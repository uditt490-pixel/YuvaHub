import * as amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

class EventBus {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  async connect(): Promise<void> {
    if (this.connection) return;

    try {
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      // Setup the main exchange for domain events
      await this.channel.assertExchange('domain_events', 'topic', { durable: true });
      
      console.log('[EventBus] Connected to RabbitMQ');
    } catch (error) {
      console.error('[EventBus] Connection failed:', error);
      throw error;
    }
  }

  async publish(routingKey: string, event: any): Promise<void> {
    if (!this.channel) {
      throw new Error('EventBus is not connected');
    }

    const payload = Buffer.from(JSON.stringify(event));
    this.channel.publish('domain_events', routingKey, payload, { persistent: true });
    // console.log(`[EventBus] Published ${routingKey}`, event.eventId);
  }

  async subscribe(
    queueName: string,
    routingKey: string,
    handler: (event: any) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('EventBus is not connected');
    }

    await this.channel.assertQueue(queueName, { durable: true });
    await this.channel.bindQueue(queueName, 'domain_events', routingKey);

    await this.channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          await handler(event);
          this.channel!.ack(msg);
        } catch (error) {
          console.error(`[EventBus] Error handling message from ${queueName}:`, error);
          // Reject and optionally requeue depending on the error
          this.channel!.nack(msg, false, false);
        }
      }
    });

    console.log(`[EventBus] Subscribed to ${routingKey} via queue ${queueName}`);
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
}

export const eventBus = new EventBus();
