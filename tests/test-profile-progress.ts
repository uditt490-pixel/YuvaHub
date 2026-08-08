import { describe, it, expect } from 'vitest';
import { calculateProfileProgress } from '../src/api/services/profileProgressService.js';

describe('Profile Progress Service', () => {
  it('should return 0 score and all missing items for a completely empty profile', () => {
    const user = { email: 'test@example.com' };
    const resumes: any[] = [];
    const result = calculateProfileProgress(user, resumes);
    
    expect(result.score).toBe(0);
    expect(result.missingItems.length).toBe(5);
    expect(result.missingItems.map(m => m.field)).toEqual(
      expect.arrayContaining(['avatar', 'bio', 'resume', 'education', 'skills'])
    );
  });

  it('should return 100 score and empty missing items for a complete profile', () => {
    const user = { 
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Hello world',
      college: 'MIT',
      skills: ['TypeScript']
    };
    const resumes: any[] = [{ id: '1' }];
    const result = calculateProfileProgress(user, resumes);
    
    expect(result.score).toBe(100);
    expect(result.missingItems.length).toBe(0);
  });
});
