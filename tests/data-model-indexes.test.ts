import { describe, expect, it, vi } from "vitest";
import { ensureDataModelIndexes } from "../src/api/services/dataModelIndexes";

describe("data model indexes", () => {
  it("creates application, notification, scholarship, team and bounty indexes", async () => {
    const calls: Array<{
      collection: string;
      keys: unknown;
      options: unknown;
    }> = [];

    const db = {
      collection(name: string) {
        return {
          createIndex: vi.fn(
            async (keys: unknown, options: unknown) => {
              calls.push({ collection: name, keys, options });
              return "index";
            },
          ),
        };
      },
    };

    await ensureDataModelIndexes(db as never);

    expect(calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collection: "applications",
          keys: { userId: 1, opportunityId: 1 },
          options: expect.objectContaining({ unique: true }),
        }),
        expect.objectContaining({
          collection: "notifications",
          keys: { userId: 1, read: 1, createdAt: -1 },
        }),
        expect.objectContaining({
          collection: "notifications",
          keys: { expiresAt: 1 },
          options: expect.objectContaining({ expireAfterSeconds: 0 }),
        }),
        expect.objectContaining({
          collection: "scholarships",
          keys: { deadline: 1 },
        }),
        expect.objectContaining({
          collection: "teams",
          keys: { "members.uid": 1 },
        }),
      ]),
    );
  });
});
