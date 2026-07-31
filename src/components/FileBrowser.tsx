import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  Music2,
  Search,
  HardDrive,
  List,
  Layers,
  Sparkles,
  Play,
  Star,
  ChevronRight,
  ChevronDown,
  Upload,
  Plus,
  Youtube
} from 'lucide-react';
import { Track, DeckId } from '../types';
import { audioEngine, ALL_DECKS } from '../utils/audioEngine';

interface FileBrowserProps {
  tracks: Track[];
  activeDeckCount: 2 | 4 | 6 | 8;
  onSelectTrackForDeck: (deckId: DeckId, track: Track) => void;
  onFileUpload: (deckId: DeckId, e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenYouTubeModal?: () => void;
}

interface MockFolder {
  id: string;
  name: string;
  isOpen?: boolean;
  children?: MockFolder[];
}

const MOCK_FOLDERS: MockFolder[] = [
  { id: 'f1', name: '.config' },
  { id: 'f2', name: '.copilot' },
  { id: 'f3', name: '.docker' },
  { id: 'f4', name: '.dotnet' },
  { id: 'f5', name: '.gradle' },
  { id: 'f6', name: '.m2' },
  { id: 'f7', name: '.nuget' },
  { id: 'f8', name: '.pm2' },
  { id: 'f9', name: '.vscode' },
  { id: 'f10', name: 'Contacts' },
  { id: 'f11', name: 'Desktop' },
  { id: 'f12', name: 'Documents' },
  { id: 'f13', name: 'Downloads' },
  { id: 'f14', name: 'Favorites' },
  {
    id: 'f15',
    name: 'Music',
    isOpen: true,
    children: [
      { id: 'f15_1', name: 'DJ Crates' },
      { id: 'f15_2', name: 'Stems Isolations' },
      { id: 'f15_3', name: 'Hot Cues Saved' },
    ],
  },
  { id: 'f16', name: 'NCH Software Suite' },
];

export const FileBrowser: React.FC<FileBrowserProps> = ({
  tracks,
  activeDeckCount,
  onSelectTrackForDeck,
  onFileUpload,
  onOpenYouTubeModal,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState('f15');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(tracks[0] || null);
  const [sideViewTab, setSideViewTab] = useState<'sidelist' | 'remixes' | 'sampler' | 'automix' | 'karaoke'>('sidelist');
  const [targetDeck, setTargetDeck] = useState<DeckId>('A');

  const filteredTracks = tracks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDecks = ALL_DECKS.slice(0, activeDeckCount);

  return (
    <div className="bg-[#12141a] border border-[#2a2d38] rounded-none text-slate-200 select-none flex flex-col text-xs font-sans shadow-xl h-full min-h-0 flex-1 overflow-hidden">
      {/* Search & Browser Control Header */}
      <div className="bg-[#1a1d26] border-b border-[#2a2d38] px-3 py-1.5 flex items-center justify-between gap-3">
        {/* Left Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#0d0e12] border border-[#2e3240] rounded px-2 py-1 focus-within:border-blue-500">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search STIL DJ STUDIO PRO Crate..."
            className="bg-transparent border-none text-slate-100 placeholder-slate-500 text-xs focus:outline-none w-full font-mono"
          />
          <span className="text-[10px] font-mono text-amber-400 bg-[#1e2230] px-1.5 py-0.5 rounded shrink-0">
            {filteredTracks.length} files
          </span>
        </div>

        {/* Target Deck Quick Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Load Target:</span>
          <div className="flex items-center gap-1 bg-[#0d0e12] p-0.5 rounded border border-[#2e3240]">
            {activeDecks.map((d) => (
              <button
                key={d}
                onClick={() => setTargetDeck(d)}
                className={`px-2 py-0.5 rounded font-black font-mono text-[10px] cursor-pointer ${
                  targetDeck === d ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Upload Custom Track Button */}
          <label className="px-2 py-1 rounded bg-[#252a38] hover:bg-[#303648] border border-[#3a4154] text-slate-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition active:scale-95">
            <Upload className="w-3.5 h-3.5 text-blue-400" /> ADD AUDIO FILE
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => onFileUpload(targetDeck, e)}
              className="hidden"
            />
          </label>

          <button
            onClick={onOpenYouTubeModal}
            className="px-2.5 py-1 rounded bg-[#3d1217] hover:bg-[#52131b] border border-red-500/80 text-red-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow"
            title="Stream or convert YouTube Video to MP3 for DJ Deck"
          >
            <Youtube className="w-3.5 h-3.5 text-red-400 animate-pulse" /> YOUTUBE STREAM / MP3
          </button>
        </div>
      </div>

      {/* Main 4-Column Browser Layout */}
      <div className="grid grid-cols-12 flex-1 overflow-hidden divide-x divide-[#2a2d38]">
        {/* Column 1: Folder Tree View (2 cols) */}
        <div className="col-span-2 bg-[#0e1015] overflow-y-auto p-1.5 space-y-0.5 text-[11px] font-mono scrollbar-thin">
          <div className="px-2 py-1 font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center justify-between border-b border-[#1f2330] mb-1">
            <span>FOLDERS</span>
            <HardDrive className="w-3 h-3 text-slate-500" />
          </div>
          {MOCK_FOLDERS.map((folder) => {
            const isSelected = selectedFolderId === folder.id;
            return (
              <div key={folder.id}>
                <div
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40'
                      : 'hover:bg-[#181b24] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {folder.children ? (
                    <ChevronDown className="w-3 h-3 text-blue-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  )}
                  {isSelected ? (
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span className="truncate">{folder.name}</span>
                </div>
                {folder.isOpen && folder.children && (
                  <div className="pl-4 space-y-0.5 mt-0.5">
                    {folder.children.map((child) => (
                      <div
                        key={child.id}
                        onClick={() => setSelectedFolderId(child.id)}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer text-[10px] ${
                          selectedFolderId === child.id
                            ? 'bg-blue-600/30 text-blue-300 font-bold'
                            : 'hover:bg-[#181b24] text-slate-400'
                        }`}
                      >
                        <Music2 className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">{child.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Column 2: Track Table (5 cols) */}
        <div className="col-span-5 bg-[#12141a] overflow-y-auto flex flex-col scrollbar-thin">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-[#171a22] sticky top-0 border-b border-[#2a2d38] text-slate-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="py-1.5 px-2 font-semibold">Title</th>
                <th className="py-1.5 px-2 font-semibold">Artist</th>
                <th className="py-1.5 px-2 font-semibold text-right">Length</th>
                <th className="py-1.5 px-2 font-semibold text-right">BPM</th>
                <th className="py-1.5 px-2 font-semibold text-center">Key</th>
                <th className="py-1.5 px-2 font-semibold text-center">Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e222d] font-sans">
              {filteredTracks.map((t) => {
                const isSelected = selectedTrack?.id === t.id;
                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTrack(t)}
                    onDoubleClick={() => onSelectTrackForDeck(targetDeck, t)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-600/25 text-white font-medium border-l-2 border-blue-500'
                        : 'hover:bg-[#181c26] text-slate-300'
                    }`}
                  >
                    <td className="py-1.5 px-2 flex items-center gap-1.5 truncate max-w-[140px]">
                      <Music2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-blue-400'}`} />
                      <span className="truncate font-semibold">{t.title}</span>
                    </td>
                    <td className="py-1.5 px-2 truncate max-w-[100px] text-slate-400 text-[10px]">
                      {t.artist}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-400 text-[10px]">
                      {t.duration ? `${Math.floor(t.duration / 60)}:${Math.floor(t.duration % 60).toString().padStart(2, '0')}` : '02:30'}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-amber-400 text-[10px]">
                      {t.bpm || 124}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono font-bold text-emerald-400 text-[10px]">
                      04B
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTrackForDeck('A', t);
                          }}
                          className="px-1.5 py-0.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded font-mono font-black text-[9px] cursor-pointer shadow"
                          title="Load onto Deck A"
                        >
                          A
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTrackForDeck('B', t);
                          }}
                          className="px-1.5 py-0.5 bg-pink-600/80 hover:bg-pink-500 text-white rounded font-mono font-black text-[9px] cursor-pointer shadow"
                          title="Load onto Deck B"
                        >
                          B
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Column 3: STIL DJ STUDIO PRO Workstation (3 cols) */}
        <div className="col-span-3 bg-[#0d0f14] flex flex-col">
          {/* Sideview Header */}
          <div className="bg-[#161821] border-b border-[#2a2d38] px-2 py-1 font-bold text-slate-300 text-[10px] uppercase flex items-center justify-between">
            <span className="flex items-center gap-1 font-mono">
              <Layers className="w-3.5 h-3.5 text-pink-400" /> STIL DJ STUDIO PRO WORKSTATION
            </span>
            <span className="text-[9px] text-slate-500 font-mono">STIL DJ STUDIO PRO</span>
          </div>

          {/* Central Drag & Drop / Active Panel */}
          <div className="flex-1 p-3 flex flex-col items-center justify-center text-center border-b border-[#2a2d38] bg-[#0a0b0e]">
            <div className="w-12 h-12 rounded-xl bg-[#161822] border border-[#2e3344] flex items-center justify-center text-slate-500 mb-2 shadow-inner">
              <Plus className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-xs font-bold text-slate-300 tracking-wide uppercase">
              DRAG AND DROP ANY FOLDER HERE
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">OR USE THE BUTTONS BELOW TO BUILD CRATES</p>
          </div>

          {/* Sideview Bottom Tab Bar */}
          <div className="bg-[#12141a] border-t border-[#2a2d38] p-1 grid grid-cols-5 gap-1 text-[9px] font-mono font-bold">
            {(['sidelist', 'remixes', 'sampler', 'automix', 'karaoke'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSideViewTab(tab)}
                className={`py-1 rounded text-center uppercase cursor-pointer transition ${
                  sideViewTab === tab
                    ? 'bg-blue-600 text-white font-extrabold shadow'
                    : 'bg-[#181a24] text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Column 4: Track Artwork & Info Inspector (2 cols) */}
        <div className="col-span-2 bg-[#0e1015] p-2.5 flex flex-col gap-2 overflow-y-auto font-mono text-[10px]">
          {/* Artwork Box */}
          <div className="w-full aspect-square bg-[#08090c] rounded border border-[#2a2d38] flex flex-col items-center justify-center relative overflow-hidden shadow-inner group">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-pink-600 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-spin-slow">
              <Music2 className="w-8 h-8 text-white" />
            </div>
            <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/80 px-1 py-0.5 rounded text-amber-400">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              <Star className="w-2.5 h-2.5 fill-amber-400" />
            </div>
          </div>

          {/* Track Details List */}
          <div className="space-y-1 text-slate-400">
            <div className="text-slate-200 font-bold truncate text-[11px]">
              {selectedTrack?.title || 'No Track Selected'}
            </div>
            <div className="text-blue-400 truncate text-[10px]">
              {selectedTrack?.artist || 'Unknown Artist'}
            </div>
            <hr className="border-[#222634] my-1" />
            <div className="flex justify-between">
              <span>Year:</span>
              <span className="text-slate-200 font-bold">2026</span>
            </div>
            <div className="flex justify-between">
              <span>Album:</span>
              <span className="text-slate-200 font-bold truncate max-w-[80px]">Virtual Studio</span>
            </div>
            <div className="flex justify-between">
              <span>Genre:</span>
              <span className="text-slate-200 font-bold truncate max-w-[80px]">{selectedTrack?.genre || 'Electronic'}</span>
            </div>
            <div className="flex justify-between">
              <span>First Seen:</span>
              <span className="text-slate-200 font-bold">Today</span>
            </div>
            <div className="flex justify-between">
              <span>Last Play:</span>
              <span className="text-slate-200 font-bold">Just now</span>
            </div>
            <div className="flex justify-between">
              <span>Play Count:</span>
              <span className="text-amber-400 font-bold">14</span>
            </div>
            <div className="flex justify-between">
              <span>Comment:</span>
              <span className="text-emerald-400 font-bold">DSP Master</span>
            </div>
            <div className="flex justify-between">
              <span>User 1:</span>
              <span className="text-slate-300 font-bold">f1r3dr4g0n85</span>
            </div>
            <div className="flex justify-between">
              <span>User 2:</span>
              <span className="text-slate-300 font-bold">PRO DSP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
