import { Db } from 'mongodb';

const LOCK_ID = 'migration_lock';
const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class MigrationLockManager {
  private db: Db;
  private collectionName = 'migration_locks';

  constructor(db: Db) {
    this.db = db;
  }

  /**
   * Attempts to acquire the migration lock.
   * Uses findOneAndUpdate to atomically check for an existing lock and create/update it if it's expired or doesn't exist.
   */
  async acquireLock(): Promise<boolean> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_TTL_MS);

    try {
      const result = await this.db.collection(this.collectionName).findOneAndUpdate(
        {
          _id: LOCK_ID as any,
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $lt: now } }
          ]
        },
        {
          $set: {
            _id: LOCK_ID,
            lockedAt: now,
            expiresAt: expiresAt
          }
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      );
      return !!result; // If it updated/upserted, we got the lock.
    } catch (err: any) {
      // If duplicate key error on upsert, another process just grabbed it
      if (err.code === 11000) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Releases the migration lock.
   */
  async releaseLock(): Promise<void> {
    await this.db.collection(this.collectionName).deleteOne({ _id: LOCK_ID as any });
  }
}
