import React, { useEffect, useState, useRef } from 'react';
import { Volume2, Sliders, VolumeX, Headphones, Settings } from 'lucide-react';
import { DeckState, MixerState, CrossfaderCurve, DeckId, CrossfaderAssign } from '../types';
import { audioEngine, ALL_DECKS } from '../utils/audioEngine';
import { Knob } from './Knob';
import { FrequencyVisualizer } from './FrequencyVisualizer';

interface MixerBoardProps {
  deckStates: Record<DeckId, DeckState>;
  mixerState: MixerState;
  activeDeckCount?: 2 | 4 | 6 | 8;
}

const DECK_COLORS: Record<DeckId, string> = {
  A: '#3b82f6',
  B: '#ec4899',
  C: '#10b981',
  D: '#f59e0b',
  E: '#8b5cf6',
  F: '#06b6d4',
  G: '#ef4444',
  H: '#84cc16',
};

export const MixerChannelStrip: React.FC<{ deckId: DeckId; deckState: DeckState; isCompact?: boolean }> = ({
  deckId,
  deckState,
  isCompact = false,
}) => {
  const [level, setLevel] = useState(0);
  const color = DECK_COLORS[deckId] || '#3b82f6';

  useEffect(() => {
    let animId: number;
    const update = () => {
      setLevel(audioEngine.getLevelData(deckId).peak);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [deckId]);

  return (
    <div
      className={`flex flex-col items-center justify-between bg-[#08090d] rounded-none border border-[#232736] shrink-0 select-none shadow-xl h-full ${
        isCompact ? 'w-20 p-0.5 gap-0.5 text-[8px]' : 'w-24 p-0.5 gap-0.5 text-[9px]'
      }`}
      style={{ borderColor: `${color}50` }}
    >
      {/* Deck Title */}
      <div
        className="w-full text-center py-0.5 font-mono font-black text-[8px] text-white uppercase tracking-wider shadow rounded-none"
        style={{ backgroundColor: color }}
      >
        DECK {deckId}
      </div>

      {/* Trim Knob */}
      <Knob
        label="TRIM"
        value={deckState.gain}
        min={0}
        max={2}
        step={0.05}
        defaultValue={1.0}
        color={color}
        onChange={(v) => audioEngine.setDeckTrim(deckId, v)}
        size={isCompact ? 18 : 22}
      />

      {/* 3-Band EQ */}
      <div className="flex flex-col items-center gap-1 my-0">
        <Knob
          label="HIGH"
          value={deckState.eqHigh}
          min={-24}
          max={12}
          unit="dB"
          defaultValue={0}
          color={color}
          onChange={(v) => audioEngine.setEq(deckId, 'high', v)}
          size={isCompact ? 16 : 18}
        />
        <Knob
          label="MID"
          value={deckState.eqMid}
          min={-24}
          max={12}
          unit="dB"
          defaultValue={0}
          color={color}
          onChange={(v) => audioEngine.setEq(deckId, 'mid', v)}
          size={isCompact ? 16 : 18}
        />
        <Knob
          label="BASS"
          value={deckState.eqLow}
          min={-24}
          max={12}
          unit="dB"
          defaultValue={0}
          color={color}
          onChange={(v) => audioEngine.setEq(deckId, 'low', v)}
          size={isCompact ? 16 : 18}
        />
      </div>

      {/* Filter Sweep Knob */}
      <Knob
        label="FILTER"
        value={deckState.filterCutoff}
        min={-1}
        max={1}
        step={0.05}
        defaultValue={0}
        color="#f59e0b"
        onChange={(v) => audioEngine.setFilterCutoff(deckId, v)}
        size={isCompact ? 14 : 16}
      />

      {/* FX Echo Button */}
      <div className="flex gap-0.5 w-full justify-center">
        <button
          onClick={() => audioEngine.toggleEchoFx(deckId)}
          className={`px-1 py-0.2 rounded text-[7px] font-bold font-mono transition border cursor-pointer ${
            deckState.fxEcho
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          ECHO FX
        </button>
      </div>

      {/* Crossfader Assign Toggle */}
      <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded border border-slate-800 w-full justify-center">
        {(['left', 'thru', 'right'] as CrossfaderAssign[]).map((assign) => (
          <button
            key={assign}
            onClick={() => audioEngine.setCrossfaderAssign(deckId, assign)}
            className={`px-0.5 py-0.2 text-[6px] font-mono font-bold rounded cursor-pointer ${
              deckState.crossfaderAssign === assign
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {assign === 'left' ? 'L' : assign === 'right' ? 'R' : 'THRU'}
          </button>
        ))}
      </div>

      {/* Meter & Channel Volume Fader */}
      <div className={`flex items-center gap-0.5 my-0.5 ${isCompact ? 'h-8' : 'h-10'}`}>
        {/* Channel LED Meter */}
        <div className="w-1.5 h-full bg-slate-900 rounded-full p-0.5 flex flex-col-reverse overflow-hidden border border-slate-800">
          <div
            className="w-full rounded-full transition-all duration-75"
            style={{
              height: `${Math.min(100, level * 120)}%`,
              backgroundColor: level > 0.8 ? '#ef4444' : level > 0.5 ? '#f59e0b' : color,
            }}
          />
        </div>

        {/* Vertical Volume Fader */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={deckState.volume}
          onChange={(e) => audioEngine.setDeckVolume(deckId, parseFloat(e.target.value))}
          className={`accent-blue-500 cursor-pointer origin-center -rotate-90 appearance-none bg-slate-800 rounded ${
            isCompact ? 'w-8 h-1' : 'w-10 h-1.5'
          }`}
        />
      </div>

      <span className="text-[8px] font-mono text-slate-400 font-bold">
        {Math.round(deckState.volume * 100)}%
      </span>
    </div>
  );
};

export const StilDJCenterMixer: React.FC<{
  mixerState: MixerState;
  onOpenBroadcast?: () => void;
  isCompact?: boolean;
}> = ({ mixerState, onOpenBroadcast, isCompact = false }) => {
  const [masterLevel, setMasterLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const leverTrackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animId: number;
    const update = () => {
      setMasterLevel(audioEngine.getLevelData().peak);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateVolumeFromPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1 && leverTrackRef.current) {
      updateVolumeFromPointer(e.clientY);
    }
  };

  const updateVolumeFromPointer = (clientY: number) => {
    if (!leverTrackRef.current) return;
    const rect = leverTrackRef.current.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const pct = 1 - Math.max(0, Math.min(1, offsetY / rect.height));
    audioEngine.setMasterVolume(Math.round(pct * 100) / 100);
  };

  const dbVal = mixerState.masterVolume > 0
    ? (20 * Math.log10(mixerState.masterVolume)).toFixed(1)
    : '-∞';

  return (
    <div className={`bg-[#141620] border border-[#2a2e40] rounded-none flex flex-col justify-between select-none shadow-2xl font-sans text-slate-200 shrink-0 h-full ${
      isCompact ? 'p-1 w-[180px] sm:w-[195px]' : 'p-1.5 w-[200px] sm:w-[225px]'
    }`}>
      {/* Top Console Plate & Status LED Bar */}
      <div className="bg-[#0a0c10] border border-[#232736] p-1 flex flex-col gap-1 rounded-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-glow animate-pulse"></span>
            <span className="text-[9px] font-mono font-black text-cyan-300 uppercase tracking-widest">
              MASTER LEVER BAR
            </span>
          </div>
          <span className="text-[7px] font-mono font-bold text-slate-400 bg-[#161924] px-1 py-0.2 border border-[#2a2e40]">
            MAIN BUS
          </span>
        </div>

        <div className="grid grid-cols-4 gap-0.5 text-[6px] font-mono font-extrabold text-center pt-0.5 border-t border-[#1e2230]">
          <div className="flex flex-col items-center">
            <span className="w-1 h-1 rounded-full bg-emerald-400 mb-0.5"></span>
            <span className="text-slate-300">PWR</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="w-1 h-1 rounded-full bg-cyan-400 mb-0.5"></span>
            <span className="text-slate-300">LIMIT</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`w-1 h-1 rounded-full mb-0.5 ${masterLevel > 0.9 ? 'bg-rose-500 animate-ping' : 'bg-slate-700'}`}></span>
            <span className={masterLevel > 0.9 ? 'text-rose-400' : 'text-slate-500'}>CLIP</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`w-1 h-1 rounded-full mb-0.5 ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-700'}`}></span>
            <span className={isRecording ? 'text-rose-400' : 'text-slate-500'}>REC</span>
          </div>
        </div>
      </div>

      {/* Real-time Web Audio Spectrum Visualizer */}
      <div className="my-1">
        <FrequencyVisualizer height={isCompact ? 55 : 70} isCompact={isCompact} />
      </div>

      {/* Main Full-Size Master Lever Bar Console */}
      <div className="flex-1 bg-[#080a0f] border border-[#202332] p-1.5 my-1 flex justify-between items-center gap-1.5 relative overflow-hidden shadow-inner">
        {/* Left Channel Stereo VU Meter */}
        <div className="flex flex-col items-center justify-between h-full font-mono text-[6px] text-slate-500 shrink-0">
          <span>+6</span>
          <span>+3</span>
          <span>0</span>
          <span>-3</span>
          <span>-6</span>
          <span>-12</span>
          <span>-24</span>
          <span>-∞</span>
        </div>

        <div className="w-1.5 h-full bg-[#040507] border border-[#181c28] p-0.5 flex flex-col justify-between items-center rounded-none shrink-0">
          {[...Array(12)].map((_, i) => {
            const idx = 11 - i;
            const threshold = idx / 12;
            const isActive = masterLevel >= threshold;
            const isRed = idx >= 10;
            const isYellow = idx >= 7 && idx < 10;
            return (
              <span
                key={i}
                className={`w-full h-1 rounded-none transition-colors duration-75 ${
                  isActive
                    ? isRed
                      ? 'bg-rose-500 shadow-glow'
                      : isYellow
                      ? 'bg-amber-400'
                      : 'bg-cyan-400 shadow-glow'
                    : 'bg-[#121520]'
                }`}
              />
            );
          })}
        </div>

        {/* Center Master Lever Bar Slider Track */}
        <div
          ref={leverTrackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="flex-1 h-full bg-[#050608] border-2 border-[#1c202e] rounded-sm relative flex items-center justify-center cursor-pointer shadow-inner touch-none group hover:border-cyan-500/60 transition-colors"
        >
          {/* Vertical Metallic Track Slot Line */}
          <div className="w-2.5 h-full bg-[#020204] border-x border-[#1a1d29] flex flex-col justify-between items-center py-1">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1.5 h-px bg-[#202534]"></div>
            ))}
          </div>

          {/* Master Lever Handle Bar */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-14 sm:w-16 h-7 bg-gradient-to-b from-[#2a2f42] via-[#1a1e2b] to-[#0d0f17] border-2 border-[#3d445e] rounded shadow-2xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:border-cyan-400 transition-all"
            style={{
              bottom: `calc(${mixerState.masterVolume * 100}% - 14px)`,
            }}
          >
            {/* Lever Grip Grooves & Glowing Center Marker */}
            <div className="w-full h-1.5 bg-[#08090e] border-y border-[#32384e] flex justify-center items-center">
              <div className="w-8 h-1 bg-cyan-400 shadow-glow rounded-full"></div>
            </div>
            <div className="flex gap-1 mt-0.5">
              <div className="w-1 h-2 bg-[#2d3346] rounded-full"></div>
              <div className="w-1 h-2 bg-[#2d3346] rounded-full"></div>
              <div className="w-1 h-2 bg-[#2d3346] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Channel Stereo VU Meter */}
        <div className="w-1.5 h-full bg-[#040507] border border-[#181c28] p-0.5 flex flex-col justify-between items-center rounded-none shrink-0">
          {[...Array(12)].map((_, i) => {
            const idx = 11 - i;
            const threshold = idx / 12;
            const isActive = masterLevel >= threshold;
            const isRed = idx >= 10;
            const isYellow = idx >= 7 && idx < 10;
            return (
              <span
                key={i}
                className={`w-full h-1 rounded-none transition-colors duration-75 ${
                  isActive
                    ? isRed
                      ? 'bg-rose-500 shadow-glow'
                      : isYellow
                      ? 'bg-amber-400'
                      : 'bg-cyan-400 shadow-glow'
                    : 'bg-[#121520]'
                }`}
              />
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-between h-full font-mono text-[6px] text-slate-500 shrink-0">
          <span>+6</span>
          <span>+3</span>
          <span>0</span>
          <span>-3</span>
          <span>-6</span>
          <span>-12</span>
          <span>-24</span>
          <span>-∞</span>
        </div>
      </div>

      {/* Digital Level & Quick Action Controls */}
      <div className="bg-[#0a0c10] border border-[#232736] p-1 flex items-center justify-between font-mono text-[8px]">
        <div className="flex flex-col">
          <span className="text-slate-400 text-[6px] font-bold">MASTER GAIN</span>
          <span className="text-cyan-400 font-black">
            {Math.round(mixerState.masterVolume * 100)}% ({dbVal} dB)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`px-1.5 py-0.5 text-[7px] font-black uppercase border transition cursor-pointer ${
              isRecording ? 'bg-rose-600 text-white border-rose-400 animate-pulse' : 'bg-[#181a24] text-slate-300 border-[#2a2d3d]'
            }`}
          >
            {isRecording ? 'REC' : 'REC'}
          </button>
          {onOpenBroadcast && (
            <button
              onClick={onOpenBroadcast}
              className="px-1.5 py-0.5 text-[7px] font-black uppercase bg-[#181a24] text-pink-400 border border-[#2a2d3d] hover:bg-[#222634] cursor-pointer"
            >
              LIVE
            </button>
          )}
        </div>
      </div>

      {/* Bottom Crossfader Slider */}
      <div className="mt-1 bg-[#0d0f15] border border-[#232736] p-1 flex flex-col items-center gap-0.5">
        <div className="flex justify-between w-full text-[6px] font-mono font-bold text-slate-400 px-0.5">
          <span className="text-blue-400">BUS L</span>
          <span className="text-slate-400">CENTER</span>
          <span className="text-pink-400">BUS R</span>
        </div>
        <div className="relative w-full h-3.5 bg-[#06070a] border border-[#1d212e] p-0.5 flex items-center">
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={mixerState.crossfader}
            onChange={(e) => audioEngine.setCrossfader(parseFloat(e.target.value))}
            className="w-full h-1.5 accent-cyan-400 cursor-pointer appearance-none bg-[#1a1e2b] rounded-none"
          />
        </div>
      </div>
    </div>
  );
};

export const MasterMixerControls: React.FC<{ mixerState: MixerState }> = ({ mixerState }) => {
  const [masterLevel, setMasterLevel] = useState(0);

  useEffect(() => {
    let animId: number;
    const update = () => {
      setMasterLevel(audioEngine.getLevelData().peak);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="bg-[#11131a] border border-[#232736] p-1 rounded-none shadow-xl flex flex-col gap-1 w-full select-none font-sans justify-between">
      <div className="flex items-center justify-between gap-1 border-b border-[#232736] pb-0.5">
        {/* Master Volume Knob & Meter */}
        <div className="flex items-center gap-1.5">
          <Knob
            label="MASTER"
            value={mixerState.masterVolume}
            min={0}
            max={1}
            step={0.01}
            defaultValue={0.85}
            color="#10b981"
            onChange={(v) => audioEngine.setMasterVolume(v)}
            size={22}
          />

          <div className="flex flex-col gap-0.5">
            <span className="text-[7px] font-mono font-extrabold text-slate-300 uppercase tracking-wider">
              MASTER LEVEL
            </span>
            <div className="w-20 h-1.5 bg-[#08090d] rounded-none p-0.5 overflow-hidden border border-[#232736]">
              <div
                className="h-full transition-all duration-75"
                style={{
                  width: `${Math.min(100, masterLevel * 120)}%`,
                  backgroundColor:
                    masterLevel > 0.85 ? '#ef4444' : masterLevel > 0.5 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
          </div>
        </div>

        {/* Crossfader Curve Selector */}
        <div className="flex items-center gap-0.5 bg-[#08090d] p-0.5 rounded-none border border-[#232736]">
          <span className="text-[7px] font-mono font-bold text-slate-400 uppercase px-0.5">Curve:</span>
          {(['smooth', 'linear', 'cut'] as CrossfaderCurve[]).map((curve) => (
            <button
              key={curve}
              onClick={() => audioEngine.setCrossfaderCurve(curve)}
              className={`px-1 py-0.2 rounded-none text-[7px] font-mono uppercase font-extrabold transition border ${
                mixerState.crossfaderCurve === curve
                  ? 'bg-blue-600 text-white border-blue-400 shadow'
                  : 'bg-[#161822] text-slate-400 border-[#2a2d3d] hover:text-slate-200'
              }`}
            >
              {curve}
            </button>
          ))}
        </div>
      </div>

      {/* Master Crossfader */}
      <div className="flex flex-col items-center gap-0.5 w-full pt-0.5">
        <div className="flex justify-between w-full text-[7px] font-mono text-slate-400 font-black px-0.5">
          <span className="text-blue-400">BUS L</span>
          <span className="text-slate-400">CENTER</span>
          <span className="text-pink-400">BUS R</span>
        </div>

        <div className="relative w-full h-4 bg-[#08090d] rounded-none p-0.5 border border-[#232736] flex items-center">
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={mixerState.crossfader}
            onChange={(e) => audioEngine.setCrossfader(parseFloat(e.target.value))}
            className="w-full h-1.5 accent-purple-500 cursor-pointer appearance-none bg-[#1c1f2c] rounded-none"
          />
        </div>
      </div>
    </div>
  );
};

export const MixerBoard: React.FC<MixerBoardProps> = ({
  deckStates,
  mixerState,
  activeDeckCount = 8,
}) => {
  const activeDecks = ALL_DECKS.slice(0, activeDeckCount);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-2xl flex flex-col justify-between w-full select-none gap-4">
      {/* Mixer Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
        <Sliders className="w-5 h-5 text-blue-400" />
        <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
          {activeDeckCount}-Channel DJ Mixer Matrix
        </h2>
      </div>

      {/* Channel Strips Grid */}
      <div className="overflow-x-auto pb-2 flex justify-center">
        <div className="flex gap-3 min-w-max mx-auto justify-center">
          {activeDecks.map((d) => (
            <MixerChannelStrip key={d} deckId={d} deckState={deckStates[d]} />
          ))}
        </div>
      </div>

      {/* Master Section */}
      <MasterMixerControls mixerState={mixerState} />
    </div>
  );
};
