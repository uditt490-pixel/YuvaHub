import { Db } from 'mongodb';

export const up = async (db: Db) => {
  console.log('[001_initial_indexes] Creating opportunities indexes...');
  await db.collection("opportunities").createIndex({ created_at: -1, source_quality_score: -1 });
  await db.collection("opportunities").createIndex(
    { dedupe_hash: 1 },
    { unique: true, partialFilterExpression: { dedupe_hash: { $exists: true } } }
  );

  console.log('[001_initial_indexes] Creating users indexes...');
  await db.collection("users").createIndex({ uid: 1 }, { unique: true, sparse: true });
  await db.collection("users").createIndex({ firebaseUid: 1 }, { unique: true, sparse: true });
  await db.collection("users").createIndex({ alumni_status: 1, is_open_to_mentoring: 1, graduation_year: -1 });

  console.log('[001_initial_indexes] Creating mentorship_requests index...');
  await db.collection("mentorship_requests").createIndex({ sender_id: 1, recipient_id: 1, created_at: -1 });

  console.log('[001_initial_indexes] Creating opportunity_notes index...');
  await db.collection("opportunity_notes").createIndex({ userId: 1, opportunityId: 1 }, { unique: true });

  console.log('[001_initial_indexes] Creating notifications index...');
  await db.collection("notifications").createIndex(
    { dedupeKey: 1 },
    {
      name: "deadline_reminder_dedupe_key_unique",
      unique: true,
      partialFilterExpression: { dedupeKey: { $exists: true } },
    }
  );

  console.log('[001_initial_indexes] Creating paginated collection indexes...');
  const paginatedIndexes: [string, string][] = [
    ["teams", "created_at"],
    ["posts", "created_at"],
    ["bounties", "created_at"],
    ["notifications", "created_at"],
    ["mentorship_sessions", "created_at"],
    ["bookmark_folders", "created_at"],
    ["resumes", "uploaded_at"],
    ["scraper_logs", "created_at"],
  ];
  for (const [collection, field] of paginatedIndexes) {
    await db.collection(collection).createIndex({ [field]: -1 });
  }
};

export const down = async (db: Db) => {
  console.log('[001_initial_indexes] Dropping indexes is not fully implemented in down() to avoid accidental performance drops.');
  // Dropping indexes can be risky on a rollback, but for completeness, we could list them:
  // await db.collection("opportunities").dropIndex("created_at_-1_source_quality_score_-1");
  // etc.
};
