import { expect } from 'vitest';

export const assertDbCount = async (db: any, collection: string, expectedCount: number) => {
  const count = await db.collection(collection).countDocuments();
  expect(count).toBe(expectedCount);
};

export const assertDbContains = async (db: any, collection: string, query: any) => {
  const doc = await db.collection(collection).findOne(query);
  expect(doc).toBeTruthy();
  return doc;
};

export const assertDbNotContains = async (db: any, collection: string, query: any) => {
  const doc = await db.collection(collection).findOne(query);
  expect(doc).toBeFalsy();
};
