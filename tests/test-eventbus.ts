import assert from "node:assert";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
const amqplibMod = req("amqplib");

let connectionEstablished = false;
let connectionClosed = false;
let channelCreated = false;
let channelClosed = false;
let publishedMessages: { exchange: string; routingKey: string; content: Buffer; options?: any }[] = [];
let subscribedQueues: { queue: string; exchange: string; routingKey: string; handler: Function }[] = [];
let ackedMessages = 0;
let nackedMessages = 0;

const mockChannel = {
  assertExchange: async (exchange: string, type: string, options: any) => {},
  assertQueue: async (queueName: string, options: any) => ({ queue: queueName }),
  bindQueue: async (queue: string, exchange: string, routingKey: string) => {},
  publish: (exchange: string, routingKey: string, content: Buffer, options?: any, callback?: (err: any) => void) => {
    publishedMessages.push({ exchange, routingKey, content, options });
    if (callback) callback(null);
    return true;
  },
  consume: async (queue: string, handler: Function) => {
    subscribedQueues.push({ queue, exchange: "domain_events", routingKey: "", handler });
    return { consumerTag: "mock_tag" };
  },
  ack: (msg: any) => { ackedMessages++; },
  nack: (msg: any, allUpTo: boolean, requeue: boolean) => { nackedMessages++; },
  close: async () => { channelClosed = true; }
};

const mockConnection = {
  createConfirmChannel: async () => { channelCreated = true; return mockChannel; },
  close: async () => { connectionClosed = true; }
};

let shouldFailConnection = true;
amqplibMod.connect = async (url: string) => {
  if (shouldFailConnection) {
    shouldFailConnection = false;
    throw new Error("Simulated connection failure");
  }
  connectionEstablished = true;
  return mockConnection;
};

const { eventBus } = await import("../src/events/eventBus.js");

import { describe, it, expect } from 'vitest';

describe('tests/test-eventbus.ts', () => {
  it('should execute without errors', async () => {
    try {
      console.log("Starting EventBus Regression Tests...");

      // 1. Connection Failure Handling
      try {
        await eventBus.connect();
        assert.fail("Should have thrown an error on connection failure");
      } catch (err: any) {
        assert.strictEqual(err.message, "Simulated connection failure");
      }

      // 2. Successful Connection and Channel Creation
      process.env.RABBITMQ_URL = "amqp://localhost";
      await eventBus.connect();
      assert.strictEqual(connectionEstablished, true);
      assert.strictEqual(channelCreated, true);

      connectionEstablished = false;
      await eventBus.connect();
      assert.strictEqual(connectionEstablished, false);

      // 3. Publish Message with confirmation
      const testEvent = { id: 123, type: "test" };
      const publishResult = await eventBus.publish("test.routing.key", testEvent);
      assert.strictEqual(publishResult, true);
      assert.strictEqual(publishedMessages.length, 1);
      assert.strictEqual(publishedMessages[0].exchange, "domain_events");
      assert.strictEqual(publishedMessages[0].routingKey, "test.routing.key");
      assert.deepStrictEqual(JSON.parse(publishedMessages[0].content.toString()), testEvent);

      // 4. Subscribe and Acknowledge
      let handledEvent = null;
      await eventBus.subscribe("test_queue", "test.routing.key", async (event) => {
        handledEvent = event;
      });
      // Only main queue gets a consumer (retry is TTL-routed, dlq is for inspection)
      assert.strictEqual(subscribedQueues.length, 1);
      assert.strictEqual(subscribedQueues[0].queue, "test_queue");

      const mockMsg = { content: Buffer.from(JSON.stringify(testEvent)), fields: { routingKey: 'test.routing.key' }, properties: { headers: {} } };
      await subscribedQueues[0].handler(mockMsg);
      assert.deepStrictEqual(handledEvent, testEvent);
      assert.strictEqual(ackedMessages, 1);

      // 5. Subscribe and Nack on Error after max retries
      const prevCount = subscribedQueues.length;
      await eventBus.subscribe("fail_queue", "fail.routing.key", async (event) => {
        throw new Error("Simulated processing error");
      });
      assert.strictEqual(subscribedQueues.length, prevCount + 1);
      assert.strictEqual(subscribedQueues[prevCount].queue, "fail_queue");

      const mockFailMsg = {
        content: Buffer.from(JSON.stringify(testEvent)),
        fields: { routingKey: 'fail.routing.key' },
        properties: { headers: { 'x-retry-count': 3 } }
      };
      await subscribedQueues[prevCount].handler(mockFailMsg);
      assert.strictEqual(nackedMessages, 1);

      // 6. Verify retry publishes to retry exchange for a fresh message
      const retryMsg = {
        content: Buffer.from(JSON.stringify(testEvent)),
        fields: { routingKey: 'fail.routing.key' },
        properties: { headers: {} }
      };
      const prevPublishCount = publishedMessages.length;
      await subscribedQueues[prevCount].handler(retryMsg);
      assert.strictEqual(publishedMessages.length, prevPublishCount + 1);
      const retryPublish = publishedMessages[publishedMessages.length - 1];
      assert.strictEqual(retryPublish.exchange, "domain_events_retry");
      assert.strictEqual(retryPublish.options.headers['x-retry-count'], 1);
      assert.strictEqual(retryPublish.options.expiration, '5000');

      // 7. Disconnect Cleans Resources
      await eventBus.disconnect();
      assert.strictEqual(channelClosed, true);
      assert.strictEqual(connectionClosed, true);

      // 8. Verify Unconnected State
      try {
        await eventBus.publish("test", {});
        assert.fail("Should not allow publishing when disconnected");
      } catch (err: any) {
        assert.strictEqual(err.message, "EventBus is not connected");
      }

      console.log("✅ All EventBus regression tests passed successfully.");
    } catch (e: any) {
      console.warn("Test failed:", e.message);
      throw e;
    }
  });
});
