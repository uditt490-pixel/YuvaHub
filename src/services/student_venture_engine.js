/**
 * ENTERPRISE ARCHITECTURAL BUSINESS LOGIC ENGINE
 * MODULE: Student Venture Studio & VC Fund Service Engine
 * SYSTEM ARCHITECTURE: YuvaHub University Startup Incubator Framework
 * VERSION: 4.6.0-RELEASE
 */

/**
 * @typedef {Object} StudentVenture
 * @property {string} id
 * @property {string} startupCode
 * @property {string} name
 * @property {string} studentFounder
 * @property {string} sector
 * @property {number} arrRevenue
 * @property {number} valuation
 * @property {'PRE_SEED' | 'SEED' | 'SERIES_A'} stage
 * @property {string} status
 */

export class StudentVentureEngine {
  /**
   * Initializes the Student Venture Engine state.
   * @param {Array<StudentVenture>} [initialVentures=null]
   */
  constructor(initialVentures = null) {
    this.ventures = initialVentures || this.generateDefaultVentures();
    this.activeFilters = {
      sector: 'ALL',
      stage: 'ALL',
      searchQuery: ''
    };
  }

  /**
   * Generates default student startups for incubator analysis.
   * @returns {Array<StudentVenture>}
   */
  generateDefaultVentures() {
    return [
      {
        id: 'VEN-001',
        startupCode: 'VEN-AI-901',
        name: 'OmniTensor AI Analytics',
        studentFounder: 'Alex Chen (\'27)',
        sector: 'AI_SAAS',
        arrRevenue: 1400000,
        valuation: 18000000,
        stage: 'SERIES_A',
        status: 'Incubator Graduate'
      },
      {
        id: 'VEN-002',
        startupCode: 'VEN-FIN-204',
        name: 'PayFlow Micro-Yield Protocol',
        studentFounder: 'Maya Lin (\'26)',
        sector: 'FINTECH_CRYPTO',
        arrRevenue: 650000,
        valuation: 8500000,
        stage: 'SEED',
        status: 'Active Incubation'
      },
      {
        id: 'VEN-003',
        startupCode: 'VEN-BIO-402',
        name: 'BioPulse Synthetic Diagnostics',
        studentFounder: 'David Miller (\'26)',
        sector: 'BIOTECH_HEALTH',
        arrRevenue: 120000,
        valuation: 3500000,
        stage: 'PRE_SEED',
        status: 'Active Incubation'
      }
    ];
  }

  /**
   * Calculates total portfolio valuation sum.
   * @param {Array<StudentVenture>} ventures
   * @returns {number}
   */
  calculateTotalValuation(ventures = this.ventures) {
    if (!ventures || ventures.length === 0) return 0;
    return ventures.reduce((acc, v) => acc + v.valuation, 0);
  }

  /**
   * Calculates total combined Annual Recurring Revenue (ARR).
   * @param {Array<StudentVenture>} ventures
   * @returns {number}
   */
  calculateTotalArr(ventures = this.ventures) {
    if (!ventures || ventures.length === 0) return 0;
    return ventures.reduce((acc, v) => acc + v.arrRevenue, 0);
  }

  /**
   * Filters student ventures by sector, stage, and search query.
   * @param {{ sector: string, stage: string, searchQuery: string }} criteria
   * @returns {Array<StudentVenture>}
   */
  filterVentures(criteria) {
    return this.ventures.filter(v => {
      if (criteria.sector && criteria.sector !== 'ALL' && v.sector !== criteria.sector) return false;
      if (criteria.stage && criteria.stage !== 'ALL' && v.stage !== criteria.stage) return false;
      if (criteria.searchQuery && criteria.searchQuery.trim() !== '') {
        const query = criteria.searchQuery.toLowerCase().trim();
        const matchName = v.name.toLowerCase().includes(query);
        const matchFounder = v.studentFounder.toLowerCase().includes(query);
        if (!matchName && !matchFounder) return false;
      }
      return true;
    });
  }

  /**
   * Sanitizes input string against script injection.
   * @param {string} str
   * @returns {string}
   */
  sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
// Total lines: 130+ lines
