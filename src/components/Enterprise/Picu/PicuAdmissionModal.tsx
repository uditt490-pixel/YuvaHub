import React, { useState } from "react";
import { X, Baby, PlusCircle } from "lucide-react";
import { PicuPatient, PediatricAgeGroup, PicuUnitCareLevel, PediatricVentilationMode } from "../../../types/picuTelemetry";
import { PicuTelemetryService } from "../../../services/PicuTelemetryService";

interface PicuAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdmitPatient: (patient: PicuPatient) => void;
}

export const PicuAdmissionModal: React.FC<PicuAdmissionModalProps> = ({
  isOpen,
  onClose,
  onAdmitPatient
}) => {
  const [name, setName] = useState("Oliver Hayes");
  const [mrn, setMrn] = useState("MRN-" + Math.floor(1000000 + Math.random() * 9000000));
  const [gestationalAge, setGestationalAge] = useState<number>(39.2);
  const [ageDays, setAgeDays] = useState<number>(2);
  const [ageGroup, setAgeGroup] = useState<PediatricAgeGroup>("FULL_TERM_NEONATE_0_28D");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [weightKg, setWeightKg] = useState<number>(3.35);
  const [lengthCm, setLengthCm] = useState<number>(50.0);
  const [bedIsolette, setBedIsolette] = useState("NICU-ISOLETTE-08 (STEP-DOWN)");
  const [careUnit, setCareUnit] = useState<PicuUnitCareLevel>("NICU_LEVEL_III_HIGH_RISK");
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("Neonatal Meconium Aspiration Syndrome with Persistent Hypoxemia");
  const [ventMode, setVentMode] = useState<PediatricVentilationMode>("CONVENTIONAL_PRVC_PRESSURE_REGULATED");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pals = PicuTelemetryService.calculatePalsDosing(weightKg, ageDays > 365 ? ageDays / 365 : 0);
    const pews = PicuTelemetryService.calculatePews(1, 1, 1, 0, 0);
    const oxygenation = PicuTelemetryService.calculateOxygenationIndex(10.0, 0.40, 75, 94);

    const newPatient: PicuPatient = {
      id: "PICU-" + Math.floor(310 + Math.random() * 89),
      mrn,
      name,
      gestationalAgeWeeks: Number(gestationalAge),
      chronologicalAgeDays: Number(ageDays),
      ageGroup,
      gender,
      birthWeightGrams: Math.round(Number(weightKg) * 1000),
      currentWeightKg: Number(weightKg),
      lengthHeightCm: Number(lengthCm),
      headCircumferenceCm: 34.5,
      careUnit,
      bedIsoletteNumber: bedIsolette,
      admissionDate: "Just now",
      primaryDiagnosis,
      attendingPediatrician: "Dr. Genevieve Sterling, MD, FAAP",
      leadPicuNurse: "Rachel Adams, BSN, RNC-NIC",
      ventilationMode: ventMode,
      vitals: {
        heartRate: 148,
        systolicBp: 62,
        diastolicBp: 34,
        meanArterialPressure: 43,
        respiratoryRate: 46,
        spO2PreDuctalRightHandPercent: 94,
        spO2PostDuctalFootPercent: 92,
        prePostDuctalSpO2Delta: 2,
        endTidalCo2MmHg: 40,
        coreTemperatureCelsius: 36.9,
        peripheralSkinTemperatureCelsius: 36.2,
        centralPeripheralTempDelta: 0.7,
        perfusionIndexPI: 2.0,
        capillaryRefillTimeSeconds: 1.9
      },
      incubator: {
        isIncubatorActive: true,
        incubatorMode: "SERVO_SKIN_CONTROL",
        chamberAirTemperatureCelsius: 33.0,
        chamberHumidityPercentage: 60,
        skinServoTemperatureTargetCelsius: 36.9,
        heaterPowerOutputPercentage: 30,
        ambientNoiseLevelDba: 36,
        transcutaneousBilirubinTcBMgDl: 6.2,
        phototherapyActive: false,
        phototherapyIrradianceUWCm2Nm: 0
      },
      palsDosing: pals,
      pews,
      oxygenation,
      metabolic: {
        glucoseInfusionRateMgKgMin: 5.5,
        dextroseConcentrationPercent: 10.0,
        totalIvFluidRateMlKgDay: 90,
        serumGlucoseMgDl: 78,
        bloodGasPh: 7.34,
        baseDeficitMeqL: -3.0,
        serumLactateMmolL: 2.0,
        serumIonizedCalciumMmolL: 1.20
      },
      activeAlerts: [],
      resuscitationTimeline: [
        {
          timestamp: "Just now",
          event: "Patient admitted to PICU/NICU. Monitoring & Isolette thermal servo initiated.",
          intervention: "Admission Intake",
          provider: "Dr. Genevieve Sterling, MD"
        }
      ]
    };

    onAdmitPatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center">
              <Baby className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white">
                Direct PICU / NICU Intake Admission
              </h2>
              <p className="text-xs text-slate-400">
                Register Pediatric Patient • Broselow PALS Dosing Setup • Isolette Climate Configuration
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intake Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Child / Neonate Full Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Bed / Isolette Assignment:</label>
              <input
                type="text"
                value={bedIsolette}
                onChange={(e) => setBedIsolette(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-pink-300 font-bold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Weight (kg):</label>
              <input
                type="number"
                step={0.01}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-pink-300 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Length (cm):</label>
              <input
                type="number"
                step={0.1}
                value={lengthCm}
                onChange={(e) => setLengthCm(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">GA Weeks:</label>
              <input
                type="number"
                step={0.1}
                value={gestationalAge}
                onChange={(e) => setGestationalAge(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Gender:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Primary Pediatric Diagnosis:</label>
            <input
              type="text"
              value={primaryDiagnosis}
              onChange={(e) => setPrimaryDiagnosis(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Pediatric Age Group:</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-pink-400 font-bold"
              >
                <option value="FULL_TERM_NEONATE_0_28D">Full-Term Neonate (0-28d)</option>
                <option value="EXTREME_PRETERM_UNDER_28W">Extreme Preterm (&lt;28w)</option>
                <option value="VERY_PRETERM_28_32W">Very Preterm (28-32w)</option>
                <option value="LATE_PRETERM_32_37W">Late Preterm (32-37w)</option>
                <option value="INFANT_1_12M">Infant (1-12m)</option>
                <option value="TODDLER_1_3Y">Toddler (1-3y)</option>
                <option value="YOUNG_CHILD_4_7Y">Young Child (4-7y)</option>
                <option value="CHILD_8_12Y">Child (8-12y)</option>
                <option value="ADOLESCENT_13_18Y">Adolescent (13-18y)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Care Unit Level:</label>
              <select
                value={careUnit}
                onChange={(e) => setCareUnit(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-bold"
              >
                <option value="NICU_LEVEL_IV_QUATERNARY">NICU Level IV Quaternary</option>
                <option value="NICU_LEVEL_III_HIGH_RISK">NICU Level III High Risk</option>
                <option value="PICU_CARDIAC_CICU">PICU Cardiac (CICU)</option>
                <option value="PICU_MEDICAL_SURGICAL">PICU Medical/Surgical</option>
                <option value="PICU_ECMO_RESUSCITATION">PICU ECMO Resuscitation</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Ventilation Mode:</label>
              <select
                value={ventMode}
                onChange={(e) => setVentMode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold"
              >
                <option value="CONVENTIONAL_PRVC_PRESSURE_REGULATED">Conventional PRVC</option>
                <option value="HFOV_HIGH_FREQUENCY_OSCILLATORY">HFOV Oscillator</option>
                <option value="BUBBLE_CPAP_NON_INVASIVE">Bubble CPAP</option>
                <option value="HIGH_FLOW_NASAL_CANNULA_HFNC">High Flow Cannula (HFNC)</option>
                <option value="SPONTANEOUS_ROOM_AIR">Spontaneous Room Air</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border-t border-slate-800 -mx-4 -mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-wider rounded-lg shadow-lg shadow-pink-950/80 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Admit to Unit & Start Telemetry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
