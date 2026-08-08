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
  const mockCheckQueue = vi.fn();
  const mockGet = vi.fn();
  const mockPurgeQueue = vi.fn();

  const mockChannel = {
    publish: mockPublish,
    assertExchange: mockAssertExchange,
    assertQueue: mockAssertQueue,
    bindQueue: mockBindQueue,
    consume: mockConsume,
    ack: mockAck,
    nack: mockNack,
    close: mockClose,
    checkQueue: mockCheckQueue,
    get: mockGet,
    purgeQueue: mockPurgeQueue,
  };

  const mockConnection = {
    createConfirmChannel: vi.fn().mockResolvedValue(mockChannel),
    close: mockClose,
  };

  return {
    mockAck, mockNack, mockPublish, mockAssertExchange,
    mockAssertQueue, mockBindQueue, mockConsume, mockClose,
    mockCheckQueue, mockGet, mockPurgeQueue,
    mockChannel, mockConnection,
  };
});

vi.mock('amqplib', () => ({
  connect: vi.fn().mockResolvedValue(mocks.mockConnection),
}));

import { eventBus } from '../src/events/eventBus.js';

describe('RabbitMQ Dead Letter Queue (DLQ) Management & Recovery — Issue #604', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (eventBus as any).connection = null;
    (eventBus as any).channel = null;
    (eventBus as any).registeredQueues = new Map();
    mocks.mockPublish.mockImplementation((_ex: any, _rk: any, _payload: any, _opts: any, cb?: any) => {
      if (typeof cb === 'function') cb(null);
      return true;
    });
  });

  it('should attach death metadata headers when max retries are exceeded', async () => {
    await eventBus.connect();
    const handler = vi.fn().mockRejectedValue(new Error('Fatal database connection drop'));
    await eventBus.subscribe('notification_queue', 'notification.send', handler);

    const consumeCallback = mocks.mockConsume.mock.calls[0][1];
    const msg = {
      content: Buffer.from(JSON.stringify({ userId: 'u123', template: 'welcome' })),
      fields: { routingKey: 'notification.send' },
      properties: { headers: { 'x-retry-count': 3 } },
    };

    await consumeCallback(msg);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(mocks.mockNack).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          headers: expect.objectContaining({
            'x-death-reason': 'Fatal database connection drop',
            'x-original-queue': 'notification_queue',
            'x-original-routing-key': 'notification.send',
          }),
        }),
      }),
      false,
      false
    );
  });

  it('should retrieve DLQ statistics via getDlqStats & getAllDlqStats', async () => {
    await eventBus.connect();
    await eventBus.subscribe('email_queue', 'email.send', async () => {});

    mocks.mockCheckQueue.mockResolvedValueOnce({
      queue: 'email_queue.dlq',
      messageCount: 5,
      consumerCount: 0,
    });

    const stats = await eventBus.getDlqStats('email_queue');
    expect(stats).toEqual({
      queueName: 'email_queue',
      dlqName: 'email_queue.dlq',
      messageCount: 5,
      consumerCount: 0,
      routingKey: 'email.send',
    });

    mocks.mockCheckQueue.mockResolvedValueOnce({
      queue: 'email_queue.dlq',
      messageCount: 5,
      consumerCount: 0,
    });

    const allStats = await eventBus.getAllDlqStats();
    expect(allStats).toHaveLength(1);
    expect(allStats[0].queueName).toBe('email_queue');
    expect(allStats[0].messageCount).toBe(5);
  });

  it('should inspect dead-lettered messages without destroying them (re-queues with nack)', async () => {
    await eventBus.connect();
    await eventBus.subscribe('push_queue', 'push.send', async () => {});

    const fakeDlqMessage = {
      content: Buffer.from(JSON.stringify({ pushId: 'p1' })),
      fields: { routingKey: 'push_queue.failed' },
      properties: {
        headers: {
          'x-death-reason': 'Push gateway timeout',
          'x-death-timestamp': '2026-08-05T10:00:00Z',
          'x-retry-count': 3,
        },
      },
    };

    mocks.mockGet
      .mockResolvedValueOnce(fakeDlqMessage)
      .mockResolvedValueOnce(false);

    const inspected = await eventBus.inspectDlq('push_queue', 5);
    expect(inspected).toHaveLength(1);
    expect(inspected[0]).toEqual({
      payload: { pushId: 'p1' },
      headers: fakeDlqMessage.properties.headers,
      routingKey: 'push_queue.failed',
      failedAt: '2026-08-05T10:00:00Z',
      retryCount: 3,
    });

    expect(mocks.mockNack).toHaveBeenCalledWith(fakeDlqMessage, false, true);
  });

  it('should replay dead-lettered messages back to MAIN_EXCHANGE with reset retry counter', async () => {
    await eventBus.connect();
    await eventBus.subscribe('scraper_queue', 'scraper.ingest', async () => {});

    const fakeDlqMsg = {
      content: Buffer.from(JSON.stringify({ target: 'unstop' })),
      fields: { routingKey: 'scraper_queue.failed' },
      properties: {
        headers: {
          'x-retry-count': 3,
          'x-death-reason': 'Rate limit hit',
          'x-death-timestamp': '2026-08-05T10:00:00Z',
          'custom-header': 'val1',
        },
      },
    };

    mocks.mockGet
      .mockResolvedValueOnce(fakeDlqMsg)
      .mockResolvedValueOnce(false);

    const replayed = await eventBus.replayDlq('scraper_queue', 10);
    expect(replayed).toBe(1);

    expect(mocks.mockPublish).toHaveBeenCalledWith(
      'domain_events',
      'scraper.ingest',
      fakeDlqMsg.content,
      expect.objectContaining({
        persistent: true,
        headers: expect.objectContaining({
          'custom-header': 'val1',
          'x-replayed-from-dlq': true,
        }),
      }),
      expect.any(Function)
    );

    // Verify retry count and death headers were stripped on replay
    const publishedOpts = mocks.mockPublish.mock.calls[0][3];
    expect(publishedOpts.headers['x-retry-count']).toBeUndefined();
    expect(publishedOpts.headers['x-death-reason']).toBeUndefined();

    // Verify the DLQ message was acknowledged after re-publishing
    expect(mocks.mockAck).toHaveBeenCalledWith(fakeDlqMsg);
  });

  it('should purge DLQ messages when requested', async () => {
    await eventBus.connect();
    await eventBus.subscribe('test_queue', 'test.routing', async () => {});

    mocks.mockPurgeQueue.mockResolvedValueOnce({ messageCount: 12 });

    const purged = await eventBus.purgeDlq('test_queue');
    expect(purged).toBe(12);
    expect(mocks.mockPurgeQueue).toHaveBeenCalledWith('test_queue.dlq');
  });
});
