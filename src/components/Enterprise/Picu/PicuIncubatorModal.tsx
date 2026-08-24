import React, { useState } from "react";
import { X, Sliders, Sun, ShieldCheck, Activity, Baby } from "lucide-react";

interface PicuIncubatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PicuIncubatorModal: React.FC<PicuIncubatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [skinTarget, setSkinTarget] = useState<number>(36.8);
  const [humidityTarget, setHumidityTarget] = useState<number>(75);
  const [phototherapyActive, setPhototherapyActive] = useState<boolean>(true);
  const [noiseAlarmDba, setNoiseAlarmDba] = useState<number>(45);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white">
                Neonatal Isolette & Incubator Micro-Climate Controller
              </h2>
              <p className="text-xs text-slate-400">
                Servo Skin Temperature Control • Chamber Humidity Humidification • 360° LED Phototherapy • Acoustic Monitoring
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Target Action Banner */}
          <div className="p-3.5 rounded-xl font-bold flex items-center gap-3 shadow-md bg-cyan-950/80 border border-cyan-600 text-cyan-200">
            <ShieldCheck className="w-5 h-5 shrink-0 text-cyan-400" />
            <div>
              <div className="text-xs uppercase font-black tracking-wide">Neuro-Developmental Micro-Environment: ACTIVE</div>
              <div className="text-xs font-mono mt-0.5">
                Chamber humidity at {humidityTarget}% to prevent insensible transepidermal water loss in extreme prematurity (&lt; 28 weeks).
              </div>
            </div>
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="font-mono text-xs font-bold uppercase text-cyan-400">
              Isolette Servo Climate Controls
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
              {/* Skin Servo Temperature */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Servo Skin Target Temp:</span>
                  <span className="font-bold text-pink-300">{skinTarget}°C (Ref: 36.5 - 37.5°C)</span>
                </div>
                <input
                  type="range"
                  min={35.5}
                  max={37.8}
                  step={0.1}
                  value={skinTarget}
                  onChange={(e) => setSkinTarget(Number(e.target.value))}
                  className="w-full accent-pink-400"
                />
              </div>

              {/* Chamber Humidity */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Chamber Humidity:</span>
                  <span className="font-bold text-cyan-300">{humidityTarget}% (Target: 60 - 85%)</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={90}
                  step={5}
                  value={humidityTarget}
                  onChange={(e) => setHumidityTarget(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Ambient Noise Threshold */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Acoustic Noise Limit:</span>
                  <span className="font-bold text-emerald-400">{noiseAlarmDba} dBA (AAP Limit &lt; 45)</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={60}
                  step={1}
                  value={noiseAlarmDba}
                  onChange={(e) => setNoiseAlarmDba(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              {/* 360 Phototherapy Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-slate-300 font-bold block">360° LED Phototherapy</span>
                  <span className="text-slate-500 text-[10px]">High-irradiance blue light (460-490 nm)</span>
                </div>
                <button
                  onClick={() => setPhototherapyActive(!phototherapyActive)}
                  className={"px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition " + (phototherapyActive ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400")}
                >
                  {phototherapyActive ? "ACTIVE" : "STANDBY"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>AAP Guidelines for Environmental Management of High-Risk Preterms</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-bold cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
