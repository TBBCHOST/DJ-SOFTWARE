import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Cpu,
  Activity,
  Sliders,
  Volume2,
  ShieldCheck,
  Zap,
  Radio,
  Clock,
  BatteryCharging,
  Maximize2,
  Monitor
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface DesktopStatusBarProps {
  onOpenSettings: () => void;
  onOpenDesktopModal: () => void;
  isAudioUnlocked: boolean;
}

export const DesktopStatusBar: React.FC<DesktopStatusBarProps> = ({
  onOpenSettings,
  onOpenDesktopModal,
  isAudioUnlocked,
}) => {
  const [driver, setDriver] = useState('ASIO v2.0 (Low Latency)');
  const [sampleRate, setSampleRate] = useState('48,000 Hz');
  const [bufferSize, setBufferSize] = useState('256 samples (5.3ms)');
  const [battery, setBattery] = useState('100% [AC POWER]');

  return (
    <footer className="bg-[#050203] border-t border-[#2b0c11] px-2 py-1 flex items-center justify-between text-[9px] font-mono text-slate-400 select-none shrink-0 w-full">
      {/* Left: Audio Hardware Engine Status */}
      <div className="flex items-center gap-3">
        {/* Hardware Audio Driver Badge */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1 bg-[#120507] hover:bg-[#1d090d] text-amber-300 border border-[#300c11] px-1.5 py-0.5 rounded cursor-pointer transition"
          title="Click to Configure Audio Driver & Hardware Output Routing"
        >
          <Zap className="w-2.5 h-2.5 text-amber-400" />
          <span className="text-slate-500">DRIVER:</span>
          <span className="font-bold">{driver}</span>
        </button>

        {/* Sample Rate */}
        <div className="hidden sm:flex items-center gap-1 bg-[#120507] text-slate-300 border border-[#2b0c11] px-1.5 py-0.5 rounded">
          <Activity className="w-2.5 h-2.5 text-cyan-400" />
          <span className="text-slate-500">SR:</span>
          <span className="font-bold text-cyan-300">{sampleRate}</span>
        </div>

        {/* Buffer Size & Latency */}
        <div className="hidden md:flex items-center gap-1 bg-[#120507] text-slate-300 border border-[#2b0c11] px-1.5 py-0.5 rounded">
          <Sliders className="w-2.5 h-2.5 text-emerald-400" />
          <span className="text-slate-500">BUF:</span>
          <span className="font-bold text-emerald-300">{bufferSize}</span>
        </div>

        {/* Master Output Routing Channels */}
        <div className="hidden lg:flex items-center gap-1 bg-[#120507] text-slate-300 border border-[#2b0c11] px-1.5 py-0.5 rounded">
          <Volume2 className="w-2.5 h-2.5 text-orange-400" />
          <span className="text-slate-500">OUT:</span>
          <span className="font-bold text-orange-300">MASTER [1/2] | CUE [3/4]</span>
        </div>
      </div>

      {/* Center: System Status Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-slate-300">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span className="font-extrabold text-emerald-400 uppercase tracking-widest text-[8px]">
            DESKTOP ENGINE READY
          </span>
        </div>
      </div>

      {/* Right: Power & Desktop Launcher Quick Access */}
      <div className="flex items-center gap-3">
        {/* Power Status */}
        <div className="hidden sm:flex items-center gap-1 bg-[#120507] text-slate-400 border border-[#2b0c11] px-1.5 py-0.5 rounded">
          <BatteryCharging className="w-2.5 h-2.5 text-emerald-400" />
          <span className="font-bold text-slate-300">{battery}</span>
        </div>

        {/* Desktop EXE Launcher Modal trigger */}
        <button
          onClick={onOpenDesktopModal}
          className="flex items-center gap-1 bg-gradient-to-r from-red-950 to-amber-950 hover:from-red-900 hover:to-amber-900 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded font-extrabold cursor-pointer transition shadow"
          title="Download Desktop App Installer / EXE Script"
        >
          <Monitor className="w-2.5 h-2.5 text-amber-400" />
          <span>STANDALONE MODE</span>
        </button>
      </div>
    </footer>
  );
};
