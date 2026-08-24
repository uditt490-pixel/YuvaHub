package com.medtrack.nephrology.dto;

import java.io.Serializable;

public class NephrologyCalculationRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    private double currentCreatinine;
    private double baselineCreatinine;
    private double urineOutputNormalized;
    private int oliguriaHours;
    private int age;
    private boolean isFemale;
    private double weightKg;
    private double preDialysisBun;
    private double postDialysisBun;
    private double sessionHours;
    private double ultrafiltrationLiters;
    private double serumNa;
    private double serumCl;
    private double serumHco3;
    private double serumAlbumin;
    private double urineNa;
    private double urineCr;

    public NephrologyCalculationRequest() {}

    public double getCurrentCreatinine() { return currentCreatinine; }
    public void setCurrentCreatinine(double currentCreatinine) { this.currentCreatinine = currentCreatinine; }

    public double getBaselineCreatinine() { return baselineCreatinine; }
    public void setBaselineCreatinine(double baselineCreatinine) { this.baselineCreatinine = baselineCreatinine; }

    public double getUrineOutputNormalized() { return urineOutputNormalized; }
    public void setUrineOutputNormalized(double urineOutputNormalized) { this.urineOutputNormalized = urineOutputNormalized; }

    public int getOliguriaHours() { return oliguriaHours; }
    public void setOliguriaHours(int oliguriaHours) { this.oliguriaHours = oliguriaHours; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public boolean isFemale() { return isFemale; }
    public void setFemale(boolean female) { isFemale = female; }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public double getPreDialysisBun() { return preDialysisBun; }
    public void setPreDialysisBun(double preDialysisBun) { this.preDialysisBun = preDialysisBun; }

    public double getPostDialysisBun() { return postDialysisBun; }
    public void setPostDialysisBun(double postDialysisBun) { this.postDialysisBun = postDialysisBun; }

    public double getSessionHours() { return sessionHours; }
    public void setSessionHours(double sessionHours) { this.sessionHours = sessionHours; }

    public double getUltrafiltrationLiters() { return ultrafiltrationLiters; }
    public void setUltrafiltrationLiters(double ultrafiltrationLiters) { this.ultrafiltrationLiters = ultrafiltrationLiters; }

    public double getSerumNa() { return serumNa; }
    public void setSerumNa(double serumNa) { this.serumNa = serumNa; }

    public double getSerumCl() { return serumCl; }
    public void setSerumCl(double serumCl) { this.serumCl = serumCl; }

    public double getSerumHco3() { return serumHco3; }
    public void setSerumHco3(double serumHco3) { this.serumHco3 = serumHco3; }

    public double getSerumAlbumin() { return serumAlbumin; }
    public void setSerumAlbumin(double serumAlbumin) { this.serumAlbumin = serumAlbumin; }

    public double getUrineNa() { return urineNa; }
    public void setUrineNa(double urineNa) { this.urineNa = urineNa; }

    public double getUrineCr() { return urineCr; }
    public void setUrineCr(double urineCr) { this.urineCr = urineCr; }
}
