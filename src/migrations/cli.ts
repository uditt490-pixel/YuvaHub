import { MongoClient } from 'mongodb';
import { MigrationRunner } from './runner.js';
import dotenv from 'dotenv';
import { config } from '../config/env.js';

dotenv.config();

async function main() {
  const command = process.argv[2];

  if (!['up', 'down', 'status'].includes(command)) {
    console.error('Usage: migrate <up|down|status>');
    process.exit(1);
  }

  const uri = config.MONGODB_COMMAND_URI || config.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_COMMAND_URI or MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  const dbName = config.MONGODB_COMMAND_DB || config.MONGODB_DB_NAME || 'yuvahub';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const runner = new MigrationRunner(db);

    if (command === 'status') {
      const applied = await runner.getAppliedMigrations();
      const pending = await runner.getPendingMigrations();
      
      console.log('--- Migration Status ---');
      console.log('Applied:');
      applied.forEach(m => console.log(`  - [x] ${m}`));
      if (applied.length === 0) console.log('  (none)');
      
      console.log('\nPending:');
      pending.forEach(m => console.log(`  - [ ] ${m.id}`));
      if (pending.length === 0) console.log('  (none)');
      console.log('------------------------');
    } else if (command === 'up') {
      await runner.runMigrations();
    } else if (command === 'down') {
      await runner.rollbackMigration();
    }

  } catch (err) {
    console.error('Migration command failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
