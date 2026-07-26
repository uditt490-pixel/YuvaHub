import { describe, expect, it } from "vitest";
import {
  ApplicationDocumentSchema,
  createApplicationDocument,
} from "../src/models/applicationSchema";
import { BountySchema } from "../src/models/bountySchema";
import { NotificationSchema } from "../src/models/notificationSchema";
import { ScholarshipSchema } from "../src/models/scholarshipSchema";
import { TeamSchema } from "../src/models/teamSchema";

describe("application model", () => {
  it("creates Date-backed application documents", () => {
    const application = createApplicationDocument({
      userId: "user-1",
      opportunityId: "opp-1",
      opportunity: { title: "Security Internship" },
    });

    expect(application.createdAt).toBeInstanceOf(Date);
    expect(application.updatedAt).toBeInstanceOf(Date);
    expect(application.auditLogs[0].timestamp).toBeInstanceOf(Date);
  });

  it("rejects unsupported statuses", () => {
    expect(() =>
      ApplicationDocumentSchema.parse({
        userId: "user-1",
        opportunityId: "opp-1",
        opportunity: { title: "Test" },
        platform: "test",
        status: "approved",
        retryCount: 0,
        userConfirmed: false,
        auditLogs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow();
  });
});

describe("bounty model", () => {
  it("rejects negative and excessive rewards", () => {
    const base = {
      title: "Fix accessibility issue",
      description: "Implement and test an accessible navigation flow.",
      posterName: "Maintainer",
    };

    expect(() => BountySchema.parse({ ...base, reward: -1 })).toThrow();
    expect(() =>
      BountySchema.parse({ ...base, reward: 10_000_001 }),
    ).toThrow();
  });
});

describe("notification model", () => {
  it("adds an expiry date", () => {
    const notification = NotificationSchema.parse({
      userId: "user-1",
      type: "welcome",
      title: "Welcome",
      message: "Welcome to YuvaHub.",
    });

    expect(notification.expiresAt).toBeInstanceOf(Date);
    expect(notification.expiresAt.getTime()).toBeGreaterThan(
      notification.createdAt.getTime(),
    );
  });
});

describe("scholarship model", () => {
  it("normalizes deadline and numeric amount", () => {
    const scholarship = ScholarshipSchema.parse({
      title: "STEM Scholarship",
      description: "Scholarship for eligible STEM students.",
      provider: "Example Foundation",
      amount_inr: "₹50000",
      target_demographics: ["General"],
      deadline: "2026-12-31",
    });

    expect(scholarship.amount_inr).toBe(50000);
    expect(scholarship.deadline).toBeInstanceOf(Date);
  });
});

describe("team model", () => {
  it("rejects member counts above maxMembers", () => {
    expect(() =>
      TeamSchema.parse({
        name: "Builders",
        description: "A student project team",
        requiredRoles: ["Frontend"],
        maxMembers: 2,
        leaderUid: "leader",
        leaderName: "Leader",
        members: [
          { uid: "1", name: "One", role: "Leader" },
          { uid: "2", name: "Two", role: "Frontend" },
          { uid: "3", name: "Three", role: "Backend" },
        ],
      }),
    ).toThrow("Members cannot exceed maxMembers.");
  });
});
