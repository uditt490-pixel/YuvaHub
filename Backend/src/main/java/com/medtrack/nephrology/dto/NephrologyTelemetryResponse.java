package com.medtrack.nephrology.dto;

import java.io.Serializable;
import java.util.List;

public class NephrologyTelemetryResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String patientId;
    private String mrn;
    private String name;
    private String kdigoStage;
    private String modality;
    private double serumCreatinine;
    private double serumPotassium;
    private double urineOutput;
    private double bloodPh;
    private double tmp;
    private double ktV;
    private double totalToIcaRatio;
    private boolean isCitrateToxicity;
    private String clinicalStatusSummary;
    private List<String> priorityAlerts;

    public NephrologyTelemetryResponse() {}

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getKdigoStage() { return kdigoStage; }
    public void setKdigoStage(String kdigoStage) { this.kdigoStage = kdigoStage; }

    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }

    public double getSerumCreatinine() { return serumCreatinine; }
    public void setSerumCreatinine(double serumCreatinine) { this.serumCreatinine = serumCreatinine; }

    public double getSerumPotassium() { return serumPotassium; }
    public void setSerumPotassium(double serumPotassium) { this.serumPotassium = serumPotassium; }

    public double getUrineOutput() { return urineOutput; }
    public void setUrineOutput(double urineOutput) { this.urineOutput = urineOutput; }

    public double getBloodPh() { return bloodPh; }
    public void setBloodPh(double bloodPh) { this.bloodPh = bloodPh; }

    public double getTmp() { return tmp; }
    public void setTmp(double tmp) { this.tmp = tmp; }

    public double getKtV() { return ktV; }
    public void setKtV(double ktV) { this.ktV = ktV; }

    public double getTotalToIcaRatio() { return totalToIcaRatio; }
    public void setTotalToIcaRatio(double totalToIcaRatio) { this.totalToIcaRatio = totalToIcaRatio; }

    public boolean isCitrateToxicity() { return isCitrateToxicity; }
    public void setCitrateToxicity(boolean citrateToxicity) { isCitrateToxicity = citrateToxicity; }

    public String getClinicalStatusSummary() { return clinicalStatusSummary; }
    public void setClinicalStatusSummary(String clinicalStatusSummary) { this.clinicalStatusSummary = clinicalStatusSummary; }

    public List<String> getPriorityAlerts() { return priorityAlerts; }
    public void setPriorityAlerts(List<String> priorityAlerts) { this.priorityAlerts = priorityAlerts; }
}
