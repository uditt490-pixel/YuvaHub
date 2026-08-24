package com.medtrack.trauma.dto;

import java.io.Serializable;

public class TraumaCalculationRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    private int age;
    private int heartRate;
    private int systolicBp;
    private int diastolicBp;
    private int respiratoryRate;
    private int totalGcs;
    private boolean penetratingMechanism;
    private boolean fastUltrasoundPositive;
    private double coreTempCelsius;
    private double bloodPh;
    private double baseDeficit;
    private double inr;
    private double plateletCountK;
    private double hemoglobinGdl;

    // AIS scores for ISS
    private int aisHead;
    private int aisFace;
    private int aisChest;
    private int aisAbdomen;
    private int aisExtremities;
    private int aisExternal;

    public TraumaCalculationRequest() {}

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public int getHeartRate() { return heartRate; }
    public void setHeartRate(int heartRate) { this.heartRate = heartRate; }

    public int getSystolicBp() { return systolicBp; }
    public void setSystolicBp(int systolicBp) { this.systolicBp = systolicBp; }

    public int getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(int diastolicBp) { this.diastolicBp = diastolicBp; }

    public int getRespiratoryRate() { return respiratoryRate; }
    public void setRespiratoryRate(int respiratoryRate) { this.respiratoryRate = respiratoryRate; }

    public int getTotalGcs() { return totalGcs; }
    public void setTotalGcs(int totalGcs) { this.totalGcs = totalGcs; }

    public boolean isPenetratingMechanism() { return penetratingMechanism; }
    public void setPenetratingMechanism(boolean penetratingMechanism) { this.penetratingMechanism = penetratingMechanism; }

    public boolean isFastUltrasoundPositive() { return fastUltrasoundPositive; }
    public void setFastUltrasoundPositive(boolean fastUltrasoundPositive) { this.fastUltrasoundPositive = fastUltrasoundPositive; }

    public double getCoreTempCelsius() { return coreTempCelsius; }
    public void setCoreTempCelsius(double coreTempCelsius) { this.coreTempCelsius = coreTempCelsius; }

    public double getBloodPh() { return bloodPh; }
    public void setBloodPh(double bloodPh) { this.bloodPh = bloodPh; }

    public double getBaseDeficit() { return baseDeficit; }
    public void setBaseDeficit(double baseDeficit) { this.baseDeficit = baseDeficit; }

    public double getInr() { return inr; }
    public void setInr(double inr) { this.inr = inr; }

    public double getPlateletCountK() { return plateletCountK; }
    public void setPlateletCountK(double plateletCountK) { this.plateletCountK = plateletCountK; }

    public double getHemoglobinGdl() { return hemoglobinGdl; }
    public void setHemoglobinGdl(double hemoglobinGdl) { this.hemoglobinGdl = hemoglobinGdl; }

    public int getAisHead() { return aisHead; }
    public void setAisHead(int aisHead) { this.aisHead = aisHead; }

    public int getAisFace() { return aisFace; }
    public void setAisFace(int aisFace) { this.aisFace = aisFace; }

    public int getAisChest() { return aisChest; }
    public void setAisChest(int aisChest) { this.aisChest = aisChest; }

    public int getAisAbdomen() { return aisAbdomen; }
    public void setAisAbdomen(int aisAbdomen) { this.aisAbdomen = aisAbdomen; }

    public int getAisExtremities() { return aisExtremities; }
    public void setAisExtremities(int aisExtremities) { this.aisExtremities = aisExtremities; }

    public int getAisExternal() { return aisExternal; }
    public void setAisExternal(int aisExternal) { this.aisExternal = aisExternal; }
}
