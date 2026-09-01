import { Db } from 'mongodb';

export const up = async (db: Db) => {
  console.log('[002_opportunity_schema_validator] Applying JSON schema validator to opportunities collection...');

  await db.command({
    collMod: 'opportunities',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'company', 'description', 'source', 'url', 'canonicalId'],
        properties: {
          title: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          company: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          description: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          source: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          url: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          canonicalId: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          embedding: {
            bsonType: 'array',
            items: {
              bsonType: 'number'
            },
            description: 'must be an array of numbers if present'
          }
        }
      }
    },
    validationLevel: 'moderate' // Only apply to inserts and updates that already match
  });
};

export const down = async (db: Db) => {
  console.log('[002_opportunity_schema_validator] Removing JSON schema validator from opportunities collection...');
  await db.command({
    collMod: 'opportunities',
    validator: {}, // Remove validator
    validationLevel: 'off'
  });
};
