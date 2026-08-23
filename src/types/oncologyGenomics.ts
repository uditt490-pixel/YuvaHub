/**
 * Precision Oncology & Genomic Biomarker Clinical Decision Support Type Definitions
 * Standards Compliance: NCCN, ESMO Precision Oncology, AMP/ASCO/CAP Molecular Guidelines, HL7 FHIR R4 Genomics
 */

export type TumorPrimarySite =
  | "NON_SMALL_CELL_LUNG"
  | "COLORECTAL"
  | "BREAST"
  | "MELANOMA"
  | "PANCREATIC_DUCTAL"
  | "OVARIAN_HIGH_GRADE"
  | "PROSTATE"
  | "GASTROESOPHAGEAL"
  | "GLIOBLASTOMA";

export type VariantClinicalTier =
  | "TIER_I_STRONG_CLINICAL_SIGNIFICANCE"      // FDA Approved therapy / NCCN Category 1
  | "TIER_II_POTENTIAL_SIGNIFICANCE"           // Off-label / NCCN Category 2A / Active Clinical Trial
  | "TIER_III_UNKNOWN_SIGNIFICANCE"            // Variant of Uncertain Significance (VUS)
  | "TIER_IV_BENIGN_OR_LIKELY_BENIGN";

export type MsiStatus =
  | "MSI_HIGH"       // Microsatellite Instability-High (dMMR)
  | "MSS"            // Microsatellite Stable (pMMR)
  | "MSI_INDETERMINATE";

export type HrdStatus =
  | "HRD_POSITIVE"   // HRD Score >= 42 or BRCA1/2 loss
  | "HRD_NEGATIVE"   // HRD Score < 42
  | "HRD_EQUIVOCAL";

export type MrdStatus =
  | "MRD_POSITIVE"   // ctDNA detected above limit of detection
  | "MRD_NEGATIVE"   // ctDNA undetectable
  | "MRD_INDETERMINATE";

export type TherapyLineStatus =
  | "FIRST_LINE_TARGETED"
  | "FIRST_LINE_IMMUNOTHERAPY"
  | "SECOND_LINE_RESISTANCE_TARGETED"
  | "COMBINATION_CHEMO_IO"
  | "PARP_INHIBITOR_MAINTENANCE"
  | "CLINICAL_TRIAL_ARM"
  | "MOLECULAR_TUMOR_BOARD_PENDING";

export interface GenomicMutation {
  id: string;
  geneSymbol: string;              // e.g. "EGFR", "KRAS", "BRAF"
  hgvsc: string;                   // e.g. "c.2573T>G"
  hgvsp: string;                   // e.g. "p.Leu858Arg" (L858R)
  exon: number;                    // e.g. 21
  variantAlleleFrequency: number;  // VAF % (e.g. 34.5%)
  sequencingDepthX: number;        // e.g. 1200x
  tier: VariantClinicalTier;
  mutationType: "SNV" | "INDEL" | "CNV_AMPLIFICATION" | "GENE_FUSION" | "SPLICE_SITE";
  associatedTherapies: string[];   // e.g. ["Osimertinib", "Erlotinib"]
  resistanceMechanism?: string;    // e.g. "T790M confers 1st/2nd Gen TKI resistance"
}

export interface LiquidBiopsyCtDna {
  timestamp: string;
  plasmaCtDnaHgeMl: number;        // human genome equivalents per mL (hGE/mL)
  meanVafPercent: number;          // Mean VAF across tracking clones
  mrdStatus: MrdStatus;
  clonesTrackedCount: number;
  longitudinalTrend: "RISING" | "FALLING" | "CLEARANCE" | "STABLE";
  ctDnaHistory: number[];          // 30 historical timepoints for sparklines
}

export interface PharmacogenomicsProfile {
  dpydStatus: "NORMAL_METABOLIZER" | "INTERMEDIATE_METABOLIZER" | "POOR_METABOLIZER";
  dpydVariantsDetected: string[];  // e.g. "*2A (c.1905+1G>A)", "*13 (c.1679T>G)"
  fluoropyrimidineToxicityRisk: "LOW" | "MODERATE" | "SEVERE_FATAL_RISK";
  fluoropyrimidineDoseAdjustmentPercent: number; // e.g. 50% reduction or 0% (contraindicated)

  ugt1a1Status: "*1/*1 (Normal)" | "*1/*28 (Intermediate)" | "*28/*28 (Homozygous Poor)";
  irinotecanToxicityRisk: "STANDARD" | "ELEVATED_NEUTROPENIA_RISK" | "HIGH_SEVERE_TOXICITY";
  irinotecanDoseAdjustmentPercent: number;

  tpmtStatus: "NORMAL" | "INTERMEDIATE" | "DEFICIENT";
}

export interface MolecularTumorProfile {
  tumorMutationBurdenMb: number;   // mut/Mb
  tmbClassification: "TMB_HIGH" | "TMB_INTERMEDIATE" | "TMB_LOW"; // >=10 is High
  msiStatus: MsiStatus;
  hrdScore: number;                // 0 - 100
  hrdStatus: HrdStatus;
  pdl1TpsScorePercent: number;     // Tumor Proportion Score (0 - 100%)
  mutations: GenomicMutation[];
  actionableBiomarkersCount: number;
  resistanceMutationsCount: number;
}

export interface ClinicalTrialMatch {
  nctId: string;
  title: string;
  phase: "PHASE_I" | "PHASE_II" | "PHASE_III" | "BASKET_TRIAL";
  matchedGene: string;
  experimentalDrug: string;
  location: string;
  eligibilityStatus: "HIGHLY_ELIGIBLE" | "POTENTIAL_MATCH" | "EXCLUDED_PRIOR_THERAPY";
  matchRationale: string;
}

export interface MolecularTumorBoardDiscussion {
  meetingId: string;
  scheduledDate: string;
  leadOncologist: string;
  leadPathologist: string;
  leadGenomicist: string;
  status: "SCHEDULED" | "CONSENSUS_REACHED" | "ACTION_ORDERED";
  consensusRecommendation: string;
  tierIActionOrdered: string;
}

export interface OncologyPatient {
  id: string;
  mrn: string;
  name: string;
  ageYears: number;
  gender: "MALE" | "FEMALE";
  weightKg: number;
  heightCm: number;
  bodySurfaceAreaM2: number;       // Mosteller BSA formula: sqrt((Ht * Wt) / 3600)
  primarySite: TumorPrimarySite;
  histologySubtype: string;
  clinicalTnmStage: string;        // e.g. "cT3N2M1b (Stage IVB)"
  ecogPerformanceStatus: 0 | 1 | 2 | 3 | 4;
  currentTherapyLine: TherapyLineStatus;
  currentRegimenName: string;
  molecularProfile: MolecularTumorProfile;
  liquidBiopsy: LiquidBiopsyCtDna;
  pharmacogenomics: PharmacogenomicsProfile;
  matchedTrials: ClinicalTrialMatch[];
  tumorBoard: MolecularTumorBoardDiscussion;
  recurrenceRiskScore: number;     // 0 - 100 Genomic Recurrence Score
  activeAlertsCount: number;
}

export interface OncologyWardMetrics {
  totalPatients: number;
  tmbHighCount: number;
  actionableTargetedEligibleCount: number;
  mrdPositiveCtDnaCount: number;
  pharmacogenomicDoseReducedCount: number;
  mtbScheduledCount: number;
  clinicalTrialMatchedCount: number;
  lastGenomicSyncTimestamp: string;
}
