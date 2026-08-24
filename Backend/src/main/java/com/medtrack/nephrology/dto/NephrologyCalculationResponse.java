package com.medtrack.nephrology.dto;

import java.io.Serializable;

public class NephrologyCalculationResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String kdigoStage;
    private String kdigoRationale;
    private double eGfrCkdEpi;
    private double daugirdasKtV;
    private double ureaReductionRatio;
    private double standardAnionGap;
    private double correctedAnionGap;
    private double fenaExcretion;
    private String clinicalRecommendation;

    public NephrologyCalculationResponse() {}

    public String getKdigoStage() { return kdigoStage; }
    public void setKdigoStage(String kdigoStage) { this.kdigoStage = kdigoStage; }

    public String getKdigoRationale() { return kdigoRationale; }
    public void setKdigoRationale(String kdigoRationale) { this.kdigoRationale = kdigoRationale; }

    public double geteGfrCkdEpi() { return eGfrCkdEpi; }
    public void seteGfrCkdEpi(double eGfrCkdEpi) { this.eGfrCkdEpi = eGfrCkdEpi; }

    public double getDaugirdasKtV() { return daugirdasKtV; }
    public void setDaugirdasKtV(double daugirdasKtV) { this.daugirdasKtV = daugirdasKtV; }

    public double getUreaReductionRatio() { return ureaReductionRatio; }
    public void setUreaReductionRatio(double ureaReductionRatio) { this.ureaReductionRatio = ureaReductionRatio; }

    public double getStandardAnionGap() { return standardAnionGap; }
    public void setStandardAnionGap(double standardAnionGap) { this.standardAnionGap = standardAnionGap; }

    public double getCorrectedAnionGap() { return correctedAnionGap; }
    public void setCorrectedAnionGap(double correctedAnionGap) { this.correctedAnionGap = correctedAnionGap; }

    public double getFenaExcretion() { return fenaExcretion; }
    public void setFenaExcretion(double fenaExcretion) { this.fenaExcretion = fenaExcretion; }

    public String getClinicalRecommendation() { return clinicalRecommendation; }
    public void setClinicalRecommendation(String clinicalRecommendation) { this.clinicalRecommendation = clinicalRecommendation; }
}
