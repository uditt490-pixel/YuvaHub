package com.medtrack.picu.model;

import java.io.Serializable;
import java.time.Instant;

/**
 * Pediatric ICU & Neonatal Critical Care Patient Entity.
 * Compliant with PALS AHA/AAP Guidelines and HL7 FHIR R4 Patient/Observation Resources.
 */
public class PicuPatient implements Serializable {

    private static final long serialVersionUID = 1L;

    private String id;
    private String mrn;
    private String name;
    private double gestationalAgeWeeks;
    private int chronologicalAgeDays;
    private String ageGroup;
    private String gender;
    private int birthWeightGrams;
    private double currentWeightKg;
    private double lengthHeightCm;
    private double headCircumferenceCm;
    private String careUnit;
    private String bedIsoletteNumber;
    private Instant admissionTimestamp;
    private String primaryDiagnosis;
    private String attendingPediatrician;
    private String leadPicuNurse;
    private String ventilationMode;

    // Vitals Telemetry
    private int heartRate;
    private int systolicBp;
    private int diastolicBp;
    private int meanArterialPressure;
    private int respiratoryRate;
    private int spO2PreDuctal;
    private int spO2PostDuctal;
    private int prePostDuctalDelta;
    private int endTidalCo2;
    private double coreTemperature;
    private double skinTemperature;
    private double perfusionIndex;
    private double capillaryRefillSeconds;

    // PALS Dosing
    private String broselowColor;
    private double epinephrineIvDoseMg;
    private double amiodaroneDoseMg;
    private double defibrillationJoules;
    private double cuffedEttMm;

    // Scores
    private int totalPewsScore;
    private String pewsRiskCategory;
    private double oxygenationIndexOI;
    private String pardsClassification;
    private double glucoseInfusionRateGIR;

    public PicuPatient() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getGestationalAgeWeeks() { return gestationalAgeWeeks; }
    public void setGestationalAgeWeeks(double gestationalAgeWeeks) { this.gestationalAgeWeeks = gestationalAgeWeeks; }

    public int getChronologicalAgeDays() { return chronologicalAgeDays; }
    public void setChronologicalAgeDays(int chronologicalAgeDays) { this.chronologicalAgeDays = chronologicalAgeDays; }

    public String getAgeGroup() { return ageGroup; }
    public void setAgeGroup(String ageGroup) { this.ageGroup = ageGroup; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public int getBirthWeightGrams() { return birthWeightGrams; }
    public void setBirthWeightGrams(int birthWeightGrams) { this.birthWeightGrams = birthWeightGrams; }

    public double getCurrentWeightKg() { return currentWeightKg; }
    public void setCurrentWeightKg(double currentWeightKg) { this.currentWeightKg = currentWeightKg; }

    public double getLengthHeightCm() { return lengthHeightCm; }
    public void setLengthHeightCm(double lengthHeightCm) { this.lengthHeightCm = lengthHeightCm; }

    public double getHeadCircumferenceCm() { return headCircumferenceCm; }
    public void setHeadCircumferenceCm(double headCircumferenceCm) { this.headCircumferenceCm = headCircumferenceCm; }

    public String getCareUnit() { return careUnit; }
    public void setCareUnit(String careUnit) { this.careUnit = careUnit; }

    public String getBedIsoletteNumber() { return bedIsoletteNumber; }
    public void setBedIsoletteNumber(String bedIsoletteNumber) { this.bedIsoletteNumber = bedIsoletteNumber; }

    public Instant getAdmissionTimestamp() { return admissionTimestamp; }
    public void setAdmissionTimestamp(Instant admissionTimestamp) { this.admissionTimestamp = admissionTimestamp; }

    public String getPrimaryDiagnosis() { return primaryDiagnosis; }
    public void setPrimaryDiagnosis(String primaryDiagnosis) { this.primaryDiagnosis = primaryDiagnosis; }

    public String getAttendingPediatrician() { return attendingPediatrician; }
    public void setAttendingPediatrician(String attendingPediatrician) { this.attendingPediatrician = attendingPediatrician; }

    public String getLeadPicuNurse() { return leadPicuNurse; }
    public void setLeadPicuNurse(String leadPicuNurse) { this.leadPicuNurse = leadPicuNurse; }

    public String getVentilationMode() { return ventilationMode; }
    public void setVentilationMode(String ventilationMode) { this.ventilationMode = ventilationMode; }

    public int getHeartRate() { return heartRate; }
    public void setHeartRate(int heartRate) { this.heartRate = heartRate; }

    public int getSystolicBp() { return systolicBp; }
    public void setSystolicBp(int systolicBp) { this.systolicBp = systolicBp; }

    public int getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(int diastolicBp) { this.diastolicBp = diastolicBp; }

    public int getMeanArterialPressure() { return meanArterialPressure; }
    public void setMeanArterialPressure(int meanArterialPressure) { this.meanArterialPressure = meanArterialPressure; }

    public int getRespiratoryRate() { return respiratoryRate; }
    public void setRespiratoryRate(int respiratoryRate) { this.respiratoryRate = respiratoryRate; }

    public int getSpO2PreDuctal() { return spO2PreDuctal; }
    public void setSpO2PreDuctal(int spO2PreDuctal) { this.spO2PreDuctal = spO2PreDuctal; }

    public int getSpO2PostDuctal() { return spO2PostDuctal; }
    public void setSpO2PostDuctal(int spO2PostDuctal) { this.spO2PostDuctal = spO2PostDuctal; }

    public int getPrePostDuctalDelta() { return prePostDuctalDelta; }
    public void setPrePostDuctalDelta(int prePostDuctalDelta) { this.prePostDuctalDelta = prePostDuctalDelta; }

    public int getEndTidalCo2() { return endTidalCo2; }
    public void setEndTidalCo2(int endTidalCo2) { this.endTidalCo2 = endTidalCo2; }

    public double getCoreTemperature() { return coreTemperature; }
    public void setCoreTemperature(double coreTemperature) { this.coreTemperature = coreTemperature; }

    public double getSkinTemperature() { return skinTemperature; }
    public void setSkinTemperature(double skinTemperature) { this.skinTemperature = skinTemperature; }

    public double getPerfusionIndex() { return perfusionIndex; }
    public void setPerfusionIndex(double perfusionIndex) { this.perfusionIndex = perfusionIndex; }

    public double getCapillaryRefillSeconds() { return capillaryRefillSeconds; }
    public void setCapillaryRefillSeconds(double capillaryRefillSeconds) { this.capillaryRefillSeconds = capillaryRefillSeconds; }

    public String getBroselowColor() { return broselowColor; }
    public void setBroselowColor(String broselowColor) { this.broselowColor = broselowColor; }

    public double getEpinephrineIvDoseMg() { return epinephrineIvDoseMg; }
    public void setEpinephrineIvDoseMg(double epinephrineIvDoseMg) { this.epinephrineIvDoseMg = epinephrineIvDoseMg; }

    public double getAmiodaroneDoseMg() { return amiodaroneDoseMg; }
    public void setAmiodaroneDoseMg(double amiodaroneDoseMg) { this.amiodaroneDoseMg = amiodaroneDoseMg; }

    public double getDefibrillationJoules() { return defibrillationJoules; }
    public void setDefibrillationJoules(double defibrillationJoules) { this.defibrillationJoules = defibrillationJoules; }

    public double getCuffedEttMm() { return cuffedEttMm; }
    public void setCuffedEttMm(double cuffedEttMm) { this.cuffedEttMm = cuffedEttMm; }

    public int getTotalPewsScore() { return totalPewsScore; }
    public void setTotalPewsScore(int totalPewsScore) { this.totalPewsScore = totalPewsScore; }

    public String getPewsRiskCategory() { return pewsRiskCategory; }
    public void setPewsRiskCategory(String pewsRiskCategory) { this.pewsRiskCategory = pewsRiskCategory; }

    public double getOxygenationIndexOI() { return oxygenationIndexOI; }
    public void setOxygenationIndexOI(double oxygenationIndexOI) { this.oxygenationIndexOI = oxygenationIndexOI; }

    public String getPardsClassification() { return pardsClassification; }
    public void setPardsClassification(String pardsClassification) { this.pardsClassification = pardsClassification; }

    public double getGlucoseInfusionRateGIR() { return glucoseInfusionRateGIR; }
    public void setGlucoseInfusionRateGIR(double glucoseInfusionRateGIR) { this.glucoseInfusionRateGIR = glucoseInfusionRateGIR; }
}
