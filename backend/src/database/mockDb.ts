/**
 * backend/src/database/mockDb.ts
 * ------------------------------
 * Mock database classes and in-memory storage adapters.
 */

export interface User {
  id: string;
  username: string;
  reputation: number;
}

export class MockDatabase {
  private users: Map<string, User> = new Map();

  constructor() {
    // Seed default mock data
    this.users.set("1", { id: "1", username: "uditt490", reputation: 150 });
  }

  public async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  public async saveUser(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
}

export const db = new MockDatabase();
