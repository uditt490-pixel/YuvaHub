package com.medtrack.picu.service;

import com.medtrack.picu.dto.PicuCalculationRequest;
import com.medtrack.picu.dto.PicuCalculationResponse;
import com.medtrack.picu.model.PicuPatient;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PicuResuscitationService {

    private final Map<String, PicuPatient> patientDatabase = new ConcurrentHashMap<>();

    public PicuResuscitationService() {
        initSamplePatients();
    }

    public List<PicuPatient> getAllPatients() {
        return new ArrayList<>(patientDatabase.values());
    }

    public Optional<PicuPatient> getPatientById(String id) {
        return Optional.ofNullable(patientDatabase.get(id));
    }

    public PicuCalculationResponse calculatePicuScores(PicuCalculationRequest req) {
        PicuCalculationResponse res = new PicuCalculationResponse();

        double w = req.getWeightKg() > 0 ? req.getWeightKg() : 10.0;
        double age = Math.max(0, req.getAgeYears());

        // 1. Broselow Color Code
        if (w < 3.0) res.setBroselowColor("PINK_PREEMIE_UNDER_3KG");
        else if (w <= 5.5) res.setBroselowColor("GREY_3_5KG");
        else if (w <= 7.5) res.setBroselowColor("PINK_6_7KG");
        else if (w <= 9.5) res.setBroselowColor("RED_8_9KG");
        else if (w <= 11.5) res.setBroselowColor("PURPLE_10_11KG");
        else if (w <= 14.5) res.setBroselowColor("YELLOW_12_14KG");
        else if (w <= 18.5) res.setBroselowColor("WHITE_15_18KG");
        else if (w <= 23.5) res.setBroselowColor("BLUE_19_23KG");
        else if (w <= 29.5) res.setBroselowColor("ORANGE_24_29KG");
        else if (w <= 36.0) res.setBroselowColor("GREEN_30_36KG");
        else res.setBroselowColor("ADULT_OVER_36KG");

        // 2. PALS Calculations
        res.setEpinephrineIvMg(Math.round(w * 0.01 * 1000.0) / 1000.0);
        res.setDefibrillationJoules(Math.round(w * 2.0));
        res.setSalineBolus20MlKg(Math.round(w * 20.0));
        res.setCuffedEttMm(age > 0 ? Math.round(((age / 4.0) + 3.5) * 10.0) / 10.0 : 3.0);

        // 3. PEWS Score
        int pewsTotal = req.getBehaviorScore() + req.getCardiovascularScore() + req.getRespiratoryScore() + req.getExtraNebulizer() + req.getExtraEmesis();
        res.setTotalPewsScore(pewsTotal);
        if (pewsTotal >= 7) res.setPewsRiskCategory("CRITICAL_STAT_PICU_CODE");
        else if (pewsTotal >= 5) res.setPewsRiskCategory("HIGH_RAPID_RESPONSE");
        else if (pewsTotal >= 3) res.setPewsRiskCategory("MEDIUM_INCREASED_MONITORING");
        else res.setPewsRiskCategory("LOW_ROUTINE");

        // 4. PALICC Oxygenation Index (OI)
        if (req.getPaO2() > 0 && req.getMeanPawMmHg() > 0) {
            double oi = (req.getMeanPawMmHg() * req.getFiO2() * 100.0) / req.getPaO2();
            res.setOxygenationIndexOI(Math.round(oi * 10.0) / 10.0);

            if (oi >= 16.0) res.setPardsClassification("SEVERE_PARDS_OI_OVER_16");
            else if (oi >= 8.0) res.setPardsClassification("MODERATE_PARDS_OI_8_16");
            else if (oi >= 4.0) res.setPardsClassification("MILD_PARDS_OI_4_8");
            else res.setPardsClassification("NO_PARDS");
        }

        // 5. GIR
        if (req.getIvRateMlHr() > 0 && req.getDextrosePercent() > 0) {
            double gir = (req.getIvRateMlHr() * req.getDextrosePercent()) / (w * 6.0);
            res.setGlucoseInfusionRateGIR(Math.round(gir * 10.0) / 10.0);
        }

        if (res.getTotalPewsScore() >= 6) {
            res.setClinicalRecommendation("STAT PEDIATRIC RAPID RESPONSE TEAM ACTIVATED: Prepare 20 mL/kg Saline bolus and airway equipment.");
        } else {
            res.setClinicalRecommendation("CONTINUE PROTOCOLIZED MONITORING: Vital signs stable under standard unit surveillance.");
        }

        return res;
    }

    private void initSamplePatients() {
        PicuPatient p1 = new PicuPatient();
        p1.setId("PICU-301");
        p1.setMrn("MRN-1092831");
        p1.setName("Baby Boy Liam");
        p1.setGestationalAgeWeeks(26.2);
        p1.setChronologicalAgeDays(4);
        p1.setAgeGroup("EXTREME_PRETERM_UNDER_28W");
        p1.setGender("MALE");
        p1.setBirthWeightGrams(820);
        p1.setCurrentWeightKg(0.84);
        p1.setLengthHeightCm(32.5);
        p1.setHeadCircumferenceCm(23.0);
        p1.setCareUnit("NICU_LEVEL_IV_QUATERNARY");
        p1.setBedIsoletteNumber("NICU-ISOLETTE-01 (STAT HFOV)");
        p1.setAdmissionTimestamp(Instant.now().minusSeconds(3600 * 72));
        p1.setPrimaryDiagnosis("Extreme Prematurity (26w) with Severe RDS & PPHN");
        p1.setAttendingPediatrician("Dr. Genevieve Sterling, MD, FAAP");
        p1.setLeadPicuNurse("Rachel Adams, BSN, RNC-NIC");
        p1.setVentilationMode("HFOV_HIGH_FREQUENCY_OSCILLATORY");
        p1.setHeartRate(162);
        p1.setSystolicBp(48);
        p1.setDiastolicBp(26);
        p1.setMeanArterialPressure(33);
        p1.setRespiratoryRate(45);
        p1.setSpO2PreDuctal(92);
        p1.setSpO2PostDuctal(83);
        p1.setPrePostDuctalDelta(9);
        p1.setEndTidalCo2(42);
        p1.setCoreTemperature(36.8);
        p1.setSkinTemperature(35.6);
        p1.setPerfusionIndex(1.1);
        p1.setCapillaryRefillSeconds(2.2);
        p1.setBroselowColor("PINK_PREEMIE_UNDER_3KG");
        p1.setEpinephrineIvDoseMg(0.008);
        p1.setDefibrillationJoules(2.0);
        p1.setCuffedEttMm(2.5);
        p1.setTotalPewsScore(6);
        p1.setPewsRiskCategory("HIGH_RAPID_RESPONSE");
        p1.setOxygenationIndexOI(16.2);
        p1.setPardsClassification("SEVERE_PARDS_OI_OVER_16");
        p1.setGlucoseInfusionRateGIR(6.2);
        patientDatabase.put(p1.getId(), p1);
    }
}
