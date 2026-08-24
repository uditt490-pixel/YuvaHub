package com.medtrack.nephrology.model;

import java.io.Serializable;
import java.time.Instant;

/**
 * Nephrology Patient Entity for Continuous Renal Replacement & Dialysis Architecture.
 * Compliant with HL7 FHIR R4 Patient / Observation resources.
 */
public class NephrologyPatient implements Serializable {

    private static final long serialVersionUID = 1L;

    private String id;
    private String mrn;
    private String name;
    private int age;
    private String gender;
    private double dryWeightKg;
    private double currentWeightKg;
    private String renalWardBed;
    private Instant admissionTimestamp;
    private String triagePriority;
    private String primaryEtiology;
    private String attendingNephrologist;
    private String leadDialysisNurse;
    private String kdigoStage;
    private String currentModality;
    private String anticoagulation;
    private String vascularAccess;

    // Circuit Telemetry
    private double bloodFlowQb;
    private double effluentDose;
    private double dialysateFlowQd;
    private double transmembranePressureTmp;
    private double filterPressureDropDeltaP;
    private double filtrationFraction;
    private boolean isFilterClottingRisk;

    // Citrate Anticoagulation (RCA)
    private double postFilterIca;
    private double systemicIca;
    private double totalSerumCa;
    private double totalToIonizedCaRatio;
    private boolean isCitrateToxicity;

    // Electrolytes & Biomarkers
    private double serumCreatinine;
    private double baselineCreatinine;
    private double creatinineMultiplier;
    private double bloodUreaNitrogen;
    private double serumPotassium;
    private double serumBicarbonate;
    private double bloodPh;
    private double correctedAnionGap;
    private double urineOutputNormalized;
    private double fenaExcretion;

    // Clearance & Fluid Balance
    private double daugirdasKtV;
    private double ureaReductionRatio;
    private double netFluidBalance24h;
    private double fluidOverloadPercent;

    public NephrologyPatient() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public double getDryWeightKg() { return dryWeightKg; }
    public void setDryWeightKg(double dryWeightKg) { this.dryWeightKg = dryWeightKg; }

    public double getCurrentWeightKg() { return currentWeightKg; }
    public void setCurrentWeightKg(double currentWeightKg) { this.currentWeightKg = currentWeightKg; }

    public String getRenalWardBed() { return renalWardBed; }
    public void setRenalWardBed(String renalWardBed) { this.renalWardBed = renalWardBed; }

    public Instant getAdmissionTimestamp() { return admissionTimestamp; }
    public void setAdmissionTimestamp(Instant admissionTimestamp) { this.admissionTimestamp = admissionTimestamp; }

    public String getTriagePriority() { return triagePriority; }
    public void setTriagePriority(String triagePriority) { this.triagePriority = triagePriority; }

    public String getPrimaryEtiology() { return primaryEtiology; }
    public void setPrimaryEtiology(String primaryEtiology) { this.primaryEtiology = primaryEtiology; }

    public String getAttendingNephrologist() { return attendingNephrologist; }
    public void setAttendingNephrologist(String attendingNephrologist) { this.attendingNephrologist = attendingNephrologist; }

    public String getLeadDialysisNurse() { return leadDialysisNurse; }
    public void setLeadDialysisNurse(String leadDialysisNurse) { this.leadDialysisNurse = leadDialysisNurse; }

    public String getKdigoStage() { return kdigoStage; }
    public void setKdigoStage(String kdigoStage) { this.kdigoStage = kdigoStage; }

    public String getCurrentModality() { return currentModality; }
    public void setCurrentModality(String currentModality) { this.currentModality = currentModality; }

    public String getAnticoagulation() { return anticoagulation; }
    public void setAnticoagulation(String anticoagulation) { this.anticoagulation = anticoagulation; }

    public String getVascularAccess() { return vascularAccess; }
    public void setVascularAccess(String vascularAccess) { this.vascularAccess = vascularAccess; }

    public double getBloodFlowQb() { return bloodFlowQb; }
    public void setBloodFlowQb(double bloodFlowQb) { this.bloodFlowQb = bloodFlowQb; }

    public double getEffluentDose() { return effluentDose; }
    public void setEffluentDose(double effluentDose) { this.effluentDose = effluentDose; }

    public double getDialysateFlowQd() { return dialysateFlowQd; }
    public void setDialysateFlowQd(double dialysateFlowQd) { this.dialysateFlowQd = dialysateFlowQd; }

    public double getTransmembranePressureTmp() { return transmembranePressureTmp; }
    public void setTransmembranePressureTmp(double transmembranePressureTmp) { this.transmembranePressureTmp = transmembranePressureTmp; }

    public double getFilterPressureDropDeltaP() { return filterPressureDropDeltaP; }
    public void setFilterPressureDropDeltaP(double filterPressureDropDeltaP) { this.filterPressureDropDeltaP = filterPressureDropDeltaP; }

    public double getFiltrationFraction() { return filtrationFraction; }
    public void setFiltrationFraction(double filtrationFraction) { this.filtrationFraction = filtrationFraction; }

    public boolean isFilterClottingRisk() { return isFilterClottingRisk; }
    public void setFilterClottingRisk(boolean filterClottingRisk) { isFilterClottingRisk = filterClottingRisk; }

    public double getPostFilterIca() { return postFilterIca; }
    public void setPostFilterIca(double postFilterIca) { this.postFilterIca = postFilterIca; }

    public double getSystemicIca() { return systemicIca; }
    public void setSystemicIca(double systemicIca) { this.systemicIca = systemicIca; }

    public double getTotalSerumCa() { return totalSerumCa; }
    public void setTotalSerumCa(double totalSerumCa) { this.totalSerumCa = totalSerumCa; }

    public double getTotalToIonizedCaRatio() { return totalToIonizedCaRatio; }
    public void setTotalToIonizedCaRatio(double totalToIonizedCaRatio) { this.totalToIonizedCaRatio = totalToIonizedCaRatio; }

    public boolean isCitrateToxicity() { return isCitrateToxicity; }
    public void setCitrateToxicity(boolean citrateToxicity) { isCitrateToxicity = citrateToxicity; }

    public double getSerumCreatinine() { return serumCreatinine; }
    public void setSerumCreatinine(double serumCreatinine) { this.serumCreatinine = serumCreatinine; }

    public double getBaselineCreatinine() { return baselineCreatinine; }
    public void setBaselineCreatinine(double baselineCreatinine) { this.baselineCreatinine = baselineCreatinine; }

    public double getCreatinineMultiplier() { return creatinineMultiplier; }
    public void setCreatinineMultiplier(double creatinineMultiplier) { this.creatinineMultiplier = creatinineMultiplier; }

    public double getBloodUreaNitrogen() { return bloodUreaNitrogen; }
    public void setBloodUreaNitrogen(double bloodUreaNitrogen) { this.bloodUreaNitrogen = bloodUreaNitrogen; }

    public double getSerumPotassium() { return serumPotassium; }
    public void setSerumPotassium(double serumPotassium) { this.serumPotassium = serumPotassium; }

    public double getSerumBicarbonate() { return serumBicarbonate; }
    public void setSerumBicarbonate(double serumBicarbonate) { this.serumBicarbonate = serumBicarbonate; }

    public double getBloodPh() { return bloodPh; }
    public void setBloodPh(double bloodPh) { this.bloodPh = bloodPh; }

    public double getCorrectedAnionGap() { return correctedAnionGap; }
    public void setCorrectedAnionGap(double correctedAnionGap) { this.correctedAnionGap = correctedAnionGap; }

    public double getUrineOutputNormalized() { return urineOutputNormalized; }
    public void setUrineOutputNormalized(double urineOutputNormalized) { this.urineOutputNormalized = urineOutputNormalized; }

    public double getFenaExcretion() { return fenaExcretion; }
    public void setFenaExcretion(double fenaExcretion) { this.fenaExcretion = fenaExcretion; }

    public double getDaugirdasKtV() { return daugirdasKtV; }
    public void setDaugirdasKtV(double daugirdasKtV) { this.daugirdasKtV = daugirdasKtV; }

    public double getUreaReductionRatio() { return ureaReductionRatio; }
    public void setUreaReductionRatio(double ureaReductionRatio) { this.ureaReductionRatio = ureaReductionRatio; }

    public double getNetFluidBalance24h() { return netFluidBalance24h; }
    public void setNetFluidBalance24h(double netFluidBalance24h) { this.netFluidBalance24h = netFluidBalance24h; }

    public double getFluidOverloadPercent() { return fluidOverloadPercent; }
    public void setFluidOverloadPercent(double fluidOverloadPercent) { this.fluidOverloadPercent = fluidOverloadPercent; }
}
