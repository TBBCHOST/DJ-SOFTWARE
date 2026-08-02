import React, { useState } from 'react';
import { Radio, BookOpen, Circle, Square, Sparkles, Settings, Disc, LayoutGrid } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { DeckState, DeckId } from '../types';
import { MasterWaveformBanner } from './MasterWaveformBanner';

interface HeaderProps {
  onOpenGuide: () => void;
  onOpenBroadcast: () => void;
  onOpenSettings: () => void;
  isAudioUnlocked: boolean;
  onUnlockAudio: () => void;
  isBroadcasting?: boolean;
  deckStates: Record<DeckId, DeckState>;
  activeDeckCount: 2 | 4 | 6 | 8;
  onSelectDeckCount: (count: 2 | 4 | 6 | 8) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onOpenBroadcast,
  onOpenSettings,
  isAudioUnlocked,
  onUnlockAudio,
  isBroadcasting = false,
  deckStates,
  activeDeckCount,
  onSelectDeckCount,
}) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleToggleRecord = () => {
    if (!isRecording) {
      const ok = audioEngine.startRecording();
      if (ok) setIsRecording(true);
    } else {
      audioEngine.stopRecordingAndDownload();
      setIsRecording(false);
    }
  };

  return (
    <header className="bg-[#110508] border-b border-[#3a1015] select-none flex flex-col">
      {/* Top Main Navigation Bar */}
      <div className="px-3 py-1.5 flex items-center justify-between border-b border-[#3a1015] bg-[#0d0406]">
        {/* Left: App Title & Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-600/30">
            <Disc className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider text-slate-100 flex items-center gap-1.5">
              STIL DJ STUDIO PRO
              <span className="text-[9px] font-mono font-bold text-amber-400 bg-red-950/90 border border-amber-600/80 px-1 py-0.1 rounded-sm">
                DRAGON EDITION v0.1
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Layout Deck Selector Buttons */}
        <div className="flex items-center gap-1 bg-[#1c080d] p-0.5 rounded-md border border-[#3d1217]">
          <span className="text-[9px] font-mono font-extrabold text-amber-500 px-1.5 flex items-center gap-1">
            <LayoutGrid className="w-3 h-3 text-red-500" /> DECKS:
          </span>
          {([2, 4, 6, 8] as const).map((count) => (
            <button
              key={count}
              onClick={() => onSelectDeckCount(count)}
              className={`px-2 py-0.5 rounded text-[9px] font-mono font-black transition cursor-pointer ${
                activeDeckCount === count
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow shadow-red-900/50'
                  : 'text-rose-300 hover:text-white hover:bg-[#2b0c12]'
              }`}
            >
              {count}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {!isAudioUnlocked && (
            <button
              onClick={onUnlockAudio}
              className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] flex items-center gap-1 cursor-pointer shadow shadow-amber-500/20 animate-pulse"
            >
              <Sparkles className="w-3 h-3 fill-black" />
              ENABLE AUDIO
            </button>
          )}

          <button
            onClick={onOpenBroadcast}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border transition cursor-pointer ${
              isBroadcasting
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-[#181a24] hover:bg-[#222634] text-pink-400 border-[#2a2d3d]'
            }`}
          >
            <Radio className="w-3 h-3" />
            BROADCAST
          </button>

          <button
            onClick={handleToggleRecord}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono flex items-center gap-1 border transition cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-[#181a24] hover:bg-[#222634] text-slate-200 border-[#2a2d3d]'
            }`}
          >
            {isRecording ? <Square className="w-3 h-3 fill-white" /> : <Circle className="w-3 h-3 fill-rose-500 text-rose-500" />}
            {isRecording ? 'REC...' : 'REC'}
          </button>

          <button
            onClick={onOpenGuide}
            className="p-1.5 rounded-md bg-[#181a24] hover:bg-[#222634] text-blue-400 border border-[#2a2d3d] cursor-pointer transition"
            title="User Guide"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-md bg-[#181a24] hover:bg-[#222634] text-slate-300 border border-[#2a2d3d] cursor-pointer transition"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Central Running Master Waveform Banner */}
      <MasterWaveformBanner deckStates={deckStates} activeDeckCount={activeDeckCount} />
    </header>
  );
};


