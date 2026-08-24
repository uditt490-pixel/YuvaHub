package com.medtrack.trauma.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;

/**
 * Trauma Patient Domain Entity for Enterprise Emergency & Resuscitation Architecture.
 * Follows HL7 FHIR R4 Patient / Encounter / Observation specifications.
 */
public class TraumaPatient implements Serializable {

    private static final long serialVersionUID = 1L;

    private String id;
    private String mrn;
    private String name;
    private int age;
    private String gender;
    private String traumaBayNumber;
    private Instant admissionTimestamp;
    private String triageLevel; // LEVEL_1_STAT_ALPHA, LEVEL_2_TRAUMA_BRAVO, etc.
    private String injuryMechanism;
    private String mechanismCategory;
    private String primarySurgeon;
    private String leadTraumaNurse;
    private String currentPhase;
    private String shockClass;

    // Hemodynamic Telemetry
    private int heartRate;
    private int systolicBp;
    private int diastolicBp;
    private int meanArterialPressure;
    private int spO2;
    private int respiratoryRate;
    private int endTidalCo2;
    private double coreTemperatureCelsius;

    // GCS Detail
    private int gcsEye;
    private int gcsVerbal;
    private int gcsMotor;
    private int totalGcs;
    private String pupilReactivity;

    // Blood Ledger (1:1:1 MTP)
    private int prbcUnits;
    private int ffpUnits;
    private int plateletUnits;
    private int cryoPools;
    private double calciumChlorideGrams;
    private boolean isMtpRatioBalanced;

    // REBOA Status
    private String reboaStatus;
    private String reboaZone;
    private double reboaInflationMinutes;

    // TEG / ROTEM
    private double tegRTime;
    private double tegKTime;
    private double tegAlphaAngle;
    private double tegMa;
    private double tegLy30;
    private String coagulopathyInterpretation;

    // Computed Scores
    private double shockIndex;
    private double reverseShockIndexGcs;
    private int abcScore;
    private double revisedTraumaScore;
    private int injurySeverityScore;
    private int tashScore;
    private int lethalTriadCount;

    public TraumaPatient() {}

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

    public String getTraumaBayNumber() { return traumaBayNumber; }
    public void setTraumaBayNumber(String traumaBayNumber) { this.traumaBayNumber = traumaBayNumber; }

    public Instant getAdmissionTimestamp() { return admissionTimestamp; }
    public void setAdmissionTimestamp(Instant admissionTimestamp) { this.admissionTimestamp = admissionTimestamp; }

    public String getTriageLevel() { return triageLevel; }
    public void setTriageLevel(String triageLevel) { this.triageLevel = triageLevel; }

    public String getInjuryMechanism() { return injuryMechanism; }
    public void setInjuryMechanism(String injuryMechanism) { this.injuryMechanism = injuryMechanism; }

    public String getMechanismCategory() { return mechanismCategory; }
    public void setMechanismCategory(String mechanismCategory) { this.mechanismCategory = mechanismCategory; }

    public String getPrimarySurgeon() { return primarySurgeon; }
    public void setPrimarySurgeon(String primarySurgeon) { this.primarySurgeon = primarySurgeon; }

    public String getLeadTraumaNurse() { return leadTraumaNurse; }
    public void setLeadTraumaNurse(String leadTraumaNurse) { this.leadTraumaNurse = leadTraumaNurse; }

    public String getCurrentPhase() { return currentPhase; }
    public void setCurrentPhase(String currentPhase) { this.currentPhase = currentPhase; }

    public String getShockClass() { return shockClass; }
    public void setShockClass(String shockClass) { this.shockClass = shockClass; }

    public int getHeartRate() { return heartRate; }
    public void setHeartRate(int heartRate) { this.heartRate = heartRate; }

    public int getSystolicBp() { return systolicBp; }
    public void setSystolicBp(int systolicBp) { this.systolicBp = systolicBp; }

    public int getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(int diastolicBp) { this.diastolicBp = diastolicBp; }

    public int getMeanArterialPressure() { return meanArterialPressure; }
    public void setMeanArterialPressure(int meanArterialPressure) { this.meanArterialPressure = meanArterialPressure; }

    public int getSpO2() { return spO2; }
    public void setSpO2(int spO2) { this.spO2 = spO2; }

    public int getRespiratoryRate() { return respiratoryRate; }
    public void setRespiratoryRate(int respiratoryRate) { this.respiratoryRate = respiratoryRate; }

    public int getEndTidalCo2() { return endTidalCo2; }
    public void setEndTidalCo2(int endTidalCo2) { this.endTidalCo2 = endTidalCo2; }

    public double getCoreTemperatureCelsius() { return coreTemperatureCelsius; }
    public void setCoreTemperatureCelsius(double coreTemperatureCelsius) { this.coreTemperatureCelsius = coreTemperatureCelsius; }

    public int getGcsEye() { return gcsEye; }
    public void setGcsEye(int gcsEye) { this.gcsEye = gcsEye; }

    public int getGcsVerbal() { return gcsVerbal; }
    public void setGcsVerbal(int gcsVerbal) { this.gcsVerbal = gcsVerbal; }

    public int getGcsMotor() { return gcsMotor; }
    public void setGcsMotor(int gcsMotor) { this.gcsMotor = gcsMotor; }

    public int getTotalGcs() { return totalGcs; }
    public void setTotalGcs(int totalGcs) { this.totalGcs = totalGcs; }

    public String getPupilReactivity() { return pupilReactivity; }
    public void setPupilReactivity(String pupilReactivity) { this.pupilReactivity = pupilReactivity; }

    public int getPrbcUnits() { return prbcUnits; }
    public void setPrbcUnits(int prbcUnits) { this.prbcUnits = prbcUnits; }

    public int getFfpUnits() { return ffpUnits; }
    public void setFfpUnits(int ffpUnits) { this.ffpUnits = ffpUnits; }

    public int getPlateletUnits() { return plateletUnits; }
    public void setPlateletUnits(int plateletUnits) { this.plateletUnits = plateletUnits; }

    public int getCryoPools() { return cryoPools; }
    public void setCryoPools(int cryoPools) { this.cryoPools = cryoPools; }

    public double getCalciumChlorideGrams() { return calciumChlorideGrams; }
    public void setCalciumChlorideGrams(double calciumChlorideGrams) { this.calciumChlorideGrams = calciumChlorideGrams; }

    public boolean isMtpRatioBalanced() { return isMtpRatioBalanced; }
    public void setMtpRatioBalanced(boolean mtpRatioBalanced) { isMtpRatioBalanced = mtpRatioBalanced; }

    public String getReboaStatus() { return reboaStatus; }
    public void setReboaStatus(String reboaStatus) { this.reboaStatus = reboaStatus; }

    public String getReboaZone() { return reboaZone; }
    public void setReboaZone(String reboaZone) { this.reboaZone = reboaZone; }

    public double getReboaInflationMinutes() { return reboaInflationMinutes; }
    public void setReboaInflationMinutes(double reboaInflationMinutes) { this.reboaInflationMinutes = reboaInflationMinutes; }

    public double getTegRTime() { return tegRTime; }
    public void setTegRTime(double tegRTime) { this.tegRTime = tegRTime; }

    public double getTegKTime() { return tegKTime; }
    public void setTegKTime(double tegKTime) { this.tegKTime = tegKTime; }

    public double getTegAlphaAngle() { return tegAlphaAngle; }
    public void setTegAlphaAngle(double tegAlphaAngle) { this.tegAlphaAngle = tegAlphaAngle; }

    public double getTegMa() { return tegMa; }
    public void setTegMa(double tegMa) { this.tegMa = tegMa; }

    public double getTegLy30() { return tegLy30; }
    public void setTegLy30(double tegLy30) { this.tegLy30 = tegLy30; }

    public String getCoagulopathyInterpretation() { return coagulopathyInterpretation; }
    public void setCoagulopathyInterpretation(String coagulopathyInterpretation) { this.coagulopathyInterpretation = coagulopathyInterpretation; }

    public double getShockIndex() { return shockIndex; }
    public void setShockIndex(double shockIndex) { this.shockIndex = shockIndex; }

    public double getReverseShockIndexGcs() { return reverseShockIndexGcs; }
    public void setReverseShockIndexGcs(double reverseShockIndexGcs) { this.reverseShockIndexGcs = reverseShockIndexGcs; }

    public int getAbcScore() { return abcScore; }
    public void setAbcScore(int abcScore) { this.abcScore = abcScore; }

    public double getRevisedTraumaScore() { return revisedTraumaScore; }
    public void setRevisedTraumaScore(double revisedTraumaScore) { this.revisedTraumaScore = revisedTraumaScore; }

    public int getInjurySeverityScore() { return injurySeverityScore; }
    public void setInjurySeverityScore(int injurySeverityScore) { this.injurySeverityScore = injurySeverityScore; }

    public int getTashScore() { return tashScore; }
    public void setTashScore(int tashScore) { this.tashScore = tashScore; }

    public int getLethalTriadCount() { return lethalTriadCount; }
    public void setLethalTriadCount(int lethalTriadCount) { this.lethalTriadCount = lethalTriadCount; }
}
