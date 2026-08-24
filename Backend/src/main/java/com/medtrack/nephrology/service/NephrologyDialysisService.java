package com.medtrack.nephrology.service;

import com.medtrack.nephrology.dto.NephrologyCalculationRequest;
import com.medtrack.nephrology.dto.NephrologyCalculationResponse;
import com.medtrack.nephrology.model.NephrologyPatient;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NephrologyDialysisService {

    private final Map<String, NephrologyPatient> patientDatabase = new ConcurrentHashMap<>();

    public NephrologyDialysisService() {
        initSamplePatients();
    }

    public List<NephrologyPatient> getAllPatients() {
        return new ArrayList<>(patientDatabase.values());
    }

    public Optional<NephrologyPatient> getPatientById(String id) {
        return Optional.ofNullable(patientDatabase.get(id));
    }

    public NephrologyCalculationResponse calculateNephrologyScores(NephrologyCalculationRequest req) {
        NephrologyCalculationResponse res = new NephrologyCalculationResponse();

        // 1. KDIGO AKI Classification
        double base = req.getBaselineCreatinine() > 0 ? req.getBaselineCreatinine() : 1.0;
        double ratio = req.getCurrentCreatinine() / base;
        double uo = req.getUrineOutputNormalized();
        int hours = req.getOliguriaHours();

        if (ratio >= 3.0 || req.getCurrentCreatinine() >= 4.0 || (uo < 0.3 && hours >= 24) || (uo == 0 && hours >= 12)) {
            res.setKdigoStage("STAGE_3_FAILURE");
            res.setKdigoRationale("Creatinine multiplier >= 3.0x baseline or persistent oliguria/anuria for >= 24h.");
        } else if (ratio >= 2.0 || (uo < 0.5 && hours >= 12)) {
            res.setKdigoStage("STAGE_2_INJURY");
            res.setKdigoRationale("Creatinine 2.0-2.9x baseline or urine output < 0.5 mL/kg/hr for >= 12h.");
        } else if (ratio >= 1.5 || (uo < 0.5 && hours >= 6)) {
            res.setKdigoStage("STAGE_1_RISK");
            res.setKdigoRationale("Creatinine 1.5-1.9x baseline or urine output < 0.5 mL/kg/hr for >= 6h.");
        } else {
            res.setKdigoStage("STAGE_0_NORMAL");
            res.setKdigoRationale("Within baseline parameters.");
        }

        // 2. Daugirdas single-pool Kt/V
        if (req.getPreDialysisBun() > 0 && req.getPostDialysisBun() > 0) {
            double R = req.getPostDialysisBun() / req.getPreDialysisBun();
            double t = req.getSessionHours() > 0 ? req.getSessionHours() : 4.0;
            double uf = req.getUltrafiltrationLiters();
            double w = req.getWeightKg() > 0 ? req.getWeightKg() : 70.0;
            double ktv = -Math.log(Math.max(0.01, R - 0.008 * t)) + (4 - 3.5 * R) * (uf / w);
            res.setDaugirdasKtV(Math.round(Math.max(0, ktv) * 100.0) / 100.0);

            double urr = ((req.getPreDialysisBun() - req.getPostDialysisBun()) / req.getPreDialysisBun()) * 100.0;
            res.setUreaReductionRatio(Math.round(urr * 10.0) / 10.0);
        }

        // 3. Anion Gap
        double ag = req.getSerumNa() - (req.getSerumCl() + req.getSerumHco3());
        double alb = req.getSerumAlbumin() > 0 ? req.getSerumAlbumin() : 4.0;
        double correctedAg = ag + 2.5 * (4.0 - alb);
        res.setStandardAnionGap(Math.round(ag * 10.0) / 10.0);
        res.setCorrectedAnionGap(Math.round(correctedAg * 10.0) / 10.0);

        // 4. FENa
        if (req.getSerumNa() > 0 && req.getUrineCr() > 0) {
            double fena = ((req.getUrineNa() * req.getCurrentCreatinine()) / (req.getSerumNa() * req.getUrineCr())) * 100.0;
            res.setFenaExcretion(Math.round(fena * 100.0) / 100.0);
        }

        if ("STAGE_3_FAILURE".equals(res.getKdigoStage())) {
            res.setClinicalRecommendation("STAT RENAL REPLACEMENT THERAPY INDICATED: Initiate CVVHDF / IHD based on hemodynamic stability.");
        } else {
            res.setClinicalRecommendation("CONTINUE TARGETED CONSERVATIVE MANAGEMENT: Optimize renal perfusion pressure and avoid nephrotoxins.");
        }

        return res;
    }

    private void initSamplePatients() {
        NephrologyPatient p1 = new NephrologyPatient();
        p1.setId("NEPH-7101");
        p1.setMrn("MRN-8492019");
        p1.setName("Ethan Vance");
        p1.setAge(58);
        p1.setGender("MALE");
        p1.setDryWeightKg(82.0);
        p1.setCurrentWeightKg(87.5);
        p1.setRenalWardBed("ICU-BED-04 (CRRT-STAT)");
        p1.setAdmissionTimestamp(Instant.now().minusSeconds(3600 * 48));
        p1.setTriagePriority("EMERGENT_STAT_DIALYSIS");
        p1.setPrimaryEtiology("Severe Septic Shock with Oliguric Acute Tubular Necrosis (ATN)");
        p1.setAttendingNephrologist("Dr. Alistair Sterling, MD, FASN");
        p1.setLeadDialysisNurse("Jennifer Morales, BSN, CNN");
        p1.setKdigoStage("STAGE_3_FAILURE");
        p1.setCurrentModality("CVVHDF_CONTINUOUS_HEMODIAFILTRATION");
        p1.setAnticoagulation("REGIONAL_CITRATE_RCA");
        p1.setVascularAccess("RIGHT_INTERNAL_JUGULAR_VAS_CATH");
        p1.setBloodFlowQb(200);
        p1.setEffluentDose(28.5);
        p1.setDialysateFlowQd(1200);
        p1.setTransmembranePressureTmp(275);
        p1.setFilterPressureDropDeltaP(75);
        p1.setFiltrationFraction(18.2);
        p1.setFilterClottingRisk(true);
        p1.setPostFilterIca(0.31);
        p1.setSystemicIca(1.18);
        p1.setTotalSerumCa(2.24);
        p1.setTotalToIonizedCaRatio(1.90);
        p1.setCitrateToxicity(false);
        p1.setSerumCreatinine(4.82);
        p1.setBaselineCreatinine(1.10);
        p1.setCreatinineMultiplier(4.38);
        p1.setBloodUreaNitrogen(88);
        p1.setSerumPotassium(5.6);
        p1.setSerumBicarbonate(16.5);
        p1.setBloodPh(7.28);
        p1.setCorrectedAnionGap(21.5);
        p1.setUrineOutputNormalized(0.15);
        p1.setFenaExcretion(3.42);
        p1.setDaugirdasKtV(1.48);
        p1.setUreaReductionRatio(68.2);
        p1.setNetFluidBalance24h(-1800);
        p1.setFluidOverloadPercent(6.7);
        patientDatabase.put(p1.getId(), p1);
    }
}
