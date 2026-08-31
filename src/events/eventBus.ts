import * as amqp from "amqplib";
import { sendAdminAlert } from "../services/adminAlertService.js";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

const MAIN_EXCHANGE = "domain_events";
const RETRY_EXCHANGE = "domain_events_retry";
const DLX_EXCHANGE = "domain_events_dlx";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export interface DlqStats {
  queueName: string;
  dlqName: string;
  messageCount: number;
  consumerCount: number;
  routingKey: string;
}

export interface DlqMessageInfo {
  payload: unknown;
  headers: Record<string, unknown>;
  routingKey: string;
  failedAt?: string;
  retryCount?: number;
}

class EventBus {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.ConfirmChannel | null = null;
  private registeredQueues: Map<string, string> = new Map();

  async connect(): Promise<void> {
    if (this.connection) return;

    try {
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createConfirmChannel();

      await this.channel.assertExchange(MAIN_EXCHANGE, "topic", { durable: true });
      await this.channel.assertExchange(RETRY_EXCHANGE, "topic", { durable: true });
      await this.channel.assertExchange(DLX_EXCHANGE, "topic", { durable: true });

      console.log("[EventBus] Connected to RabbitMQ (ConfirmChannel + DLX enabled)");
    } catch (error) {
      // Clean up on topology failure so reconnect is possible
      if (this.channel) {
        try { await this.channel.close(); } catch {}
        this.channel = null;
      }
      if (this.connection) {
        try { await this.connection.close(); } catch {}
        this.connection = null;
      }
      console.warn("[EventBus] Offline (RabbitMQ server not running locally):", (error as Error).message);
      throw error;
    }
  }

  async publish(routingKey: string, event: unknown): Promise<boolean> {
    if (!this.channel) {
      throw new Error("EventBus is not connected");
    }

    const payload = Buffer.from(JSON.stringify(event));

    return new Promise((resolve) => {
      this.channel!.publish(MAIN_EXCHANGE, routingKey, payload, { persistent: true }, (err) => {
        if (err) {
          console.error(`[EventBus] Publish failed for ${routingKey}:`, err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async subscribe(
    queueName: string,
    routingKey: string,
    handler: (event: unknown) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("EventBus is not connected");
    }

    this.registeredQueues.set(queueName, routingKey);
    const retryQueue = `${queueName}.retry`;
    const dlq = `${queueName}.dlq`;

    // Main queue – dead-letters to DLX on nack
    await this.channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": DLX_EXCHANGE,
        "x-dead-letter-routing-key": `${queueName}.failed`,
      },
    });
    await this.channel.bindQueue(queueName, MAIN_EXCHANGE, routingKey);

    // Retry queue – per-message expiration handles backoff; no queue-level TTL
    await this.channel.assertQueue(retryQueue, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": MAIN_EXCHANGE,
        "x-dead-letter-routing-key": routingKey,
      },
    });
    await this.channel.bindQueue(retryQueue, RETRY_EXCHANGE, routingKey);

    // Dead-letter queue – receives messages that exhausted retries
    await this.channel.assertQueue(dlq, { durable: true });
    await this.channel.bindQueue(dlq, DLX_EXCHANGE, `${queueName}.failed`);

    // Main consumer only (DLQ is for manual inspection, not auto-consumed)
    await this.channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString());
        await handler(event);
        this.channel!.ack(msg);
      } catch (error) {
        console.error(`[EventBus] Error handling message from ${queueName}:`, error);

        const retries = Number(msg.properties.headers?.["x-retry-count"] ?? 0);

        if (retries < MAX_RETRIES) {
          // Publish to retry exchange with exponential backoff
          this.channel!.publish(RETRY_EXCHANGE, routingKey, msg.content, {
            persistent: true,
            expiration: (RETRY_DELAY_MS * Math.pow(2, retries)).toString(),
            headers: {
              ...msg.properties.headers,
              "x-retry-count": retries + 1,
            },
          });
          this.channel!.ack(msg);
        } else {
          console.error(
            `[EventBus] Max retries (${MAX_RETRIES}) exceeded for ${queueName}. Routing to DLQ.`,
          );
          msg.properties.headers = {
            ...msg.properties.headers,
            "x-death-reason": (error as Error)?.message || "Max retries exceeded",
            "x-death-timestamp": new Date().toISOString(),
            "x-original-queue": queueName,
            "x-original-routing-key": routingKey,
          };
          this.channel!.nack(msg, false, false);
          sendAdminAlert(
            "EventBus",
            { id: msg.properties.messageId || queueName, data: { domain: routingKey }, attemptsMade: retries },
            error,
          );
        }      }
    });

    console.log(`[EventBus] Subscribed to ${routingKey} via queue ${queueName} (DLX: ${DLX_EXCHANGE})`);
  }

  async getDlqStats(queueName: string): Promise<DlqStats> {
    if (!this.channel) {
      throw new Error("EventBus is not connected");
    }
    const dlqName = `${queueName}.dlq`;
    const routingKey = this.registeredQueues.get(queueName) || `${queueName}.failed`;
    try {
      const info = await this.channel.checkQueue(dlqName);
      return {
        queueName,
        dlqName,
        messageCount: info.messageCount,
        consumerCount: info.consumerCount,
        routingKey,
      };
    } catch {
      return {
        queueName,
        dlqName,
        messageCount: 0,
        consumerCount: 0,
        routingKey,
      };
    }
  }

  async getAllDlqStats(): Promise<DlqStats[]> {
    const stats: DlqStats[] = [];
    for (const queueName of Array.from(this.registeredQueues.keys())) {
      stats.push(await this.getDlqStats(queueName));
    }
    return stats;
  }

  async inspectDlq(queueName: string, maxMessages = 10): Promise<DlqMessageInfo[]> {
    if (!this.channel) {
      throw new Error("EventBus is not connected");
    }
    const dlqName = `${queueName}.dlq`;
    const messages: DlqMessageInfo[] = [];

    for (let i = 0; i < maxMessages; i++) {
      const msg = await this.channel.get(dlqName, { noAck: false });
      if (!msg) break;

      try {
        const payload = JSON.parse(msg.content.toString());
        messages.push({
          payload,
          headers: (msg.properties.headers || {}) as Record<string, unknown>,
          routingKey: msg.fields.routingKey,
          failedAt: msg.properties.headers?.["x-death-timestamp"] as string | undefined,
          retryCount: Number(msg.properties.headers?.["x-retry-count"] ?? 0),
        });
      } catch {
        messages.push({
          payload: msg.content.toString(),
          headers: (msg.properties.headers || {}) as Record<string, unknown>,
          routingKey: msg.fields.routingKey,
        });
      }

      this.channel.nack(msg, false, true);
    }

    return messages;
  }

  async replayDlq(queueName: string, maxMessages = 100): Promise<number> {
    if (!this.channel) {
      throw new Error("EventBus is not connected");
    }
    const dlqName = `${queueName}.dlq`;
    const targetRoutingKey = this.registeredQueues.get(queueName) || `${queueName}.failed`;
    let replayedCount = 0;

    for (let i = 0; i < maxMessages; i++) {
      const msg = await this.channel.get(dlqName, { noAck: false });
      if (!msg) break;

      const headers = { ...msg.properties.headers };
      delete headers["x-retry-count"];
      delete headers["x-death-reason"];
      delete headers["x-death-timestamp"];

      const published = await new Promise<boolean>((resolve) => {
        this.channel!.publish(MAIN_EXCHANGE, targetRoutingKey, msg.content, {
          persistent: true,
          headers: {
            ...headers,
            "x-replayed-from-dlq": true,
            "x-replayed-at": new Date().toISOString(),
          },
        }, (err) => resolve(!err));
      });

      if (published) {
        this.channel.ack(msg);
        replayedCount++;
      } else {
        this.channel.nack(msg, false, true);
        break;
      }
    }

    console.log(`[EventBus] Replayed ${replayedCount} messages from DLQ ${dlqName} to ${targetRoutingKey}`);
    return replayedCount;
  }

  async purgeDlq(queueName: string): Promise<number> {
    if (!this.channel) {
      throw new Error("EventBus is not connected");
    }
    const dlqName = `${queueName}.dlq`;
    try {
      const res = await this.channel.purgeQueue(dlqName);
      return res.messageCount;
    } catch {
      return 0;
    }
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
    console.log("[EventBus] Disconnected");
  }
}

export const eventBus = new EventBus();

