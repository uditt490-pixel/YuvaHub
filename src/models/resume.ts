// src/models/resume.ts
/*
  Resume Draft Model (MongoDB)
  --------------------------------
  Provides a thin wrapper around the `resumes` collection.
  Each document stores a JSON representation of the draft and metadata.
*/

import { ObjectId } from 'mongodb';

type ResumeDraft = {
  _id?: ObjectId;
  userId: string;           // reference to the owning user
  name: string;             // e.g., "My First Resume"
  template: string;         // template identifier (clean-1, clean-2, …)
  data: any;                // the full resume JSON payload
  createdAt: Date;
  updatedAt: Date;
};

export class ResumeModel {
  private collectionName = 'resumes';

  constructor(private db: any) {}

  private get collection() {
    return this.db.collection(this.collectionName);
  }

  async create(draft: Omit<ResumeDraft, '_id' | 'createdAt' | 'updatedAt'>): Promise<ObjectId> {
    const now = new Date();
    const doc: ResumeDraft = {
      ...draft,
      createdAt: now,
      updatedAt: now,
    } as ResumeDraft;
    const result = await this.collection.insertOne(doc);
    return result.insertedId;
  }

  async findById(userId: string, id: string): Promise<ResumeDraft | null> {
    return this.collection.findOne({ _id: new ObjectId(id), userId });
  }

  async findAll(userId: string): Promise<ResumeDraft[]> {
    return this.collection.find({ userId }).sort({ updatedAt: -1 }).toArray();
  }

  async update(userId: string, id: string, data: Partial<ResumeDraft>): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id), userId },
      { $set: { ...data, updatedAt: new Date() } }
    );
    return result.matchedCount > 0;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id), userId });
    return result.deletedCount > 0;
  }
}
