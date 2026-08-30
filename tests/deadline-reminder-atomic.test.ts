import { describe, expect, it } from "vitest";
import {
  buildDeadlineReminderDedupeKey,
  createDeadlineReminderAtomically,
  DEADLINE_REMINDER_WINDOWS,
} from "../src/services/deadlineReminderAtomic";

describe("deadline reminder atomic helper", () => {
  it("builds a stable reminder key", () => {
    expect(
      buildDeadlineReminderDedupeKey(
        "user-1",
        "opportunity-1",
        DEADLINE_REMINDER_WINDOWS.FORTY_EIGHT_HOURS,
      ),
    ).toBe("deadline:user-1:opportunity-1:48h");
  });

  it("returns true when the atomic upsert inserts a new reminder", async () => {
    const collection = {
      updateOne: async () => ({
        matchedCount: 0,
        modifiedCount: 0,
        upsertedCount: 1,
      }),
    };

    const inserted = await createDeadlineReminderAtomically(collection, {
      userId: "user-1",
      type: "deadline_reminder",
      title: "Deadline",
      message: "Apply now",
      targetId: "opportunity-1",
      dedupeKey: "deadline:user-1:opportunity-1:7d",
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(),
    });

    expect(inserted).toBe(true);
  });

  it("treats a Mongo duplicate-key race as an expected no-op", async () => {
    const duplicateKeyError: any = new Error("duplicate");
    duplicateKeyError.code = 11000;

    const collection = {
      updateOne: async () => {
        throw duplicateKeyError;
      },
    };

    const inserted = await createDeadlineReminderAtomically(collection, {
      userId: "user-1",
      type: "deadline_reminder",
      title: "Deadline",
      message: "Apply now",
      targetId: "opportunity-1",
      dedupeKey: "deadline:user-1:opportunity-1:7d",
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(),
    });

    expect(inserted).toBe(false);
  });
});
