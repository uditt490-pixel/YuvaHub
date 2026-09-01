import { describe, it, expect } from 'vitest';
import { AlumniMentorshipEngine } from '../src/services/alumniMentorshipEngine';

describe('Campus Alumni Mentorship & Career Guidance Engine (#ECSoC_2026)', () => {
  it('should retrieve list of verified alumni mentorship slots', async () => {
    const slots = await AlumniMentorshipEngine.getSlots({});
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toHaveProperty('slotId');
    expect(slots[0]).toHaveProperty('mentorName');
  });

  it('should filter mentorship slots by expertise area', async () => {
    const aiSlots = await AlumniMentorshipEngine.getSlots({
      expertiseArea: 'AI_RESEARCH',
    });
    expect(aiSlots.every(s => s.expertiseArea === 'AI_RESEARCH')).toBe(true);
  });

  it('should register a new alumni mentorship slot', async () => {
    const created = await AlumniMentorshipEngine.registerSlot({
      mentorName: 'Pooja Bhatt',
      mentorAlumniBatchYear: 2017,
      mentorCurrentCompany: 'Google DeepMind',
      mentorCurrentRole: 'Staff Research Scientist',
      campusName: 'IIIT Hyderabad',
      expertiseArea: 'AI_RESEARCH',
      availableSessionsCount: 4,
      sessionTopics: 'LLM Alignment, Multi-Agent Systems & PhD Applications',
    });

    expect(created.slotId).toBeDefined();
    expect(created.status).toBe('OPEN');
  });

  it('should book a 1-on-1 mentorship session with an alumni mentor', async () => {
    const slots = await AlumniMentorshipEngine.getSlots({});
    const target = slots[0];

    const booked = await AlumniMentorshipEngine.bookSession(
      target.slotId!,
      'STU-9941',
      'Kunal Verma'
    );

    expect(booked).not.toBeNull();
    expect(booked!.status).toBe('BOOKED');
    expect(booked!.assignedStudentName).toBe('Kunal Verma');
  });
});
