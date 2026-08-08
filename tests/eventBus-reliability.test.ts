import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockAck = vi.fn();
  const mockNack = vi.fn();
  const mockPublish = vi.fn();
  const mockAssertExchange = vi.fn();
  const mockAssertQueue = vi.fn();
  const mockBindQueue = vi.fn();
  const mockConsume = vi.fn();
  const mockClose = vi.fn();

  const mockChannel = {
    publish: mockPublish,
    assertExchange: mockAssertExchange,
    assertQueue: mockAssertQueue,
    bindQueue: mockBindQueue,
    consume: mockConsume,
    ack: mockAck,
    nack: mockNack,
    close: mockClose,
  };

  const mockConnection = {
    createConfirmChannel: vi.fn().mockResolvedValue(mockChannel),
    close: mockClose,
  };

  return {
    mockAck, mockNack, mockPublish, mockAssertExchange,
    mockAssertQueue, mockBindQueue, mockConsume, mockClose,
    mockChannel, mockConnection,
  };
});

vi.mock('amqplib', () => ({
  connect: vi.fn().mockResolvedValue(mocks.mockConnection),
}));

import { eventBus } from '../src/events/eventBus';

describe('EventBus — Issue #538: Publisher Confirms & DLQ', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (eventBus as any).connection = null;
    (eventBus as any).channel = null;
    mocks.mockPublish.mockImplementation((_ex: any, _rk: any, _payload: any, _opts: any, cb?: any) => {
      if (typeof cb === 'function') cb(null);
      return true;
    });
  });

  it('should use ConfirmChannel and setup all exchanges on connect', async () => {
    await eventBus.connect();
    expect(mocks.mockConnection.createConfirmChannel).toHaveBeenCalledTimes(1);
    expect(mocks.mockAssertExchange).toHaveBeenCalledWith('domain_events', 'topic', { durable: true });
    expect(mocks.mockAssertExchange).toHaveBeenCalledWith('domain_events_retry', 'topic', { durable: true });
    expect(mocks.mockAssertExchange).toHaveBeenCalledWith('domain_events_dlx', 'topic', { durable: true });
  });

  it('should return true on successful publish confirmation', async () => {
    await eventBus.connect();
    const result = await eventBus.publish('test.key', { data: 1 });
    expect(result).toBe(true);
    expect(mocks.mockPublish).toHaveBeenCalledWith(
      'domain_events', 'test.key', expect.any(Buffer),
      { persistent: true }, expect.any(Function)
    );
  });

  it('should return false on publish rejection', async () => {
    await eventBus.connect();
    mocks.mockPublish.mockImplementation((_ex: any, _rk: any, _payload: any, _opts: any, cb: any) => {
      cb(new Error('Channel closed'));
    });
    const result = await eventBus.publish('test.key', { data: 1 });
    expect(result).toBe(false);
  });

  it('should configure main queue, retry queue, and DLQ with proper bindings', async () => {
    await eventBus.connect();
    await eventBus.subscribe('my_queue', 'my.routing.key', async () => {});

    expect(mocks.mockAssertQueue).toHaveBeenCalledWith('my_queue', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'domain_events_dlx',
        'x-dead-letter-routing-key': 'my_queue.failed'
      }
    });
    // Retry queue: no x-message-ttl; per-message expiration handles backoff
    expect(mocks.mockAssertQueue).toHaveBeenCalledWith('my_queue.retry', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'domain_events',
        'x-dead-letter-routing-key': 'my.routing.key'
      }
    });
    expect(mocks.mockAssertQueue).toHaveBeenCalledWith('my_queue.dlq', { durable: true });

    expect(mocks.mockBindQueue).toHaveBeenCalledWith('my_queue', 'domain_events', 'my.routing.key');
    expect(mocks.mockBindQueue).toHaveBeenCalledWith('my_queue.retry', 'domain_events_retry', 'my.routing.key');
    expect(mocks.mockBindQueue).toHaveBeenCalledWith('my_queue.dlq', 'domain_events_dlx', 'my_queue.failed');
  });

  it('should retry failed messages via RETRY_EXCHANGE with exponential backoff', async () => {
    await eventBus.connect();
    const handler = vi.fn().mockRejectedValue(new Error('Processing failed'));
    await eventBus.subscribe('retry_queue', 'retry.key', handler);

    // Only main queue gets a consumer
    expect(mocks.mockConsume).toHaveBeenCalledTimes(1);
    const mainConsumeCallback = mocks.mockConsume.mock.calls[0][1];

    // Attempt 1: expiration 5000ms
    const msg1 = {
      content: Buffer.from(JSON.stringify({ id: 1 })),
      fields: { routingKey: 'retry.key' },
      properties: { headers: {} },
    };
    await mainConsumeCallback(msg1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(mocks.mockAck).toHaveBeenCalledTimes(1);
    expect(mocks.mockPublish).toHaveBeenLastCalledWith(
      'domain_events_retry', 'retry.key', msg1.content,
      expect.objectContaining({
        headers: { 'x-retry-count': 1 },
        expiration: '5000',
        persistent: true,
      })
    );

    // Attempt 2: expiration 10000ms
    mocks.mockAck.mockClear();
    const msg2 = {
      content: Buffer.from(JSON.stringify({ id: 1 })),
      fields: { routingKey: 'retry.key' },
      properties: { headers: { 'x-retry-count': 1 } },
    };
    await mainConsumeCallback(msg2);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(mocks.mockAck).toHaveBeenCalledTimes(1);
    expect(mocks.mockPublish).toHaveBeenLastCalledWith(
      'domain_events_retry', 'retry.key', msg2.content,
      expect.objectContaining({
        headers: { 'x-retry-count': 2 },
        expiration: '10000',
        persistent: true,
      })
    );

    // Attempt 3: expiration 20000ms
    mocks.mockAck.mockClear();
    const msg3 = {
      content: Buffer.from(JSON.stringify({ id: 1 })),
      fields: { routingKey: 'retry.key' },
      properties: { headers: { 'x-retry-count': 2 } },
    };
    await mainConsumeCallback(msg3);
    expect(handler).toHaveBeenCalledTimes(3);
    expect(mocks.mockAck).toHaveBeenCalledTimes(1);
    expect(mocks.mockPublish).toHaveBeenLastCalledWith(
      'domain_events_retry', 'retry.key', msg3.content,
      expect.objectContaining({
        headers: { 'x-retry-count': 3 },
        expiration: '20000',
        persistent: true,
      })
    );

    // Attempt 4: max retries exceeded → nack to DLQ, no republish
    mocks.mockAck.mockClear();
    const publishCallCountBefore = mocks.mockPublish.mock.calls.length;
    const msg4 = {
      content: Buffer.from(JSON.stringify({ id: 1 })),
      fields: { routingKey: 'retry.key' },
      properties: { headers: { 'x-retry-count': 3 } },
    };
    await mainConsumeCallback(msg4);
    expect(handler).toHaveBeenCalledTimes(4);
    expect(mocks.mockNack).toHaveBeenCalledWith(msg4, false, false);
    expect(mocks.mockPublish.mock.calls.length).toBe(publishCallCountBefore);
  });

  it('should ack successful messages immediately without retry', async () => {
    await eventBus.connect();
    const handler = vi.fn().mockResolvedValue(undefined);
    await eventBus.subscribe('success_queue', 'success.key', handler);

    const consumeCallback = mocks.mockConsume.mock.calls[0][1];
    const msg = {
      content: Buffer.from(JSON.stringify({ id: 2 })),
      fields: { routingKey: 'success.key' },
      properties: { headers: {} },
    };
    await consumeCallback(msg);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(mocks.mockAck).toHaveBeenCalledWith(msg);
    expect(mocks.mockNack).not.toHaveBeenCalled();
  });
});
