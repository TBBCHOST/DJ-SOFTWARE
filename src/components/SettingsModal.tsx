import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Sliders,
  Disc,
  Volume2,
  Zap,
  Activity,
  LayoutGrid,
  SlidersHorizontal,
  Layers,
  Radio,
  Sparkles,
  Check,
  RotateCcw,
  Circle,
  Square,
  Download,
  Copy,
  Wifi,
  Send,
  Server,
  Play,
  Clock,
  Music,
  HelpCircle,
  Keyboard,
  BookOpen,
} from 'lucide-react';
import { audioEngine, ALL_DECKS } from '../utils/audioEngine';
import { broadcastEngine } from '../utils/broadcastEngine';
import { DeckId, BroadcastConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDeckCount: 2 | 4 | 6 | 8;
  onSelectDeckCount: (count: 2 | 4 | 6 | 8) => void;
  deckLayout: 'grid' | 'focus' | 'split';
  onSelectDeckLayout: (layout: 'grid' | 'focus' | 'split') => void;
  focusDeckA: DeckId;
  onSelectFocusDeckA: (deck: DeckId) => void;
  focusDeckB: DeckId;
  onSelectFocusDeckB: (deck: DeckId) => void;
  isAudioUnlocked: boolean;
  onUnlockAudio: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeDeckCount,
  onSelectDeckCount,
  deckLayout,
  onSelectDeckLayout,
  focusDeckA,
  onSelectFocusDeckA,
  focusDeckB,
  onSelectFocusDeckB,
  isAudioUnlocked,
  onUnlockAudio,
}) => {
  const [activeTab, setActiveTab] = useState<'readme' | 'decks' | 'mixer' | 'broadcast' | 'record' | 'audio' | 'help'>('readme');
  
  // Mixer State
  const [masterVol, setMasterVol] = useState(audioEngine.mixerState.masterVolume);
  const [crossfader, setCrossfader] = useState(audioEngine.mixerState.crossfader);
  const [pitchRange, setPitchRange] = useState<'8' | '16' | '50'>('16');
  const [crossfaderCurve, setCrossfaderCurve] = useState<'smooth' | 'scratch' | 'linear'>('smooth');
  const [eqMode, setEqMode] = useState<'3band' | '4band'>('3band');
  const [eqCrossoverLow, setEqCrossoverLow] = useState(250);
  const [eqCrossoverHigh, setEqCrossoverHigh] = useState(2500);
  const [headroom, setHeadroom] = useState<'-0' | '-3' | '-6'>('-3');
  const [limiterThreshold, setLimiterThreshold] = useState<'-0.1' | '-1.0' | '-3.0'>('-1.0');
  const [bufferSize, setBufferSize] = useState<'128' | '256' | '512'>('256');

  // Broadcast Engine State
  const [bConfig, setBConfig] = useState<BroadcastConfig>(broadcastEngine.config);
  const [bStatus, setBStatus] = useState(broadcastEngine.status);
  const [icyTitleInput, setIcyTitleInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(audioEngine.isRecording);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recFilename, setRecFilename] = useState('My_Studio_DJ_Mix.webm');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Subscribe to Broadcast Engine & Audio Engine updates
  useEffect(() => {
    const unsubB = broadcastEngine.subscribe(() => {
      setBStatus({ ...broadcastEngine.status });
      setBConfig({ ...broadcastEngine.config });
    });
    const unsubA = audioEngine.subscribe(() => {
      setIsRecording(audioEngine.isRecording);
    });
    return () => {
      unsubB();
      unsubA();
    };
  }, []);

  // Recording Timer loop
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  if (!isOpen) return null;

  const handleMasterVolChange = (v: number) => {
    setMasterVol(v);
    audioEngine.setMasterVolume(v);
  };

  const handleCrossfaderChange = (v: number) => {
    setCrossfader(v);
    audioEngine.setCrossfader(v);
  };

  const handleBConfigChange = (field: keyof BroadcastConfig, value: any) => {
    const updated = { ...bConfig, [field]: value };
    setBConfig(updated);
    broadcastEngine.saveConfig({ [field]: value });
  };

  const handleStartBroadcast = async () => {
    if (!isAudioUnlocked) {
      await onUnlockAudio();
    }
    const destination = audioEngine.getStreamDestination();
    await broadcastEngine.startBroadcast(destination);
  };

  const handleStopBroadcast = () => {
    broadcastEngine.stopBroadcast();
  };

  const handleSendIcyTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (icyTitleInput.trim()) {
      broadcastEngine.sendIcyMetadata(icyTitleInput);
      setIcyTitleInput('');
    }
  };

  const handleToggleRecord = async () => {
    if (!isAudioUnlocked) {
      await onUnlockAudio();
    }
    if (isRecording) {
      audioEngine.stopRecordingAndDownload(recFilename.trim() || 'My_Studio_DJ_Mix.webm');
    } else {
      audioEngine.startRecording();
    }
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  };

  const activeDecksList = ALL_DECKS.slice(0, activeDeckCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-100 select-none">
        {/* Header Modal Bar */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Studio Options & Hardware Configuration
              </h2>
              <p className="text-xs text-slate-400">
                Configure decks, mixer routing, Shoutcast broadcast streams, and live mix recordings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-3 pt-2 gap-1.5 text-xs font-bold font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('readme')}
            className={`px-3.5 py-2.5 rounded-t-xl border-t border-x transition flex items-center gap-2 shrink-0 ${
              activeTab === 'readme'
                ? 'bg-slate-900 border-slate-800 text-amber-400 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" /> Setup README
          </button>

          <button
            onClick={() => setActiveTab('decks')}
            className={`px-3.5 py-2.5 rounded-t-xl border-t border-x transition flex items-center gap-2 shrink-0 ${
              activeTab === 'decks'
                ? 'bg-slate-900 border-slate-800 text-blue-400 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-4 h-4" /> Decks & Layout
          </button>

          <button
            onClick={() => setActiveTab('mixer')}
            className={`px-3.5 py-2.5 rounded-t-xl border-t border-x transition flex items-center gap-2 shrink-0 ${
              activeTab === 'mixer'
                ? 'bg-slate-900 border-slate-800 text-blue-400 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" /> Mixer & EQ
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3.5 py-2.5 rounded-t-xl border-t border-x transition flex items-center gap-2 shrink-0 ${
              activeTab === 'broadcast'
                ? 'bg-slate-900 border-slate-800 text-rose-400 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-400" /> Live Broadcast
            {bStatus.isBroadcasting && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('record')}
            className={`px-3.5 py-2.5 rounded-t-xl border-t border-x transition flex items-center gap-2 shrink-0 ${
              activeTab === 'record'
                ? 'bg-slate-900 border-slate-800 text-red-400 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Circle className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Record Set
            {isRecording && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`px-3.5 py-2.5 rounded-t-xl border-t border-x transition flex items-center gap-2 shrink-0 ${
              activeTab === 'audio'
                ? 'bg-slate-900 border-slate-800 text-emerald-400 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Audio Engine
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className={`px-3.5 py-2.5 rounded-t-xl border-t border-x transition flex items-center gap-2 shrink-0 ${
              activeTab === 'help'
                ? 'bg-slate-900 border-slate-800 text-amber-400 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" /> Help & Pro Tips
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 0: SETUP README & GUIDE */}
          {activeTab === 'readme' && (
            <div className="space-y-6">
              {/* Header Welcome Banner */}
              <div className="bg-gradient-to-r from-[#1c080d] via-[#2a0c12] to-[#120407] p-5 rounded-2xl border border-[#4a131b] shadow-xl flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
                    <BookOpen className="w-7 h-7" />
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                      STIL DJ STUDIO PRO Workstation — Setup & Operating Manual
                    </h3>
                    <p className="text-xs text-rose-200">
                      Welcome to your multi-deck virtual DJ system! Follow this guide for quick hardware setup, deck routing, and advanced mixing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 1 to 5 Quickstart */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> 5-Step Rapid Studio Setup
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-mono font-black text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      STEP 1
                    </span>
                    <h5 className="font-bold text-white mt-1">Unlock Web Audio Engine</h5>
                    <p className="text-slate-400 leading-relaxed">
                      Click <strong className="text-amber-300">"START ENGINE"</strong> or hit PLAY on any deck. Modern web browsers require a user gesture to initialize high-fidelity audio streams.
                    </p>
                  </div>

                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-mono font-black text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                      STEP 2
                    </span>
                    <h5 className="font-bold text-white mt-1">Load Tracks on Decks</h5>
                    <p className="text-slate-400 leading-relaxed">
                      Use the track selector dropdown on any deck, search tracks with the <strong className="text-amber-300">SEARCH button 🔍</strong>, or drag & drop MP3/WAV/FLAC files directly onto any vinyl platter from your desktop!
                    </p>
                  </div>

                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-mono font-black text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                      STEP 3
                    </span>
                    <h5 className="font-bold text-white mt-1">Select Active Decks & View</h5>
                    <p className="text-slate-400 leading-relaxed">
                      Switch between <strong className="text-blue-300">2, 4, 6, or 8 active decks</strong> in the Decks & Layout tab. Choose Full Grid view, Split Banks, or Focus Pair dual turntable view.
                    </p>
                  </div>

                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-mono font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      STEP 4
                    </span>
                    <h5 className="font-bold text-white mt-1">Beatmatching & Auto-Sync</h5>
                    <p className="text-slate-400 leading-relaxed">
                      Press <strong className="text-emerald-300">SYNC</strong> on target decks to automatically lock tempo and phase with the master track. Pitch sliders allow manual ±8%, ±16%, or ±50% adjustment.
                    </p>
                  </div>

                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1 md:col-span-2">
                    <span className="font-mono font-black text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                      STEP 5
                    </span>
                    <h5 className="font-bold text-white mt-1">Perform & Record Your Set</h5>
                    <p className="text-slate-400 leading-relaxed">
                      Utilize 3-Band EQ frequency kills, low-pass/high-pass filter sweeps, beat loopers (1/16B to 8B), hot cues, and 12-pad sampler SFX. Click <strong className="text-red-400">Record Set</strong> to save your mix to WebM/WAV!
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Technical Features Overview */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4" /> Workstation Audio Architecture
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <Disc className="w-4 h-4 text-amber-400" /> Turntable Scratch Engine
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Real-time pitch-bending algorithm with zero-latency buffer scratching. Click and drag the vinyl center platter to scratch smoothly like real direct-drive vinyl!
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-rose-400" /> Master & Deck Waveforms
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Dual-deck scrolling waveform banner and per-deck interactive canvas. Click anywhere on waveforms for instant needle search!
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-emerald-400" /> Shoutcast / Icecast Streaming
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Connect to Icecast2/Shoutcast2 radio servers. Stream live audio with real-time ICY "Now Playing" metadata updates for listeners.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DECKS & LAYOUT */}
          {activeTab === 'decks' && (
            <div className="space-y-6">
              {/* Active Deck Count Option (2, 4, 6, 8) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block">
                    Active Decks Count
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-400">
                    Currently Selected: {activeDeckCount} Decks
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Select how many active turntables to load into the studio workstation:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {([2, 4, 6, 8] as const).map((count) => (
                    <button
                      key={count}
                      onClick={() => onSelectDeckCount(count)}
                      className={`p-3 rounded-xl border font-mono text-center transition flex flex-col items-center gap-1 active:scale-95 ${
                        activeDeckCount === count
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-lg font-black">{count} DECKS</span>
                      <span className="text-[10px] text-slate-400">
                        {count === 2 ? 'Classic Setup' : count === 4 ? 'Standard Club' : count === 6 ? 'Pro Hex' : '8-Deck Studio'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workstation View Layout */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block">
                  Workstation Layout View
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => onSelectDeckLayout('grid')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      deckLayout === 'grid'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Full Grid View</h4>
                      <p className="text-[10px] text-slate-400">All active decks side by side</p>
                    </div>
                  </button>

                  <button
                    onClick={() => onSelectDeckLayout('split')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      deckLayout === 'split'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <SlidersHorizontal className="w-5 h-5 text-purple-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Split Deck Banks</h4>
                      <p className="text-[10px] text-slate-400">Bank 1 vs Bank 2 stacked</p>
                    </div>
                  </button>

                  <button
                    onClick={() => onSelectDeckLayout('focus')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      deckLayout === 'focus'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Disc className="w-5 h-5 text-pink-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Focus Pair Mode</h4>
                      <p className="text-[10px] text-slate-400">Dual turntable focused mixing</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Focus Pair Deck Selectors */}
              {deckLayout === 'focus' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-blue-400 uppercase block mb-1">
                      Focus Deck A (Left Turntable)
                    </label>
                    <select
                      value={focusDeckA}
                      onChange={(e) => onSelectFocusDeckA(e.target.value as DeckId)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    >
                      {activeDecksList.map((d) => (
                        <option key={d} value={d}>
                          Deck {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-pink-400 uppercase block mb-1">
                      Focus Deck B (Right Turntable)
                    </label>
                    <select
                      value={focusDeckB}
                      onChange={(e) => onSelectFocusDeckB(e.target.value as DeckId)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    >
                      {activeDecksList.map((d) => (
                        <option key={d} value={d}>
                          Deck {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Pitch Fader Range Option */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block">
                  Turntable Pitch Fader Range
                </span>
                <div className="flex gap-3">
                  {(['8', '16', '50'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setPitchRange(r)}
                      className={`flex-1 py-2 rounded-lg border font-mono text-xs font-bold transition ${
                        pitchRange === r
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      ±{r}% {r === '50' ? '(WIDE)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MIXER & EQ DSP */}
          {activeTab === 'mixer' && (
            <div className="space-y-6">
              {/* Master Volume & Headroom Tuning */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-blue-400" /> Master Gain & Output Dynamics
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {Math.round(masterVol * 100)}% Gain
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVol}
                  onChange={(e) => handleMasterVolChange(parseFloat(e.target.value))}
                  className="w-full h-2.5 accent-blue-500 bg-slate-800 rounded appearance-none cursor-pointer"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-slate-400 font-mono text-[11px] block mb-1">
                      Master Headroom Margin
                    </label>
                    <div className="flex gap-2">
                      {(['-0', '-3', '-6'] as const).map((h) => (
                        <button
                          key={h}
                          onClick={() => setHeadroom(h)}
                          className={`flex-1 py-1.5 rounded-lg border font-mono text-xs font-bold transition ${
                            headroom === h
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {h} dB {h === '-3' ? '(Club)' : h === '-6' ? '(Studio)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono text-[11px] block mb-1">
                      Master Brickwall Peak Limiter
                    </label>
                    <div className="flex gap-2">
                      {(['-0.1', '-1.0', '-3.0'] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLimiterThreshold(l)}
                          className={`flex-1 py-1.5 rounded-lg border font-mono text-xs font-bold transition ${
                            limiterThreshold === l
                              ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {l} dB
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* EQ Architecture & Crossover Frequency Tuning */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" /> EQ DSP Architecture & Isolator Curves
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setEqMode('3band')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      eqMode === '3band'
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="p-2 rounded-lg bg-purple-950 text-purple-400 font-black font-mono text-xs border border-purple-800">
                      3B
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">Classic 3-Band EQ</h4>
                      <p className="text-[10px] text-slate-400">+6dB Boost / -26dB Kill (Club Standard)</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setEqMode('4band')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      eqMode === '4band'
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="p-2 rounded-lg bg-pink-950 text-pink-400 font-black font-mono text-xs border border-pink-800">
                      4B
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">4-Band Studio Isolator</h4>
                      <p className="text-[10px] text-slate-400">Sub, Low, Mid, High (-Inf dB Total Kill)</p>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono text-slate-300">
                      <span>Low-Mid Crossover Freq</span>
                      <span className="text-purple-400 font-bold">{eqCrossoverLow} Hz</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="500"
                      step="10"
                      value={eqCrossoverLow}
                      onChange={(e) => setEqCrossoverLow(parseInt(e.target.value))}
                      className="w-full h-2 accent-purple-500 bg-slate-800 rounded appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono text-slate-300">
                      <span>Mid-High Crossover Freq</span>
                      <span className="text-purple-400 font-bold">{(eqCrossoverHigh / 1000).toFixed(1)} kHz</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="5000"
                      step="100"
                      value={eqCrossoverHigh}
                      onChange={(e) => setEqCrossoverHigh(parseInt(e.target.value))}
                      className="w-full h-2 accent-purple-500 bg-slate-800 rounded appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Crossfader Curve & Response */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block">
                  Crossfader Response Curve
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setCrossfaderCurve('smooth');
                      audioEngine.setCrossfaderCurve('smooth');
                    }}
                    className={`p-3 rounded-xl border text-center transition ${
                      crossfaderCurve === 'smooth'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold block">Smooth Blend</span>
                    <span className="text-[10px] text-slate-400">Constant Power</span>
                  </button>

                  <button
                    onClick={() => {
                      setCrossfaderCurve('linear');
                      audioEngine.setCrossfaderCurve('linear');
                    }}
                    className={`p-3 rounded-xl border text-center transition ${
                      crossfaderCurve === 'linear'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold block">Linear Fade</span>
                    <span className="text-[10px] text-slate-400">Equal Gain</span>
                  </button>

                  <button
                    onClick={() => {
                      setCrossfaderCurve('scratch');
                      audioEngine.setCrossfaderCurve('cut');
                    }}
                    className={`p-3 rounded-xl border text-center transition ${
                      crossfaderCurve === 'scratch'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold block">Fast Cut / Scratch</span>
                    <span className="text-[10px] text-slate-400">Sharp Edge</span>
                  </button>
                </div>
              </div>

              {/* Audio Processing Latency & Buffer Size */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Audio Buffer Size & Latency Mode
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {(['128', '256', '512'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setBufferSize(b)}
                      className={`p-3 rounded-xl border text-center transition ${
                        bufferSize === b
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-bold block font-mono">{b} Samples</span>
                      <span className="text-[10px] text-slate-400">
                        {b === '128' ? '~2.6ms Low Latency' : b === '256' ? '~5.3ms Standard' : '~10.6ms Studio Safe'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Channel Strip Fine Tuning (Deck A & B Preview) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block">
                  Deck Channel Trim & 3-Band EQ Quick Calibrator
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Deck A Calibration Box */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-blue-500/30 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono font-extrabold text-blue-400">
                      <span>DECK A (LEFT CHANNEL)</span>
                      <span>TRIM: {audioEngine.deckStates['A']?.gain.toFixed(1)}x</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 block">HI</span>
                        <input
                          type="range"
                          min="-24"
                          max="12"
                          value={audioEngine.deckStates['A']?.eqHigh || 0}
                          onChange={(e) => audioEngine.setEq('A', 'high', parseFloat(e.target.value))}
                          className="w-full h-1.5 accent-blue-500 bg-slate-800 rounded appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-blue-300">
                          {audioEngine.deckStates['A']?.eqHigh || 0}dB
                        </span>
                      </div>

                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 block">MID</span>
                        <input
                          type="range"
                          min="-24"
                          max="12"
                          value={audioEngine.deckStates['A']?.eqMid || 0}
                          onChange={(e) => audioEngine.setEq('A', 'mid', parseFloat(e.target.value))}
                          className="w-full h-1.5 accent-blue-500 bg-slate-800 rounded appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-blue-300">
                          {audioEngine.deckStates['A']?.eqMid || 0}dB
                        </span>
                      </div>

                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 block">LOW</span>
                        <input
                          type="range"
                          min="-24"
                          max="12"
                          value={audioEngine.deckStates['A']?.eqLow || 0}
                          onChange={(e) => audioEngine.setEq('A', 'low', parseFloat(e.target.value))}
                          className="w-full h-1.5 accent-blue-500 bg-slate-800 rounded appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-blue-300">
                          {audioEngine.deckStates['A']?.eqLow || 0}dB
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deck B Calibration Box */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-pink-500/30 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono font-extrabold text-pink-400">
                      <span>DECK B (RIGHT CHANNEL)</span>
                      <span>TRIM: {audioEngine.deckStates['B']?.gain.toFixed(1)}x</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 block">HI</span>
                        <input
                          type="range"
                          min="-24"
                          max="12"
                          value={audioEngine.deckStates['B']?.eqHigh || 0}
                          onChange={(e) => audioEngine.setEq('B', 'high', parseFloat(e.target.value))}
                          className="w-full h-1.5 accent-pink-500 bg-slate-800 rounded appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-pink-300">
                          {audioEngine.deckStates['B']?.eqHigh || 0}dB
                        </span>
                      </div>

                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 block">MID</span>
                        <input
                          type="range"
                          min="-24"
                          max="12"
                          value={audioEngine.deckStates['B']?.eqMid || 0}
                          onChange={(e) => audioEngine.setEq('B', 'mid', parseFloat(e.target.value))}
                          className="w-full h-1.5 accent-pink-500 bg-slate-800 rounded appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-pink-300">
                          {audioEngine.deckStates['B']?.eqMid || 0}dB
                        </span>
                      </div>

                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 block">LOW</span>
                        <input
                          type="range"
                          min="-24"
                          max="12"
                          value={audioEngine.deckStates['B']?.eqLow || 0}
                          onChange={(e) => audioEngine.setEq('B', 'low', parseFloat(e.target.value))}
                          className="w-full h-1.5 accent-pink-500 bg-slate-800 rounded appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-pink-300">
                          {audioEngine.deckStates['B']?.eqLow || 0}dB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Crossfader Slider */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-blue-400">DECK BANK A (LEFT)</span>
                  <span className="text-slate-400">CENTER</span>
                  <span className="text-pink-400">DECK BANK B (RIGHT)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={crossfader}
                  onChange={(e) => handleCrossfaderChange(parseFloat(e.target.value))}
                  className="w-full h-3 accent-purple-500 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: BROADCAST OPTIONS */}
          {activeTab === 'broadcast' && (
            <div className="space-y-6">
              {/* Broadcast Action Banner */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-rose-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-100">
                      Shoutcast & Icecast Live Stream
                    </span>
                    {bStatus.isBroadcasting ? (
                      <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800 font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
                        LIVE BROADCASTING
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 font-mono font-bold px-2 py-0.5 rounded-full">
                        OFFLINE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Stream live studio master output directly to Internet Radio servers
                  </p>
                </div>

                <div>
                  {bStatus.isBroadcasting ? (
                    <button
                      onClick={handleStopBroadcast}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Square className="w-4 h-4 fill-white" /> STOP BROADCAST
                    </button>
                  ) : (
                    <button
                      onClick={handleStartBroadcast}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-white" /> GO LIVE NOW
                    </button>
                  )}
                </div>
              </div>

              {/* Station Configuration Inputs */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block">
                  Server Credentials & Mount Settings
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 font-mono block mb-1">Server Protocol</label>
                    <select
                      value={bConfig.serverType}
                      onChange={(e) => handleBConfigChange('serverType', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                    >
                      <option value="icecast2">Icecast v2 Server</option>
                      <option value="shoutcast2">Shoutcast v2 Server</option>
                      <option value="custom">Custom WebRTC Stream</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono block mb-1">Station / Show Title</label>
                    <input
                      type="text"
                      value={bConfig.stationName}
                      onChange={(e) => handleBConfigChange('stationName', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Deep House Night Radio"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono block mb-1">Server Host / IP</label>
                    <input
                      type="text"
                      value={bConfig.host}
                      onChange={(e) => handleBConfigChange('host', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                      placeholder="stream.myradio.com"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono block mb-1">Port</label>
                    <input
                      type="number"
                      value={bConfig.port}
                      onChange={(e) => handleBConfigChange('port', parseInt(e.target.value) || 8000)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono block mb-1">Mount Point / Path</label>
                    <input
                      type="text"
                      value={bConfig.mount}
                      onChange={(e) => handleBConfigChange('mount', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                      placeholder="/live"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono block mb-1">Stream Bitrate</label>
                    <select
                      value={bConfig.bitrate}
                      onChange={(e) => handleBConfigChange('bitrate', parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                    >
                      <option value={128}>128 kbps (Mobile)</option>
                      <option value={192}>192 kbps (Standard)</option>
                      <option value={256}>256 kbps (HQ)</option>
                      <option value={320}>320 kbps (Ultra Studio)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Now Playing ICY Title Sender */}
              {bStatus.isBroadcasting && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block">
                    Send Live "Now Playing" Title Banner
                  </span>
                  <form onSubmit={handleSendIcyTitle} className="flex gap-2">
                    <input
                      type="text"
                      value={icyTitleInput}
                      onChange={(e) => setIcyTitleInput(e.target.value)}
                      placeholder="e.g. Artist - Track Name (Live Mix)"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Send ICY
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RECORD SET */}
          {activeTab === 'record' && (
            <div className="space-y-6">
              {/* Record Banner */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                        isRecording
                          ? 'bg-red-600 text-white animate-pulse shadow-red-600/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Circle className="w-6 h-6 fill-current" />
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                        Studio Set Audio Recorder
                        {isRecording && (
                          <span className="text-xs bg-red-950 text-red-400 border border-red-800 font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
                            RECORDING LIVE
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Record master output mix directly into a lossless WebM/WAV audio file
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isRecording && (
                      <div className="bg-slate-900 px-4 py-2 rounded-xl border border-red-900/60 font-mono font-black text-lg text-red-400 flex items-center gap-2 animate-pulse">
                        <Clock className="w-4 h-4" /> {formatTimer(recordSeconds)}
                      </div>
                    )}

                    <button
                      onClick={handleToggleRecord}
                      className={`px-6 py-3 rounded-xl font-extrabold text-xs transition active:scale-95 shadow-xl flex items-center gap-2 ${
                        isRecording
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4 fill-white" /> STOP & DOWNLOAD SET
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 fill-white" /> START RECORDING SET
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Record Custom Filename & Options */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block">
                  Export Filename & Format Settings
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 font-mono block mb-1">Export File Name</label>
                    <input
                      type="text"
                      value={recFilename}
                      onChange={(e) => setRecFilename(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-red-500"
                      placeholder="My_Studio_DJ_Mix.webm"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono block mb-1">Audio Codec Container</label>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-300 font-mono flex items-center justify-between">
                      <span>MediaRecorder (WebM / Opus 48kHz)</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        HD Lossless
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIO ENGINE */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Audio Context Status Banner */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block">
                    Web Audio Context
                  </span>
                  <p className="text-xs text-slate-400">
                    Status: {isAudioUnlocked ? <span className="text-emerald-400 font-bold">● ACTIVE (48 kHz)</span> : <span className="text-amber-400 font-bold">○ SUSPENDED</span>}
                  </p>
                </div>

                {!isAudioUnlocked && (
                  <button
                    onClick={onUnlockAudio}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition shadow-lg"
                  >
                    START ENGINE
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: HELP & PRO TIPS */}
          {activeTab === 'help' && (
            <div className="space-y-6">
              {/* Keyboard Hotkeys Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  <Keyboard className="w-4 h-4" /> Workstation Keyboard Hotkeys
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Play / Pause Deck A:</span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-amber-400 font-bold">[ Spacebar ]</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Play / Pause Deck B:</span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-amber-400 font-bold">[ B ]</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Club SFX (Horn/Scratch/Laser/Clap):</span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-amber-400 font-bold">[ 1 ] [ 2 ] [ 3 ] [ 4 ]</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Sub & FX (Siren/Drop/Roll/Rewind):</span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-amber-400 font-bold">[ 5 ] [ 6 ] [ 7 ] [ 8 ]</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Perc & Vocals (Rim/Hey/Riser/Glitch):</span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-amber-400 font-bold">[ 9 ] [ 0 ] [ Q ] [ W ]</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">BPM Auto-Sync Engine:</span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-blue-400 font-bold">[ SYNC Button ]</span>
                  </div>
                </div>
              </div>

              {/* Turntable & Scratching Pro Tips */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-400">
                  <Disc className="w-4 h-4" /> Turntable & Scratching Pro Tips
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Real-time Vinyl Scratching
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Click and drag directly on any spinning vinyl record platter to scratch the audio back and forth. Release to resume regular tempo playback instantly.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Hot Cue Memory Points
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Click CUE 1–4 to set instant recall markers during track playback. Click again at any time to jump straight to that position for drop builds and breakdown loops.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" /> Seamless Beat Looper Roll
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Select 1/16, 1/8, 1/4, 1/2, 1, 2, 4, or 8 beat loops on any deck. The loop stays quantised in tempo with the master clock without drifting.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" /> Pitch Fader & Pitch Bend
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Adjust tempo sliders for ±8%, ±16%, or ±50% (WIDE) speed changes. Use the [+] / [-] pitch bend buttons to temporarily nudge tracks into phase alignment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mixer Board & DSP Routing Pro Tips */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-purple-400">
                  <Sliders className="w-4 h-4" /> Mixer Board & DSP EQ Pro Tips
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-purple-400" /> 3-Band EQ & Frequency Kills
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Tweak High, Mid, and Low frequency knobs or tap the HI / MID / LOW Kill buttons for instant cuts. Killing the Low EQ on incoming tracks prevents muddy bass clashes.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Low-Pass / High-Pass Filter Sweeps
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Turn the bipolar Filter knob counter-clockwise for a dark Low-Pass Filter sweep, or clockwise for a bright High-Pass Filter transition.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" /> Crossfader Bus Routing
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Route any active deck to Crossfader Bus L (Left), Bus R (Right), or THRU (Direct master output, bypassing crossfader). Essential for 4+ deck performance sets!
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-400" /> Real-time VU Volume Peak Meters
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Monitor multi-deck channel gain and master output headroom visually to keep mix volume clean and avoid audio clipping.
                    </p>
                  </div>
                </div>
              </div>

              {/* Broadcast & Live Recording Pro Tips */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-400">
                  <Radio className="w-4 h-4" /> Live Broadcast & Set Recording Pro Tips
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-rose-400" /> Shoutcast / Icecast Streaming
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Enter host, port, mount point, and bitrate in the Live Broadcast tab to stream live audio directly to Internet radio servers. Send live ICY track titles on the fly!
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <Circle className="w-3.5 h-3.5 text-red-500 fill-red-500" /> HD Lossless Set Recording
                    </h5>
                    <p className="text-slate-400 leading-relaxed">
                      Click 'Record Set' in the header or in Settings to start capturing master output audio. Stop at any time to automatically download your set as a high-quality WebM/Opus file.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 animate-fade-in">
                <Check className="w-4 h-4" /> Preferences Saved!
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Preferences
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
