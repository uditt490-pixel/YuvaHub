import { Collection, ObjectId } from 'mongodb';
import { dbCommand } from '../api/db.js';

export interface ResumeDraft {
  _id?: ObjectId;
  userId: string;
  profileData?: any; // hydrated data: education, skills, github stats
  workExperience?: any[]; // array of experience objects
  projects?: any[];
  summary?: string;
  selectedTemplate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getResumeDraftsCollection = (): Collection<ResumeDraft> => {
  return dbCommand.collection('resumeDrafts');
};

export const upsertResumeDraft = async (userId: string, draft: Partial<ResumeDraft>) => {
  const collection = getResumeDraftsCollection();
  const now = new Date();
  const update = {
    $set: { ...draft, updatedAt: now },
    $setOnInsert: { userId, createdAt: now },
  } as any;
  await collection.updateOne({ userId }, update, { upsert: true });
};

export const getResumeDraft = async (userId: string) => {
  const collection = getResumeDraftsCollection();
  return await collection.findOne({ userId });
};
