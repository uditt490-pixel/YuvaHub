/**
 * ENTERPRISE ARCHITECTURAL BUSINESS LOGIC ENGINE
 * MODULE: Research IP & Patent Licensing Service Engine
 * SYSTEM ARCHITECTURE: YuvaHub Institutional Technology Transfer Office
 * VERSION: 4.5.0-RELEASE
 */

/**
 * @typedef {Object} PatentDisclosure
 * @property {string} id
 * @property {string} patentCode
 * @property {string} title
 * @property {string} leadInventor
 * @property {string} domain
 * @property {number} trlLevel
 * @property {number} annualRoyalty
 * @property {string} corporateLicensee
 * @property {string} status
 */

export class ResearchPatentEngine {
  /**
   * Initializes the Research Patent Engine state.
   * @param {Array<PatentDisclosure>} [initialPatents=null]
   */
  constructor(initialPatents = null) {
    this.patents = initialPatents || this.generateDefaultPatents();
    this.activeFilters = {
      domain: 'ALL',
      trl: 'ALL',
      searchQuery: ''
    };
  }

  /**
   * Generates default invention disclosures for campus TTO analysis.
   * @returns {Array<PatentDisclosure>}
   */
  generateDefaultPatents() {
    return [
      {
        id: 'PAT-001',
        patentCode: 'US-98214-B2',
        title: 'Neuromorphic Photonic Tensor Processing Array',
        leadInventor: 'Dr. Alan Turing',
        domain: 'AI_QUANTUM',
        trlLevel: 8,
        annualRoyalty: 4500000,
        corporateLicensee: 'Intel Labs Corp',
        status: 'Granted & Licensed'
      },
      {
        id: 'PAT-002',
        patentCode: 'US-44109-A1',
        title: 'Targeted mRNA Nanoparticle Delivery for Oncology',
        leadInventor: 'Dr. Rosalind Franklin',
        domain: 'BIOTECH_MEDTECH',
        trlLevel: 6,
        annualRoyalty: 2800000,
        corporateLicensee: 'Moderna Bio',
        status: 'Pending USPTO Audit'
      },
      {
        id: 'PAT-003',
        patentCode: 'US-10928-B1',
        title: 'Perovskite-Silicon Tandem Solar Harvesting Mesh',
        leadInventor: 'Dr. Nikola Tesla',
        domain: 'CLEANTECH_ENERGY',
        trlLevel: 7,
        annualRoyalty: 1200000,
        corporateLicensee: 'FirstSolar Inc',
        status: 'Granted & Licensed'
      }
    ];
  }

  /**
   * Calculates total annual royalty yields from active patent licenses.
   * @param {Array<PatentDisclosure>} patents
   * @returns {number}
   */
  calculateTotalRoyaltyYield(patents = this.patents) {
    if (!patents || patents.length === 0) return 0;
    return patents.reduce((acc, p) => acc + p.annualRoyalty, 0);
  }

  /**
   * Calculates average TRL score of patents in portfolio.
   * @param {Array<PatentDisclosure>} patents
   * @returns {number}
   */
  calculateAverageTrl(patents = this.patents) {
    if (!patents || patents.length === 0) return 0.0;
    const totalTrl = patents.reduce((acc, p) => acc + p.trlLevel, 0);
    return parseFloat((totalTrl / patents.length).toFixed(1));
  }

  /**
   * Filters patent disclosures by domain, TRL stage, and search query.
   * @param {{ domain: string, trl: string, searchQuery: string }} criteria
   * @returns {Array<PatentDisclosure>}
   */
  filterPatents(criteria) {
    return this.patents.filter(p => {
      if (criteria.domain && criteria.domain !== 'ALL' && p.domain !== criteria.domain) return false;
      if (criteria.trl && criteria.trl !== 'ALL') {
        if (criteria.trl === 'EARLY' && p.trlLevel > 3) return false;
        if (criteria.trl === 'PROTOTYPE' && (p.trlLevel < 4 || p.trlLevel > 6)) return false;
        if (criteria.trl === 'COMMERCIAL' && p.trlLevel < 7) return false;
      }
      if (criteria.searchQuery && criteria.searchQuery.trim() !== '') {
        const query = criteria.searchQuery.toLowerCase().trim();
        const matchCode = p.patentCode.toLowerCase().includes(query);
        const matchInventor = p.leadInventor.toLowerCase().includes(query);
        if (!matchCode && !matchInventor) return false;
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
