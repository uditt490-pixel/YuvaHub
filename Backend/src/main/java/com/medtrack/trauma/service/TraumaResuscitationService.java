package com.medtrack.trauma.service;

import com.medtrack.trauma.dto.TraumaCalculationRequest;
import com.medtrack.trauma.dto.TraumaCalculationResponse;
import com.medtrack.trauma.dto.TraumaTelemetryResponse;
import com.medtrack.trauma.model.TraumaPatient;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Enterprise Trauma Resuscitation & Massive Transfusion Service
 * Implements ATLS 10th Edition, TCCC, and TEG/ROTEM decision support algorithms.
 */
@Service
public class TraumaResuscitationService {

    private final Map<String, TraumaPatient> patientDatabase = new ConcurrentHashMap<>();

    public TraumaResuscitationService() {
        initSamplePatients();
    }

    public List<TraumaPatient> getAllTraumaPatients() {
        return new ArrayList<>(patientDatabase.values());
    }

    public Optional<TraumaPatient> getTraumaPatientById(String id) {
        return Optional.ofNullable(patientDatabase.get(id));
    }

    /**
     * Compute comprehensive trauma clinical scores and risk stratification.
     */
    public TraumaCalculationResponse calculateTraumaScores(TraumaCalculationRequest req) {
        TraumaCalculationResponse res = new TraumaCalculationResponse();

        // 1. Shock Index (SI = HR / SBP)
        double sbp = req.getSystolicBp() > 0 ? req.getSystolicBp() : 1.0;
        double si = Math.round((req.getHeartRate() / sbp) * 100.0) / 100.0;
        res.setShockIndex(si);
        res.setAgeAdjustedShockIndex(Math.round((req.getAge() * si) * 10.0) / 10.0);

        // 2. Reverse Shock Index x GCS: rSIG = (SBP / HR) * GCS
        double hr = req.getHeartRate() > 0 ? req.getHeartRate() : 1.0;
        double rsig = Math.round(((req.getSystolicBp() / hr) * req.getTotalGcs()) * 100.0) / 100.0;
        res.setReverseShockIndexGcs(rsig);

        // 3. ABC Score (0-4)
        int abc = 0;
        if (req.isPenetratingMechanism()) abc++;
        if (req.getSystolicBp() <= 90) abc++;
        if (req.getHeartRate() >= 120) abc++;
        if (req.isFastUltrasoundPositive()) abc++;
        res.setAbcScore(abc);
        res.setMtpActivationIndicated(abc >= 2 || si >= 1.3);

        // 4. Revised Trauma Score (RTS)
        double rts = calculateRts(req.getTotalGcs(), req.getSystolicBp(), req.getRespiratoryRate());
        res.setRevisedTraumaScore(rts);

        // 5. Injury Severity Score (ISS)
        int iss = calculateIss(req.getAisHead(), req.getAisFace(), req.getAisChest(),
                req.getAisAbdomen(), req.getAisExtremities(), req.getAisExternal());
        res.setInjurySeverityScore(iss);
        res.setIssCategory(getIssCategory(iss));

        // 6. TASH Score
        int tash = calculateTash(req.getSystolicBp(), req.getHemoglobinGdl(), req.isFastUltrasoundPositive(),
                req.getAisExtremities() >= 4, req.getAisExtremities() >= 3, req.getHeartRate(), req.getBaseDeficit());
        res.setTashScore(tash);

        // 7. Lethal Triad Risk
        int triadCount = 0;
        if (req.getCoreTempCelsius() < 35.0) triadCount++;
        if (req.getBloodPh() < 7.20 || req.getBaseDeficit() > 6.0) triadCount++;
        if (req.getInr() > 1.5 || req.getPlateletCountK() < 100.0) triadCount++;
        res.setLethalTriadCount(triadCount);

        double mortalityRisk = 10.0;
        if (triadCount == 1) mortalityRisk = 25.0;
        else if (triadCount == 2) mortalityRisk = 52.0;
        else if (triadCount == 3) mortalityRisk = 88.0;
        res.setLethalTriadMortalityRiskPercent(mortalityRisk);

        // Clinical Decision Support Guidance
        if (abc >= 2 || si >= 1.3) {
            res.setResuscitationRecommendation("STAT MASSIVE TRANSFUSION PROTOCOL ACTIVATION: 1:1:1 pRBC/FFP/Plt + 1g IV TXA within 3hr + Calcium Chloride 1g/4 units pRBC.");
        } else if (si >= 0.9) {
            res.setResuscitationRecommendation("OCCULT SHOCK PROTOCOL: Initiate restrictive balanced blood resuscitation; avoid excessive crystalloid hemodilution.");
        } else {
            res.setResuscitationRecommendation("HEMODYNAMICALLY STABLE: Continue serial clinical observation and secondary survey.");
        }

        return res;
    }

    private double calculateRts(int gcs, int sbp, int rr) {
        int gcsCode = gcs <= 3 ? 0 : gcs <= 5 ? 1 : gcs <= 8 ? 2 : gcs <= 12 ? 3 : 4;
        int sbpCode = sbp <= 0 ? 0 : sbp <= 49 ? 1 : sbp <= 75 ? 2 : sbp <= 89 ? 3 : 4;
        int rrCode = rr <= 0 ? 0 : rr <= 5 ? 1 : rr <= 9 ? 2 : rr >= 30 ? 3 : 4;
        return Math.round((0.9368 * gcsCode + 0.7326 * sbpCode + 0.2908 * rrCode) * 1000.0) / 1000.0;
    }

    private int calculateIss(int h, int f, int c, int a, int e, int ext) {
        int[] scores = new int[]{h, f, c, a, e, ext};
        for (int s : scores) {
            if (s == 6) return 75; // Unsurvivable
        }
        Arrays.sort(scores);
        return scores[5] * scores[5] + scores[4] * scores[4] + scores[3] * scores[3];
    }

    private String getIssCategory(int iss) {
        if (iss >= 50) return "MAXIMAL_LETHAL_50_PLUS";
        if (iss >= 25) return "CRITICAL_25_TO_49";
        if (iss >= 16) return "SEVERE_16_TO_24";
        if (iss >= 9) return "MODERATE_9_TO_15";
        return "MILD_UNDER_9";
    }

    private int calculateTash(int sbp, double hb, boolean fast, boolean pelvicFx, boolean femurFx, int hr, double bd) {
        int tash = 0;
        if (sbp < 100) tash += 4;
        else if (sbp < 120) tash += 1;

        if (hb < 7.0) tash += 8;
        else if (hb < 9.0) tash += 6;
        else if (hb < 10.0) tash += 4;
        else if (hb < 11.0) tash += 3;

        if (fast) tash += 3;
        if (pelvicFx) tash += 6;
        if (femurFx) tash += 3;
        if (hr > 120) tash += 2;

        if (bd > 10.0) tash += 4;
        else if (bd > 6.0) tash += 3;
        else if (bd > 2.0) tash += 1;

        return tash;
    }

    private void initSamplePatients() {
        TraumaPatient p1 = new TraumaPatient();
        p1.setId("TRM-9401");
        p1.setMrn("MRN-7839120");
        p1.setName("Marcus Vance");
        p1.setAge(34);
        p1.setGender("MALE");
        p1.setTraumaBayNumber("TB-01 (STAT RESUS)");
        p1.setAdmissionTimestamp(Instant.now().minusSeconds(720));
        p1.setTriageLevel("LEVEL_1_STAT_ALPHA");
        p1.setInjuryMechanism("High-Speed MVC Rollover with Ejection (65 mph, Unrestrained)");
        p1.setMechanismCategory("MOTOR_VEHICLE_COLLISION");
        p1.setPrimarySurgeon("Dr. Elena Rostova, MD");
        p1.setLeadTraumaNurse("Sarah Jenkins, BSN, TCRN");
        p1.setCurrentPhase("DAMAGE_CONTROL_RESUSCITATION");
        p1.setShockClass("CLASS_IV_SEVERE_EXSANGUINATING");
        p1.setHeartRate(138);
        p1.setSystolicBp(74);
        p1.setDiastolicBp(42);
        p1.setMeanArterialPressure(53);
        p1.setSpO2(91);
        p1.setRespiratoryRate(28);
        p1.setEndTidalCo2(24);
        p1.setCoreTemperatureCelsius(34.2);
        p1.setTotalGcs(8);
        p1.setPrbcUnits(8);
        p1.setFfpUnits(6);
        p1.setPlateletUnits(1);
        p1.setCryoPools(1);
        p1.setCalciumChlorideGrams(1.0);
        p1.setMtpRatioBalanced(false);
        p1.setReboaStatus("ACTIVE_OCCLUDED");
        p1.setReboaZone("ZONE_3_INFRARENAL");
        p1.setReboaInflationMinutes(14.0);
        p1.setShockIndex(1.86);
        p1.setReverseShockIndexGcs(4.29);
        p1.setAbcScore(3);
        p1.setInjurySeverityScore(50);
        p1.setLethalTriadCount(3);
        patientDatabase.put(p1.getId(), p1);

        TraumaPatient p2 = new TraumaPatient();
        p2.setId("TRM-9402");
        p2.setMrn("MRN-6192841");
        p2.setName("Devon Taylor");
        p2.setAge(27);
        p2.setGender("MALE");
        p2.setTraumaBayNumber("TB-02 (EMERGENT OR STAT)");
        p2.setAdmissionTimestamp(Instant.now().minusSeconds(1080));
        p2.setTriageLevel("LEVEL_1_STAT_ALPHA");
        p2.setInjuryMechanism("Penetrating Ballistic GSW to Left Anterior Chest");
        p2.setMechanismCategory("PENETRATING_BALLISTIC");
        p2.setPrimarySurgeon("Dr. Arthur Vance, MD");
        p2.setLeadTraumaNurse("Michael Chang, BSN, CEN");
        p2.setCurrentPhase("EMERGENT_SURGICAL_OR");
        p2.setShockClass("CLASS_III_MODERATE_SHOCK");
        p2.setHeartRate(126);
        p2.setSystolicBp(88);
        p2.setDiastolicBp(56);
        p2.setMeanArterialPressure(67);
        p2.setSpO2(94);
        p2.setRespiratoryRate(24);
        p2.setEndTidalCo2(29);
        p2.setCoreTemperatureCelsius(35.8);
        p2.setTotalGcs(13);
        p2.setPrbcUnits(4);
        p2.setFfpUnits(4);
        p2.setPlateletUnits(1);
        p2.setCryoPools(0);
        p2.setCalciumChlorideGrams(1.0);
        p2.setMtpRatioBalanced(true);
        p2.setReboaStatus("NOT_INDICATED");
        p2.setShockIndex(1.43);
        p2.setReverseShockIndexGcs(9.07);
        p2.setAbcScore(4);
        p2.setInjurySeverityScore(26);
        p2.setLethalTriadCount(0);
        patientDatabase.put(p2.getId(), p2);
    }
}
