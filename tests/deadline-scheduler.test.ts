import { beforeEach, describe, expect, it, vi } from "vitest";

const enqueueEmail = vi.fn().mockResolvedValue(undefined);
const enqueuePushNotification = vi.fn().mockResolvedValue(undefined);
const emit = vi.fn();
const getSocketIO = vi.fn(() => ({ emit }));
const generateDeadlineReminderHtml = vi.fn(() => "<p>deadline</p>");
const generateWeeklyDigestHtml = vi.fn(() => "<p>digest</p>");

vi.mock("../src/queues/emailQueue", () => ({ enqueueEmail }));
vi.mock("../src/queues/pushQueue", () => ({ enqueuePushNotification }));
vi.mock("../src/api/socketInstance.js", () => ({ getSocketIO }));
vi.mock("../src/workers/emailTemplates", () => ({
  generateDeadlineReminderHtml,
  generateWeeklyDigestHtml,
}));

import { runDeadlineChecks } from "../src/services/deadlineScheduler";

class FakeCollection {
  private documents: any[];
  private indexCreated = false;

  constructor(documents: any[] = []) {
    this.documents = documents;
  }

  async createIndex() {
    this.indexCreated = true;
    return "deadline_reminder_dedupe_key_unique";
  }

  find(query: any) {
    const collection = this;

    return {
      async toArray() {
        if (query?.bookmarks) return collection.documents;

        if (query?.$or) {
          const ids = new Set<string>();
          for (const condition of query.$or) {
            for (const value of condition.id?.$in || []) ids.add(String(value));
            for (const value of condition._id?.$in || []) ids.add(String(value));
          }

          return collection.documents.filter((doc) => {
            return ids.has(String(doc.id)) || ids.has(String(doc._id));
          });
        }

        return [];
      },
    };
  }

  async updateOne(
    query: { dedupeKey: string },
    update: { $setOnInsert: any },
    options: { upsert: boolean },
  ) {
    expect(this.indexCreated).toBe(true);
    expect(options.upsert).toBe(true);

    const existing = this.documents.find(
      (document) => document.dedupeKey === query.dedupeKey,
    );

    if (existing) {
      return { matchedCount: 1, modifiedCount: 0, upsertedCount: 0 };
    }

    // Simulate two application instances reaching MongoDB concurrently.
    await new Promise((resolve) => setTimeout(resolve, 5));

    const winner = this.documents.find(
      (document) => document.dedupeKey === query.dedupeKey,
    );

    if (winner) {
      const error: any = new Error("duplicate key");
      error.code = 11000;
      error.codeName = "DuplicateKey";
      throw error;
    }

    this.documents.push({ ...update.$setOnInsert });
    return {
      matchedCount: 0,
      modifiedCount: 0,
      upsertedCount: 1,
    };
  }

  get size() {
    return this.documents.length;
  }

  get data() {
    return this.documents;
  }
}

class FakeDb {
  users: FakeCollection;
  opportunities: FakeCollection;
  notifications: FakeCollection;

  constructor() {
    this.users = new FakeCollection([
      {
        uid: "user-1",
        email: "student@example.com",
        fcmToken: "fcm-token",
        bookmarks: ["opp-1"],
        notificationPreferences: {
          deadlineRemindersEnabled: true,
          emailEnabled: true,
          pushEnabled: true,
        },
      },
    ]);

    this.opportunities = new FakeCollection([
      {
        id: "opp-1",
        title: "Test Scholarship",
        company: "YuvaHub",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 1000),
      },
    ]);

    this.notifications = new FakeCollection();
  }

  collection(name: string) {
    if (name === "users") return this.users;
    if (name === "opportunities") return this.opportunities;
    if (name === "notifications") return this.notifications;
    throw new Error(`Unexpected collection: ${name}`);
  }
}

describe("deadline reminder atomicity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates exactly one reminder when two scheduler runs race", async () => {
    const db = new FakeDb();

    await Promise.all([runDeadlineChecks(db), runDeadlineChecks(db)]);

    expect(db.notifications.size).toBe(1);
    expect(db.notifications.data[0].dedupeKey).toBe(
      "deadline:user-1:opp-1:7d",
    );

    // Every external notification side effect must happen only for the winner.
    expect(emit).toHaveBeenCalledTimes(1);
    expect(enqueueEmail).toHaveBeenCalledTimes(1);
    expect(enqueuePushNotification).toHaveBeenCalledTimes(1);
  });

  it("uses a stable key instead of notification title text", async () => {
    const db = new FakeDb();

    await runDeadlineChecks(db);

    const reminder = db.notifications.data[0];

    expect(reminder.dedupeKey).toBe("deadline:user-1:opp-1:7d");
    expect(reminder.dedupeKey).not.toContain(reminder.title);
  });

  it("does not create a second reminder for the same window on later runs", async () => {
    const db = new FakeDb();

    await runDeadlineChecks(db);
    await runDeadlineChecks(db);

    expect(db.notifications.size).toBe(1);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(enqueueEmail).toHaveBeenCalledTimes(1);
    expect(enqueuePushNotification).toHaveBeenCalledTimes(1);
  });
});
