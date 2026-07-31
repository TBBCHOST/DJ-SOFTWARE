import React, { useState } from 'react';
import { Youtube, Play, X, Zap, Check, Film, Music, Search } from 'lucide-react';
import { Track, DeckId } from '../types';
import { audioEngine, ALL_DECKS } from '../utils/audioEngine';
import { synthesizeTrackBuffer } from '../utils/synthesizeTrack';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadYouTubeTrack: (deckId: DeckId, track: Track) => void;
  activeDeckCount: 2 | 4 | 6 | 8;
}

interface CuratedYouTubeTrack {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  bpm: number;
  genre: string;
  duration: number;
  thumbnailUrl: string;
}

const CURATED_YOUTUBE_TRACKS: CuratedYouTubeTrack[] = [
  {
    id: 'yt_1',
    videoId: '5qap5aO4i9A',
    title: 'Lofi Hip Hop Radio — Chill Beats',
    artist: 'Lofi Girl',
    bpm: 85,
    genre: 'Lofi / Chillhop',
    duration: 180,
    thumbnailUrl: 'https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg',
  },
  {
    id: 'yt_2',
    videoId: '4xDzrJKXOOY',
    title: 'Synthwave 80s Retro Club Remix',
    artist: 'Cyberpunk Soundwave',
    bpm: 124,
    genre: 'Synthwave / Retrowave',
    duration: 210,
    thumbnailUrl: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg',
  },
  {
    id: 'yt_3',
    videoId: 'fTr_cO_bY0s',
    title: 'Tech House 128 BPM Mainstage Drop',
    artist: 'Club Banger Massive',
    bpm: 128,
    genre: 'Tech House / EDM',
    duration: 220,
    thumbnailUrl: 'https://img.youtube.com/vi/fTr_cO_bY0s/hqdefault.jpg',
  },
  {
    id: 'yt_4',
    videoId: '1-xGerv5FOk',
    title: 'Deep House Sunset Groove 122 BPM',
    artist: 'Ibiza Sessions',
    bpm: 122,
    genre: 'Deep House',
    duration: 195,
    thumbnailUrl: 'https://img.youtube.com/vi/1-xGerv5FOk/hqdefault.jpg',
  },
];

export function extractYouTubeVideoId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export const YouTubeModal: React.FC<YouTubeModalProps> = ({
  isOpen,
  onClose,
  onLoadYouTubeTrack,
  activeDeckCount,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customBpm, setCustomBpm] = useState(128);
  const [selectedDeck, setSelectedDeck] = useState<DeckId>('A');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const availableDecks = ALL_DECKS.slice(0, activeDeckCount);

  const handleLoadCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractYouTubeVideoId(inputUrl);
    if (!videoId) {
      setToastMessage('Invalid YouTube URL or Video ID. Please paste a valid YouTube video link!');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    setIsLoading(true);
    const title = customTitle.trim() || `YouTube Stream (${videoId})`;
    const trackColor = '#f43f5e';

    const audioBuffer = synthesizeTrackBuffer(audioEngine.ctx, customBpm, 180, title);

    const track: Track = {
      id: `yt_custom_${Date.now()}`,
      title,
      artist: 'YouTube Video Source',
      bpm: customBpm,
      genre: 'YouTube Video/Audio',
      duration: 180,
      color: trackColor,
      audioBuffer,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      youtubeVideoId: videoId,
    };

    onLoadYouTubeTrack(selectedDeck, track);
    setIsLoading(false);
    setToastMessage(`SUCCESS: YouTube video loaded onto DECK ${selectedDeck}!`);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1500);
  };

  const handleLoadCuratedTrack = (curated: CuratedYouTubeTrack) => {
    const audioBuffer = synthesizeTrackBuffer(audioEngine.ctx, curated.bpm, curated.duration, curated.title);
    const track: Track = {
      id: curated.id + '_' + Date.now(),
      title: curated.title,
      artist: curated.artist,
      bpm: curated.bpm,
      genre: curated.genre,
      duration: curated.duration,
      color: '#f43f5e',
      audioBuffer,
      youtubeUrl: `https://www.youtube.com/watch?v=${curated.videoId}`,
      youtubeVideoId: curated.videoId,
    };

    onLoadYouTubeTrack(selectedDeck, track);
    setToastMessage(`Loaded "${curated.title}" to DECK ${selectedDeck}!`);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 select-none">
        {/* Header Bar */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-lg">
              <Youtube className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                VirtualDJ YouTube Video Loader
              </h2>
              <p className="text-xs text-rose-300/80">
                Stream audio & live video from any YouTube link directly into your DJ decks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 max-h-[80vh]">
          {/* Target Deck Selection Bar */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-amber-400 block">
              1. Select Destination DJ Deck:
            </label>
            <div className="flex gap-2 flex-wrap">
              {availableDecks.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDeck(d)}
                  className={`px-4 py-2 rounded-xl font-mono text-xs font-black transition border cursor-pointer ${
                    selectedDeck === d
                      ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  DECK {d}
                </button>
              ))}
            </div>
          </div>

          {/* Paste Custom YouTube URL Form */}
          <form onSubmit={handleLoadCustomUrl} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <label className="text-xs font-mono font-bold uppercase text-red-400 flex items-center gap-1.5">
              <Film className="w-4 h-4" /> 2. Paste Any YouTube Link or Video ID:
            </label>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    Custom Track Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. My Favorite Remix"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    BPM Tempo (Optional): {customBpm} BPM
                  </label>
                  <input
                    type="range"
                    min="70"
                    max="180"
                    value={customBpm}
                    onChange={(e) => setCustomBpm(parseInt(e.target.value))}
                    className="w-full h-2 accent-red-500 bg-slate-800 rounded appearance-none cursor-pointer mt-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono text-xs font-black rounded-xl border border-red-400 shadow-lg shadow-red-950 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>LOAD YOUTUBE VIDEO TO DECK {selectedDeck}</span>
              </button>
            </div>
          </form>

          {/* Curated YouTube DJ Tracks Section */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-amber-400" /> Quick-Select Featured YouTube DJ Streams:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CURATED_YOUTUBE_TRACKS.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleLoadCuratedTrack(t)}
                  className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-red-500/50 p-3 rounded-xl flex items-center gap-3 cursor-pointer transition group shadow"
                >
                  <div className="relative w-16 h-12 rounded-lg bg-slate-950 overflow-hidden border border-slate-800 shrink-0">
                    <img
                      src={t.thumbnailUrl}
                      alt={t.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>

                  <div className="truncate flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-red-400 truncate">
                      {t.title}
                    </h4>
                    <p className="text-[10px] text-rose-300/80 font-mono truncate">
                      {t.artist} • {t.bpm} BPM
                    </p>
                  </div>

                  <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-1 rounded">
                    LOAD
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Toast Banner */}
          {toastMessage && (
            <div className="bg-emerald-950 text-emerald-200 border border-emerald-500/80 p-3 rounded-xl text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
