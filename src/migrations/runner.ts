import { Db } from 'mongodb';
import { MigrationLockManager } from './lockManager.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Migration {
  id: string; // The filename e.g., '001_initial_indexes.ts'
  up: (db: Db) => Promise<void>;
  down?: (db: Db) => Promise<void>;
}

export class MigrationRunner {
  private db: Db;
  private lockManager: MigrationLockManager;
  private collectionName = 'schema_versions';
  private migrationsPath: string;

  constructor(db: Db, migrationsPath?: string) {
    this.db = db;
    this.lockManager = new MigrationLockManager(db);
    this.migrationsPath = migrationsPath || path.join(__dirname, 'versions');
  }

  async getAppliedMigrations(): Promise<string[]> {
    const docs = await this.db.collection(this.collectionName).find({}).sort({ appliedAt: 1 }).toArray();
    return docs.map(doc => doc.id);
  }

  async getPendingMigrations(): Promise<Migration[]> {
    const applied = await this.getAppliedMigrations();
    
    if (!fs.existsSync(this.migrationsPath)) {
      return [];
    }

    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .sort();

    const pendingFiles = files.filter(file => !applied.includes(file));

    const pendingMigrations: Migration[] = [];
    for (const file of pendingFiles) {
      const filePath = path.join(this.migrationsPath, file);
      // Use dynamic import for ES modules
      const module = await import(`file://${filePath}`);
      pendingMigrations.push({
        id: file,
        up: module.up,
        down: module.down
      });
    }

    return pendingMigrations;
  }

  async runMigrations(): Promise<void> {
    const lockAcquired = await this.lockManager.acquireLock();
    if (!lockAcquired) {
      console.warn('[Migrations] Could not acquire lock. Another process is running migrations.');
      return;
    }

    try {
      const pending = await this.getPendingMigrations();
      
      if (pending.length === 0) {
        console.log('[Migrations] No pending migrations.');
        return;
      }

      console.log(`[Migrations] Found ${pending.length} pending migrations.`);

      for (const migration of pending) {
        console.log(`[Migrations] Applying ${migration.id}...`);
        await migration.up(this.db);
        
        await this.db.collection(this.collectionName).insertOne({
          id: migration.id,
          appliedAt: new Date()
        });
        
        console.log(`[Migrations] Successfully applied ${migration.id}.`);
      }
      console.log('[Migrations] All migrations applied successfully.');
    } catch (err) {
      console.error('[Migrations] Migration failed:', err);
      throw err;
    } finally {
      await this.lockManager.releaseLock();
    }
  }

  async rollbackMigration(): Promise<void> {
    const lockAcquired = await this.lockManager.acquireLock();
    if (!lockAcquired) {
      console.warn('[Migrations] Could not acquire lock. Another process is running migrations.');
      return;
    }

    try {
      const docs = await this.db.collection(this.collectionName).find({}).sort({ appliedAt: -1 }).limit(1).toArray();
      
      if (docs.length === 0) {
        console.log('[Migrations] No migrations to rollback.');
        return;
      }

      const lastMigrationDoc = docs[0];
      const filePath = path.join(this.migrationsPath, lastMigrationDoc.id);
      
      if (!fs.existsSync(filePath)) {
         console.warn(`[Migrations] Migration file ${lastMigrationDoc.id} not found. Cannot run down().`);
      } else {
         const module = await import(`file://${filePath}`);
         if (module.down) {
             console.log(`[Migrations] Rolling back ${lastMigrationDoc.id}...`);
             await module.down(this.db);
         } else {
             console.log(`[Migrations] Migration ${lastMigrationDoc.id} has no down() method. Only removing from schema_versions.`);
         }
      }

      await this.db.collection(this.collectionName).deleteOne({ id: lastMigrationDoc.id });
      console.log(`[Migrations] Successfully rolled back ${lastMigrationDoc.id}.`);
    } catch (err) {
      console.error('[Migrations] Rollback failed:', err);
      throw err;
    } finally {
      await this.lockManager.releaseLock();
    }
  }
}
