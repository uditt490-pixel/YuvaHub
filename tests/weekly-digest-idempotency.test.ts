import { describe, expect, it, vi } from "vitest";
import { getIsoWeek, getWeeklyDigestKey } from "../src/lib/dateUtils";
import { enqueueWeeklyDigestIdempotently } from "../src/services/weeklyDigestIdempotency";

describe("weekly digest idempotency", () => {
  it("uses deterministic ISO weeks at a year boundary", () => {
    expect(getIsoWeek(new Date("2024-12-30T12:00:00Z"))).toEqual({
      year: 2025,
      week: 1,
    });
    expect(getIsoWeek(new Date("2025-01-05T12:00:00Z"))).toEqual({
      year: 2025,
      week: 1,
    });
  });

  it("builds a stable digest key from user and ISO week", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    expect(getWeeklyDigestKey("user-123", date)).toBe(
      "weekly-digest:user-123:2026-01",
    );
  });

  it("queues only for a new claim", async () => {
    const update = vi
      .fn()
      .mockResolvedValueOnce({
        value: {
          _id: "delivery-1",
          dedupeKey: "weekly-digest:u1:2026-01",
          status: "queued",
          queuedAt: new Date(),
        },
      });

    const db = { collection: () => ({ findOneAndUpdate: update, updateOne: vi.fn() }) };
    const enqueue = vi.fn().mockResolvedValue({ id: "job-1" });

    const result = await enqueueWeeklyDigestIdempotently(
      db,
      "u1",
      new Date("2026-01-01T00:00:00Z"),
      { to: "u@example.com", subject: "Digest", body: "Hello" },
      enqueue,
    );

    expect(result.queued).toBe(true);
    expect(enqueue).toHaveBeenCalledTimes(1);
  });

  it("does not queue when another execution already owns the week", async () => {
    const update = vi.fn().mockResolvedValue({
      value: {
        _id: "delivery-1",
        dedupeKey: "weekly-digest:u1:2026-01",
        status: "queued",
        queuedAt: new Date(Date.now() - 60_000),
      },
    });

    const db = { collection: () => ({ findOneAndUpdate: update }) };
    const enqueue = vi.fn();

    const result = await enqueueWeeklyDigestIdempotently(
      db,
      "u1",
      new Date("2026-01-01T00:00:00Z"),
      { to: "u@example.com", subject: "Digest", body: "Hello" },
      enqueue,
    );

    expect(result.queued).toBe(false);
    expect(enqueue).not.toHaveBeenCalled();
  });

  it("marks failed queue attempts so a later execution can retry", async () => {
    const updateOne = vi.fn().mockResolvedValue({});
    const findOneAndUpdate = vi.fn().mockResolvedValue({
      value: {
        _id: "delivery-1",
        dedupeKey: "weekly-digest:u1:2026-01",
        status: "queued",
        queuedAt: new Date(),
      },
    });

    const db = {
      collection: () => ({ findOneAndUpdate, updateOne }),
    };

    const enqueue = vi.fn().mockRejectedValue(new Error("queue unavailable"));

    await expect(
      enqueueWeeklyDigestIdempotently(
        db,
        "u1",
        new Date("2026-01-01T00:00:00Z"),
        { to: "u@example.com", subject: "Digest", body: "Hello" },
        enqueue,
      ),
    ).rejects.toThrow("queue unavailable");

    expect(updateOne).toHaveBeenCalledWith(
      { dedupeKey: "weekly-digest:u1:2026-01" },
      expect.objectContaining({
        $set: expect.objectContaining({ status: "failed" }),
      }),
    );
  });
});
