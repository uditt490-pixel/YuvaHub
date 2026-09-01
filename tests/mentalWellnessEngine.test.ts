import { describe, it, expect, beforeEach } from 'vitest';
import { StudentMentalWellnessEngine } from '../src/services/mentalWellnessEngine';
import { MentalWellnessCheckInSchema } from '../src/models/mentalWellnessCheckInSchema';

describe('StudentMentalWellnessEngine Unit Tests', () => {
  const initialMockCheckIns = [
    {
      studentId: 'STD-TEST-801',
      studentName: 'Rohan Mehta',
      campusName: 'IIT Bombay',
      moodRating: 2,
      stressLevel: 'HIGH' as const,
      burnoutScorePercent: 78,
      primaryStressor: 'EXAMS' as const,
      supportRequested: true,
      counselorAssigned: undefined,
      sessionStatus: 'PENDING' as const,
      confidentialNotes: 'Preparing for midterm examinations.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      studentId: 'STD-TEST-802',
      studentName: 'Pooja Iyer',
      campusName: 'BITS Pilani',
      moodRating: 4,
      stressLevel: 'MODERATE' as const,
      burnoutScorePercent: 40,
      primaryStressor: 'ACADEMICS' as const,
      supportRequested: false,
      counselorAssigned: undefined,
      sessionStatus: 'RESOLVED' as const,
      confidentialNotes: 'General academic coursework workload.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    StudentMentalWellnessEngine.resetInMemoryCheckIns(
      initialMockCheckIns.map((item) => ({ ...item }))
    );
  });

  describe('Burnout Score Calculation Algorithm', () => {
    it('should compute 100% burnout score for mood rating 1 and CRITICAL stress', () => {
      const score = StudentMentalWellnessEngine.calculateBurnoutScore(1, 'CRITICAL');
      expect(score).toBe(100);
    });

    it('should compute 15% burnout score for mood rating 5 and LOW stress', () => {
      const score = StudentMentalWellnessEngine.calculateBurnoutScore(5, 'LOW');
      expect(score).toBe(15);
    });

    it('should clamp burnout score between 5 and 100', () => {
      const maxScore = StudentMentalWellnessEngine.calculateBurnoutScore(1, 'CRITICAL');
      expect(maxScore).toBeLessThanOrEqual(100);

      const minScore = StudentMentalWellnessEngine.calculateBurnoutScore(5, 'LOW');
      expect(minScore).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Check-In Submission & Zod Schema Validation', () => {
    it('should create a check-in with PENDING session status when support is requested', async () => {
      const checkIn = await StudentMentalWellnessEngine.createCheckIn({
        studentId: 'STD-TEST-803',
        studentName: 'Kavya Sengupta',
        campusName: 'IIT Kharagpur',
        moodRating: 1,
        stressLevel: 'CRITICAL',
        primaryStressor: 'JOB_HUNT',
        supportRequested: true,
        confidentialNotes: 'Placement interview anxiety.',
      });

      expect(checkIn.studentId).toBe('STD-TEST-803');
      expect(checkIn.burnoutScorePercent).toBe(100);
      expect(checkIn.sessionStatus).toBe('PENDING');

      const parsed = MentalWellnessCheckInSchema.safeParse(checkIn);
      expect(parsed.success).toBe(true);
    });

    it('should create a check-in with RESOLVED session status when support is not requested', async () => {
      const checkIn = await StudentMentalWellnessEngine.createCheckIn({
        studentId: 'STD-TEST-804',
        studentName: 'Vidyut Kapoor',
        campusName: 'IIT Madras',
        moodRating: 4,
        stressLevel: 'LOW',
        primaryStressor: 'PERSONAL',
        supportRequested: false,
      });

      expect(checkIn.sessionStatus).toBe('RESOLVED');
    });
  });

  describe('Filtering & Searching Mental Wellness Telemetry', () => {
    it('should filter check-ins by campusName', async () => {
      const results = await StudentMentalWellnessEngine.getCheckIns({ campusName: 'IIT Bombay' });
      expect(results.length).toBe(1);
      expect(results[0].studentName).toBe('Rohan Mehta');
    });

    it('should filter check-ins by stressLevel', async () => {
      const results = await StudentMentalWellnessEngine.getCheckIns({ stressLevel: 'HIGH' });
      expect(results.length).toBe(1);
      expect(results[0].studentId).toBe('STD-TEST-801');
    });

    it('should filter check-ins by sessionStatus', async () => {
      const results = await StudentMentalWellnessEngine.getCheckIns({ sessionStatus: 'PENDING' });
      expect(results.length).toBe(1);
      expect(results[0].studentName).toBe('Rohan Mehta');
    });

    it('should search check-ins by student name or student ID', async () => {
      const nameResults = await StudentMentalWellnessEngine.getCheckIns({ search: 'Rohan' });
      expect(nameResults.length).toBe(1);

      const idResults = await StudentMentalWellnessEngine.getCheckIns({ search: 'STD-TEST-802' });
      expect(idResults.length).toBe(1);
    });

    it('should return all check-ins when filters are set to "All"', async () => {
      const results = await StudentMentalWellnessEngine.getCheckIns({
        campusName: 'All',
        stressLevel: 'All',
        sessionStatus: 'All',
      });
      expect(results.length).toBe(2);
    });
  });

  describe('Counselor Session Assignment & Scheduling', () => {
    it('should assign counselor name and update session status to SCHEDULED', async () => {
      const updated = await StudentMentalWellnessEngine.assignCounselor(
        'STD-TEST-801',
        'Dr. Ananya Verma (Clinical Psychologist)'
      );

      expect(updated).not.toBeNull();
      expect(updated?.counselorAssigned).toBe('Dr. Ananya Verma (Clinical Psychologist)');
      expect(updated?.sessionStatus).toBe('SCHEDULED');
    });

    it('should return null when assigning counselor to a non-existent check-in ID', async () => {
      const result = await StudentMentalWellnessEngine.assignCounselor(
        'NON-EXISTENT-ID',
        'Dr. Unknown'
      );
      expect(result).toBeNull();
    });
  });
});
