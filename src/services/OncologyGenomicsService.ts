/**
 * Precision Oncology & Genomic Decision Support Service Engine
 * 
 * Standards Reference:
 * - NCCN Clinical Practice Guidelines in Oncology (Biomarker-Directed Therapy)
 * - ESMO Precision Medicine Recommendations
 * - AMP / ASCO / CAP Standards for Somatic Variant Interpretation
 * - CPIC Pharmacogenomics Dosing Guidelines (DPYD, UGT1A1, TPMT)
 * - HL7 FHIR R4 Genomics DiagnosticReport & MolecularSequence Profiles
 */

import {
  TumorPrimarySite,
  VariantClinicalTier,
  MsiStatus,
  HrdStatus,
  MrdStatus,
  TherapyLineStatus,
  GenomicMutation,
  LiquidBiopsyCtDna,
  PharmacogenomicsProfile,
  MolecularTumorProfile,
  ClinicalTrialMatch,
  MolecularTumorBoardDiscussion,
  OncologyPatient,
  OncologyWardMetrics
} from "../types/oncologyGenomics";

export class OncologyGenomicsService {
  /**
   * Body Surface Area (BSA) via Mosteller Formula
   * BSA = sqrt((Height_cm * Weight_kg) / 3600)
   */
  public static calculateBsa(heightCm: number, weightKg: number): number {
    if (heightCm <= 0 || weightKg <= 0) return 1.7;
    return Math.round(Math.sqrt((heightCm * weightKg) / 3600) * 100) / 100;
  }

  /**
   * Tumor Mutation Burden (TMB) Classification
   * Standard: FDA / NCCN Pan-Tumor Pembrolizumab threshold (>= 10 mut/Mb)
   */
  public static classifyTmb(tmbMutMb: number): MolecularTumorProfile["tmbClassification"] {
    if (tmbMutMb >= 10.0) return "TMB_HIGH";
    if (tmbMutMb >= 6.0) return "TMB_INTERMEDIATE";
    return "TMB_LOW";
  }

  /**
   * Homologous Recombination Deficiency (HRD) Status
   * Standard: Score >= 42 or BRCA1/2 loss-of-function
   */
  public static evaluateHrdStatus(hrdScore: number, mutations: GenomicMutation[]): HrdStatus {
    const hasBrcaLoss = mutations.some(
      (m) => (m.geneSymbol === "BRCA1" || m.geneSymbol === "BRCA2") && m.tier === "TIER_I_STRONG_CLINICAL_SIGNIFICANCE"
    );
    if (hrdScore >= 42 || hasBrcaLoss) return "HRD_POSITIVE";
    if (hrdScore >= 35) return "HRD_EQUIVOCAL";
    return "HRD_NEGATIVE";
  }

  /**
   * Pharmacogenomic Dosing Safety Evaluator (CPIC Guidelines)
   */
  public static evaluatePharmacogenomics(
    dpydVariants: string[],
    ugt1a1Variant: string
  ): PharmacogenomicsProfile {
    let dpydStatus: PharmacogenomicsProfile["dpydStatus"] = "NORMAL_METABOLIZER";
    let fluoropyrimidineToxicityRisk: PharmacogenomicsProfile["fluoropyrimidineToxicityRisk"] = "LOW";
    let fluoropyrimidineDoseAdjustmentPercent = 0;

    if (dpydVariants.some((v) => v.includes("*2A") || v.includes("*13") || v.includes("c.1905+1G>A"))) {
      dpydStatus = "POOR_METABOLIZER";
      fluoropyrimidineToxicityRisk = "SEVERE_FATAL_RISK";
      fluoropyrimidineDoseAdjustmentPercent = 100; // Contraindicated / 0% dose
    } else if (dpydVariants.some((v) => v.includes("c.2846A>T") || v.includes("HapB3"))) {
      dpydStatus = "INTERMEDIATE_METABOLIZER";
      fluoropyrimidineToxicityRisk = "MODERATE";
      fluoropyrimidineDoseAdjustmentPercent = 50; // 50% dose reduction
    }

    let irinotecanToxicityRisk: PharmacogenomicsProfile["irinotecanToxicityRisk"] = "STANDARD";
    let irinotecanDoseAdjustmentPercent = 0;

    if (ugt1a1Variant.includes("*28/*28")) {
      irinotecanToxicityRisk = "HIGH_SEVERE_TOXICITY";
      irinotecanDoseAdjustmentPercent = 30; // 30% dose reduction
    } else if (ugt1a1Variant.includes("*1/*28")) {
      irinotecanToxicityRisk = "ELEVATED_NEUTROPENIA_RISK";
      irinotecanDoseAdjustmentPercent = 15;
    }

    return {
      dpydStatus,
      dpydVariantsDetected: dpydVariants,
      fluoropyrimidineToxicityRisk,
      fluoropyrimidineDoseAdjustmentPercent,
      ugt1a1Status: ugt1a1Variant as any,
      irinotecanToxicityRisk,
      irinotecanDoseAdjustmentPercent,
      tpmtStatus: "NORMAL"
    };
  }

  /**
   * Clinical Trial & Targeted Therapy Matching Engine
   */
  public static matchTherapiesAndTrials(patient: OncologyPatient): ClinicalTrialMatch[] {
    const trials: ClinicalTrialMatch[] = [];
    const geneSymbols = patient.molecularProfile.mutations.map((m) => m.geneSymbol);

    if (geneSymbols.includes("EGFR")) {
      const egfrMut = patient.molecularProfile.mutations.find((m) => m.geneSymbol === "EGFR");
      if (egfrMut?.hgvsp.includes("T790M") || egfrMut?.hgvsp.includes("C797S")) {
        trials.push({
          nctId: "NCT-04862780",
          title: "Phase II Study of 4th-Gen Allosteric EGFR Inhibitor in C797S / T790M Resistant NSCLC",
          phase: "PHASE_II",
          matchedGene: "EGFR C797S",
          experimentalDrug: "BLU-945 + Osimertinib",
          location: "Memorial Sloan Kettering / Multi-Center",
          eligibilityStatus: "HIGHLY_ELIGIBLE",
          matchRationale: "Direct target for acquired 3rd-generation TKI resistance mutation."
        });
      }
    }

    if (geneSymbols.includes("KRAS")) {
      const krasMut = patient.molecularProfile.mutations.find((m) => m.geneSymbol === "KRAS");
      if (krasMut?.hgvsp.includes("G12C")) {
        trials.push({
          nctId: "NCT-03785249",
          title: "KRYSTAL-1: Sotorasib / Adagrasib + Cetuximab Combination in KRAS G12C Solid Tumors",
          phase: "PHASE_III",
          matchedGene: "KRAS G12C",
          experimentalDrug: "Adagrasib (MRTX849) + Cetuximab",
          location: "Dana-Farber Cancer Institute",
          eligibilityStatus: "HIGHLY_ELIGIBLE",
          matchRationale: "Dual blockade of KRAS G12C switch-II pocket and EGFR feedback loop."
        });
      }
    }

    if (patient.molecularProfile.hrdStatus === "HRD_POSITIVE") {
      trials.push({
        nctId: "NCT-03605758",
        title: "TOPACIO / KEYNOTE-162: Niraparib plus Pembrolizumab in HRD-Positive Advanced Tumors",
        phase: "PHASE_II",
        matchedGene: "HRD Score >= 42 / BRCA",
        experimentalDrug: "Niraparib + Pembrolizumab",
        location: "MD Anderson Cancer Center",
        eligibilityStatus: "HIGHLY_ELIGIBLE",
        matchRationale: "Synthetic lethality from dual PARP inhibition and immune checkpoint activation."
      });
    }

    if (patient.molecularProfile.tmbClassification === "TMB_HIGH" || patient.molecularProfile.msiStatus === "MSI_HIGH") {
      trials.push({
        nctId: "NCT-04165798",
        title: "Pan-Tumor Dual Checkpoint Blockade (Nivolumab + Ipilimumab) in High TMB (>10 mut/Mb)",
        phase: "BASKET_TRIAL",
        matchedGene: "TMB-High / MSI-H",
        experimentalDrug: "Nivolumab + Ipilimumab",
        location: "National Cancer Institute (NCI-MATCH)",
        eligibilityStatus: "HIGHLY_ELIGIBLE",
        matchRationale: "High neoantigen burden enhances response to dual CTLA-4 and PD-1 blockade."
      });
    }

    return trials;
  }

  /**
   * Mock Oncology Patient Repository (6 Deep Genomic Cases)
   */
  public static getMockOncologyPatients(): OncologyPatient[] {
    const patients: OncologyPatient[] = [
      {
        id: "ONC-PT-401",
        mrn: "MRN-3394812",
        name: "Vikram Malhotra",
        ageYears: 62,
        gender: "MALE",
        weightKg: 74.0,
        heightCm: 176,
        bodySurfaceAreaM2: 1.90,
        primarySite: "NON_SMALL_CELL_LUNG",
        histologySubtype: "Lung Adenocarcinoma (EGFR-driven)",
        clinicalTnmStage: "cT3N2M1b (Stage IVB)",
        ecogPerformanceStatus: 1,
        currentTherapyLine: "SECOND_LINE_RESISTANCE_TARGETED",
        currentRegimenName: "Osimertinib 80mg Daily (Acquired C797S Mutation)",
        molecularProfile: {
          tumorMutationBurdenMb: 7.8,
          tmbClassification: "TMB_INTERMEDIATE",
          msiStatus: "MSS",
          hrdScore: 18,
          hrdStatus: "HRD_NEGATIVE",
          pdl1TpsScorePercent: 45,
          mutations: [
            {
              id: "MUT-01",
              geneSymbol: "EGFR",
              hgvsc: "c.2573T>G",
              hgvsp: "p.Leu858Arg (L858R)",
              exon: 21,
              variantAlleleFrequency: 38.4,
              sequencingDepthX: 1450,
              tier: "TIER_I_STRONG_CLINICAL_SIGNIFICANCE",
              mutationType: "SNV",
              associatedTherapies: ["Osimertinib", "Erlotinib", "Gefitinib"]
            },
            {
              id: "MUT-02",
              geneSymbol: "EGFR",
              hgvsc: "c.2389T>A",
              hgvsp: "p.Cys797Ser (C797S)",
              exon: 20,
              variantAlleleFrequency: 14.2,
              sequencingDepthX: 1200,
              tier: "TIER_I_STRONG_CLINICAL_SIGNIFICANCE",
              mutationType: "SNV",
              associatedTherapies: ["BLU-945 (Trial)", "Brigatinib + Cetuximab"],
              resistanceMechanism: "Disrupts covalent binding of Osimertinib; 4th Gen TKI candidate"
            },
            {
              id: "MUT-03",
              geneSymbol: "TP53",
              hgvsc: "c.742C>T",
              hgvsp: "p.Arg248Trp",
              exon: 7,
              variantAlleleFrequency: 42.1,
              sequencingDepthX: 980,
              tier: "TIER_II_POTENTIAL_SIGNIFICANCE",
              mutationType: "SNV",
              associatedTherapies: []
            }
          ],
          actionableBiomarkersCount: 2,
          resistanceMutationsCount: 1
        },
        liquidBiopsy: {
          timestamp: "2026-08-23T14:00:00Z",
          plasmaCtDnaHgeMl: 420,
          meanVafPercent: 12.8,
          mrdStatus: "MRD_POSITIVE",
          clonesTrackedCount: 3,
          longitudinalTrend: "RISING",
          ctDnaHistory: [180, 175, 160, 140, 130, 120, 110, 115, 130, 160, 210, 260, 310, 370, 420]
        },
        pharmacogenomics: {
          dpydStatus: "NORMAL_METABOLIZER",
          dpydVariantsDetected: [],
          fluoropyrimidineToxicityRisk: "LOW",
          fluoropyrimidineDoseAdjustmentPercent: 0,
          ugt1a1Status: "*1/*1 (Normal)",
          irinotecanToxicityRisk: "STANDARD",
          irinotecanDoseAdjustmentPercent: 0,
          tpmtStatus: "NORMAL"
        },
        matchedTrials: [],
        tumorBoard: {
          meetingId: "MTB-2026-08-24-A",
          scheduledDate: "2026-08-24T10:00:00Z",
          leadOncologist: "Dr. Sanjay Gupta, MD",
          leadPathologist: "Dr. Sunita Rao, MD",
          leadGenomicist: "Dr. Amit Shah, PhD",
          status: "CONSENSUS_REACHED",
          consensusRecommendation: "Enroll in Phase II Allosteric 4th-Gen EGFR Inhibitor Clinical Trial (NCT-04862780).",
          tierIActionOrdered: "BLU-945 + Osimertinib combination trial arm"
        },
        recurrenceRiskScore: 78,
        activeAlertsCount: 2
      },
      {
        id: "ONC-PT-402",
        mrn: "MRN-4482019",
        name: "Sunita Deshmukh",
        ageYears: 54,
        gender: "FEMALE",
        weightKg: 62.0,
        heightCm: 160,
        bodySurfaceAreaM2: 1.66,
        primarySite: "BREAST",
        histologySubtype: "Invasive Ductal Carcinoma (Triple-Negative / BRCA1-mutant)",
        clinicalTnmStage: "pT2N1aM0 (Stage IIB)",
        ecogPerformanceStatus: 0,
        currentTherapyLine: "PARP_INHIBITOR_MAINTENANCE",
        currentRegimenName: "Olaparib 300mg BID Maintenance",
        molecularProfile: {
          tumorMutationBurdenMb: 14.5,
          tmbClassification: "TMB_HIGH",
          msiStatus: "MSS",
          hrdScore: 68,
          hrdStatus: "HRD_POSITIVE",
          pdl1TpsScorePercent: 10,
          mutations: [
            {
              id: "MUT-04",
              geneSymbol: "BRCA1",
              hgvsc: "c.68_69delAG",
              hgvsp: "p.Glu23fs",
              exon: 2,
              variantAlleleFrequency: 48.0,
              sequencingDepthX: 1800,
              tier: "TIER_I_STRONG_CLINICAL_SIGNIFICANCE",
              mutationType: "INDEL",
              associatedTherapies: ["Olaparib", "Talazoparib", "Platinum-based Chemo"]
            },
            {
              id: "MUT-05",
              geneSymbol: "PIK3CA",
              hgvsc: "c.3140A>G",
              hgvsp: "p.His1047Arg (H1047R)",
              exon: 20,
              variantAlleleFrequency: 22.5,
              sequencingDepthX: 1100,
              tier: "TIER_I_STRONG_CLINICAL_SIGNIFICANCE",
              mutationType: "SNV",
              associatedTherapies: ["Alpelisib", "Capivasertib"]
            }
          ],
          actionableBiomarkersCount: 2,
          resistanceMutationsCount: 0
        },
        liquidBiopsy: {
          timestamp: "2026-08-23T13:30:00Z",
          plasmaCtDnaHgeMl: 0,
          meanVafPercent: 0,
          mrdStatus: "MRD_NEGATIVE",
          clonesTrackedCount: 2,
          longitudinalTrend: "CLEARANCE",
          ctDnaHistory: [850, 620, 380, 190, 80, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        pharmacogenomics: {
          dpydStatus: "INTERMEDIATE_METABOLIZER",
          dpydVariantsDetected: ["c.2846A>T (DPYD*Int)"],
          fluoropyrimidineToxicityRisk: "MODERATE",
          fluoropyrimidineDoseAdjustmentPercent: 50,
          ugt1a1Status: "*1/*1 (Normal)",
          irinotecanToxicityRisk: "STANDARD",
          irinotecanDoseAdjustmentPercent: 0,
          tpmtStatus: "NORMAL"
        },
        matchedTrials: [],
        tumorBoard: {
          meetingId: "MTB-2026-08-20-B",
          scheduledDate: "2026-08-20T14:00:00Z",
          leadOncologist: "Dr. Sanjay Gupta, MD",
          leadPathologist: "Dr. Sunita Rao, MD",
          leadGenomicist: "Dr. Amit Shah, PhD",
          status: "ACTION_ORDERED",
          consensusRecommendation: "Continue Olaparib maintenance; molecular residual disease is ctDNA negative.",
          tierIActionOrdered: "Olaparib 300mg BID Maintenance + 3-month ctDNA surveillance"
        },
        recurrenceRiskScore: 32,
        activeAlertsCount: 1
      },
      {
        id: "ONC-PT-403",
        mrn: "MRN-5591028",
        name: "Rajeshwar Iyer",
        ageYears: 58,
        gender: "MALE",
        weightKg: 82.0,
        heightCm: 172,
        bodySurfaceAreaM2: 1.98,
        primarySite: "COLORECTAL",
        histologySubtype: "Colorectal Adenocarcinoma (KRAS G12C)",
        clinicalTnmStage: "cT4aN2bM1a (Stage IVA)",
        ecogPerformanceStatus: 1,
        currentTherapyLine: "FIRST_LINE_TARGETED",
        currentRegimenName: "Adagrasib + Cetuximab + FOLFIRI (Dose-Adjusted)",
        molecularProfile: {
          tumorMutationBurdenMb: 8.2,
          tmbClassification: "TMB_INTERMEDIATE",
          msiStatus: "MSS",
          hrdScore: 12,
          hrdStatus: "HRD_NEGATIVE",
          pdl1TpsScorePercent: 5,
          mutations: [
            {
              id: "MUT-06",
              geneSymbol: "KRAS",
              hgvsc: "c.34G>T",
              hgvsp: "p.Gly12Cys (G12C)",
              exon: 2,
              variantAlleleFrequency: 41.2,
              sequencingDepthX: 2100,
              tier: "TIER_I_STRONG_CLINICAL_SIGNIFICANCE",
              mutationType: "SNV",
              associatedTherapies: ["Adagrasib + Cetuximab", "Sotorasib + Panitumumab"]
            },
            {
              id: "MUT-07",
              geneSymbol: "APC",
              hgvsc: "c.4348C>T",
              hgvsp: "p.Arg1450Ter",
              exon: 15,
              variantAlleleFrequency: 46.8,
              sequencingDepthX: 1600,
              tier: "TIER_II_POTENTIAL_SIGNIFICANCE",
              mutationType: "SNV",
              associatedTherapies: []
            }
          ],
          actionableBiomarkersCount: 1,
          resistanceMutationsCount: 0
        },
        liquidBiopsy: {
          timestamp: "2026-08-23T12:45:00Z",
          plasmaCtDnaHgeMl: 280,
          meanVafPercent: 8.4,
          mrdStatus: "MRD_POSITIVE",
          clonesTrackedCount: 2,
          longitudinalTrend: "FALLING",
          ctDnaHistory: [890, 850, 780, 690, 580, 490, 420, 360, 310, 280]
        },
        pharmacogenomics: {
          dpydStatus: "NORMAL_METABOLIZER",
          dpydVariantsDetected: [],
          fluoropyrimidineToxicityRisk: "LOW",
          fluoropyrimidineDoseAdjustmentPercent: 0,
          ugt1a1Status: "*1/*28 (Intermediate)",
          irinotecanToxicityRisk: "ELEVATED_NEUTROPENIA_RISK",
          irinotecanDoseAdjustmentPercent: 15,
          tpmtStatus: "NORMAL"
        },
        matchedTrials: [],
        tumorBoard: {
          meetingId: "MTB-2026-08-22-C",
          scheduledDate: "2026-08-22T11:30:00Z",
          leadOncologist: "Dr. Sanjay Gupta, MD",
          leadPathologist: "Dr. Sunita Rao, MD",
          leadGenomicist: "Dr. Amit Shah, PhD",
          status: "CONSENSUS_REACHED",
          consensusRecommendation: "Dual KRAS G12C + EGFR antibody blockade with UGT1A1-adjusted FOLFIRI.",
          tierIActionOrdered: "Adagrasib + Cetuximab regimen"
        },
        recurrenceRiskScore: 84,
        activeAlertsCount: 1
      },
      {
        id: "ONC-PT-404",
        mrn: "MRN-6610924",
        name: "Pooja Banerjee",
        ageYears: 47,
        gender: "FEMALE",
        weightKg: 58.0,
        heightCm: 165,
        bodySurfaceAreaM2: 1.63,
        primarySite: "MELANOMA",
        histologySubtype: "Cutaneous Metastatic Melanoma (BRAF V600E)",
        clinicalTnmStage: "cT4bN3cM1c (Stage IV)",
        ecogPerformanceStatus: 1,
        currentTherapyLine: "FIRST_LINE_TARGETED",
        currentRegimenName: "Dabrafenib (150mg BID) + Trametinib (2mg QD)",
        molecularProfile: {
          tumorMutationBurdenMb: 24.8,
          tmbClassification: "TMB_HIGH",
          msiStatus: "MSS",
          hrdScore: 22,
          hrdStatus: "HRD_NEGATIVE",
          pdl1TpsScorePercent: 80,
          mutations: [
            {
              id: "MUT-08",
              geneSymbol: "BRAF",
              hgvsc: "c.1799T>A",
              hgvsp: "p.Val600Glu (V600E)",
              exon: 15,
              variantAlleleFrequency: 52.3,
              sequencingDepthX: 2400,
              tier: "TIER_I_STRONG_CLINICAL_SIGNIFICANCE",
              mutationType: "SNV",
              associatedTherapies: ["Dabrafenib + Trametinib", "Encorafenib + Binimetinib"]
            },
            {
              id: "MUT-09",
              geneSymbol: "NRAS",
              hgvsc: "c.182A>G",
              hgvsp: "p.Gln61Arg (Q61R)",
              exon: 3,
              variantAlleleFrequency: 6.8,
              sequencingDepthX: 1900,
              tier: "TIER_II_POTENTIAL_SIGNIFICANCE",
              mutationType: "SNV",
              associatedTherapies: ["MEK Inhibitors"],
              resistanceMechanism: "Emerging subclonal resistance clone to BRAF monotherapy"
            }
          ],
          actionableBiomarkersCount: 2,
          resistanceMutationsCount: 1
        },
        liquidBiopsy: {
          timestamp: "2026-08-23T11:00:00Z",
          plasmaCtDnaHgeMl: 120,
          meanVafPercent: 4.2,
          mrdStatus: "MRD_POSITIVE",
          clonesTrackedCount: 2,
          longitudinalTrend: "FALLING",
          ctDnaHistory: [1400, 1100, 850, 620, 410, 260, 180, 120]
        },
        pharmacogenomics: {
          dpydStatus: "NORMAL_METABOLIZER",
          dpydVariantsDetected: [],
          fluoropyrimidineToxicityRisk: "LOW",
          fluoropyrimidineDoseAdjustmentPercent: 0,
          ugt1a1Status: "*1/*1 (Normal)",
          irinotecanToxicityRisk: "STANDARD",
          irinotecanDoseAdjustmentPercent: 0,
          tpmtStatus: "NORMAL"
        },
        matchedTrials: [],
        tumorBoard: {
          meetingId: "MTB-2026-08-18-D",
          scheduledDate: "2026-08-18T16:00:00Z",
          leadOncologist: "Dr. Sanjay Gupta, MD",
          leadPathologist: "Dr. Sunita Rao, MD",
          leadGenomicist: "Dr. Amit Shah, PhD",
          status: "CONSENSUS_REACHED",
          consensusRecommendation: "BRAF+MEK targeted inhibition; switch to Dual Checkpoint IO (Nivo+Ipi) if NRAS clone surges.",
          tierIActionOrdered: "Dabrafenib + Trametinib with monthly ctDNA clone sequencing"
        },
        recurrenceRiskScore: 65,
        activeAlertsCount: 1
      },
      {
        id: "ONC-PT-405",
        mrn: "MRN-7729104",
        name: "Arunachal Kothari",
        ageYears: 67,
        gender: "MALE",
        weightKg: 68.0,
        heightCm: 168,
        bodySurfaceAreaM2: 1.78,
        primarySite: "PANCREATIC_DUCTAL",
        histologySubtype: "Pancreatic Ductal Adenocarcinoma (PDAC)",
        clinicalTnmStage: "cT4N1M1 (Stage IV)",
        ecogPerformanceStatus: 2,
        currentTherapyLine: "MOLECULAR_TUMOR_BOARD_PENDING",
        currentRegimenName: "Modified FOLFIRINOX Evaluation",
        molecularProfile: {
          tumorMutationBurdenMb: 3.4,
          tmbClassification: "TMB_LOW",
          msiStatus: "MSS",
          hrdScore: 14,
          hrdStatus: "HRD_NEGATIVE",
          pdl1TpsScorePercent: 0,
          mutations: [
            {
              id: "MUT-10",
              geneSymbol: "KRAS",
              hgvsc: "c.35G>A",
              hgvsp: "p.Gly12Asp (G12D)",
              exon: 2,
              variantAlleleFrequency: 49.5,
              sequencingDepthX: 1750,
              tier: "TIER_II_POTENTIAL_SIGNIFICANCE",
              mutationType: "SNV",
              associatedTherapies: ["MRTX1133 (Trial)", "Pan-KRAS Inhibitors"]
            },
            {
              id: "MUT-11",
              geneSymbol: "SMAD4",
              hgvsc: "c.1082G>A",
              hgvsp: "p.Arg361His",
              exon: 9,
              variantAlleleFrequency: 44.1,
              sequencingDepthX: 1300,
              tier: "TIER_II_POTENTIAL_SIGNIFICANCE",
              mutationType: "SNV",
              associatedTherapies: []
            }
          ],
          actionableBiomarkersCount: 1,
          resistanceMutationsCount: 0
        },
        liquidBiopsy: {
          timestamp: "2026-08-23T10:15:00Z",
          plasmaCtDnaHgeMl: 940,
          meanVafPercent: 18.5,
          mrdStatus: "MRD_POSITIVE",
          clonesTrackedCount: 2,
          longitudinalTrend: "RISING",
          ctDnaHistory: [450, 520, 610, 720, 830, 940]
        },
        pharmacogenomics: {
          dpydStatus: "POOR_METABOLIZER",
          dpydVariantsDetected: ["*2A (c.1905+1G>A) Splice Site Defect"],
          fluoropyrimidineToxicityRisk: "SEVERE_FATAL_RISK",
          fluoropyrimidineDoseAdjustmentPercent: 100, // Absolute Contraindication to 5-FU/Capecitabine
          ugt1a1Status: "*28/*28 (Homozygous Poor)",
          irinotecanToxicityRisk: "HIGH_SEVERE_TOXICITY",
          irinotecanDoseAdjustmentPercent: 30,
          tpmtStatus: "NORMAL"
        },
        matchedTrials: [],
        tumorBoard: {
          meetingId: "MTB-2026-08-25-E",
          scheduledDate: "2026-08-25T09:00:00Z",
          leadOncologist: "Dr. Sanjay Gupta, MD",
          leadPathologist: "Dr. Sunita Rao, MD",
          leadGenomicist: "Dr. Amit Shah, PhD",
          status: "SCHEDULED",
          consensusRecommendation: "CRITICAL: 5-FU/Capecitabine strictly contraindicated (DPYD*2A). Use Gemcitabine + Nab-Paclitaxel; match to MRTX1133 KRAS G12D trial.",
          tierIActionOrdered: "Pharmacogenomic alert flag activated"
        },
        recurrenceRiskScore: 92,
        activeAlertsCount: 3
      },
      {
        id: "ONC-PT-406",
        mrn: "MRN-8819032",
        name: "Meera Subramanian",
        ageYears: 51,
        gender: "FEMALE",
        weightKg: 64.0,
        heightCm: 162,
        bodySurfaceAreaM2: 1.70,
        primarySite: "OVARIAN_HIGH_GRADE",
        histologySubtype: "High-Grade Serous Ovarian Carcinoma (HGSOC)",
        clinicalTnmStage: "pT3cN1M0 (Stage IIIC)",
        ecogPerformanceStatus: 0,
        currentTherapyLine: "FIRST_LINE_IMMUNOTHERAPY",
        currentRegimenName: "Niraparib + Pembrolizumab Combination",
        molecularProfile: {
          tumorMutationBurdenMb: 18.2,
          tmbClassification: "TMB_HIGH",
          msiStatus: "MSI_HIGH",
          hrdScore: 74,
          hrdStatus: "HRD_POSITIVE",
          pdl1TpsScorePercent: 65,
          mutations: [
            {
              id: "MUT-12",
              geneSymbol: "BRCA2",
              hgvsc: "c.5946delT",
              hgvsp: "p.Ser1982fs",
              exon: 11,
              variantAlleleFrequency: 45.0,
              sequencingDepthX: 2200,
              tier: "TIER_I_STRONG_CLINICAL_SIGNIFICANCE",
              mutationType: "INDEL",
              associatedTherapies: ["Niraparib", "Olaparib", "Rucaparib", "Pembrolizumab"]
            }
          ],
          actionableBiomarkersCount: 2,
          resistanceMutationsCount: 0
        },
        liquidBiopsy: {
          timestamp: "2026-08-23T09:00:00Z",
          plasmaCtDnaHgeMl: 25,
          meanVafPercent: 0.8,
          mrdStatus: "MRD_POSITIVE",
          clonesTrackedCount: 1,
          longitudinalTrend: "FALLING",
          ctDnaHistory: [980, 670, 420, 210, 95, 40, 25]
        },
        pharmacogenomics: {
          dpydStatus: "NORMAL_METABOLIZER",
          dpydVariantsDetected: [],
          fluoropyrimidineToxicityRisk: "LOW",
          fluoropyrimidineDoseAdjustmentPercent: 0,
          ugt1a1Status: "*1/*1 (Normal)",
          irinotecanToxicityRisk: "STANDARD",
          irinotecanDoseAdjustmentPercent: 0,
          tpmtStatus: "NORMAL"
        },
        matchedTrials: [],
        tumorBoard: {
          meetingId: "MTB-2026-08-21-F",
          scheduledDate: "2026-08-21T15:00:00Z",
          leadOncologist: "Dr. Sanjay Gupta, MD",
          leadPathologist: "Dr. Sunita Rao, MD",
          leadGenomicist: "Dr. Amit Shah, PhD",
          status: "ACTION_ORDERED",
          consensusRecommendation: "Dual PARP inhibitor + Anti-PD-1 immunotherapy based on concurrent HRD+ (74) and MSI-H status.",
          tierIActionOrdered: "Niraparib + Pembrolizumab active protocol"
        },
        recurrenceRiskScore: 38,
        activeAlertsCount: 0
      }
    ];

    // Populate matched trials for each patient
    return patients.map((p) => ({
      ...p,
      matchedTrials: OncologyGenomicsService.matchTherapiesAndTrials(p)
    }));
  }

  /**
   * Simulate a stochastic genomic liquid biopsy & ctDNA kinetics tick
   */
  public static simulateGenomicKineticsTick(patients: OncologyPatient[]): OncologyPatient[] {
    return patients.map((patient) => {
      // Simulate small ctDNA fluctuation
      const ctDnaDelta = Math.floor((Math.random() - 0.5) * 6);
      const newCtDna = Math.max(0, patient.liquidBiopsy.plasmaCtDnaHgeMl + (patient.liquidBiopsy.longitudinalTrend === "FALLING" ? -2 : patient.liquidBiopsy.longitudinalTrend === "RISING" ? +3 : ctDnaDelta));
      const newVaf = newCtDna > 0 ? Math.max(0.1, Math.round((newCtDna / 35) * 10) / 10) : 0;

      const history = [...patient.liquidBiopsy.ctDnaHistory.slice(1), newCtDna];

      return {
        ...patient,
        liquidBiopsy: {
          ...patient.liquidBiopsy,
          plasmaCtDnaHgeMl: newCtDna,
          meanVafPercent: newVaf,
          mrdStatus: newCtDna > 0 ? "MRD_POSITIVE" : "MRD_NEGATIVE",
          ctDnaHistory: history
        }
      };
    });
  }

  /**
   * Calculate Unit / Cohort Metrics
   */
  public static calculateWardMetrics(patients: OncologyPatient[]): OncologyWardMetrics {
    const total = patients.length;
    const tmbHigh = patients.filter((p) => p.molecularProfile.tmbClassification === "TMB_HIGH").length;
    const targeted = patients.filter((p) => p.molecularProfile.actionableBiomarkersCount > 0).length;
    const mrdPos = patients.filter((p) => p.liquidBiopsy.mrdStatus === "MRD_POSITIVE").length;
    const pgxDose = patients.filter((p) => p.pharmacogenomics.fluoropyrimidineDoseAdjustmentPercent > 0 || p.pharmacogenomics.irinotecanDoseAdjustmentPercent > 0).length;
    const mtbSched = patients.filter((p) => p.tumorBoard.status === "SCHEDULED").length;
    const trials = patients.reduce((acc, p) => acc + p.matchedTrials.length, 0);

    return {
      totalPatients: total,
      tmbHighCount: tmbHigh,
      actionableTargetedEligibleCount: targeted,
      mrdPositiveCtDnaCount: mrdPos,
      pharmacogenomicDoseReducedCount: pgxDose,
      mtbScheduledCount: mtbSched,
      clinicalTrialMatchedCount: trials,
      lastGenomicSyncTimestamp: new Date().toISOString()
    };
  }

  /**
   * Export Patient Genomic Profile to HL7 FHIR R4 Bundle
   */
  public static exportPatientToFhirR4Genomics(patient: OncologyPatient): object {
    return {
      resourceType: "Bundle",
      id: `oncology-fhir-${patient.id}-${Date.now()}`,
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `urn:uuid:patient-${patient.id}`,
          resource: {
            resourceType: "Patient",
            id: patient.id,
            identifier: [{ system: "urn:oid:medtrack:oncology:mrn", value: patient.mrn }],
            name: [{ use: "official", text: patient.name }],
            gender: patient.gender.toLowerCase()
          }
        },
        {
          fullUrl: `urn:uuid:diagnosticreport-genomics-${patient.id}`,
          resource: {
            resourceType: "DiagnosticReport",
            status: "final",
            category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0074", code: "GE", display: "Genetics" }] }],
            code: { text: "Comprehensive Next-Generation Somatic Sequencing & Liquid Biopsy Report" },
            subject: { reference: `Patient/${patient.id}` },
            effectiveDateTime: new Date().toISOString(),
            conclusion: patient.tumorBoard.consensusRecommendation,
            extension: [
              { url: "http://hl7.org/fhir/StructureDefinition/tumor-mutation-burden", valueDecimal: patient.molecularProfile.tumorMutationBurdenMb },
              { url: "http://hl7.org/fhir/StructureDefinition/msi-status", valueString: patient.molecularProfile.msiStatus },
              { url: "http://hl7.org/fhir/StructureDefinition/hrd-score", valueDecimal: patient.molecularProfile.hrdScore }
            ]
          }
        }
      ]
    };
  }

  /**
   * Export Patient Genomic Profile to CSV
   */
  public static exportPatientGenomicsCsv(patient: OncologyPatient): string {
    const headers = [
      "Patient ID",
      "MRN",
      "Name",
      "Primary Site",
      "TNM Stage",
      "ECOG",
      "TMB (mut/Mb)",
      "MSI Status",
      "HRD Score",
      "ctDNA (hGE/mL)",
      "MRD Status",
      "Top Mutation",
      "Tier",
      "DPYD Status",
      "UGT1A1 Status",
      "Current Therapy"
    ].join(",");

    const topMut = patient.molecularProfile.mutations[0];
    const row = [
      `"${patient.id}"`,
      `"${patient.mrn}"`,
      `"${patient.name}"`,
      `"${patient.primarySite}"`,
      `"${patient.clinicalTnmStage}"`,
      patient.ecogPerformanceStatus,
      patient.molecularProfile.tumorMutationBurdenMb,
      `"${patient.molecularProfile.msiStatus}"`,
      patient.molecularProfile.hrdScore,
      patient.liquidBiopsy.plasmaCtDnaHgeMl,
      `"${patient.liquidBiopsy.mrdStatus}"`,
      `"${topMut ? `${topMut.geneSymbol} ${topMut.hgvsp}` : "None"}"`,
      `"${topMut ? topMut.tier : "N/A"}"`,
      `"${patient.pharmacogenomics.dpydStatus}"`,
      `"${patient.pharmacogenomics.ugt1a1Status}"`,
      `"${patient.currentRegimenName}"`
    ].join(",");

    return `${headers}
${row}`;
  }
}
