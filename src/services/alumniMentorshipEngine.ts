import { IAlumniMentorshipSlot, AlumniMentorshipSlotSchema } from '../models/alumniMentorshipSchema';

export interface MentorshipFilterQuery {
  campusName?: string;
  expertiseArea?: string;
  status?: string;
  search?: string;
}

const inMemorySlots: IAlumniMentorshipSlot[] = [
  {
    slotId: 'SLOT-501',
    mentorName: 'Rohan Deshmukh',
    mentorAlumniBatchYear: 2018,
    mentorCurrentCompany: 'Google DeepMind',
    mentorCurrentRole: 'Staff AI Researcher',
    campusName: 'IIT Bombay',
    expertiseArea: 'AI_RESEARCH',
    availableSessionsCount: 4,
    sessionDurationMinutes: 45,
    matchingCompatibilityPercent: 98,
    status: 'OPEN',
    assignedStudentId: undefined,
    assignedStudentName: undefined,
    sessionTopics: 'LLM fine-tuning, Agentic Systems, AI Careers',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    slotId: 'SLOT-502',
    mentorName: 'Kavya Nair',
    mentorAlumniBatchYear: 2020,
    mentorCurrentCompany: 'Sequoia Capital',
    mentorCurrentRole: 'Investment Vice President',
    campusName: 'BITS Pilani',
    expertiseArea: 'VENTURE_CAPITAL',
    availableSessionsCount: 2,
    sessionDurationMinutes: 30,
    matchingCompatibilityPercent: 92,
    status: 'BOOKED',
    assignedStudentId: 'STD-1102',
    assignedStudentName: 'Devansh Verma',
    sessionTopics: 'Pitch decks, seed fundraising, cap tables',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export class AlumniMentorshipEngine {
  public static calculateCompatibilityPercent(
    mentorCampus: string,
    studentCampus?: string
  ): number {
    if (!studentCampus || studentCampus === 'All') return 90;
    if (mentorCampus.toLowerCase() === studentCampus.toLowerCase()) return 98;
    return 85;
  }

  public static async registerSlot(payload: {
    mentorName: string;
    mentorAlumniBatchYear: number;
    mentorCurrentCompany: string;
    mentorCurrentRole: string;
    campusName: string;
    expertiseArea: 'SOFTWARE_ENGINEERING' | 'PRODUCT_MANAGEMENT' | 'AI_RESEARCH' | 'VENTURE_CAPITAL';
    availableSessionsCount: number;
    sessionTopics: string;
    matchingCompatibilityPercent?: number;
  }): Promise<IAlumniMentorshipSlot> {
    const compatibility =
      payload.matchingCompatibilityPercent !== undefined
        ? payload.matchingCompatibilityPercent
        : this.calculateCompatibilityPercent(payload.campusName);

    const slot: IAlumniMentorshipSlot = {
      ...payload,
      slotId: `SLOT-${Date.now()}`,
      sessionDurationMinutes: 45,
      matchingCompatibilityPercent: compatibility,
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validated = AlumniMentorshipSlotSchema.parse(slot);
    inMemorySlots.unshift(validated as IAlumniMentorshipSlot);
    return validated as IAlumniMentorshipSlot;
  }

  public static async registerMentor(payload: {
    mentorName: string;
    campusName: string;
    alumniGraduationYear?: number;
    mentorAlumniBatchYear?: number;
    currentCompany?: string;
    mentorCurrentCompany?: string;
    currentJobTitle?: string;
    mentorCurrentRole?: string;
    expertiseDomain?: string;
    expertiseArea?: 'SOFTWARE_ENGINEERING' | 'PRODUCT_MANAGEMENT' | 'AI_RESEARCH' | 'VENTURE_CAPITAL';
    maxMenteesCapacity?: number;
    availableSessionsCount?: number;
    bioSummary?: string;
    sessionTopics?: string;
  }): Promise<IAlumniMentorshipSlot> {
    const mentorAlumniBatchYear = payload.mentorAlumniBatchYear || payload.alumniGraduationYear || 2018;
    const mentorCurrentCompany = payload.mentorCurrentCompany || payload.currentCompany || 'Technology Inc.';
    const mentorCurrentRole = payload.mentorCurrentRole || payload.currentJobTitle || 'Senior Staff Specialist';
    const expertiseArea = (payload.expertiseArea || (payload.expertiseDomain as any) || 'SOFTWARE_ENGINEERING');
    const availableSessionsCount = payload.availableSessionsCount || payload.maxMenteesCapacity || 3;
    const sessionTopics = payload.sessionTopics || payload.bioSummary || 'Career Mentorship & Guidance';

    return this.registerSlot({
      mentorName: payload.mentorName,
      campusName: payload.campusName,
      mentorAlumniBatchYear,
      mentorCurrentCompany,
      mentorCurrentRole,
      expertiseArea,
      availableSessionsCount,
      sessionTopics,
    });
  }

  public static async getSlots(filters: MentorshipFilterQuery): Promise<IAlumniMentorshipSlot[]> {
    return inMemorySlots.filter(item => {
      if (filters.campusName && filters.campusName !== 'All' && item.campusName !== filters.campusName) return false;
      if (filters.expertiseArea && filters.expertiseArea !== 'All' && item.expertiseArea !== filters.expertiseArea) return false;
      if (filters.status && filters.status !== 'All' && item.status !== filters.status) return false;
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesMentor = item.mentorName.toLowerCase().includes(q);
        const matchesCompany = item.mentorCurrentCompany.toLowerCase().includes(q);
        const matchesTopics = item.sessionTopics.toLowerCase().includes(q);
        if (!matchesMentor && !matchesCompany && !matchesTopics) return false;
      }
      return true;
    });
  }

  public static async getMentors(filters: any): Promise<IAlumniMentorshipSlot[]> {
    return this.getSlots({
      campusName: filters.campusName,
      expertiseArea: filters.expertiseDomain || filters.expertiseArea,
      status: filters.availabilityStatus || filters.status,
      search: filters.search,
    });
  }

  public static async bookSession(
    slotId: string,
    studentId: string,
    studentName: string
  ): Promise<IAlumniMentorshipSlot | null> {
    const slot = inMemorySlots.find(item => item.slotId === slotId);
    if (slot && slot.status === 'OPEN' && slot.availableSessionsCount > 0) {
      slot.assignedStudentId = studentId;
      slot.assignedStudentName = studentName;
      slot.availableSessionsCount = Math.max(0, slot.availableSessionsCount - 1);
      slot.status = 'BOOKED';
      slot.updatedAt = new Date();
      return slot;
    }
    return null;
  }

  public static async requestSession(
    slotId: string,
    studentName: string,
    _sessionTopic?: string
  ): Promise<IAlumniMentorshipSlot | null> {
    return this.bookSession(slotId, `STU-${Date.now()}`, studentName);
  }
}

