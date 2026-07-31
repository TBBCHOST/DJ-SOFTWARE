import React from 'react';
import { X, Keyboard, Command, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', action: 'Play / Pause Deck A', category: 'Deck Controls' },
    { key: 'Shift + Space', action: 'Play / Pause Deck B', category: 'Deck Controls' },
    { key: '1, 2, 3, 4', action: 'Trigger Hot Cues 1-4 (Deck A)', category: 'Cue Points' },
    { key: '5, 6, 7, 8', action: 'Trigger Hot Cues 1-4 (Deck B)', category: 'Cue Points' },
    { key: 'Left / Right Arrow', action: 'Nudge Crossfader Left / Right', category: 'Mixer' },
    { key: 'Down Arrow', action: 'Reset Crossfader to Center', category: 'Mixer' },
    { key: 'Q / W / E', action: 'Trigger SFX Sampler Pads 1-3', category: 'Sampler' },
    { key: 'A / S / D', action: 'Trigger SFX Sampler Pads 4-6', category: 'Sampler' },
    { key: 'F11', action: 'Toggle Fullscreen Desktop Mode', category: 'Window' },
    { key: 'Esc', action: 'Close Active Overlay / Modal', category: 'Window' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="bg-[#0e1017] border border-[#2b3044] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-[#131622] border-b border-[#2b3044] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider text-slate-100 flex items-center gap-2">
                DESKTOP KEYBOARD MAP
                <span className="text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-bold">
                  PRO HOTKEYS
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Control playback, cue points, mixer crossfader, and sampler directly from your physical keyboard.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#232738] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded bg-[#131622] border border-[#24283b]"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">{item.action}</span>
                <span className="text-[9px] font-mono text-slate-400">{item.category}</span>
              </div>
              <kbd className="px-2 py-0.5 bg-[#1c2030] border border-[#353b56] text-amber-300 font-mono text-xs font-black rounded shadow">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#131622] border-t border-[#2b3044] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">
            Keyboard navigation active globally on desktop workspace
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#232738] hover:bg-[#2d3248] text-slate-200 font-bold text-xs rounded transition cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
