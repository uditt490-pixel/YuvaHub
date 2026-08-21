import {
  ResearchProposal,
  GrantAnalytics,
  ResearchGrantFilterOptions,
  PeerReviewScorecard,
  GrantDisbursementPayload
} from '../types/researchGrant';

export class ResearchGrantService {
  private static proposalsStore: ResearchProposal[] = [
    {
      id: 'grant-001',
      grantCode: 'DST-SERB-2026-AI-801',
      title: 'Targeted Epigenetic Editing for Drug-Resistant Triple Negative Breast Cancer',
      abstract: 'Investigating CRISPR-dCas9 conjugated with DNA methyltransferase inhibitors to selectively reverse oncogenic promoter silencing in chemo-refractory TNBC cell lines.',
      principalInvestigator: 'Dr. Avantika Swaminathan',
      piEmail: 'avantika.s@iitb.ac.in',
      college: 'IIT Bombay',
      department: 'Department of Biosciences & Bioengineering',
      category: 'AI_BIOTECH_RESEARCH',
      requestedGrantLakhs: 85.0,
      disbursedGrantLakhs: 45.0,
      durationMonths: 36,
      status: 'FUNDS_DISBURSED',
      compositeReviewScore: 96.5,
      milestones: [
        {
          id: 'ms-001',
          milestoneTitle: 'Phase 1: sgRNA library design & viral vector validation',
          targetMonth: 6,
          allocatedAmountLakhs: 25.0,
          deliverablesSummary: 'Complete in-vitro cleavage efficiency benchmarks (>85%).',
          isUnlocked: true,
          unlockedAt: new Date(Date.now() - 60 * 86400000).toISOString()
        },
        {
          id: 'ms-002',
          milestoneTitle: 'Phase 2: Pre-clinical xenograft efficacy profiling',
          targetMonth: 18,
          allocatedAmountLakhs: 20.0,
          deliverablesSummary: 'Demonstrate >60% tumor volume regression with zero off-target toxicity.',
          isUnlocked: true,
          unlockedAt: new Date(Date.now() - 10 * 86400000).toISOString()
        },
        {
          id: 'ms-003',
          milestoneTitle: 'Phase 3: Pharmacokinetic safety and IND submission packet',
          targetMonth: 36,
          allocatedAmountLakhs: 40.0,
          deliverablesSummary: 'Final regulatory dossier for DCGI Phase 1 human trial filing.',
          isUnlocked: false
        }
      ],
      peerReviews: [
        {
          id: 'prev-001',
          reviewerName: 'Prof. R. Balasubramanian',
          reviewerTitle: 'Senior Scientist @ National Institute of Immunology',
          scientificMeritScore: 9.8,
          commercialFeasibilityScore: 9.2,
          methodologyRigorScore: 9.8,
          overallRecommendation: 'STRONGLY_FUND',
          writtenEvaluation: 'Transformative biological hypothesis with rigorous multi-modal control assays. Highly recommended for immediate capital disbursement.',
          reviewedAt: new Date(Date.now() - 70 * 86400000).toISOString()
        }
      ],
      submittedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      irbApprovalCode: 'IITB-IRB-2026-MED-0442'
    },
    {
      id: 'grant-002',
      grantCode: 'DST-SERB-2026-QNT-802',
      title: 'Fault-Tolerant Surface Code Architecture on Superconducting Qubit Meshes',
      abstract: 'Architecting scalable 128-qubit logical error mitigation controllers using cryogenic CMOS feedback circuitry.',
      principalInvestigator: 'Dr. Chirag Singhal',
      piEmail: 'chirag.s@iitd.ac.in',
      college: 'IIT Delhi',
      department: 'Department of Electrical Engineering & Physics',
      category: 'QUANTUM_COMPUTING',
      requestedGrantLakhs: 120.0,
      disbursedGrantLakhs: 40.0,
      durationMonths: 24,
      status: 'FUNDS_DISBURSED',
      compositeReviewScore: 93.8,
      milestones: [
        {
          id: 'ms-004',
          milestoneTitle: 'Phase 1: Cryogenic FPGA controller synthesis at 4 Kelvin',
          targetMonth: 12,
          allocatedAmountLakhs: 40.0,
          deliverablesSummary: 'Latency < 120ns for real-time syndrome extraction decoding.',
          isUnlocked: true,
          unlockedAt: new Date(Date.now() - 20 * 86400000).toISOString()
        },
        {
          id: 'ms-005',
          milestoneTitle: 'Phase 2: 128-qubit logical lattice braiding demonstration',
          targetMonth: 24,
          allocatedAmountLakhs: 80.0,
          deliverablesSummary: 'Suppression of 2-qubit gate error rates below 10^-4.',
          isUnlocked: false
        }
      ],
      peerReviews: [],
      submittedAt: new Date(Date.now() - 40 * 86400000).toISOString()
    },
    {
      id: 'grant-003',
      grantCode: 'DST-SERB-2026-CLT-803',
      title: 'Next-Gen Solid-State Sodium-Ion Batteries with High-Entropy Cathodes',
      abstract: 'Developing cost-effective, cobalt-free energy storage cells achieving >350 Wh/kg specific energy for tropical climate electric vehicles.',
      principalInvestigator: 'Dr. Meera Natesan',
      piEmail: 'meera.n@bits-pilani.ac.in',
      college: 'BITS Pilani',
      department: 'Department of Chemical Engineering',
      category: 'CLEANTECH_ENERGY',
      requestedGrantLakhs: 75.0,
      disbursedGrantLakhs: 0.0,
      durationMonths: 24,
      status: 'PEER_REVIEW',
      compositeReviewScore: 88.5,
      milestones: [
        {
          id: 'ms-006',
          milestoneTitle: 'Phase 1: High-entropy oxide cathode synthesis and XRD characterization',
          targetMonth: 8,
          allocatedAmountLakhs: 30.0,
          deliverablesSummary: 'Synthesize 5kg pilot batch with >95% phase purity.',
          isUnlocked: false
        },
        {
          id: 'ms-007',
          milestoneTitle: 'Phase 2: 1000-cycle pouch cell endurance testing at 45°C',
          targetMonth: 24,
          allocatedAmountLakhs: 45.0,
          deliverablesSummary: 'Retain >88% capacity after 1000 fast-charge cycles.',
          isUnlocked: false
        }
      ],
      peerReviews: [],
      submittedAt: new Date(Date.now() - 15 * 86400000).toISOString()
    }
  ];

  public static async getProposals(
    filters?: Partial<ResearchGrantFilterOptions>
  ): Promise<ResearchProposal[]> {
    await new Promise((r) => setTimeout(r, 300));
    let list = [...this.proposalsStore];

    if (!filters) return list;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.grantCode.toLowerCase().includes(q) ||
          p.principalInvestigator.toLowerCase().includes(q) ||
          p.college.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'ALL') {
      list = list.filter((p) => p.category === filters.category);
    }

    if (filters.status && filters.status !== 'ALL') {
      list = list.filter((p) => p.status === filters.status);
    }

    if (filters.college) {
      list = list.filter((p) => p.college === filters.college);
    }

    if (filters.minScore && filters.minScore > 0) {
      list = list.filter((p) => p.compositeReviewScore >= filters.minScore!);
    }

    if (filters.sortBy) {
      list.sort((a, b) => {
        let valA = 0;
        let valB = 0;
        if (filters.sortBy === 'score') {
          valA = a.compositeReviewScore;
          valB = b.compositeReviewScore;
        } else if (filters.sortBy === 'grantAmount') {
          valA = a.requestedGrantLakhs;
          valB = b.requestedGrantLakhs;
        } else if (filters.sortBy === 'submittedAt') {
          valA = new Date(a.submittedAt).getTime();
          valB = new Date(b.submittedAt).getTime();
        }
        return filters.sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    return list;
  }

  public static async submitPeerReview(
    proposalId: string,
    scorecard: Omit<PeerReviewScorecard, 'id' | 'reviewedAt'>
  ): Promise<ResearchProposal> {
    await new Promise((r) => setTimeout(r, 400));
    const index = this.proposalsStore.findIndex((p) => p.id === proposalId);
    if (index === -1) throw new Error('Proposal not found');

    const proposal = this.proposalsStore[index];
    const newScorecard: PeerReviewScorecard = {
      ...scorecard,
      id: `prev-${Date.now()}`,
      reviewedAt: new Date().toISOString()
    };

    const updatedReviews = [newScorecard, ...proposal.peerReviews];
    const avgScore =
      (scorecard.scientificMeritScore * 4.0 +
        scorecard.methodologyRigorScore * 3.5 +
        scorecard.commercialFeasibilityScore * 2.5) *
      1.0;

    const updated: ResearchProposal = {
      ...proposal,
      peerReviews: updatedReviews,
      compositeReviewScore: Math.round(avgScore * 10) / 10,
      status: avgScore >= 90 ? 'INSTITUTIONAL_APPROVAL' : 'PEER_REVIEW'
    };

    this.proposalsStore[index] = updated;
    return updated;
  }

  public static async executeMilestoneDisbursement(
    payload: GrantDisbursementPayload
  ): Promise<ResearchProposal> {
    await new Promise((r) => setTimeout(r, 400));
    const index = this.proposalsStore.findIndex((p) => p.id === payload.proposalId);
    if (index === -1) throw new Error('Proposal not found');

    const proposal = this.proposalsStore[index];
    const updatedMilestones = proposal.milestones.map((m) => {
      if (m.id === payload.milestoneId) {
        return {
          ...m,
          isUnlocked: true,
          unlockedAt: new Date().toISOString()
        };
      }
      return m;
    });

    const newDisbursed = proposal.disbursedGrantLakhs + payload.disbursementAmountLakhs;
    const updated: ResearchProposal = {
      ...proposal,
      disbursedGrantLakhs: newDisbursed,
      status: 'FUNDS_DISBURSED',
      milestones: updatedMilestones
    };

    this.proposalsStore[index] = updated;
    return updated;
  }

  public static async getAnalytics(): Promise<GrantAnalytics> {
    await new Promise((r) => setTimeout(r, 250));
    const list = this.proposalsStore;
    const totalReq = list.reduce((acc, p) => acc + p.requestedGrantLakhs, 0);
    const totalDisb = list.reduce((acc, p) => acc + p.disbursedGrantLakhs, 0);
    const fundedCount = list.filter((p) => p.status === 'FUNDS_DISBURSED').length;
    const avgScore = list.reduce((acc, p) => acc + p.compositeReviewScore, 0) / (list.length || 1);

    return {
      totalRequestedCapitalLakhs: totalReq,
      totalDisbursedCapitalLakhs: totalDisb,
      activeProposals: list.length,
      fundedProposalsCount: fundedCount,
      averageScientificScore: Math.round(avgScore * 10) / 10,
      auditComplianceRate: 100.0,
      categoryDistribution: [
        { category: 'AI_BIOTECH_RESEARCH', proposalCount: 14, capitalLakhs: 840.0 },
        { category: 'QUANTUM_COMPUTING', proposalCount: 8, capitalLakhs: 960.0 },
        { category: 'CLEANTECH_ENERGY', proposalCount: 12, capitalLakhs: 620.0 },
        { category: 'SEMICONDUCTOR_VLSI', proposalCount: 6, capitalLakhs: 750.0 }
      ],
      institutionAllocations: [
        { college: 'IIT Bombay', awardedCapitalLakhs: 920.0, projectCount: 12 },
        { college: 'IIT Delhi', awardedCapitalLakhs: 840.0, projectCount: 10 },
        { college: 'BITS Pilani', awardedCapitalLakhs: 680.0, projectCount: 9 },
        { college: 'IIIT Hyderabad', awardedCapitalLakhs: 540.0, projectCount: 7 }
      ]
    };
  }

  public static exportCSV(proposals: ResearchProposal[]): string {
    const headers = [
      'Grant Code',
      'Title',
      'Principal Investigator',
      'College',
      'Category',
      'Requested (Lakhs)',
      'Disbursed (Lakhs)',
      'Score',
      'Status'
    ];

    const rows = proposals.map((p) => [
      p.grantCode,
      `"${p.title}"`,
      `"${p.principalInvestigator}"`,
      `"${p.college}"`,
      p.category,
      p.requestedGrantLakhs,
      p.disbursedGrantLakhs,
      p.compositeReviewScore,
      p.status
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
