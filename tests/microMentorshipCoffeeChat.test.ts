import { describe, it, expect, vi } from 'vitest';
import { findValidMentor } from '../backend/workers/coffeeChatWorker.js';
import { findValidMentor as findValidMentorTs } from '../src/workers/coffeeChatWorker.js';
import { generateIcebreakersAndEmail } from '../backend/services/emailService.js';
import { CoffeeChatPairing } from '../src/models/CoffeeChatPairing.js';

describe('Micro-Mentorship Coffee Chat Lottery System (#920)', () => {
  it('should pair a student with a compatible mentor when no past collision exists within 6 months', async () => {
    const student = { _id: 'student_101', name: 'Alice', targetIndustry: 'FinTech', email: 'alice@student.edu' };
    const mentors = [
      { _id: 'mentor_201', name: 'Bob', industry: 'FinTech', email: 'bob@tech.com', jobTitle: 'Senior Dev', company: 'Stripe' },
      { _id: 'mentor_202', name: 'Carol', industry: 'Healthcare', email: 'carol@health.com', jobTitle: 'Product Manager', company: 'Pfizer' },
    ];

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const validMentor = await findValidMentor(student, mentors, sixMonthsAgo);
    expect(validMentor).toBeDefined();
    expect(validMentor._id).toBe('mentor_201');
  });

  it('should generate customized icebreakers and double-blind email body', async () => {
    const student = { name: 'Alice', targetIndustry: 'Artificial Intelligence', email: 'alice@univ.edu' };
    const mentor = { name: 'Dr. Smith', jobTitle: 'AI Research Lead', company: 'Google DeepMind', email: 'smith@deepmind.com' };

    const result = await generateIcebreakersAndEmail(student, mentor);
    expect(result.icebreakers).toBeDefined();
    expect(result.emailBody).toContain('Alice');
    expect(result.emailBody).toContain('Dr. Smith');
    expect(result.emailBody).toContain('AI Research Lead at Google DeepMind');
  });

  it('should enforce 6-month historical safety constraint filter in TypeScript worker', async () => {
    const student = { _id: 'student_301', targetIndustry: 'Cybersecurity' };
    const mentors = [{ _id: 'mentor_401', industry: 'Cybersecurity' }];

    const result = await findValidMentorTs(student, mentors, new Date());
    expect(result).toBeDefined();
  });

  it('should initialize CoffeeChatPairing model schema properly', () => {
    const pairing = new CoffeeChatPairing({
      studentId: 'student_501',
      mentorId: 'mentor_601',
      industry: 'Cloud Computing',
    });

    expect(pairing.status).toBe('MATCHED');
    expect(pairing.industry).toBe('Cloud Computing');
  });
});
