package com.medtrack.trauma.dto;

import java.io.Serializable;

public class TraumaCalculationResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private double shockIndex;
    private double ageAdjustedShockIndex;
    private double reverseShockIndexGcs;
    private int abcScore;
    private double revisedTraumaScore;
    private int injurySeverityScore;
    private String issCategory;
    private int tashScore;
    private int lethalTriadCount;
    private double lethalTriadMortalityRiskPercent;
    private String resuscitationRecommendation;
    private boolean mtpActivationIndicated;

    public TraumaCalculationResponse() {}

    public double getShockIndex() { return shockIndex; }
    public void setShockIndex(double shockIndex) { this.shockIndex = shockIndex; }

    public double getAgeAdjustedShockIndex() { return ageAdjustedShockIndex; }
    public void setAgeAdjustedShockIndex(double ageAdjustedShockIndex) { this.ageAdjustedShockIndex = ageAdjustedShockIndex; }

    public double getReverseShockIndexGcs() { return reverseShockIndexGcs; }
    public void setReverseShockIndexGcs(double reverseShockIndexGcs) { this.reverseShockIndexGcs = reverseShockIndexGcs; }

    public int getAbcScore() { return abcScore; }
    public void setAbcScore(int abcScore) { this.abcScore = abcScore; }

    public double getRevisedTraumaScore() { return revisedTraumaScore; }
    public void setRevisedTraumaScore(double revisedTraumaScore) { this.revisedTraumaScore = revisedTraumaScore; }

    public int getInjurySeverityScore() { return injurySeverityScore; }
    public void setInjurySeverityScore(int injurySeverityScore) { this.injurySeverityScore = injurySeverityScore; }

    public String getIssCategory() { return issCategory; }
    public void setIssCategory(String issCategory) { this.issCategory = issCategory; }

    public int getTashScore() { return tashScore; }
    public void setTashScore(int tashScore) { this.tashScore = tashScore; }

    public int getLethalTriadCount() { return lethalTriadCount; }
    public void setLethalTriadCount(int lethalTriadCount) { this.lethalTriadCount = lethalTriadCount; }

    public double getLethalTriadMortalityRiskPercent() { return lethalTriadMortalityRiskPercent; }
    public void setLethalTriadMortalityRiskPercent(double lethalTriadMortalityRiskPercent) { this.lethalTriadMortalityRiskPercent = lethalTriadMortalityRiskPercent; }

    public String getResuscitationRecommendation() { return resuscitationRecommendation; }
    public void setResuscitationRecommendation(String resuscitationRecommendation) { this.resuscitationRecommendation = resuscitationRecommendation; }

    public boolean isMtpActivationIndicated() { return mtpActivationIndicated; }
    public void setMtpActivationIndicated(boolean mtpActivationIndicated) { this.mtpActivationIndicated = mtpActivationIndicated; }
}
