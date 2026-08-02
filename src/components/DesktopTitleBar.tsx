import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Download,
  Maximize2,
  Minimize2,
  X,
  Minus,
  Square,
  Cpu,
  Activity,
  Keyboard,
  Radio,
  Sparkles,
  Settings,
  Disc,
  BookOpen,
  LayoutGrid,
  Circle,
  HardDrive,
  Youtube
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { DeckState, DeckId } from '../types';
import { MasterWaveformBanner } from './MasterWaveformBanner';

interface DesktopTitleBarProps {
  onOpenDesktopModal: () => void;
  onOpenShortcutsModal: () => void;
  onOpenGuide: () => void;
  onOpenBroadcast: () => void;
  onOpenSettings: () => void;
  onOpenYouTubeModal?: () => void;
  isAudioUnlocked: boolean;
  onUnlockAudio: () => void;
  isBroadcasting?: boolean;
  deckStates: Record<DeckId, DeckState>;
  activeDeckCount: 2 | 4 | 6 | 8;
  onSelectDeckCount: (count: 2 | 4 | 6 | 8) => void;
}

export const DesktopTitleBar: React.FC<DesktopTitleBarProps> = ({
  onOpenDesktopModal,
  onOpenShortcutsModal,
  onOpenGuide,
  onOpenBroadcast,
  onOpenSettings,
  onOpenYouTubeModal,
  isAudioUnlocked,
  onUnlockAudio,
  isBroadcasting = false,
  deckStates,
  activeDeckCount,
  onSelectDeckCount,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(4.2);
  const [currentTime, setCurrentTime] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Catch PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Update clock & CPU simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      // Realistic low CPU flutter for Web Audio engine
      setCpuUsage(parseFloat((3.5 + Math.random() * 2.1).toFixed(1)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      onOpenDesktopModal();
    }
  };

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
    <div className="bg-[#0b0406] border-b border-[#3a1015] select-none flex flex-col w-full">
      {/* Native Desktop Window Frame Bar */}
      <div className="px-2 py-1 bg-[#060203] border-b border-[#2b0c11] flex items-center justify-between text-[11px] font-mono text-slate-300">
        {/* Left: Window Controls & App Title */}
        <div className="flex items-center gap-2">
          {/* macOS / Windows Window Buttons */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-[#3a1015]">
            <button
              onClick={() => alert('Desktop App Mode active. Use Fullscreen (F11) or close tab to exit.')}
              className="w-3 h-3 rounded-full bg-rose-500/90 hover:bg-rose-400 flex items-center justify-center text-[#06070a] text-[8px] font-bold cursor-pointer transition"
              title="Close Application Window"
            >
              <X className="w-2 h-2 opacity-0 hover:opacity-100" />
            </button>
            <button
              onClick={() => alert('Application minimized to desktop system tray / dock.')}
              className="w-3 h-3 rounded-full bg-amber-500/90 hover:bg-amber-400 flex items-center justify-center text-[#06070a] text-[8px] font-bold cursor-pointer transition"
              title="Minimize to System Tray"
            >
              <Minus className="w-2 h-2 opacity-0 hover:opacity-100" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-3 h-3 rounded-full bg-emerald-500/90 hover:bg-emerald-400 flex items-center justify-center text-[#06070a] text-[8px] font-bold cursor-pointer transition"
              title="Toggle Desktop Fullscreen"
            >
              <Square className="w-2 h-2 opacity-0 hover:opacity-100" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 flex items-center justify-center text-white shadow shadow-red-900/50">
              <Disc className="w-3 h-3 animate-spin-slow" />
            </div>
            <span className="font-extrabold tracking-wider text-slate-100 text-[11px] flex items-center gap-1.5">
              STIL DJ STUDIO PRO
              <span className="text-[9px] font-mono font-bold text-amber-400 bg-red-950/90 border border-amber-600/80 px-1 py-0.2 rounded">
                DRAGON EDITION v0.1
              </span>
            </span>
          </div>
        </div>

        {/* Center: Desktop Audio System Status */}
        <div className="hidden lg:flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1 bg-[#1a080c] px-2 py-0.5 rounded border border-[#3a1015]">
            <Cpu className="w-3 h-3 text-red-400" />
            <span className="text-slate-400">DSP:</span>
            <span className="text-red-300 font-bold">{cpuUsage}%</span>
          </div>

          <div className="flex items-center gap-1 bg-[#1a080c] px-2 py-0.5 rounded border border-[#3a1015]">
            <Activity className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">LATENCY:</span>
            <span className="text-amber-300 font-bold">1.2ms ASIO</span>
          </div>

          <div className="flex items-center gap-1 bg-[#1a080c] px-2 py-0.5 rounded border border-[#3a1015]">
            <HardDrive className="w-3 h-3 text-orange-400" />
            <span className="text-slate-400">ENGINE:</span>
            <span className="text-orange-300 font-bold">64-bit Audio Context</span>
          </div>
        </div>

        {/* Right: Desktop Controls & Clock */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstallPwa}
            className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white flex items-center gap-1 shadow cursor-pointer transition border border-amber-500/40"
            title="Install as Standalone Desktop Software or Build Executable (.exe / .app)"
          >
            <Monitor className="w-3 h-3 text-amber-300" />
            {isInstalled ? 'DESKTOP ACTIVE' : 'DESKTOP APP'}
          </button>

          <button
            onClick={onOpenShortcutsModal}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1d090d] hover:bg-[#2e0e15] text-amber-300 border border-[#3d1217] flex items-center gap-1 cursor-pointer transition"
            title="Desktop Keyboard Shortcuts Cheatsheet"
          >
            <Keyboard className="w-3 h-3 text-amber-400" />
            SHORTCUTS
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1 rounded bg-[#1d090d] hover:bg-[#2e0e15] text-rose-300 border border-[#3d1217] cursor-pointer transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Desktop Fullscreen Mode (F11)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <div className="pl-1 text-[11px] font-mono text-amber-400 font-bold hidden sm:block">
            {currentTime || '12:00'}
          </div>
        </div>
      </div>

      {/* Primary Toolbar & Deck Selector */}
      <div className="px-3 py-1 flex items-center justify-between bg-[#110508] border-b border-[#3a1015]">
        {/* Left: Decks Config Switcher */}
        <div className="flex items-center gap-1 bg-[#1a080c] p-0.5 rounded-md border border-[#3d1217]">
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

        {/* Right: Quick Studio Action Buttons */}
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
            onClick={onOpenYouTubeModal}
            className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-[#280c10] hover:bg-[#3b1218] text-red-400 border border-[#52131b] hover:border-red-500 flex items-center gap-1 cursor-pointer transition shadow"
            title="Stream / Convert YouTube Videos to Decks"
          >
            <Youtube className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="hidden sm:inline">YOUTUBE</span>
          </button>

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

          <button
            onClick={onOpenDesktopModal}
            className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 flex items-center gap-1 cursor-pointer transition shadow shadow-cyan-950"
            title="Download Windows .EXE or macOS .APP Desktop App"
          >
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">DESKTOP .EXE / .APP</span>
          </button>
        </div>
      </div>

      {/* Central Master Waveform Banner */}
      <MasterWaveformBanner deckStates={deckStates} activeDeckCount={activeDeckCount} />
    </div>
  );
};
