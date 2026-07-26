import type { Db } from "mongodb";

const NOTIFICATION_RETENTION_SECONDS = 60 * 60 * 24 * 90;

export async function ensureDataModelIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection("applications").createIndex(
      { userId: 1, createdAt: -1 },
      { name: "applications_user_history" },
    ),
    db.collection("applications").createIndex(
      { opportunityId: 1, createdAt: -1 },
      { name: "applications_opportunity_history" },
    ),
    db.collection("applications").createIndex(
      { userId: 1, opportunityId: 1 },
      {
        name: "applications_unique_user_opportunity",
        unique: true,
        partialFilterExpression: {
          userId: { $type: "string" },
          opportunityId: { $type: "string" },
        },
      },
    ),

    db.collection("notifications").createIndex(
      { userId: 1, read: 1, createdAt: -1 },
      { name: "notifications_user_unread" },
    ),
    db.collection("notifications").createIndex(
      { expiresAt: 1 },
      {
        name: "notifications_expiry",
        expireAfterSeconds: 0,
        partialFilterExpression: {
          expiresAt: { $type: "date" },
        },
      },
    ),
    db.collection("notifications").createIndex(
      { createdAt: 1 },
      {
        name: "notifications_legacy_retention",
        expireAfterSeconds: NOTIFICATION_RETENTION_SECONDS,
        partialFilterExpression: {
          expiresAt: { $exists: false },
          createdAt: { $type: "date" },
        },
      },
    ),

    db.collection("scholarships").createIndex(
      { deadline: 1 },
      {
        name: "scholarships_deadline",
        partialFilterExpression: {
          deadline: { $type: "date" },
        },
      },
    ),

    db.collection("teams").createIndex(
      { "members.uid": 1 },
      { name: "teams_member_uid" },
    ),
    db.collection("teams").createIndex(
      { opportunityId: 1, status: 1, createdAt: -1 },
      { name: "teams_opportunity_status" },
    ),
    db.collection("team_requests").createIndex(
      { teamId: 1, applicantUid: 1, status: 1 },
      {
        name: "team_requests_one_pending",
        unique: true,
        partialFilterExpression: {
          status: "pending",
        },
      },
    ),

    db.collection("bounties").createIndex(
      { createdBy: 1, createdAt: -1 },
      { name: "bounties_creator_history" },
    ),
  ]);
}
