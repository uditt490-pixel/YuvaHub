import React, { useState, useEffect } from "react";
import {
  Dna,
  Sparkles,
  Activity,
  Radio,
  Plus,
  Users,
  TestTube2,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Pill,
  ShieldAlert,
  Flame,
  LayoutGrid,
  Table
} from "lucide-react";
import { OncologyPatient, OncologyWardMetrics, TherapyLineStatus } from "../../types/oncologyGenomics";
import { OncologyGenomicsService } from "../../services/OncologyGenomicsService";
import { OncologyMetricsHeader } from "../../components/Enterprise/Oncology/OncologyMetricsHeader";
import { OncologyPatientCard } from "../../components/Enterprise/Oncology/OncologyPatientCard";
import { OncologyFilterToolbar } from "../../components/Enterprise/Oncology/OncologyFilterToolbar";
import { OncologyGenomicsInspectorModal } from "../../components/Enterprise/Oncology/OncologyGenomicsInspectorModal";
import { MolecularTumorBoardModal } from "../../components/Enterprise/Oncology/MolecularTumorBoardModal";
import { OncologyTherapyEscalationModal } from "../../components/Enterprise/Oncology/OncologyTherapyEscalationModal";
import { OncologyIntakeModal } from "../../components/Enterprise/Oncology/OncologyIntakeModal";
import { PharmacogenomicsCalculatorModal } from "../../components/Enterprise/Oncology/PharmacogenomicsCalculatorModal";

export const OncologyGenomicsHub: React.FC = () => {
  const [patients, setPatients] = useState<OncologyPatient[]>([]);
  const [metrics, setMetrics] = useState<OncologyWardMetrics | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [viewMode, setViewMode] = useState<"GRID" | "MATRIX">("GRID");

  // Filters
  const [selectedSite, setSelectedSite] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBiomarker, setSelectedBiomarker] = useState("ALL");
  const [selectedMrd, setSelectedMrd] = useState("ALL");

  // Modals
  const [inspectingPatient, setInspectingPatient] = useState<OncologyPatient | null>(null);
  const [mtbPatient, setMtbPatient] = useState<OncologyPatient | null>(null);
  const [escalatingPatient, setEscalatingPatient] = useState<OncologyPatient | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isPgxOpen, setIsPgxOpen] = useState(false);

  // Init Data
  useEffect(() => {
    const initial = OncologyGenomicsService.getMockOncologyPatients();
    setPatients(initial);
    setMetrics(OncologyGenomicsService.calculateWardMetrics(initial));
  }, []);

  // Live ctDNA Streaming Loop
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setPatients((prev) => {
        const updated = OncologyGenomicsService.simulateGenomicKineticsTick(prev);
        setMetrics(OncologyGenomicsService.calculateWardMetrics(updated));
        if (inspectingPatient) {
          const fresh = updated.find((p) => p.id === inspectingPatient.id);
          if (fresh) setInspectingPatient(fresh);
        }
        return updated;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isLiveStreaming, inspectingPatient]);

  // Handle MTB Consensus Save
  const handleSaveConsensus = (patientId: string, recommendation: string, orderedAction: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          tumorBoard: {
            ...p.tumorBoard,
            status: "ACTION_ORDERED",
            consensusRecommendation: recommendation,
            tierIActionOrdered: orderedAction
          }
        };
      })
    );
  };

  // Handle Therapy Escalation
  const handleEscalateTherapy = (patientId: string, line: TherapyLineStatus, regimen: string, rationale: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          currentTherapyLine: line,
          currentRegimenName: regimen,
          tumorBoard: {
            ...p.tumorBoard,
            consensusRecommendation: `Escalated to ${line.replace(/_/g, " ")}: ${rationale}`
          }
        };
      })
    );
  };

  // Handle New Molecular Intake
  const handleAdmitPatient = (newPatient: OncologyPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setMetrics((prev) => (prev ? OncologyGenomicsService.calculateWardMetrics([newPatient, ...patients]) : null));
  };

  // Filter Patients
  const filteredPatients = patients.filter((p) => {
    if (selectedSite !== "ALL" && p.primarySite !== selectedSite) return false;
    if (selectedMrd !== "ALL" && p.liquidBiopsy.mrdStatus !== selectedMrd) return false;

    if (selectedBiomarker !== "ALL") {
      if (selectedBiomarker === "TMB_HIGH" && p.molecularProfile.tmbClassification !== "TMB_HIGH") return false;
      if (selectedBiomarker === "MSI_HIGH" && p.molecularProfile.msiStatus !== "MSI_HIGH") return false;
      if (selectedBiomarker === "BRCA" && p.molecularProfile.hrdStatus !== "HRD_POSITIVE") return false;
      if (
        (selectedBiomarker === "EGFR" || selectedBiomarker === "KRAS" || selectedBiomarker === "BRAF") &&
        !p.molecularProfile.mutations.some((m) => m.geneSymbol.includes(selectedBiomarker))
      ) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchMrn = p.mrn.toLowerCase().includes(q);
      const matchHist = p.histologySubtype.toLowerCase().includes(q);
      const matchGenes = p.molecularProfile.mutations.some(
        (m) => m.geneSymbol.toLowerCase().includes(q) || m.hgvsp.toLowerCase().includes(q)
      );
      if (!matchName && !matchMrn && !matchHist && !matchGenes) return false;
    }

    return true;
  });

  const clearAllFilters = () => {
    setSelectedSite("ALL");
    setSearchQuery("");
    setSelectedBiomarker("ALL");
    setSelectedMrd("ALL");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 font-sans space-y-6">
      {/* Metrics Header */}
      {metrics && (
        <OncologyMetricsHeader
          metrics={metrics}
          isLiveStreaming={isLiveStreaming}
          onToggleStreaming={() => setIsLiveStreaming(!isLiveStreaming)}
          onOpenIntakeModal={() => setIsIntakeOpen(true)}
          onOpenPgxModal={() => setIsPgxOpen(true)}
          selectedSite={selectedSite}
          onSelectSite={setSelectedSite}
        />
      )}

      {/* Filter Toolbar */}
      <OncologyFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSite={selectedSite}
        onSiteChange={setSelectedSite}
        selectedBiomarker={selectedBiomarker}
        onBiomarkerChange={setSelectedBiomarker}
        selectedMrd={selectedMrd}
        onMrdChange={setSelectedMrd}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onClearFilters={clearAllFilters}
      />

      {/* Patient Views */}
      {filteredPatients.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-xl">
          <Dna className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Oncology Patients Match Current Filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria or select &quot;All Tumor Sites&quot; to view all NGS profiles in the unit.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-violet-600 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-600/30"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "GRID" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <OncologyPatientCard
              key={patient.id}
              patient={patient}
              onInspect={(p) => setInspectingPatient(p)}
              onOpenMtb={(p) => setMtbPatient(p)}
              onOpenEscalation={(p) => setEscalatingPatient(p)}
            />
          ))}
        </div>
      ) : (
        /* High-Density Central Station Matrix Tabular View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4">Patient & MRN</th>
                  <th className="py-4 px-3">Primary Site & Stage</th>
                  <th className="py-4 px-3">Top Genomic Driver</th>
                  <th className="py-4 px-3">Tier</th>
                  <th className="py-4 px-3">TMB (mut/Mb)</th>
                  <th className="py-4 px-3">MSI / HRD</th>
                  <th className="py-4 px-3">ctDNA MRD</th>
                  <th className="py-4 px-3">PGx Alert</th>
                  <th className="py-4 px-3">Current Regimen</th>
                  <th className="py-4 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredPatients.map((p) => {
                  const topMut = p.molecularProfile.mutations[0];
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({p.gender === "MALE" ? "M" : "F"}, {p.ageYears}y)</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{p.mrn}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-violet-300 font-bold">{p.primarySite.replace(/_/g, " ")}</span>
                        <div className="text-[10px] text-slate-400">{p.clinicalTnmStage}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        {topMut ? (
                          <div>
                            <span className="font-bold text-white">{topMut.geneSymbol}</span>
                            <span className="text-cyan-300 font-mono ml-1 font-bold">{topMut.hgvsp}</span>
                            <div className="text-[10px] text-slate-500">VAF: {topMut.variantAlleleFrequency}%</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {topMut && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            topMut.tier === "TIER_I_STRONG_CLINICAL_SIGNIFICANCE"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          }`}>
                            {topMut.tier.split("_")[0]} {topMut.tier.split("_")[1]}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold">
                        <span className={p.molecularProfile.tumorMutationBurdenMb >= 10 ? "text-cyan-400" : "text-slate-300"}>
                          {p.molecularProfile.tumorMutationBurdenMb}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{p.molecularProfile.msiStatus}</div>
                        <div className="text-[10px] text-indigo-300">HRD: {p.molecularProfile.hrdScore}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className={`font-bold ${p.liquidBiopsy.mrdStatus === "MRD_POSITIVE" ? "text-rose-400" : "text-emerald-400"}`}>
                          {p.liquidBiopsy.plasmaCtDnaHgeMl} hGE
                        </span>
                        <div className="text-[10px] text-slate-500">{p.liquidBiopsy.mrdStatus}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        {p.pharmacogenomics.fluoropyrimidineToxicityRisk !== "LOW" || p.pharmacogenomics.irinotecanToxicityRisk !== "STANDARD" ? (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
                            PGx Warning
                          </span>
                        ) : (
                          <span className="text-slate-500">Standard</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-slate-300 text-[11px] line-clamp-1">{p.currentRegimenName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectingPatient(p)}
                            className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-[11px]"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => setMtbPatient(p)}
                            className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold rounded-lg text-[11px]"
                          >
                            MTB
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {inspectingPatient && (
        <OncologyGenomicsInspectorModal
          patient={inspectingPatient}
          isOpen={!!inspectingPatient}
          onClose={() => setInspectingPatient(null)}
          onOpenMtb={(p) => {
            setInspectingPatient(null);
            setMtbPatient(p);
          }}
          onOpenEscalation={(p) => {
            setInspectingPatient(null);
            setEscalatingPatient(p);
          }}
        />
      )}

      {mtbPatient && (
        <MolecularTumorBoardModal
          patient={mtbPatient}
          isOpen={!!mtbPatient}
          onClose={() => setMtbPatient(null)}
          onSaveConsensus={handleSaveConsensus}
        />
      )}

      {escalatingPatient && (
        <OncologyTherapyEscalationModal
          patient={escalatingPatient}
          isOpen={!!escalatingPatient}
          onClose={() => setEscalatingPatient(null)}
          onEscalateTherapy={handleEscalateTherapy}
        />
      )}

      {isIntakeOpen && (
        <OncologyIntakeModal
          isOpen={isIntakeOpen}
          onClose={() => setIsIntakeOpen(false)}
          onAdmitPatient={handleAdmitPatient}
        />
      )}

      {isPgxOpen && (
        <PharmacogenomicsCalculatorModal
          isOpen={isPgxOpen}
          onClose={() => setIsPgxOpen(false)}
        />
      )}
    </div>
  );
};

export default OncologyGenomicsHub;
