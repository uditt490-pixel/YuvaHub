package com.medtrack.picu.dto;

import java.io.Serializable;

public class PicuCalculationRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    private double weightKg;
    private double ageYears;
    private int behaviorScore;
    private int cardiovascularScore;
    private int respiratoryScore;
    private int extraNebulizer;
    private int extraEmesis;
    private double meanPawMmHg;
    private double fiO2;
    private double paO2;
    private double spO2;
    private double ivRateMlHr;
    private double dextrosePercent;

    public PicuCalculationRequest() {}

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public double getAgeYears() { return ageYears; }
    public void setAgeYears(double ageYears) { this.ageYears = ageYears; }

    public int getBehaviorScore() { return behaviorScore; }
    public void setBehaviorScore(int behaviorScore) { this.behaviorScore = behaviorScore; }

    public int getCardiovascularScore() { return cardiovascularScore; }
    public void setCardiovascularScore(int cardiovascularScore) { this.cardiovascularScore = cardiovascularScore; }

    public int getRespiratoryScore() { return respiratoryScore; }
    public void setRespiratoryScore(int respiratoryScore) { this.respiratoryScore = respiratoryScore; }

    public int getExtraNebulizer() { return extraNebulizer; }
    public void setExtraNebulizer(int extraNebulizer) { this.extraNebulizer = extraNebulizer; }

    public int getExtraEmesis() { return extraEmesis; }
    public void setExtraEmesis(int extraEmesis) { this.extraEmesis = extraEmesis; }

    public double getMeanPawMmHg() { return meanPawMmHg; }
    public void setMeanPawMmHg(double meanPawMmHg) { this.meanPawMmHg = meanPawMmHg; }

    public double getFiO2() { return fiO2; }
    public void setFiO2(double fiO2) { this.fiO2 = fiO2; }

    public double getPaO2() { return paO2; }
    public void setPaO2(double paO2) { this.paO2 = paO2; }

    public double getSpO2() { return spO2; }
    public void setSpO2(double spO2) { this.spO2 = spO2; }

    public double getIvRateMlHr() { return ivRateMlHr; }
    public void setIvRateMlHr(double ivRateMlHr) { this.ivRateMlHr = ivRateMlHr; }

    public double getDextrosePercent() { return dextrosePercent; }
    public void setDextrosePercent(double dextrosePercent) { this.dextrosePercent = dextrosePercent; }
}
