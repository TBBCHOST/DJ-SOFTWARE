import React, { useState, useEffect } from 'react';
import { Zap, Volume2, Sparkles, Disc, Radio, Layers } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface SamplerPad {
  key: string;
  sfxId: string;
  name: string;
  bank: 'club' | 'fx' | 'perc';
  color: string;
  glowColor: string;
}

const allPads: SamplerPad[] = [
  // Bank A - Classic Club
  { key: '1', sfxId: 'horn', name: 'AIR HORN', bank: 'club', color: 'from-amber-600 to-amber-500 border-amber-400 text-white', glowColor: 'shadow-amber-500/50 ring-amber-400' },
  { key: '2', sfxId: 'scratch', name: 'VINYL SCRATCH', bank: 'club', color: 'from-blue-600 to-blue-500 border-blue-400 text-white', glowColor: 'shadow-blue-500/50 ring-blue-400' },
  { key: '3', sfxId: 'laser', name: 'LASER DROP', bank: 'club', color: 'from-emerald-600 to-emerald-500 border-emerald-400 text-white', glowColor: 'shadow-emerald-500/50 ring-emerald-400' },
  { key: '4', sfxId: 'clap', name: 'HEAVY CLAP', bank: 'club', color: 'from-pink-600 to-pink-500 border-pink-400 text-white', glowColor: 'shadow-pink-500/50 ring-pink-400' },

  // Bank B - Sub & FX
  { key: '5', sfxId: 'siren', name: 'DUB SIREN', bank: 'fx', color: 'from-rose-600 to-rose-500 border-rose-400 text-white', glowColor: 'shadow-rose-500/50 ring-rose-400' },
  { key: '6', sfxId: 'subdrop', name: 'SUB DROP', bank: 'fx', color: 'from-purple-600 to-purple-500 border-purple-400 text-white', glowColor: 'shadow-purple-500/50 ring-purple-400' },
  { key: '7', sfxId: 'snare', name: 'SNARE ROLL', bank: 'fx', color: 'from-orange-600 to-orange-500 border-orange-400 text-white', glowColor: 'shadow-orange-500/50 ring-orange-400' },
  { key: '8', sfxId: 'rewind', name: 'REWIND TAPESTOP', bank: 'fx', color: 'from-cyan-600 to-cyan-500 border-cyan-400 text-white', glowColor: 'shadow-cyan-500/50 ring-cyan-400' },

  // Bank C - Perc & Vocal
  { key: '9', sfxId: 'rimshot', name: 'ANALOG RIM', bank: 'perc', color: 'from-teal-600 to-teal-500 border-teal-400 text-white', glowColor: 'shadow-teal-500/50 ring-teal-400' },
  { key: '0', sfxId: 'vocal_hey', name: 'VOCAL "HEY!"', bank: 'perc', color: 'from-yellow-600 to-amber-500 border-yellow-400 text-white', glowColor: 'shadow-yellow-500/50 ring-yellow-400' },
  { key: 'q', sfxId: 'cymbal', name: 'CYMBAL RISER', bank: 'perc', color: 'from-indigo-600 to-indigo-500 border-indigo-400 text-white', glowColor: 'shadow-indigo-500/50 ring-indigo-400' },
  { key: 'w', sfxId: 'glitch', name: 'GLITCH STUTTER', bank: 'perc', color: 'from-fuchsia-600 to-fuchsia-500 border-fuchsia-400 text-white', glowColor: 'shadow-fuchsia-500/50 ring-fuchsia-400' },
];

export const SamplerPads: React.FC = () => {
  const [activeBank, setActiveBank] = useState<'all' | 'club' | 'fx' | 'perc'>('all');
  const [activePadKey, setActivePadKey] = useState<string | null>(null);

  const triggerPad = (pad: SamplerPad) => {
    audioEngine.playSFX(pad.sfxId);
    setActivePadKey(pad.key);
    setTimeout(() => {
      setActivePadKey((prev) => (prev === pad.key ? null : prev));
    }, 250);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyLower = e.key.toLowerCase();
      const match = allPads.find((p) => p.key === keyLower);
      if (match) {
        triggerPad(match);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredPads = activeBank === 'all' ? allPads : allPads.filter((p) => p.bank === activeBank);

  return (
    <div className="bg-[#110508] border border-[#3a1015] rounded-none p-2 shadow-xl flex flex-col gap-1.5 text-slate-100 select-none h-full justify-between overflow-hidden">
      {/* Top Header & Bank Switcher */}
      <div className="flex items-center justify-between border-b border-[#3a1015] pb-1 gap-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-none bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Zap className="w-3 h-3 fill-amber-400" />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-100 flex items-center gap-1 font-mono leading-none">
              SAMPLER MATRIX
              <span className="text-[8px] font-mono text-amber-400 bg-amber-950 border border-amber-800 px-1 py-0.1 rounded-none">
                12 PADS
              </span>
            </h3>
          </div>
        </div>

        {/* Bank Selection Tabs */}
        <div className="flex items-center gap-1 font-mono text-[9px] font-bold">
          <button
            onClick={() => setActiveBank('all')}
            className={`px-1.5 py-0.5 rounded-none border transition ${
              activeBank === 'all'
                ? 'bg-amber-500/30 border-amber-500 text-amber-300'
                : 'bg-[#08090d] border-[#232736] text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setActiveBank('club')}
            className={`px-1.5 py-0.5 rounded-none border transition ${
              activeBank === 'club'
                ? 'bg-blue-500/30 border-blue-500 text-blue-300'
                : 'bg-[#08090d] border-[#232736] text-slate-400 hover:text-slate-200'
            }`}
          >
            CLUB
          </button>
          <button
            onClick={() => setActiveBank('fx')}
            className={`px-1.5 py-0.5 rounded-none border transition ${
              activeBank === 'fx'
                ? 'bg-rose-500/30 border-rose-500 text-rose-300'
                : 'bg-[#08090d] border-[#232736] text-slate-400 hover:text-slate-200'
            }`}
          >
            FX
          </button>
          <button
            onClick={() => setActiveBank('perc')}
            className={`px-1.5 py-0.5 rounded-none border transition ${
              activeBank === 'perc'
                ? 'bg-teal-500/30 border-teal-500 text-teal-300'
                : 'bg-[#08090d] border-[#232736] text-slate-400 hover:text-slate-200'
            }`}
          >
            PERC
          </button>
        </div>
      </div>

      {/* 12-Pad Grid Display */}
      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-1 flex-1 min-h-0 overflow-y-auto">
        {filteredPads.map((pad) => {
          const isTriggered = activePadKey === pad.key;
          return (
            <button
              key={pad.key}
              onClick={() => triggerPad(pad)}
              className={`p-1 rounded bg-gradient-to-br ${pad.color} border transition-all duration-100 shadow flex flex-col justify-between h-full min-h-[44px] active:scale-95 cursor-pointer relative overflow-hidden group ${
                isTriggered ? `ring-2 scale-105 ${pad.glowColor} brightness-125` : 'hover:brightness-110'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[8px] font-mono font-black bg-black/50 px-1 py-0.1 rounded text-slate-200 tracking-wider">
                  [{pad.key.toUpperCase()}]
                </span>
                <span className="text-[7px] font-mono uppercase text-white/70 tracking-widest hidden sm:inline">
                  {pad.bank}
                </span>
              </div>

              <span className="text-[9px] font-black tracking-wide uppercase drop-shadow text-left leading-tight line-clamp-1">
                {pad.name}
              </span>

              {/* Instant Trigger Ripple Overlay */}
              {isTriggered && (
                <div className="absolute inset-0 bg-white/30 animate-ping pointer-events-none rounded" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
