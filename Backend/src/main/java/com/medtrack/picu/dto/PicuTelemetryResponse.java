package com.medtrack.picu.dto;

import java.io.Serializable;
import java.util.List;

public class PicuTelemetryResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String patientId;
    private String mrn;
    private String name;
    private String bedIsolette;
    private String careUnit;
    private double weightKg;
    private String broselowColor;
    private int heartRate;
    private int map;
    private int prePostDuctalDelta;
    private int pewsScore;
    private double oxygenationIndexOI;
    private double gir;
    private String clinicalStatusSummary;
    private List<String> activeAlarms;

    public PicuTelemetryResponse() {}

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBedIsolette() { return bedIsolette; }
    public void setBedIsolette(String bedIsolette) { this.bedIsolette = bedIsolette; }

    public String getCareUnit() { return careUnit; }
    public void setCareUnit(String careUnit) { this.careUnit = careUnit; }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public String getBroselowColor() { return broselowColor; }
    public void setBroselowColor(String broselowColor) { this.broselowColor = broselowColor; }

    public int getHeartRate() { return heartRate; }
    public void setHeartRate(int heartRate) { this.heartRate = heartRate; }

    public int getMap() { return map; }
    public void setMap(int map) { this.map = map; }

    public int getPrePostDuctalDelta() { return prePostDuctalDelta; }
    public void setPrePostDuctalDelta(int prePostDuctalDelta) { this.prePostDuctalDelta = prePostDuctalDelta; }

    public int getPewsScore() { return pewsScore; }
    public void setPewsScore(int pewsScore) { this.pewsScore = pewsScore; }

    public double getOxygenationIndexOI() { return oxygenationIndexOI; }
    public void setOxygenationIndexOI(double oxygenationIndexOI) { this.oxygenationIndexOI = oxygenationIndexOI; }

    public double getGir() { return gir; }
    public void setGir(double gir) { this.gir = gir; }

    public String getClinicalStatusSummary() { return clinicalStatusSummary; }
    public void setClinicalStatusSummary(String clinicalStatusSummary) { this.clinicalStatusSummary = clinicalStatusSummary; }

    public List<String> getActiveAlarms() { return activeAlarms; }
    public void setActiveAlarms(List<String> activeAlarms) { this.activeAlarms = activeAlarms; }
}
