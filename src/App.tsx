import React, { useState, useEffect } from 'react';
import { audioEngine, ALL_DECKS } from './utils/audioEngine';
import { broadcastEngine } from './utils/broadcastEngine';
import { createSynthesizedTrack, createSFXBuffers } from './utils/synthesizeTrack';
import { Track, DeckState, MixerState, DeckId } from './types';
import { DesktopTitleBar } from './components/DesktopTitleBar';
import { TurntableDeck } from './components/TurntableDeck';
import { MixerBoard, MixerChannelStrip, StilDJCenterMixer } from './components/MixerBoard';
import { SamplerPads } from './components/SamplerPads';
import { FileBrowser } from './components/FileBrowser';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { BroadcastModal } from './components/BroadcastModal';
import { SettingsModal } from './components/SettingsModal';
import { DesktopModal } from './components/DesktopModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { YouTubeModal } from './components/YouTubeModal';

export default function App() {
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isYouTubeOpen, setIsYouTubeOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(broadcastEngine.status.isBroadcasting);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);

  const [activeDeckCount, setActiveDeckCount] = useState<2 | 4 | 6 | 8>(2);
  const [deckStates, setDeckStates] = useState<Record<DeckId, DeckState>>(audioEngine.deckStates);
  const [mixerState, setMixerState] = useState<MixerState>(audioEngine.mixerState);
  const [deckLayout, setDeckLayout] = useState<'grid' | 'focus' | 'split'>('grid');
  const [focusDeckA, setFocusDeckA] = useState<DeckId>('A');
  const [focusDeckB, setFocusDeckB] = useState<DeckId>('B');
  const [isDragOverWindow, setIsDragOverWindow] = useState(false);

  const activeDecks = ALL_DECKS.slice(0, activeDeckCount);

  const handleSelectDeckCount = (count: 2 | 4 | 6 | 8) => {
    setActiveDeckCount(count);
    const validDecks = ALL_DECKS.slice(0, count);
    if (!validDecks.includes(focusDeckA)) {
      setFocusDeckA(validDecks[0]);
    }
    if (!validDecks.includes(focusDeckB)) {
      setFocusDeckB(validDecks[Math.min(1, validDecks.length - 1)]);
    }
  };

  // Subscribe to Audio Engine & Broadcast Engine state updates
  useEffect(() => {
    const unsubAudio = audioEngine.subscribe(() => {
      setDeckStates({ ...audioEngine.deckStates });
      setMixerState({ ...audioEngine.mixerState });
    });

    const unsubBroadcast = broadcastEngine.subscribe(() => {
      setIsBroadcasting(broadcastEngine.status.isBroadcasting);
    });

    return () => {
      unsubAudio();
      unsubBroadcast();
    };
  }, []);

  // Global Desktop Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        const deckToToggle: DeckId = e.shiftKey ? 'B' : 'A';
        if (audioEngine.deckStates[deckToToggle]?.isPlaying) {
          audioEngine.pauseDeck(deckToToggle);
        } else {
          audioEngine.playDeck(deckToToggle);
        }
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
        const idx = parseInt(e.key) - 1;
        audioEngine.jumpToHotCue('A', idx);
      } else if (['Digit5', 'Digit6', 'Digit7', 'Digit8'].includes(e.code)) {
        const idx = parseInt(e.key) - 5;
        audioEngine.jumpToHotCue('B', idx);
      } else if (e.code === 'ArrowLeft') {
        const currentX = audioEngine.mixerState.crossfader;
        audioEngine.setCrossfader(Math.max(-1, currentX - 0.15));
      } else if (e.code === 'ArrowRight') {
        const currentX = audioEngine.mixerState.crossfader;
        audioEngine.setCrossfader(Math.min(1, currentX + 0.15));
      } else if (e.code === 'ArrowDown') {
        audioEngine.setCrossfader(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Native File Drag & Drop Handler from Desktop
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOverWindow(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragOverWindow(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDragOverWindow(false);

      if (!e.dataTransfer?.files || e.dataTransfer.files.length === 0) return;
      const file = e.dataTransfer.files[0];

      if (!isAudioUnlocked) await handleUnlockAudio();
      if (!audioEngine.ctx) return;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const decodedBuffer = await audioEngine.ctx.decodeAudioData(arrayBuffer);

        const customTrack: Track = {
          id: `dragdrop-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Desktop Import',
          bpm: 128,
          genre: 'Local Audio',
          duration: decodedBuffer.duration,
          color: '#3b82f6',
          audioBuffer: decodedBuffer,
        };

        setAvailableTracks((prev) => [customTrack, ...prev]);
        audioEngine.loadTrack('A', decodedBuffer, customTrack);
      } catch (err) {
        alert('Could not decode audio file. Please drop a valid MP3, WAV, or FLAC file.');
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [isAudioUnlocked]);

  // Initialize Web Audio Engine & Synthesize Initial Tracks for Decks
  const handleUnlockAudio = async () => {
    try {
      await audioEngine.initAudioContext();
      setIsAudioUnlocked(true);

      if (audioEngine.ctx && availableTracks.length === 0) {
        // Synthesize tracks in parallel
        const [house, synthwave, hiphop, dnb, funk] = await Promise.all([
          createSynthesizedTrack(audioEngine.ctx, 'house'),
          createSynthesizedTrack(audioEngine.ctx, 'synthwave'),
          createSynthesizedTrack(audioEngine.ctx, 'hiphop'),
          createSynthesizedTrack(audioEngine.ctx, 'dnb'),
          createSynthesizedTrack(audioEngine.ctx, 'funk'),
        ]);

        const trackBumbleBee: Track = {
          id: 'vjd-1',
          title: 'BUMBLE BEE',
          artist: 'f1r3dr4g0n85',
          bpm: 103.5,
          genre: 'Electronic',
          duration: house.duration,
          color: '#3b82f6',
          audioBuffer: house.audioBuffer,
        };

        const trackFuzzyButt: Track = {
          id: 'vjd-2',
          title: 'Fuzzy Butt Bassel - Topic',
          artist: 'Fuck this fuck that',
          bpm: 110.1,
          genre: 'Bass House',
          duration: synthwave.duration,
          color: '#ec4899',
          audioBuffer: synthwave.audioBuffer,
        };

        const trackGoodnight: Track = {
          id: 'vjd-3',
          title: 'Goodnight Sweetheart Goodnight',
          artist: 'Traditional',
          bpm: 72.6,
          genre: 'DownTempo',
          duration: hiphop.duration,
          color: '#10b981',
          audioBuffer: hiphop.audioBuffer,
        };

        const trackTrumpIsATwat: Track = {
          id: 'vjd-4',
          title: 'Trump Is A Twat',
          artist: 'f1r3dr4g0n85',
          bpm: 96.0,
          genre: 'Breakbeat',
          duration: dnb.duration,
          color: '#f59e0b',
          audioBuffer: dnb.audioBuffer,
        };

        const trackTracerRacer: Track = {
          id: 'vjd-5',
          title: 'TRACER RACER',
          artist: '1c3dr4g0n',
          bpm: 86.5,
          genre: 'Cyberpunk',
          duration: funk.duration,
          color: '#8b5cf6',
          audioBuffer: funk.audioBuffer,
        };

        const tracks = [
          trackBumbleBee,
          trackFuzzyButt,
          trackGoodnight,
          trackTrumpIsATwat,
          trackTracerRacer,
          house,
          synthwave,
          hiphop,
          dnb,
          funk,
        ];

        setAvailableTracks(tracks);

        // Preload decks with default tracks
        const presetMapping: Record<DeckId, Track> = {
          A: trackBumbleBee,
          B: trackFuzzyButt,
          C: trackGoodnight,
          D: trackTrumpIsATwat,
          E: trackTracerRacer,
          F: house,
          G: synthwave,
          H: hiphop,
        };

        for (const d of ALL_DECKS) {
          const t = presetMapping[d];
          if (t && t.audioBuffer) {
            audioEngine.loadTrack(d, t.audioBuffer, t);
          }
        }

        // Setup Sampler SFX Pads
        const sfx = createSFXBuffers(audioEngine.ctx);
        audioEngine.setSFXBuffers(sfx);
      }
    } catch (e) {
      console.error('Audio initialization error:', e);
    }
  };

  // Handle local user MP3/WAV file uploads
  const handleFileUpload = async (deckId: DeckId, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAudioUnlocked) await handleUnlockAudio();
    const file = e.target.files?.[0];
    if (!file || !audioEngine.ctx) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await audioEngine.ctx.decodeAudioData(arrayBuffer);

      const customTrack: Track = {
        id: `upload-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local File',
        bpm: 124,
        genre: 'Desktop MP3/WAV',
        duration: decodedBuffer.duration,
        color: '#3b82f6',
        audioBuffer: decodedBuffer,
      };

      setAvailableTracks((prev) => [customTrack, ...prev]);
      audioEngine.loadTrack(deckId, decodedBuffer, customTrack);
    } catch (err) {
      alert('Could not decode audio file. Please upload a valid MP3 or WAV file.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090305] text-slate-100 flex flex-col font-sans select-none relative">
      {/* Visual Overlay when user drags audio file from Desktop filesystem */}
      {isDragOverWindow && (
        <div className="fixed inset-0 z-50 bg-red-950/90 backdrop-blur-md border-4 border-dashed border-amber-400 flex flex-col items-center justify-center pointer-events-none animate-pulse">
          <div className="p-6 bg-[#0a0204] rounded-xl border border-amber-500 shadow-2xl flex flex-col items-center gap-3">
            <span className="text-4xl">🐉</span>
            <h2 className="text-xl font-black text-amber-400 font-mono">
              DROP AUDIO FILE TO LOAD ON DECK A
            </h2>
            <p className="text-xs text-rose-200">
              Supports MP3, WAV, FLAC, OGG, M4A local audio files
            </p>
          </div>
        </div>
      )}

      {/* Desktop Window Frame & Header Bar */}
      <DesktopTitleBar
        onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenBroadcast={() => setIsBroadcastOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenYouTubeModal={() => setIsYouTubeOpen(true)}
        isAudioUnlocked={isAudioUnlocked}
        onUnlockAudio={handleUnlockAudio}
        isBroadcasting={isBroadcasting}
        deckStates={deckStates}
        activeDeckCount={activeDeckCount}
        onSelectDeckCount={handleSelectDeckCount}
      />

      {/* Main STIL DJ STUDIO PRO Workstation Layout */}
      <main className="flex-1 w-full flex flex-col gap-1 p-1 max-w-[1920px] mx-auto overflow-y-auto">
        {/* Decks & Mixer Pairs Render Section */}
        <section className="w-full flex flex-col items-center gap-0.5">
          {deckLayout === 'grid' && (
            <div className={`flex flex-col w-full items-center ${activeDeckCount > 2 ? 'gap-0.5' : 'gap-0.5'}`}>
              {([
                ['A', 'B'],
                ['C', 'D'],
                ['E', 'F'],
                ['G', 'H'],
              ] as const).map(([leftId, rightId], index) => {
                if (!activeDecks.includes(leftId)) return null;

                const isCompact = activeDeckCount > 2;

                return (
                  <div
                    key={index}
                    className="flex flex-col xl:flex-row items-stretch justify-between bg-[#110508] border border-[#3a1015] rounded-none shadow-xl w-full p-0 gap-0"
                  >
                    {/* Left Deck (Deck A / C / E / G) */}
                    <div className="w-full xl:w-auto flex-1 flex flex-col min-h-0">
                      <TurntableDeck
                        deckId={leftId}
                        state={deckStates[leftId]}
                        allDeckStates={deckStates}
                        availableTracks={availableTracks}
                        onSelectTrack={(track) => {
                          if (track.audioBuffer) audioEngine.loadTrack(leftId, track.audioBuffer, track);
                        }}
                        onFileUpload={(e) => handleFileUpload(leftId, e)}
                        onOpenYouTubeModal={() => setIsYouTubeOpen(true)}
                        isCompact={isCompact}
                      />
                    </div>

                    {/* Center Mixer Pair: Mixer Left & STIL DJ Center Master (only for Deck A/B) & Mixer Right */}
                    <div className="flex items-stretch justify-center bg-[#070204] rounded-none border border-[#3a1015] shrink-0 p-0 gap-[1px]">
                      <MixerChannelStrip deckId={leftId} deckState={deckStates[leftId]} isCompact={isCompact} />
                      {index === 0 ? (
                        <StilDJCenterMixer mixerState={mixerState} onOpenBroadcast={() => setIsBroadcastOpen(true)} isCompact={isCompact} />
                      ) : (
                        <div className="w-px bg-[#232736] my-auto h-full hidden sm:block"></div>
                      )}
                      <MixerChannelStrip deckId={rightId} deckState={deckStates[rightId]} isCompact={isCompact} />
                    </div>

                    {/* Right Deck (Deck B / D / F / H) */}
                    <div className="w-full xl:w-auto flex-1 flex flex-col min-h-0">
                      <TurntableDeck
                        deckId={rightId}
                        state={deckStates[rightId]}
                        allDeckStates={deckStates}
                        availableTracks={availableTracks}
                        onSelectTrack={(track) => {
                          if (track.audioBuffer) audioEngine.loadTrack(rightId, track.audioBuffer, track);
                        }}
                        onFileUpload={(e) => handleFileUpload(rightId, e)}
                        onOpenYouTubeModal={() => setIsYouTubeOpen(true)}
                        isCompact={isCompact}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {deckLayout === 'split' && (
            <div className={`flex flex-col w-full items-center ${activeDeckCount > 2 ? 'gap-1' : 'gap-2'}`}>
              <div className="w-full text-center">
                <h3 className="text-[10px] font-black uppercase text-blue-400 mb-0.5 tracking-widest text-center font-mono">
                  DECK BANK 1 (DECKS {activeDecks[0]} - {activeDecks[Math.ceil(activeDeckCount / 2) - 1]})
                </h3>
                <div className={`grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto ${activeDeckCount > 2 ? 'gap-1' : 'gap-2'}`}>
                  {activeDecks.slice(0, Math.ceil(activeDeckCount / 2)).map((d) => (
                    <TurntableDeck
                      key={d}
                      deckId={d}
                      state={deckStates[d]}
                      allDeckStates={deckStates}
                      availableTracks={availableTracks}
                      onSelectTrack={(track) => {
                        if (track.audioBuffer) audioEngine.loadTrack(d, track.audioBuffer, track);
                      }}
                      onFileUpload={(e) => handleFileUpload(d, e)}
                      isCompact={activeDeckCount > 2}
                    />
                  ))}
                </div>
              </div>

              <div className="w-full text-center">
                <h3 className="text-[10px] font-black uppercase text-purple-400 mb-0.5 tracking-widest text-center font-mono">
                  DECK BANK 2 (DECKS {activeDecks[Math.ceil(activeDeckCount / 2)]} - {activeDecks[activeDecks.length - 1]})
                </h3>
                <div className={`grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto ${activeDeckCount > 2 ? 'gap-1' : 'gap-2'}`}>
                  {activeDecks.slice(Math.ceil(activeDeckCount / 2)).map((d) => (
                    <TurntableDeck
                      key={d}
                      deckId={d}
                      state={deckStates[d]}
                      allDeckStates={deckStates}
                      availableTracks={availableTracks}
                      onSelectTrack={(track) => {
                        if (track.audioBuffer) audioEngine.loadTrack(d, track.audioBuffer, track);
                      }}
                      onFileUpload={(e) => handleFileUpload(d, e)}
                      isCompact={activeDeckCount > 2}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {deckLayout === 'focus' && (
            <div className="flex flex-col xl:flex-row items-center justify-between gap-2 bg-[#11131a] border border-[#232736] rounded-none p-1 shadow-xl w-full max-w-6xl">
              <div className="w-full xl:w-auto flex-1">
                <TurntableDeck
                  deckId={focusDeckA}
                  state={deckStates[focusDeckA]}
                  allDeckStates={deckStates}
                  availableTracks={availableTracks}
                  onSelectTrack={(track) => {
                    if (track.audioBuffer) audioEngine.loadTrack(focusDeckA, track.audioBuffer, track);
                  }}
                  onFileUpload={(e) => handleFileUpload(focusDeckA, e)}
                />
              </div>

              <div className="flex items-center justify-center gap-1 bg-[#090a0f] p-1 rounded border border-[#232736] shrink-0">
                <MixerChannelStrip deckId={focusDeckA} deckState={deckStates[focusDeckA]} />
                <div className="w-px h-64 bg-[#232736] my-auto hidden sm:block"></div>
                <MixerChannelStrip deckId={focusDeckB} deckState={deckStates[focusDeckB]} />
              </div>

              <div className="w-full xl:w-auto flex-1">
                <TurntableDeck
                  deckId={focusDeckB}
                  state={deckStates[focusDeckB]}
                  allDeckStates={deckStates}
                  availableTracks={availableTracks}
                  onSelectTrack={(track) => {
                    if (track.audioBuffer) audioEngine.loadTrack(focusDeckB, track.audioBuffer, track);
                  }}
                  onFileUpload={(e) => handleFileUpload(focusDeckB, e)}
                />
              </div>
            </div>
          )}
        </section>

        {/* Sampler SFX Controls */}
        <section className="w-full">
          <SamplerPads />
        </section>

        {/* Bottom STIL DJ STUDIO PRO File Browser */}
        <section className="w-full mt-1">
          <FileBrowser
            tracks={availableTracks}
            activeDeckCount={activeDeckCount}
            onSelectTrackForDeck={(deckId, track) => {
              if (track.audioBuffer) audioEngine.loadTrack(deckId, track.audioBuffer, track);
            }}
            onFileUpload={handleFileUpload}
            onOpenYouTubeModal={() => setIsYouTubeOpen(true)}
          />
        </section>
      </main>

      {/* Architecture Tutorial Modal */}
      <ArchitectureGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Shoutcast & Icecast Live Broadcast Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        isAudioUnlocked={isAudioUnlocked}
        onUnlockAudio={handleUnlockAudio}
      />

      {/* Studio Settings & Hardware Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeDeckCount={activeDeckCount}
        onSelectDeckCount={handleSelectDeckCount}
        deckLayout={deckLayout}
        onSelectDeckLayout={setDeckLayout}
        focusDeckA={focusDeckA}
        onSelectFocusDeckA={setFocusDeckA}
        focusDeckB={focusDeckB}
        onSelectFocusDeckB={setFocusDeckB}
        isAudioUnlocked={isAudioUnlocked}
        onUnlockAudio={handleUnlockAudio}
      />

      {/* YouTube Stream & MP3 Converter Modal */}
      <YouTubeModal
        isOpen={isYouTubeOpen}
        onClose={() => setIsYouTubeOpen(false)}
        activeDeckCount={activeDeckCount}
        onLoadYouTubeTrack={(deckId, track) => {
          setAvailableTracks((prev) => [track, ...prev]);
          if (track.audioBuffer) {
            audioEngine.loadTrack(deckId, track.audioBuffer, track);
          }
        }}
      />

      {/* Desktop Mode & Executable Modal */}
      <DesktopModal isOpen={isDesktopModalOpen} onClose={() => setIsDesktopModalOpen(false)} />

      {/* Desktop Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}

