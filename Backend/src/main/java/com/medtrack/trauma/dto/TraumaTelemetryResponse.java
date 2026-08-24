package com.medtrack.trauma.dto;

import java.io.Serializable;
import java.util.List;

public class TraumaTelemetryResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String patientId;
    private String mrn;
    private String name;
    private int age;
    private String triageLevel;
    private String traumaBay;
    private int heartRate;
    private int systolicBp;
    private int diastolicBp;
    private int map;
    private double shockIndex;
    private double rsig;
    private int abcScore;
    private int iss;
    private int lethalTriadCount;
    private boolean mtpBalanced;
    private String clinicalStatusSummary;
    private List<String> priorityAlerts;

    public TraumaTelemetryResponse() {}

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getTriageLevel() { return triageLevel; }
    public void setTriageLevel(String triageLevel) { this.triageLevel = triageLevel; }

    public String getTraumaBay() { return traumaBay; }
    public void setTraumaBay(String traumaBay) { this.traumaBay = traumaBay; }

    public int getHeartRate() { return heartRate; }
    public void setHeartRate(int heartRate) { this.heartRate = heartRate; }

    public int getSystolicBp() { return systolicBp; }
    public void setSystolicBp(int systolicBp) { this.systolicBp = systolicBp; }

    public int getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(int diastolicBp) { this.diastolicBp = diastolicBp; }

    public int getMap() { return map; }
    public void setMap(int map) { this.map = map; }

    public double getShockIndex() { return shockIndex; }
    public void setShockIndex(double shockIndex) { this.shockIndex = shockIndex; }

    public double getRsig() { return rsig; }
    public void setRsig(double rsig) { this.rsig = rsig; }

    public int getAbcScore() { return abcScore; }
    public void setAbcScore(int abcScore) { this.abcScore = abcScore; }

    public int getIss() { return iss; }
    public void setIss(int iss) { this.iss = iss; }

    public int getLethalTriadCount() { return lethalTriadCount; }
    public void setLethalTriadCount(int lethalTriadCount) { this.lethalTriadCount = lethalTriadCount; }

    public boolean isMtpBalanced() { return mtpBalanced; }
    public void setMtpBalanced(boolean mtpBalanced) { this.mtpBalanced = mtpBalanced; }

    public String getClinicalStatusSummary() { return clinicalStatusSummary; }
    public void setClinicalStatusSummary(String clinicalStatusSummary) { this.clinicalStatusSummary = clinicalStatusSummary; }

    public List<String> getPriorityAlerts() { return priorityAlerts; }
    public void setPriorityAlerts(List<String> priorityAlerts) { this.priorityAlerts = priorityAlerts; }
}
