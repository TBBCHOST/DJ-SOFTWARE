import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Square, Zap, Upload, Lock, Repeat, Activity, Search, Youtube } from 'lucide-react';
import { DeckState, Track, DeckId, CrossfaderAssign } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { WaveformDisplay } from './WaveformDisplay';

interface TurntableDeckProps {
  deckId: DeckId;
  state: DeckState;
  allDeckStates: Record<DeckId, DeckState>;
  availableTracks: Track[];
  onSelectTrack: (track: Track) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenYouTubeModal?: () => void;
  isCompact?: boolean;
}

const DECK_COLORS: Record<DeckId, string> = {
  A: '#ef4444', // Dragon Fire Red
  B: '#f59e0b', // Ember Gold
  C: '#10b981', // Toxic Green
  D: '#06b6d4', // Flame Cyan
  E: '#a855f7', // Dragon Purple Flame
  F: '#f43f5e', // Blood Crimson
  G: '#eab308', // Dragon Blaze Yellow
  H: '#e11d48', // Infernal Ruby
};

function formatDeckTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const TurntableDeck: React.FC<TurntableDeckProps> = ({
  deckId,
  state,
  availableTracks,
  onSelectTrack,
  onFileUpload,
  onOpenYouTubeModal,
  isCompact = false,
}) => {
  const vinylRef = useRef<HTMLDivElement | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const isDraggingRef = useRef(false);
  const lastAngleRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);
  const themeColor = DECK_COLORS[deckId] || '#ef4444';

  const filteredTracks = availableTracks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.genre.toLowerCase().includes(q) ||
      t.bpm.toString().includes(q)
    );
  });

  // Get Master Deck info for Sync matching
  const masterInfo = audioEngine.getMasterBpmDeck(deckId);
  const isSyncedToMaster = masterInfo ? Math.abs(state.bpm - masterInfo.bpm) <= 1 : false;

  const handleAutoSync = () => {
    const result = audioEngine.syncDeckBpm(deckId);
    if (result) {
      setSyncToast(`SYNCED TO DECK ${result.masterDeckId} (${result.syncedBpm} BPM)`);
      setTimeout(() => setSyncToast(null), 2500);
    } else {
      setSyncToast(`NO OTHER DECK TO SYNC`);
      setTimeout(() => setSyncToast(null), 2000);
    }
  };

  // Spin animation when playing
  useEffect(() => {
    let lastTs = performance.now();
    const animate = (now: number) => {
      const delta = (now - lastTs) / 1000;
      lastTs = now;

      if (state.isPlaying && !isDraggingRef.current) {
        const rateFactor = state.playbackRate;
        setRotationAngle((prev) => (prev + 200 * rateFactor * delta) % 360);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [state.isPlaying, state.playbackRate]);

  // Handle Vinyl Scratch Touch & Mouse Interaction
  const handleVinylMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!vinylRef.current || !state.track) return;
    e.preventDefault();
    isDraggingRef.current = true;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = vinylRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    lastAngleRef.current = Math.atan2(clientY - centerY, clientX - centerX);
    lastTimeRef.current = Date.now();

    window.addEventListener('mousemove', handleVinylMouseMove);
    window.addEventListener('mouseup', handleVinylMouseUp);
    window.addEventListener('touchmove', handleVinylMouseMove);
    window.addEventListener('touchend', handleVinylMouseUp);
  };

  const handleVinylMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !vinylRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const rect = vinylRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const currentAngle = Math.atan2(clientY - centerY, clientX - centerX);
    let deltaAngle = currentAngle - lastAngleRef.current;

    if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
    if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

    const now = Date.now();
    const dt = (now - lastTimeRef.current) / 1000;

    if (dt > 0) {
      const angularVelocity = deltaAngle / dt;
      const scratchVelocity = angularVelocity / (Math.PI * 2);
      audioEngine.setScratchVelocity(deckId, scratchVelocity * 1.8);

      setRotationAngle((prev) => (prev + (deltaAngle * 180) / Math.PI) % 360);
    }

    lastAngleRef.current = currentAngle;
    lastTimeRef.current = now;
  };

  const handleVinylMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    audioEngine.stopScratch(deckId);

    window.removeEventListener('mousemove', handleVinylMouseMove);
    window.removeEventListener('mouseup', handleVinylMouseUp);
    window.removeEventListener('touchmove', handleVinylMouseMove);
    window.removeEventListener('touchend', handleVinylMouseUp);
  };

  const progressPercent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  const remainingTime = Math.max(0, state.duration - state.currentTime);

  return (
    <div
      className={`bg-[#0d0406] border border-[#3d1217] rounded-none shadow-2xl flex flex-col justify-between relative select-none w-full h-full p-0 gap-0 ${
        isCompact ? 'text-[8px]' : 'text-[9px]'
      }`}
      style={{ borderColor: `${themeColor}70` }}
    >
      {/* Deck Badge, Track Selection & Digital Time Counter */}
      <div className={`flex items-center justify-between bg-[#140608] rounded-none border-b border-[#3d1217] ${isCompact ? 'p-0.5' : 'px-1.5 py-1'}`}>
        {/* Left: Deck Badge & Track Info */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div
            className={`rounded-none flex items-center justify-center font-black text-white shadow shadow-red-950 shrink-0 font-mono ${
              isCompact ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 text-[10px]'
            }`}
            style={{ backgroundColor: themeColor }}
          >
            {deckId}
          </div>
          <div className="truncate">
            <h3 className={`font-black text-slate-100 truncate tracking-tight leading-tight ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>
              {state.track ? state.track.title : `Deck ${deckId} — Ready`}
            </h3>
            <p className={`text-rose-300/80 truncate font-mono leading-none ${isCompact ? 'text-[7px]' : 'text-[8px]'}`}>
              {state.track ? `${state.track.artist} • ${state.track.genre}` : 'Select track'}
            </p>
          </div>
        </div>

        {/* Center: Digital Time Display (Counts Up Continuously When Music Plays!) */}
        <div className="flex items-center gap-2 bg-[#080203] px-2 py-0.5 rounded border border-[#4a131b] font-mono shadow-inner">
          <div className="flex flex-col items-center leading-none">
            <span className="text-[7px] text-amber-500/80 font-bold uppercase tracking-widest">ELAPSED</span>
            <span className={`font-black text-amber-300 ${state.isPlaying ? 'animate-pulse' : ''} ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>
              {formatDeckTime(state.currentTime)}
            </span>
          </div>
          <span className="text-amber-600/50 font-black">/</span>
          <div className="flex flex-col items-center leading-none">
            <span className="text-[7px] text-rose-400/80 font-bold uppercase tracking-widest">REMAIN</span>
            <span className={`font-black text-rose-300 ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>
              -{formatDeckTime(remainingTime)}
            </span>
          </div>
        </div>

        {/* Right: BPM & Sync options */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex flex-col items-end leading-none">
            <span className={`font-mono font-black text-amber-400 ${isCompact ? 'text-[8px]' : 'text-[10px]'}`}>
              {state.bpm} <span className="text-[6px] text-rose-300/70 font-normal">BPM</span>
            </span>
            <span className="text-[6px] text-amber-500/90 font-mono">
              {state.playbackRate !== 1.0
                ? `${(state.playbackRate * 100 - 100).toFixed(1)}%`
                : 'ORIG'}
            </span>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleAutoSync}
            className={`px-1.5 py-0.5 rounded-none text-[8px] font-black font-mono transition border flex items-center gap-0.5 active:scale-95 cursor-pointer ${
              isSyncedToMaster
                ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white border-amber-400 shadow shadow-amber-900/50 ring-1 ring-amber-400'
                : 'bg-[#1c080d] hover:bg-[#2e0e15] text-amber-300 border-[#3d1217]'
            }`}
            title="Auto-Sync BPM to Master Track"
          >
            <Zap className={`w-2.5 h-2.5 ${isSyncedToMaster ? 'text-white fill-white animate-bounce' : 'text-amber-400'}`} />
            {isSyncedToMaster ? 'SYNCED' : 'SYNC'}
          </button>
        </div>
      </div>

      {/* Sync Notification Toast Banner */}
      {syncToast && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 bg-amber-400 text-slate-950 font-black text-[8px] tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xl border border-amber-200 animate-bounce flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 fill-slate-950" /> {syncToast}
        </div>
      )}

      {/* Waveform Canvas Visualizer */}
      <WaveformDisplay
        deckId={deckId}
        isPlaying={state.isPlaying}
        track={state.track}
        currentTime={state.currentTime}
        duration={state.duration}
        bpm={state.bpm}
        hotCues={state.hotCues}
        color={themeColor}
        onSeek={(time) => audioEngine.seekDeck(deckId, time)}
        height={isCompact ? 28 : 36}
      />

      {/* Interactive Drag Scrubber Progress Bar (Visually Moves continuously!) */}
      <div className="relative w-full h-1.5 bg-[#1b070a] border-b border-[#3d1217] cursor-pointer group">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-75"
          style={{ width: `${progressPercent}%` }}
        />
        <input
          type="range"
          min="0"
          max={state.duration || 100}
          step="0.1"
          value={state.currentTime}
          onChange={(e) => audioEngine.seekDeck(deckId, parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Scrub Track Position"
        />
      </div>

      {/* Main Turntable Platter & Pitch Controls */}
      <div className={`grid grid-cols-12 items-center bg-[#100406] rounded-none border-b border-[#3d1217] ${isCompact ? 'p-0.5 gap-0.5' : 'p-1 gap-1'}`}>
        {/* Left Side: Pitch Slider, Nudge & Pitch Lock */}
        <div className={`col-span-4 flex flex-col items-center bg-[#1a080c] rounded border border-[#3d1217] ${isCompact ? 'p-0.5 gap-0.5' : 'p-1 gap-0.5'}`}>
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-[8px] font-bold text-amber-400/90 uppercase tracking-wider leading-none">
              PITCH
            </span>
            <button
              onClick={() => audioEngine.togglePitchLock(deckId)}
              className={`p-0.5 rounded text-[7px] border cursor-pointer ${
                state.pitchLock
                  ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold'
                  : 'bg-[#120406] text-rose-300 border-[#2e0e15]'
              }`}
              title="Keylock / Pitch Lock"
            >
              <Lock className="w-2 h-2" />
            </button>
          </div>

          <div className={`relative flex justify-center items-center ${isCompact ? 'h-10 w-5' : 'h-12 w-5'}`}>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.005"
              value={state.playbackRate}
              onChange={(e) => audioEngine.setPlaybackRate(deckId, parseFloat(e.target.value))}
              className={`accent-red-500 cursor-pointer origin-center -rotate-90 appearance-none bg-[#2e0e15] rounded ${isCompact ? 'w-10 h-1.5' : 'w-12 h-1.5'}`}
              title="Pitch Slider (-50% to +50%)"
            />
          </div>

          <div className="flex flex-col gap-0.5 w-full items-center">
            <div className="flex gap-0.5 w-full justify-between">
              <button
                onClick={() => audioEngine.setPlaybackRate(deckId, state.playbackRate - 0.02)}
                className="flex-1 py-0.5 rounded bg-[#2b0c12] hover:bg-[#3d1217] text-amber-300 text-[7px] font-mono border border-[#4a131b] text-center cursor-pointer font-black"
                title="Pitch Nudge Down -2%"
              >
                -2%
              </button>
              <button
                onClick={() => audioEngine.setPlaybackRate(deckId, 1.0)}
                className="flex-1 py-0.5 rounded bg-[#2b0c12] hover:bg-[#3d1217] text-rose-200 text-[7px] font-mono border border-[#4a131b] text-center cursor-pointer font-bold"
                title="Reset Pitch to 0%"
              >
                RST
              </button>
              <button
                onClick={() => audioEngine.setPlaybackRate(deckId, state.playbackRate + 0.02)}
                className="flex-1 py-0.5 rounded bg-[#2b0c12] hover:bg-[#3d1217] text-amber-300 text-[7px] font-mono border border-[#4a131b] text-center cursor-pointer font-black"
                title="Pitch Nudge Up +2%"
              >
                +2%
              </button>
            </div>
          </div>
        </div>

        {/* Center: Interactive Vinyl Platter */}
        <div className="col-span-8 flex justify-center relative my-0">
          <div
            ref={vinylRef}
            onMouseDown={handleVinylMouseDown}
            onTouchStart={handleVinylMouseDown}
            className={`relative rounded-full bg-[#080203] border-2 border-[#4a131b] shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
              isCompact ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-20 h-20 sm:w-24 sm:h-24'
            } ${state.isScratching ? 'scale-[1.03] border-amber-400 shadow-amber-500/50' : ''}`}
            title="Interactive Vinyl Platter: Drag with mouse/touch to SCRATCH!"
          >
            {/* Vinyl Groove Rings */}
            <div
              className="absolute inset-0 rounded-full border-[2px] sm:border-[3px] border-[#1f080c] shadow-inner flex items-center justify-center pointer-events-none"
              style={{ transform: `rotate(${rotationAngle}deg)` }}
            >
              <div className="w-11/12 h-11/12 rounded-full border border-[#2e0e15] flex items-center justify-center">
                <div className="w-4/5 h-4/5 rounded-full border border-[#3d1217] flex items-center justify-center">
                  <div className="w-3/5 h-3/5 rounded-full border border-[#4a131b] flex items-center justify-center">
                    {/* Vinyl Center Label */}
                    <div
                      className={`rounded-full flex flex-col items-center justify-center p-0.5 text-center shadow-lg relative overflow-hidden ${
                        isCompact ? 'w-7 h-7' : 'w-9 h-9'
                      }`}
                      style={{ backgroundColor: state.track?.color || themeColor }}
                    >
                      <div className="w-1.5 h-1.5 bg-[#080203] rounded-full border border-amber-400 mb-0.5" />
                      <span className="text-[6px] font-black text-white leading-tight uppercase truncate max-w-full drop-shadow">
                        {state.track ? state.track.title : 'SCRATCH'}
                      </span>
                      <span className="text-[6px] font-mono text-amber-200 font-bold">{deckId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vinyl Marker Line */}
              <div
                className={`absolute rounded-full ${
                  isCompact ? 'top-0.5 w-0.5 h-2' : 'top-0.5 w-0.5 h-2.5'
                }`}
                style={{ backgroundColor: state.isScratching ? '#fbbf24' : '#ef4444' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Useful Control Pads: Beat Loop Controls & Hot Cues & FX */}
      <div className={`grid grid-cols-12 gap-1 bg-[#0d0406] rounded-none border-b border-[#3d1217] ${isCompact ? 'p-0.5' : 'p-1'}`}>
        {/* Loop Controls */}
        <div className="col-span-5 flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-0.5">
              <Repeat className="w-2 h-2 text-amber-400" /> LOOP
            </span>
            <button
              onClick={() => audioEngine.toggleLoop(deckId)}
              className={`px-1 py-0.2 rounded text-[7px] font-mono font-black border cursor-pointer ${
                state.loopActive
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow shadow-amber-500/40'
                  : 'bg-[#1c080d] text-rose-300 border-[#3d1217] hover:bg-[#2e0e15]'
              }`}
            >
              {state.loopActive ? 'LOOP ON' : 'AUTO'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-0.5">
            {[0.5, 1, 2, 4].map((beats) => (
              <button
                key={beats}
                onClick={() => audioEngine.setLoopLength(deckId, beats)}
                className={`py-0.5 rounded text-[7px] font-mono font-bold border transition cursor-pointer ${
                  state.loopActive && state.loopLength === beats
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                    : 'bg-[#1c080d] hover:bg-[#2e0e15] text-amber-300 border-[#3d1217]'
                }`}
              >
                {beats < 1 ? '1/2' : `${beats}B`}
              </button>
            ))}
          </div>
        </div>

        {/* Hot Cues */}
        <div className="col-span-4 flex flex-col gap-0.5">
          <span className="text-[7px] font-bold text-rose-300 uppercase tracking-wider block leading-none">
            HOT CUES
          </span>
          <div className="grid grid-cols-4 gap-0.5">
            {state.hotCues.map((cue, idx) => (
              <button
                key={idx}
                onClick={() => audioEngine.jumpToHotCue(deckId, idx)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  audioEngine.clearHotCue(deckId, idx);
                }}
                className={`rounded font-mono text-[7px] font-bold flex flex-col items-center justify-center transition border cursor-pointer ${
                  isCompact ? 'h-4' : 'h-5'
                } ${
                  cue
                    ? 'bg-gradient-to-br from-red-600 to-amber-600 border-amber-300 text-white font-black shadow'
                    : 'bg-[#1a080c] border-[#3d1217] text-rose-400 hover:border-amber-600/50'
                }`}
                title={cue ? `Cue ${idx + 1} (${cue.time.toFixed(1)}s) - Right-click to clear` : `Set Cue ${idx + 1}`}
              >
                <span>C{idx + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FX / Crossfader Assign */}
        <div className="col-span-3 flex flex-col gap-0.5">
          <span className="text-[7px] font-bold text-amber-400 uppercase tracking-wider block leading-none">
            ASSIGN
          </span>
          <div className="grid grid-cols-3 gap-0.5">
            {(['left', 'thru', 'right'] as CrossfaderAssign[]).map((assign) => (
              <button
                key={assign}
                onClick={() => audioEngine.setCrossfaderAssign(deckId, assign)}
                className={`rounded font-mono text-[7px] font-bold uppercase transition border cursor-pointer ${
                  isCompact ? 'h-4' : 'h-5'
                } ${
                  state.crossfaderAssign === assign
                    ? 'bg-red-600 text-white border-red-400 font-black shadow'
                    : 'bg-[#1a080c] border-[#3d1217] text-rose-300 hover:text-white'
                }`}
              >
                {assign === 'left' ? 'L' : assign === 'right' ? 'R' : 'TH'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CORE TRANSPORT CONTROLS BAR (Stop, Pause, Play, Cue, Track Selection & Upload) */}
      <div className={`flex items-center justify-between gap-1 bg-[#100406] rounded-none ${isCompact ? 'p-1' : 'p-1.5'}`}>
        {/* Left: Transport Buttons (CUE, STOP, PAUSE, PLAY) */}
        <div className="flex items-center gap-1">
          {/* CUE Button */}
          <button
            onClick={() => audioEngine.seekDeck(deckId, 0)}
            className={`rounded bg-[#1a080c] hover:bg-[#2e0e15] text-amber-400 font-black font-mono border border-amber-600/60 shadow flex items-center justify-center transition active:scale-95 cursor-pointer ${
              isCompact ? 'px-1.5 h-5 text-[8px]' : 'px-2 h-6 text-[9px]'
            }`}
            title="Return to Start / Cue 0:00"
          >
            CUE
          </button>

          {/* STOP Button (Requested!) */}
          <button
            onClick={() => audioEngine.stopDeck(deckId)}
            className={`rounded bg-red-950 hover:bg-red-800 text-red-200 font-black font-mono border border-red-600 shadow shadow-red-950 flex items-center justify-center transition active:scale-95 cursor-pointer gap-1 ${
              isCompact ? 'px-1.5 h-5 text-[8px]' : 'px-2 h-6 text-[9px]'
            }`}
            title="STOP Deck Playback and Reset to 0:00"
          >
            <Square className="w-2.5 h-2.5 fill-red-400 text-red-400" />
            <span>STOP</span>
          </button>

          {/* PAUSE Button */}
          <button
            onClick={() => audioEngine.pauseDeck(deckId)}
            className={`rounded bg-amber-950 hover:bg-amber-800 text-amber-200 font-black font-mono border border-amber-600 shadow flex items-center justify-center transition active:scale-95 cursor-pointer ${
              isCompact ? 'w-6 h-5' : 'w-7 h-6'
            } ${state.isPlaying ? 'ring-1 ring-amber-400' : 'opacity-60'}`}
            title="Pause Playback at current position"
          >
            <Pause className="w-3 h-3 text-amber-300" />
          </button>

          {/* PLAY Button */}
          <button
            onClick={() => audioEngine.playDeck(deckId)}
            className={`rounded font-black flex items-center justify-center shadow transition active:scale-95 text-white cursor-pointer gap-1 ${
              isCompact ? 'px-2 h-5 text-[8px]' : 'px-2.5 h-6 text-[9px]'
            } ${
              state.isPlaying
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 border border-emerald-400 shadow-emerald-950 animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/80 shadow-emerald-900'
            }`}
            title="Start Playback"
          >
            <Play className="w-3 h-3 fill-white text-white" />
            <span>PLAY</span>
          </button>
        </div>

        {/* Right: Track Search & Select Dropdown & Upload Button */}
        <div className="flex items-center gap-1 relative">
          {showSearchBox ? (
            <div className="flex items-center gap-1 bg-[#1c080d] p-0.5 rounded border border-amber-500/80 shadow-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, artist, BPM..."
                autoFocus
                className="bg-transparent text-amber-200 text-[8px] font-mono px-1 py-0.5 focus:outline-none w-28 placeholder:text-rose-400/50"
              />
              <button
                onClick={() => {
                  setShowSearchBox(false);
                  setSearchQuery('');
                }}
                className="text-amber-400 hover:text-white font-mono text-[8px] px-1 font-bold"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchBox(true)}
              className={`rounded bg-[#1a080c] hover:bg-[#2e0e15] text-amber-400 border border-[#4a131b] hover:border-amber-500 transition shadow active:scale-95 ${
                isCompact ? 'p-1' : 'p-1.5'
              }`}
              title="Search Tracks in Library by Name, Artist, or BPM"
            >
              <Search className={isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            </button>
          )}

          <select
            onChange={(e) => {
              const selected = availableTracks.find((t) => t.id === e.target.value);
              if (selected) {
                onSelectTrack(selected);
                setShowSearchBox(false);
              }
            }}
            value={state.track?.id || ''}
            className={`bg-[#080203] text-rose-100 border border-[#4a131b] hover:border-amber-500 rounded font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 truncate cursor-pointer shadow-inner ${
              isCompact ? 'text-[8px] px-1 py-0.5 max-w-[85px]' : 'text-[9px] px-2 py-1 max-w-[120px]'
            }`}
          >
            <option value="" disabled>
              {filteredTracks.length === 0 ? 'No tracks found' : 'Load Track...'}
            </option>
            {filteredTracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.bpm}BPM)
              </option>
            ))}
          </select>

          <label
            className={`rounded bg-[#1a080c] hover:bg-[#2e0e15] text-rose-200 border border-[#4a131b] cursor-pointer transition shadow active:scale-95 ${
              isCompact ? 'p-1' : 'p-1.5'
            }`}
            title="Upload Custom Local Audio File (MP3/WAV/FLAC)"
          >
            <Upload className={isCompact ? 'w-3 h-3 text-amber-400' : 'w-3.5 h-3.5 text-amber-400'} />
            <input type="file" accept="audio/*" onChange={onFileUpload} className="hidden" />
          </label>

          <button
            onClick={onOpenYouTubeModal}
            className={`rounded bg-[#2a0c10] hover:bg-[#3d1217] text-red-400 border border-[#52131b] hover:border-red-500 cursor-pointer transition shadow active:scale-95 ${
              isCompact ? 'p-1' : 'p-1.5'
            }`}
            title="Stream / Convert YouTube Video directly to this Deck"
          >
            <Youtube className={isCompact ? 'w-3 h-3 text-red-500 animate-pulse' : 'w-3.5 h-3.5 text-red-500 animate-pulse'} />
          </button>
        </div>
      </div>
    </div>
  );
};
