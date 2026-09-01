import { IMentalWellnessCheckIn, MentalWellnessCheckInSchema } from '../models/mentalWellnessCheckInSchema';

export interface WellnessFilterQuery {
  campusName?: string;
  stressLevel?: string;
  sessionStatus?: string;
  search?: string;
}

// In-memory telemetry storage fallback for environment flexibility
const inMemoryCheckIns: IMentalWellnessCheckIn[] = [
  {
    studentId: 'STD-8841',
    studentName: 'Aarav Sharma',
    campusName: 'IIT Bombay',
    moodRating: 2,
    stressLevel: 'HIGH',
    burnoutScorePercent: 78,
    primaryStressor: 'EXAMS',
    supportRequested: true,
    counselorAssigned: 'Dr. Meera Nambiar',
    sessionStatus: 'SCHEDULED',
    confidentialNotes: 'Preparing for end-semester finals.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    studentId: 'STD-9923',
    studentName: 'Ananya Roy',
    campusName: 'BITS Pilani',
    moodRating: 1,
    stressLevel: 'CRITICAL',
    burnoutScorePercent: 92,
    primaryStressor: 'JOB_HUNT',
    supportRequested: true,
    counselorAssigned: undefined,
    sessionStatus: 'PENDING',
    confidentialNotes: 'Placement interview anxiety.',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export class StudentMentalWellnessEngine {
  public static calculateBurnoutScore(moodRating: number, stressLevel: string): number {
    let baseScore = (6 - moodRating) * 15;
    if (stressLevel === 'CRITICAL') baseScore += 25;
    else if (stressLevel === 'HIGH') baseScore += 18;
    else if (stressLevel === 'MODERATE') baseScore += 10;
    return Math.min(Math.max(baseScore, 5), 100);
  }

  public static async createCheckIn(payload: {
    studentId: string;
    studentName: string;
    campusName: string;
    moodRating: number;
    stressLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    primaryStressor: 'ACADEMICS' | 'EXAMS' | 'JOB_HUNT' | 'FINANCES' | 'PERSONAL';
    supportRequested: boolean;
    confidentialNotes?: string;
  }): Promise<IMentalWellnessCheckIn> {
    const burnoutScorePercent = this.calculateBurnoutScore(payload.moodRating, payload.stressLevel);

    const checkIn: IMentalWellnessCheckIn = {
      ...payload,
      burnoutScorePercent,
      sessionStatus: payload.supportRequested ? 'PENDING' : 'RESOLVED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validated = MentalWellnessCheckInSchema.parse(checkIn);
    inMemoryCheckIns.unshift(validated as IMentalWellnessCheckIn);
    return validated as IMentalWellnessCheckIn;
  }

  public static async getCheckIns(filters: WellnessFilterQuery): Promise<IMentalWellnessCheckIn[]> {
    return inMemoryCheckIns.filter(item => {
      if (filters.campusName && filters.campusName !== 'All' && item.campusName !== filters.campusName) return false;
      if (filters.stressLevel && filters.stressLevel !== 'All' && item.stressLevel !== filters.stressLevel) return false;
      if (filters.sessionStatus && filters.sessionStatus !== 'All' && item.sessionStatus !== filters.sessionStatus) return false;
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesName = item.studentName.toLowerCase().includes(q);
        const matchesId = item.studentId.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });
  }

  public static async assignCounselor(
    checkInId: string,
    counselorName: string
  ): Promise<IMentalWellnessCheckIn | null> {
    const target = inMemoryCheckIns.find(item => item.studentId === checkInId);
    if (target) {
      target.counselorAssigned = counselorName;
      target.sessionStatus = 'SCHEDULED';
      target.updatedAt = new Date();
      return target;
    }
    return null;
  }

  public static resetInMemoryCheckIns(checkIns?: IMentalWellnessCheckIn[]) {
    inMemoryCheckIns.length = 0;
    if (checkIns) {
      inMemoryCheckIns.push(...checkIns);
    }
  }
}
