/**
 * ENTERPRISE ARCHITECTURAL BUSINESS LOGIC ENGINE
 * MODULE: Student Mental Wellness & Triage Telemetry Service Engine
 * SYSTEM ARCHITECTURE: YuvaHub Campus Healthcare Intelligence Matrix
 * VERSION: 4.3.0-RELEASE
 */

/**
 * @typedef {Object} WellnessRecord
 * @property {string} id
 * @property {string} studentAnonId
 * @property {string} cohort
 * @property {number} stressIndex
 * @property {number} sleepHoursAvg
 * @property {string} assignedCounselor
 * @property {'LOW' | 'MODERATE' | 'CRITICAL'} triageStatus
 * @property {string} interventionStage
 */

export class MentalWellnessEngine {
  /**
   * Initializes the Mental Wellness Service Engine state and mock records.
   * @param {Array<WellnessRecord>} [initialRecords=null]
   */
  constructor(initialRecords = null) {
    this.records = initialRecords || this.generateDefaultWellnessRecords();
    this.activeFilters = {
      cohort: 'ALL',
      severity: 'ALL',
      searchQuery: ''
    };
  }

  /**
   * Generates default telemetry records for campus student triage.
   * @returns {Array<WellnessRecord>}
   */
  generateDefaultWellnessRecords() {
    return [
      {
        id: 'WEL-001',
        studentAnonId: 'STU-ANON-8921',
        cohort: 'UNDERGRAD_FRESHMAN',
        stressIndex: 32,
        sleepHoursAvg: 7.5,
        assignedCounselor: 'Dr. Sarah Jenkins',
        triageStatus: 'LOW',
        interventionStage: 'Routine Check-In'
      },
      {
        id: 'WEL-002',
        studentAnonId: 'STU-ANON-4102',
        cohort: 'UNDERGRAD_SENIOR',
        stressIndex: 78,
        sleepHoursAvg: 4.8,
        assignedCounselor: 'Dr. Marcus Vance',
        triageStatus: 'MODERATE',
        interventionStage: 'Counseling Scheduled'
      },
      {
        id: 'WEL-003',
        studentAnonId: 'STU-ANON-9014',
        cohort: 'PHD_RESEARCH',
        stressIndex: 94,
        sleepHoursAvg: 3.2,
        assignedCounselor: 'Dr. Elena Rostova',
        triageStatus: 'CRITICAL',
        interventionStage: 'Crisis Dispatch En Route'
      },
      {
        id: 'WEL-004',
        studentAnonId: 'STU-ANON-1159',
        cohort: 'GRADUATE_MASTERS',
        stressIndex: 45,
        sleepHoursAvg: 6.8,
        assignedCounselor: 'Dr. Sarah Jenkins',
        triageStatus: 'LOW',
        interventionStage: 'Self-Care Module Active'
      },
      {
        id: 'WEL-005',
        studentAnonId: 'STU-ANON-6730',
        cohort: 'UNDERGRAD_SENIOR',
        stressIndex: 88,
        sleepHoursAvg: 4.0,
        assignedCounselor: 'Dr. Marcus Vance',
        triageStatus: 'CRITICAL',
        interventionStage: 'Urgent Care Assigned'
      }
    ];
  }

  /**
   * Calculates overall campus wellness index (0 - 100).
   * @param {Array<WellnessRecord>} records
   * @returns {number}
   */
  calculateCampusWellnessIndex(records = this.records) {
    if (!records || records.length === 0) return 100.0;
    const avgStress = records.reduce((acc, r) => acc + r.stressIndex, 0) / records.length;
    const wellnessIndex = 100 - avgStress;
    return parseFloat(wellnessIndex.toFixed(1));
  }

  /**
   * Counts active critical crisis cases requiring urgent intervention.
   * @param {Array<WellnessRecord>} records
   * @returns {number}
   */
  countActiveCriticalCases(records = this.records) {
    if (!records) return 0;
    return records.filter(r => r.triageStatus === 'CRITICAL').length;
  }

  /**
   * Calculates average sleep hours across student cohort.
   * @param {Array<WellnessRecord>} records
   * @returns {number}
   */
  calculateAverageSleepHours(records = this.records) {
    if (!records || records.length === 0) return 0.0;
    const totalSleep = records.reduce((acc, r) => acc + r.sleepHoursAvg, 0);
    return parseFloat((totalSleep / records.length).toFixed(1));
  }

  /**
   * Filters wellness telemetry records based on active criteria.
   * @param {{ cohort: string, severity: string, searchQuery: string }} criteria
   * @returns {Array<WellnessRecord>}
   */
  filterRecords(criteria) {
    return this.records.filter(r => {
      if (criteria.cohort && criteria.cohort !== 'ALL' && r.cohort !== criteria.cohort) return false;
      if (criteria.severity && criteria.severity !== 'ALL' && r.triageStatus !== criteria.severity) return false;
      if (criteria.searchQuery && criteria.searchQuery.trim() !== '') {
        const query = criteria.searchQuery.toLowerCase().trim();
        const matchId = r.studentAnonId.toLowerCase().includes(query);
        const matchCounselor = r.assignedCounselor.toLowerCase().includes(query);
        if (!matchId && !matchCounselor) return false;
      }
      return true;
    });
  }

  /**
   * Sanitizes string against script injection.
   * @param {string} str
   * @returns {string}
   */
  sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
// Total lines: 140+ lines
