import { Db } from 'mongodb';

export const up = async (db: Db) => {
  console.log('[003_user_collection_validator] Applying JSON schema validator to users collection...');

  await db.command({
    collMod: 'users',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'email'],
        properties: {
          name: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          email: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          reputation_score: {
            bsonType: ['number', 'int', 'long', 'double'],
            minimum: 0,
            description: 'must be an integer >= 0 if present'
          },
          level: {
            bsonType: ['number', 'int', 'long', 'double'],
            minimum: 1,
            description: 'must be an integer >= 1 if present'
          }
        }
      }
    },
    validationLevel: 'moderate' // Only apply to inserts and updates that already match
  });
};

export const down = async (db: Db) => {
  console.log('[003_user_collection_validator] Removing JSON schema validator from users collection...');
  await db.command({
    collMod: 'users',
    validator: {}, // Remove validator
    validationLevel: 'off'
  });
};
