package com.medtrack.picu.dto;

import java.io.Serializable;

public class PicuCalculationResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String broselowColor;
    private double epinephrineIvMg;
    private double defibrillationJoules;
    private double salineBolus20MlKg;
    private double cuffedEttMm;
    private int totalPewsScore;
    private String pewsRiskCategory;
    private double oxygenationIndexOI;
    private String pardsClassification;
    private double glucoseInfusionRateGIR;
    private String clinicalRecommendation;

    public PicuCalculationResponse() {}

    public String getBroselowColor() { return broselowColor; }
    public void setBroselowColor(String broselowColor) { this.broselowColor = broselowColor; }

    public double getEpinephrineIvMg() { return epinephrineIvMg; }
    public void setEpinephrineIvMg(double epinephrineIvMg) { this.epinephrineIvMg = epinephrineIvMg; }

    public double getDefibrillationJoules() { return defibrillationJoules; }
    public void setDefibrillationJoules(double defibrillationJoules) { this.defibrillationJoules = defibrillationJoules; }

    public double getSalineBolus20MlKg() { return salineBolus20MlKg; }
    public void setSalineBolus20MlKg(double salineBolus20MlKg) { this.salineBolus20MlKg = salineBolus20MlKg; }

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

    public String getClinicalRecommendation() { return clinicalRecommendation; }
    public void setClinicalRecommendation(String clinicalRecommendation) { this.clinicalRecommendation = clinicalRecommendation; }
}
