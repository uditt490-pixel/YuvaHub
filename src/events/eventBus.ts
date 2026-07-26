import * as amqp from 'amqplib';
import { getCommandDB } from '../lib/mongodb.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

class EventBus {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  // In-Memory Fallback fields
  private inMemoryListeners = new Map<string, Array<(event: any) => Promise<void>>>();
  private inMemoryQueue: Array<{ dbId: string; routingKey: string; event: any }> = [];
  private activeCount = 0;
  private maxConcurrency = 10; // Backpressure limit: max 10 concurrent tasks

  async connect(): Promise<void> {
    if (this.connection) return;

    try {
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      // Setup the main exchange for domain events
      await this.channel.assertExchange('domain_events', 'topic', { durable: true });
      
      console.log('[EventBus] Connected to RabbitMQ');
    } catch (error) {
      console.warn('[EventBus] Offline (RabbitMQ server not running locally). Using persistent in-memory fallback mode.');
      
      // Recover pending/undelivered events from database on startup
      try {
        const db = await getCommandDB();
        const pending = await db.collection("events_persistence").find({}).toArray();
        if (pending.length > 0) {
          console.log(`[EventBus Fallback] Recovered ${pending.length} pending events from database.`);
          for (const item of pending) {
            this.enqueueInMemory(item._id.toString(), item.routingKey, item.event);
          }
        }
      } catch (dbErr: any) {
        console.error('[EventBus Fallback] Failed to recover pending events:', dbErr.message);
      }
    }
  }

  async publish(routingKey: string, event: any): Promise<void> {
    if (!this.channel) {
      // RabbitMQ is offline: Publish using persistent in-memory fallback
      await this.publishInMemory(routingKey, event);
      return;
    }

    const payload = Buffer.from(JSON.stringify(event));
    this.channel.publish('domain_events', routingKey, payload, { persistent: true });
  }

  async subscribe(
    queueName: string,
    routingKey: string,
    handler: (event: any) => Promise<void>
  ): Promise<void> {
    // Also track subscription locally for in-memory fallback routing
    if (!this.inMemoryListeners.has(routingKey)) {
      this.inMemoryListeners.set(routingKey, []);
    }
    this.inMemoryListeners.get(routingKey)!.push(handler);

    if (!this.channel) {
      console.log(`[EventBus In-Memory] Registered local fallback listener for routingKey: ${routingKey}`);
      return;
    }

    await this.channel.assertQueue(queueName, { durable: true });
    await this.channel.bindQueue(queueName, 'domain_events', routingKey);

    await this.channel.consume(queueName, async (msg) => {
      if (msg) {
        let retryCount = 0;
        try {
          const headers = msg.properties.headers || {};
          retryCount = headers['x-retry-count'] || 0;

          const event = JSON.parse(msg.content.toString());
          await handler(event);
          this.channel!.ack(msg);
        } catch (error: any) {
          console.error(`[EventBus] Error handling message from ${queueName}:`, error.message);
          
          // Retry logic (max 3 retries)
          if (retryCount < 3) {
            const nextCount = retryCount + 1;
            const updatedHeaders = { ...(msg.properties.headers || {}), 'x-retry-count': nextCount };
            
            console.warn(`[EventBus] Retrying message on ${queueName} (Attempt ${nextCount}/3)...`);
            this.channel!.sendToQueue(queueName, msg.content, {
              headers: updatedHeaders,
              persistent: true
            });
            this.channel!.ack(msg);
          } else {
            // Exceeded retries limit: Move to Dead Letter Queue (RabbitMQ queue + MongoDB log)
            console.error(`[EventBus] Exceeded max retries on ${queueName}. Moving message to DLQ.`);
            
            try {
              // 1. Move to RabbitMQ DLQ
              await this.channel!.assertQueue(`${queueName}_dlq`, { durable: true });
              this.channel!.sendToQueue(`${queueName}_dlq`, msg.content, {
                headers: {
                  ...(msg.properties.headers || {}),
                  'x-death-reason': error.message || 'Exceeded attempts limit',
                  'x-failed-at': new Date().toISOString()
                },
                persistent: true
              });
            } catch (dlqErr: any) {
              console.error(`[EventBus] Failed to route to RabbitMQ DLQ:`, dlqErr.message);
            }

            try {
              // 2. Persist to MongoDB dead_letter_jobs collection
              const db = await getCommandDB();
              const eventPayload = JSON.parse(msg.content.toString());
              await db.collection("dead_letter_jobs").insertOne({
                queue: queueName,
                routingKey,
                data: eventPayload,
                failedAt: new Date(),
                error: error.message,
                stack: error.stack
              });
            } catch (dbErr: any) {
              console.error(`[EventBus] Failed to write to dead_letter_jobs collection:`, dbErr.message);
            }

            this.channel!.ack(msg);
          }
        }
      }
    });

    console.log(`[EventBus] Subscribed to ${routingKey} via queue ${queueName}`);
  }

  /** Cleanly remove listener to prevent memory leaks */
  unsubscribe(routingKey: string, handler: (event: any) => Promise<void>): void {
    const list = this.inMemoryListeners.get(routingKey);
    if (list) {
      const idx = list.indexOf(handler);
      if (idx !== -1) {
        list.splice(idx, 1);
        console.log(`[EventBus] Cleaned up listener from routingKey: ${routingKey}`);
      }
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
    console.log('[EventBus] Disconnected');
  }

  // --- In-Memory Fallback Handling ---

  private async publishInMemory(routingKey: string, event: any): Promise<void> {
    try {
      const db = await getCommandDB();
      const res = await db.collection("events_persistence").insertOne({
        routingKey,
        event,
        status: "pending",
        createdAt: new Date(),
      });
      
      const dbId = res.insertedId.toString();
      this.enqueueInMemory(dbId, routingKey, event);
    } catch (err: any) {
      console.error("[EventBus Fallback] Failed to persist event to MongoDB:", err.message);
      // Fail-safe: continue execution locally even if DB fails
      this.enqueueInMemory(`temp_${Date.now()}`, routingKey, event);
    }
  }

  private enqueueInMemory(dbId: string, routingKey: string, event: any) {
    // Backpressure check: Warn if queue grows too large
    if (this.inMemoryQueue.length >= 1000) {
      console.warn(`[EventBus Fallback] Backpressure warning: In-memory queue limit reached (${this.inMemoryQueue.length}). Throttling...`);
    }

    this.inMemoryQueue.push({ dbId, routingKey, event });
    this.processInMemoryQueue();
  }

  private async processInMemoryQueue() {
    if (this.activeCount >= this.maxConcurrency || this.inMemoryQueue.length === 0) return;

    this.activeCount++;
    const item = this.inMemoryQueue.shift();
    if (item) {
      const { dbId, routingKey, event } = item;
      const listeners = this.inMemoryListeners.get(routingKey) || [];

      let errorOccurred = false;
      let firstError: any = null;
      const promises = listeners.map(async (handler) => {
        try {
          await handler(event);
        } catch (err: any) {
          console.error(`[EventBus Fallback] Error in local handler for ${routingKey}:`, err.message);
          errorOccurred = true;
          if (!firstError) firstError = err;
        }
      });

      try {
        await Promise.all(promises);
        if (errorOccurred) {
          throw firstError || new Error("In-memory handler execution failed");
        }
        
        // On complete execution, delete event from DB
        if (!dbId.startsWith("temp_")) {
          const db = await getCommandDB();
          const { ObjectId } = await import("mongodb");
          await db.collection("events_persistence").deleteOne({ _id: new ObjectId(dbId) });
        }
      } catch (err: any) {
        console.error(`[EventBus Fallback] Execution error for routingKey ${routingKey}:`, err.message);
        
        if (!dbId.startsWith("temp_")) {
          try {
            const db = await getCommandDB();
            const { ObjectId } = await import("mongodb");
            const doc = await db.collection("events_persistence").findOne({ _id: new ObjectId(dbId) });
            const attempts = (doc?.attempts || 0) + 1;
            
            if (attempts < 3) {
              await db.collection("events_persistence").updateOne(
                { _id: new ObjectId(dbId) },
                { $set: { attempts } }
              );
              console.warn(`[EventBus Fallback] Scheduled event retry (${attempts}/3) for ${routingKey}`);
            } else {
              console.error(`[EventBus Fallback] Event ${routingKey} exceeded max retries. Moving to dead_letter_jobs.`);
              await db.collection("dead_letter_jobs").insertOne({
                queue: "in_memory_event_bus",
                routingKey,
                data: event,
                failedAt: new Date(),
                attemptsMade: attempts,
                error: err.message,
                stack: err.stack
              });
              await db.collection("events_persistence").deleteOne({ _id: new ObjectId(dbId) });
            }
          } catch (dbErr: any) {
            console.error("[EventBus Fallback] Failed to update attempts or write to DLQ in MongoDB:", dbErr.message);
          }
        }
      } finally {
        this.activeCount--;
        this.processInMemoryQueue();
      }
    }
  }
}

export const eventBus = new EventBus();
