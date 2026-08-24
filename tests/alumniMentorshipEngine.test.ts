import { describe, it, expect, beforeEach } from 'vitest';
import { AlumniMentorshipEngine } from '../src/services/alumniMentorshipEngine';
import { AlumniMentorshipSlotSchema } from '../src/models/alumniMentorshipSchema';

describe('AlumniMentorshipEngine Unit Tests', () => {
  const initialMockSlots = [
    {
      slotId: 'SLOT-TEST-1',
      mentorName: 'Arjun Mehta',
      mentorAlumniBatchYear: 2017,
      mentorCurrentCompany: 'Google',
      mentorCurrentRole: 'Staff Software Engineer',
      campusName: 'IIT Bombay',
      expertiseArea: 'SOFTWARE_ENGINEERING' as const,
      availableSessionsCount: 2,
      sessionDurationMinutes: 45,
      matchingCompatibilityPercent: 98,
      status: 'OPEN' as const,
      assignedStudentId: undefined,
      assignedStudentName: undefined,
      sessionTopics: 'Distributed systems, Code reviews',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      slotId: 'SLOT-TEST-2',
      mentorName: 'Sneha Patel',
      mentorAlumniBatchYear: 2019,
      mentorCurrentCompany: 'Microsoft',
      mentorCurrentRole: 'Principal PM',
      campusName: 'BITS Pilani',
      expertiseArea: 'PRODUCT_MANAGEMENT' as const,
      availableSessionsCount: 1,
      sessionDurationMinutes: 30,
      matchingCompatibilityPercent: 92,
      status: 'OPEN' as const,
      assignedStudentId: undefined,
      assignedStudentName: undefined,
      sessionTopics: 'Product strategy, Resume critique',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    AlumniMentorshipEngine.resetInMemorySlots([...initialMockSlots]);
  });

  describe('Slot Registration & Schema Validation', () => {
    it('should register a new mentorship slot with valid schema', async () => {
      const newSlot = await AlumniMentorshipEngine.registerSlot({
        mentorName: 'Dr. Vikram Seth',
        mentorAlumniBatchYear: 2015,
        mentorCurrentCompany: 'DeepMind',
        mentorCurrentRole: 'Research Scientist',
        campusName: 'IIT Bombay',
        expertiseArea: 'AI_RESEARCH',
        availableSessionsCount: 3,
        sessionTopics: 'LLMs, AI Research Careers',
      });

      expect(newSlot.slotId).toBeDefined();
      expect(newSlot.mentorName).toBe('Dr. Vikram Seth');
      expect(newSlot.status).toBe('OPEN');
      expect(newSlot.matchingCompatibilityPercent).toBe(90); // Default for unassigned student campus
      expect(newSlot.sessionDurationMinutes).toBe(45);

      const parsed = AlumniMentorshipSlotSchema.safeParse(newSlot);
      expect(parsed.success).toBe(true);
    });

    it('should calculate custom compatibility percentage if provided', async () => {
      const newSlot = await AlumniMentorshipEngine.registerSlot({
        mentorName: 'Aarti Kumar',
        mentorAlumniBatchYear: 2021,
        mentorCurrentCompany: 'Sequoia',
        mentorCurrentRole: 'Associate',
        campusName: 'IIIT Hyderabad',
        expertiseArea: 'VENTURE_CAPITAL',
        availableSessionsCount: 1,
        sessionTopics: 'Venture capital pitching',
        matchingCompatibilityPercent: 88,
      });

      expect(newSlot.matchingCompatibilityPercent).toBe(88);
    });
  });

  describe('Filtering & Searching Mentorship Slots', () => {
    it('should filter slots by campusName', async () => {
      const slots = await AlumniMentorshipEngine.getSlots({ campusName: 'IIT Bombay' });
      expect(slots.length).toBe(1);
      expect(slots[0].mentorName).toBe('Arjun Mehta');
    });

    it('should filter slots by expertiseArea', async () => {
      const slots = await AlumniMentorshipEngine.getSlots({ expertiseArea: 'PRODUCT_MANAGEMENT' });
      expect(slots.length).toBe(1);
      expect(slots[0].mentorName).toBe('Sneha Patel');
    });

    it('should filter slots by search keyword matching mentor name, company, or topics', async () => {
      const slots = await AlumniMentorshipEngine.getSlots({ search: 'Microsoft' });
      expect(slots.length).toBe(1);
      expect(slots[0].mentorName).toBe('Sneha Patel');

      const topicSlots = await AlumniMentorshipEngine.getSlots({ search: 'Distributed systems' });
      expect(topicSlots.length).toBe(1);
      expect(topicSlots[0].mentorName).toBe('Arjun Mehta');
    });

    it('should return all slots when "All" filters are provided', async () => {
      const slots = await AlumniMentorshipEngine.getSlots({
        campusName: 'All',
        expertiseArea: 'All',
        status: 'All',
      });
      expect(slots.length).toBe(2);
    });
  });

  describe('Session Booking & Capacity Enforcement', () => {
    it('should book an open slot and decrement available sessions count', async () => {
      const booked = await AlumniMentorshipEngine.bookSession(
        'SLOT-TEST-1',
        'STU-101',
        'Rahul Kumar'
      );

      expect(booked).not.toBeNull();
      expect(booked?.assignedStudentId).toBe('STU-101');
      expect(booked?.assignedStudentName).toBe('Rahul Kumar');
      expect(booked?.availableSessionsCount).toBe(1);
      expect(booked?.status).toBe('OPEN'); // 1 session still remaining
    });

    it('should change status to BOOKED when capacity is exhausted', async () => {
      const booked = await AlumniMentorshipEngine.bookSession(
        'SLOT-TEST-2',
        'STU-202',
        'Ananya Sharma'
      );

      expect(booked).not.toBeNull();
      expect(booked?.availableSessionsCount).toBe(0);
      expect(booked?.status).toBe('BOOKED');
    });

    it('should return null when trying to book a slot that is already fully booked or non-existent', async () => {
      // First booking exhausts capacity (SLOT-TEST-2 has 1 session available)
      await AlumniMentorshipEngine.bookSession('SLOT-TEST-2', 'STU-202', 'Ananya');

      // Second booking attempt should fail
      const secondAttempt = await AlumniMentorshipEngine.bookSession('SLOT-TEST-2', 'STU-303', 'Priya');
      expect(secondAttempt).toBeNull();

      // Booking non-existent slot should return null
      const invalidSlot = await AlumniMentorshipEngine.bookSession('SLOT-INVALID', 'STU-999', 'Test');
      expect(invalidSlot).toBeNull();
    });
  });

  describe('Compatibility Helper Calculations', () => {
    it('should compute 98% for matching campus, 85% for mismatched campus, and 90% for All/empty', () => {
      expect(AlumniMentorshipEngine.calculateCompatibilityPercent('IIT Bombay', 'IIT Bombay')).toBe(98);
      expect(AlumniMentorshipEngine.calculateCompatibilityPercent('IIT Bombay', 'BITS Pilani')).toBe(85);
      expect(AlumniMentorshipEngine.calculateCompatibilityPercent('IIT Bombay', 'All')).toBe(90);
      expect(AlumniMentorshipEngine.calculateCompatibilityPercent('IIT Bombay')).toBe(90);
    });
  });
});
