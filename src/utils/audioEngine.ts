import { DeckState, MixerState, CrossfaderCurve, HotCue, DeckId, CrossfaderAssign } from '../types';

export const ALL_DECKS: DeckId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export class AudioEngine {
  public ctx: AudioContext | null = null;

  // Master Nodes
  private masterGain: GainNode | null = null;
  private masterAnalyser: AnalyserNode | null = null;
  private recDestination: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  // Deck Nodes & State for 8 Decks
  private decks: Record<DeckId, {
    source: AudioBufferSourceNode | null;
    gainNode: GainNode;
    trimNode: GainNode;
    eqLow: BiquadFilterNode;
    eqMid: BiquadFilterNode;
    eqHigh: BiquadFilterNode;
    filterNode: BiquadFilterNode;
    echoDelay: DelayNode;
    echoFeedback: GainNode;
    echoWet: GainNode;
    crossfaderGain: GainNode;
    analyser: AnalyserNode;
    cueGain: GainNode;
    
    // Playback state tracking
    buffer: AudioBuffer | null;
    startTime: number; // AudioContext time when playback started
    startOffset: number; // Buffer position offset in seconds
    isPlaying: boolean;
    playbackRate: number;
    isScratching: boolean;
    scratchVelocity: number;
  }> | null = null;

  // Mixers State
  public mixerState: MixerState = {
    crossfader: 0,
    crossfaderCurve: 'smooth',
    masterVolume: 0.85,
    headphoneVolume: 0.8,
    headphoneMix: 0.5,
  };

  public deckStates: Record<DeckId, DeckState> = {
    A: this.getInitialDeckState('A'),
    B: this.getInitialDeckState('B'),
    C: this.getInitialDeckState('C'),
    D: this.getInitialDeckState('D'),
    E: this.getInitialDeckState('E'),
    F: this.getInitialDeckState('F'),
    G: this.getInitialDeckState('G'),
    H: this.getInitialDeckState('H'),
  };

  private listeners: Set<() => void> = new Set();
  private sfxBuffers: Record<string, AudioBuffer> = {};
  private playbackAnimFrame: number | null = null;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  private startPlaybackLoop() {
    if (this.playbackAnimFrame !== null) return;

    const tick = () => {
      let anyPlaying = false;
      for (const d of ALL_DECKS) {
        if (this.deckStates[d].isPlaying) {
          anyPlaying = true;
          const time = this.getDeckCurrentTime(d);
          this.deckStates[d].currentTime = time;

          // Check loop boundaries
          const state = this.deckStates[d];
          if (state.loopActive && state.loopStart !== null && state.bpm > 0) {
            const loopDurationSec = (60 / state.bpm) * state.loopLength;
            if (time >= state.loopStart + loopDurationSec) {
              this.seekDeck(d, state.loopStart);
            }
          }
        }
      }
      this.notify();

      if (anyPlaying) {
        this.playbackAnimFrame = requestAnimationFrame(tick);
      } else {
        this.playbackAnimFrame = null;
      }
    };

    this.playbackAnimFrame = requestAnimationFrame(tick);
  }

  private getInitialDeckState(id: DeckId): DeckState {
    const defaultAssign: CrossfaderAssign = ['A', 'C', 'E', 'G'].includes(id) ? 'left' : 'right';
    return {
      id,
      crossfaderAssign: defaultAssign,
      isPlaying: false,
      isScratching: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1.0,
      pitchLock: false,
      volume: 0.85,
      gain: 1.0,
      bpm: 124,
      originalBpm: 124,
      hotCues: [null, null, null, null],
      loopActive: false,
      loopLength: 4,
      loopStart: null,
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      filterCutoff: 0,
      fxEcho: false,
      fxEchoWet: 0.4,
      fxReverb: false,
      fxReverbWet: 0.3,
      fxFilter: false,
      headphoneCue: false,
      stems: {
        vocals: true,
        drums: true,
        bass: true,
        melody: true,
        vocalLevel: 1.0,
        drumLevel: 1.0,
        bassLevel: 1.0,
        melodyLevel: 1.0,
      },
      track: null,
    };
  }

  public async initAudioContext(): Promise<void> {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.mixerState.masterVolume;

    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 256;

    this.masterGain.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.ctx.destination);

    // MediaRecorder Stream destination for recording mixes
    this.recDestination = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(this.recDestination);

    // Setup Decks A through H
    const deckMap = {} as Record<DeckId, any>;
    for (const d of ALL_DECKS) {
      deckMap[d] = this.createDeckPipeline(d);
    }
    this.decks = deckMap;

    this.updateCrossfaderGains();
  }

  private createDeckPipeline(deckId: DeckId) {
    if (!this.ctx || !this.masterGain) throw new Error('AudioContext not initialized');

    const gainNode = this.ctx.createGain(); // Track Volume slider
    const trimNode = this.ctx.createGain(); // Trim/Gain knob

    // 3-Band EQ Nodes
    const eqLow = this.ctx.createBiquadFilter();
    eqLow.type = 'lowshelf';
    eqLow.frequency.value = 250;

    const eqMid = this.ctx.createBiquadFilter();
    eqMid.type = 'peaking';
    eqMid.frequency.value = 1000;
    eqMid.Q.value = 1.0;

    const eqHigh = this.ctx.createBiquadFilter();
    eqHigh.type = 'highshelf';
    eqHigh.frequency.value = 4000;

    // Filter Node (Lowpass / Highpass Sweep)
    const filterNode = this.ctx.createBiquadFilter();
    filterNode.type = 'allpass'; // bypassed by default

    // Echo FX
    const echoDelay = this.ctx.createDelay();
    echoDelay.delayTime.value = 0.375; // 3/16th beat delay
    const echoFeedback = this.ctx.createGain();
    echoFeedback.gain.value = 0.4;
    const echoWet = this.ctx.createGain();
    echoWet.gain.value = 0; // Off initially

    echoDelay.connect(echoFeedback);
    echoFeedback.connect(echoDelay);
    echoDelay.connect(echoWet);

    // Crossfader Gain
    const crossfaderGain = this.ctx.createGain();

    // Cue Gain
    const cueGain = this.ctx.createGain();
    cueGain.gain.value = 0;

    // Analyser
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 128;

    // Chain: Source -> Trim -> EQ Low -> EQ Mid -> EQ High -> Filter -> Volume Gain -> Crossfader Gain -> Master Gain
    trimNode.connect(eqLow);
    eqLow.connect(eqMid);
    eqMid.connect(eqHigh);
    eqHigh.connect(filterNode);
    filterNode.connect(gainNode);

    // Echo parallel routing
    filterNode.connect(echoDelay);
    echoWet.connect(gainNode);

    gainNode.connect(crossfaderGain);
    crossfaderGain.connect(analyser);
    analyser.connect(this.masterGain);

    return {
      source: null,
      gainNode,
      trimNode,
      eqLow,
      eqMid,
      eqHigh,
      filterNode,
      echoDelay,
      echoFeedback,
      echoWet,
      crossfaderGain,
      analyser,
      cueGain,
      buffer: null,
      startTime: 0,
      startOffset: 0,
      isPlaying: false,
      playbackRate: 1.0,
      isScratching: false,
      scratchVelocity: 0,
    };
  }

  public setSFXBuffers(buffers: Record<string, AudioBuffer>) {
    this.sfxBuffers = buffers;
  }

  public playSFX(sfxKey: string) {
    if (!this.ctx || !this.sfxBuffers[sfxKey] || !this.masterGain) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.sfxBuffers[sfxKey];
    src.connect(this.masterGain);
    src.start();
  }

  public getDeckAnalyserData(deckId: DeckId, dataArray: Uint8Array): void {
    if (this.decks && this.decks[deckId] && this.decks[deckId].analyser) {
      this.decks[deckId].analyser.getByteFrequencyData(dataArray);
    } else {
      dataArray.fill(0);
    }
  }

  public getMasterAnalyserData(dataArray: Uint8Array): void {
    if (this.masterAnalyser) {
      this.masterAnalyser.getByteFrequencyData(dataArray);
    } else {
      dataArray.fill(0);
    }
  }

  // Load track into deck
  public loadTrack(deckId: DeckId, audioBuffer: AudioBuffer, trackInfo: any) {
    if (!this.decks) return;
    const deck = this.decks[deckId];
    this.stopDeck(deckId);

    deck.buffer = audioBuffer;
    deck.startOffset = 0;
    deck.startTime = 0;
    deck.isPlaying = false;

    this.deckStates[deckId].duration = audioBuffer.duration;
    this.deckStates[deckId].currentTime = 0;
    this.deckStates[deckId].track = trackInfo;
    this.deckStates[deckId].bpm = trackInfo.bpm || 124;
    this.deckStates[deckId].originalBpm = trackInfo.bpm || 124;

    this.notify();
  }

  public playDeck(deckId: DeckId) {
    if (!this.ctx || !this.decks) return;
    const deck = this.decks[deckId];
    if (!deck.buffer) return;

    if (deck.isPlaying) return; // Already playing

    // Create source node
    const source = this.ctx.createBufferSource();
    source.buffer = deck.buffer;
    source.playbackRate.value = this.deckStates[deckId].playbackRate;

    source.connect(deck.trimNode);

    const offset = deck.startOffset % deck.buffer.duration;
    source.start(0, offset);

    deck.source = source;
    deck.startTime = this.ctx.currentTime;
    deck.isPlaying = true;
    this.deckStates[deckId].isPlaying = true;

    this.startPlaybackLoop();

    // Setup ended event listener
    source.onended = () => {
      if (deck.isPlaying && !deck.isScratching) {
        deck.isPlaying = false;
        this.deckStates[deckId].isPlaying = false;
        deck.startOffset = 0;
        this.notify();
      }
    };

    this.notify();
  }

  public pauseDeck(deckId: DeckId) {
    if (!this.decks || !this.ctx) return;
    const deck = this.decks[deckId];
    if (!deck.isPlaying) return;

    deck.startOffset = this.getDeckCurrentTime(deckId);
    this.stopDeckSource(deckId);
    deck.isPlaying = false;
    this.deckStates[deckId].isPlaying = false;
    this.notify();
  }

  public stopDeck(deckId: DeckId) {
    if (!this.decks) return;
    const deck = this.decks[deckId];
    this.stopDeckSource(deckId);
    deck.startOffset = 0;
    deck.isPlaying = false;
    this.deckStates[deckId].isPlaying = false;
    this.deckStates[deckId].currentTime = 0;
    this.notify();
  }

  private stopDeckSource(deckId: DeckId) {
    if (!this.decks) return;
    const deck = this.decks[deckId];
    if (deck.source) {
      try {
        deck.source.stop();
        deck.source.disconnect();
      } catch (e) {
        // Source might already be stopped
      }
      deck.source = null;
    }
  }

  public seekDeck(deckId: DeckId, time: number) {
    if (!this.decks) return;
    const deck = this.decks[deckId];
    if (!deck.buffer) return;

    const clampedTime = Math.max(0, Math.min(deck.buffer.duration, time));
    const wasPlaying = deck.isPlaying;

    if (wasPlaying) {
      this.stopDeckSource(deckId);
      deck.startOffset = clampedTime;
      deck.isPlaying = false;
      this.playDeck(deckId);
    } else {
      deck.startOffset = clampedTime;
      this.deckStates[deckId].currentTime = clampedTime;
      this.notify();
    }
  }

  // Real-time vinyl scratching velocity handling
  public setScratchVelocity(deckId: DeckId, velocity: number) {
    if (!this.decks || !this.ctx) return;
    const deck = this.decks[deckId];
    if (!deck.buffer) return;

    deck.isScratching = true;
    deck.scratchVelocity = velocity;
    this.deckStates[deckId].isScratching = true;

    if (deck.source && deck.source.playbackRate) {
      const rate = Math.max(-3.0, Math.min(3.0, velocity * 1.5));
      deck.source.playbackRate.setValueAtTime(Math.abs(rate) < 0.05 ? 0.001 : rate, this.ctx.currentTime);
    }
  }

  public stopScratch(deckId: DeckId) {
    if (!this.decks || !this.ctx) return;
    const deck = this.decks[deckId];
    deck.isScratching = false;
    deck.scratchVelocity = 0;
    this.deckStates[deckId].isScratching = false;

    if (deck.source && deck.source.playbackRate) {
      deck.source.playbackRate.setValueAtTime(this.deckStates[deckId].playbackRate, this.ctx.currentTime);
    }

    if (!this.deckStates[deckId].isPlaying) {
      this.pauseDeck(deckId);
    }
    this.notify();
  }

  public getDeckCurrentTime(deckId: DeckId): number {
    if (!this.decks || !this.ctx) return 0;
    const deck = this.decks[deckId];
    if (!deck.buffer) return 0;

    if (deck.isPlaying && deck.source) {
      const elapsed = (this.ctx.currentTime - deck.startTime) * this.deckStates[deckId].playbackRate;
      return (deck.startOffset + elapsed) % deck.buffer.duration;
    }
    return deck.startOffset;
  }

  // Pitch / Tempo Adjustment
  public setPlaybackRate(deckId: DeckId, rate: number) {
    const clampedRate = Math.max(0.5, Math.min(1.5, rate));
    this.deckStates[deckId].playbackRate = clampedRate;
    this.deckStates[deckId].bpm = Math.round(this.deckStates[deckId].originalBpm * clampedRate);

    if (this.decks) {
      const deck = this.decks[deckId];
      if (deck.source && deck.source.playbackRate && !deck.isScratching) {
        deck.source.playbackRate.setValueAtTime(clampedRate, this.ctx?.currentTime || 0);
      }
    }
    this.notify();
  }

  // Get Master BPM deck info for BPM auto-syncing
  public getMasterBpmDeck(excludeDeckId?: DeckId): { deckId: DeckId; bpm: number; trackTitle?: string } | null {
    // 1. Find playing decks with a track loaded
    const playingDecks = ALL_DECKS.filter(
      (d) => d !== excludeDeckId && this.deckStates[d]?.isPlaying && this.deckStates[d]?.track
    );

    if (playingDecks.length > 0) {
      let bestDeck = playingDecks[0];
      let maxGain = -1;
      for (const d of playingDecks) {
        const g = this.deckStates[d].gain;
        if (g > maxGain) {
          maxGain = g;
          bestDeck = d;
        }
      }
      return {
        deckId: bestDeck,
        bpm: this.deckStates[bestDeck].bpm,
        trackTitle: this.deckStates[bestDeck].track?.title,
      };
    }

    // 2. Find any loaded deck with a track
    const loadedDecks = ALL_DECKS.filter(
      (d) => d !== excludeDeckId && this.deckStates[d]?.track
    );
    if (loadedDecks.length > 0) {
      const bestDeck = loadedDecks[0];
      return {
        deckId: bestDeck,
        bpm: this.deckStates[bestDeck].bpm,
        trackTitle: this.deckStates[bestDeck].track?.title,
      };
    }

    return null;
  }

  // Pitch Sync deck to masterDeck or auto-detected Master Track
  public syncDeckBpm(targetDeck: DeckId, masterDeck?: DeckId): { syncedBpm: number; masterDeckId: DeckId } | null {
    let targetMaster = masterDeck;
    if (!targetMaster) {
      const info = this.getMasterBpmDeck(targetDeck);
      if (info) {
        targetMaster = info.deckId;
      }
    }

    if (!targetMaster || targetMaster === targetDeck) return null;

    const masterBpm = this.deckStates[targetMaster].bpm;
    const targetOrigBpm = this.deckStates[targetDeck].originalBpm;
    if (!targetOrigBpm) return null;

    const neededRate = masterBpm / targetOrigBpm;
    this.setPlaybackRate(targetDeck, neededRate);

    return { syncedBpm: masterBpm, masterDeckId: targetMaster };
  }

  // EQ Adjustments (-24dB to +12dB)
  public setEq(deckId: DeckId, band: 'low' | 'mid' | 'high', dbValue: number) {
    this.deckStates[deckId][`eq${band === 'low' ? 'Low' : band === 'mid' ? 'Mid' : 'High'}`] = dbValue;
    if (!this.decks) return;

    const deck = this.decks[deckId];
    const node = band === 'low' ? deck.eqLow : band === 'mid' ? deck.eqMid : deck.eqHigh;
    node.gain.setValueAtTime(dbValue, this.ctx?.currentTime || 0);
    this.notify();
  }

  // Resonant Filter Cutoff (-1 to +1)
  public setFilterCutoff(deckId: DeckId, val: number) {
    this.deckStates[deckId].filterCutoff = val;
    if (!this.decks || !this.ctx) return;

    const deck = this.decks[deckId];
    if (Math.abs(val) < 0.05) {
      deck.filterNode.type = 'allpass'; // bypassed
    } else if (val < 0) {
      // Lowpass Filter (sweep down)
      deck.filterNode.type = 'lowpass';
      const freq = 200 + (1 + val) * 8000; // 200Hz to 8200Hz
      deck.filterNode.frequency.setValueAtTime(freq, this.ctx.currentTime);
      deck.filterNode.Q.setValueAtTime(2.5, this.ctx.currentTime);
    } else {
      // Highpass Filter (sweep up)
      deck.filterNode.type = 'highpass';
      const freq = val * 6000; // 0Hz to 6000Hz
      deck.filterNode.frequency.setValueAtTime(freq, this.ctx.currentTime);
      deck.filterNode.Q.setValueAtTime(2.5, this.ctx.currentTime);
    }
    this.notify();
  }

  // Stem Isolation & Stem Gain Controls
  public toggleStemMute(deckId: DeckId, stem: 'vocals' | 'drums' | 'bass' | 'melody') {
    if (!this.deckStates[deckId].stems) {
      this.deckStates[deckId].stems = {
        vocals: true, drums: true, bass: true, melody: true,
        vocalLevel: 1.0, drumLevel: 1.0, bassLevel: 1.0, melodyLevel: 1.0,
      };
    }
    const current = this.deckStates[deckId].stems[stem];
    this.deckStates[deckId].stems[stem] = !current;
    this.applyStemFilters(deckId);
    this.notify();
  }

  public setStemLevel(deckId: DeckId, stem: 'vocals' | 'drums' | 'bass' | 'melody', level: number) {
    if (!this.deckStates[deckId].stems) return;
    const clamped = Math.max(0, Math.min(1, level));
    const levelKey = `${stem === 'vocals' ? 'vocal' : stem === 'drums' ? 'drum' : stem}Level` as keyof typeof this.deckStates[DeckId]['stems'];
    (this.deckStates[deckId].stems as any)[levelKey] = clamped;
    this.applyStemFilters(deckId);
    this.notify();
  }

  public isolateStem(deckId: DeckId, soloStem: 'vocals' | 'drums' | 'bass' | 'melody') {
    if (!this.deckStates[deckId].stems) return;
    const stems = this.deckStates[deckId].stems;
    stems.vocals = soloStem === 'vocals';
    stems.drums = soloStem === 'drums';
    stems.bass = soloStem === 'bass';
    stems.melody = soloStem === 'melody';
    this.applyStemFilters(deckId);
    this.notify();
  }

  public resetStems(deckId: DeckId) {
    if (!this.deckStates[deckId].stems) return;
    this.deckStates[deckId].stems = {
      vocals: true, drums: true, bass: true, melody: true,
      vocalLevel: 1.0, drumLevel: 1.0, bassLevel: 1.0, melodyLevel: 1.0,
    };
    this.applyStemFilters(deckId);
    this.notify();
  }

  private applyStemFilters(deckId: DeckId) {
    const stems = this.deckStates[deckId].stems;
    if (!stems) return;

    // Apply real-time EQ & Filter adjustments based on stem isolation
    const lowDb = (!stems.bass ? -24 : (stems.bassLevel - 1) * 24);
    const midDb = (!stems.vocals || !stems.melody) 
      ? (!stems.vocals && !stems.melody ? -24 : -12) 
      : ((stems.vocalLevel + stems.melodyLevel) / 2 - 1) * 24;
    const highDb = (!stems.drums ? -20 : (stems.drumLevel - 1) * 20);

    // Update real-time EQ filters
    if (this.decks) {
      const deck = this.decks[deckId];
      if (deck) {
        deck.eqLow.gain.setValueAtTime(this.deckStates[deckId].eqLow + lowDb, this.ctx?.currentTime || 0);
        deck.eqMid.gain.setValueAtTime(this.deckStates[deckId].eqMid + midDb, this.ctx?.currentTime || 0);
        deck.eqHigh.gain.setValueAtTime(this.deckStates[deckId].eqHigh + highDb, this.ctx?.currentTime || 0);
      }
    }
  }

  // Volume & Gain controls
  public setDeckVolume(deckId: DeckId, volume: number) {
    this.deckStates[deckId].volume = volume;
    if (this.decks) {
      this.decks[deckId].gainNode.gain.setValueAtTime(volume, this.ctx?.currentTime || 0);
    }
    this.notify();
  }

  public setDeckTrim(deckId: DeckId, gain: number) {
    this.deckStates[deckId].gain = gain;
    if (this.decks) {
      this.decks[deckId].trimNode.gain.setValueAtTime(gain, this.ctx?.currentTime || 0);
    }
    this.notify();
  }

  // Echo FX toggle
  public toggleEchoFx(deckId: DeckId) {
    const active = !this.deckStates[deckId].fxEcho;
    this.deckStates[deckId].fxEcho = active;
    if (this.decks) {
      const wet = active ? this.deckStates[deckId].fxEchoWet : 0;
      this.decks[deckId].echoWet.gain.setValueAtTime(wet, this.ctx?.currentTime || 0);
    }
    this.notify();
  }

  // Crossfader Position (-1 to 1) & Assignment
  public setCrossfader(position: number) {
    this.mixerState.crossfader = Math.max(-1, Math.min(1, position));
    this.updateCrossfaderGains();
    this.notify();
  }

  public setCrossfaderCurve(curve: CrossfaderCurve) {
    this.mixerState.crossfaderCurve = curve;
    this.updateCrossfaderGains();
    this.notify();
  }

  public setCrossfaderAssign(deckId: DeckId, assign: CrossfaderAssign) {
    this.deckStates[deckId].crossfaderAssign = assign;
    this.updateCrossfaderGains();
    this.notify();
  }

  private updateCrossfaderGains() {
    if (!this.decks || !this.ctx) return;
    const x = (this.mixerState.crossfader + 1) / 2; // Normalize to 0 .. 1
    let gainL = 1;
    let gainR = 1;

    if (this.mixerState.crossfaderCurve === 'linear') {
      gainL = 1 - x;
      gainR = x;
    } else if (this.mixerState.crossfaderCurve === 'smooth') {
      // Equal power curve
      gainL = Math.cos(x * 0.5 * Math.PI);
      gainR = Math.sin(x * 0.5 * Math.PI);
    } else if (this.mixerState.crossfaderCurve === 'cut') {
      // Battle cut curve
      gainL = x > 0.9 ? (1 - x) * 10 : 1;
      gainR = x < 0.1 ? x * 10 : 1;
    }

    for (const d of ALL_DECKS) {
      const deck = this.decks[d];
      if (!deck) continue;

      const assign = this.deckStates[d].crossfaderAssign;
      let finalGain = 1.0;

      if (assign === 'left') {
        finalGain = gainL;
      } else if (assign === 'right') {
        finalGain = gainR;
      } else if (assign === 'thru') {
        finalGain = 1.0; // bypasses crossfader entirely
      }

      deck.crossfaderGain.gain.setValueAtTime(finalGain, this.ctx.currentTime);
    }
  }

  // Master Volume
  public setMasterVolume(vol: number) {
    this.mixerState.masterVolume = vol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
    this.notify();
  }

  // Hot Cue Management
  public toggleLoop(deckId: DeckId, lengthBeats = 4) {
    const state = this.deckStates[deckId];
    if (state.loopActive) {
      state.loopActive = false;
      state.loopStart = null;
    } else {
      state.loopActive = true;
      state.loopLength = lengthBeats;
      state.loopStart = this.getDeckCurrentTime(deckId);
    }
    this.notify();
  }

  public setLoopLength(deckId: DeckId, lengthBeats: number) {
    const state = this.deckStates[deckId];
    state.loopLength = lengthBeats;
    if (!state.loopActive) {
      state.loopActive = true;
      state.loopStart = this.getDeckCurrentTime(deckId);
    }
    this.notify();
  }

  public togglePitchLock(deckId: DeckId) {
    this.deckStates[deckId].pitchLock = !this.deckStates[deckId].pitchLock;
    this.notify();
  }

  public setHotCue(deckId: DeckId, index: number) {
    const currentTime = this.getDeckCurrentTime(deckId);
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
    const cue: HotCue = {
      id: index + 1,
      time: currentTime,
      color: colors[index % colors.length],
    };
    this.deckStates[deckId].hotCues[index] = cue;
    this.notify();
  }

  public jumpToHotCue(deckId: DeckId, index: number) {
    const cue = this.deckStates[deckId].hotCues[index];
    if (cue) {
      this.seekDeck(deckId, cue.time);
    } else {
      this.setHotCue(deckId, index);
    }
  }

  public clearHotCue(deckId: DeckId, index: number) {
    this.deckStates[deckId].hotCues[index] = null;
    this.notify();
  }

  public isRecording = false;

  public getStreamDestination(): MediaStreamAudioDestinationNode | null {
    return this.recDestination;
  }

  // Recording Mix
  public startRecording(): boolean {
    if (!this.recDestination) return false;
    this.recordedChunks = [];
    try {
      this.mediaRecorder = new MediaRecorder(this.recDestination.stream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };
      this.mediaRecorder.start();
      this.isRecording = true;
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to start MediaRecorder:', e);
      return false;
    }
  }

  public stopRecordingAndDownload(filename = 'My_Studio_DJ_Mix.webm') {
    if (!this.mediaRecorder) return;
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      this.isRecording = false;
      this.notify();
    };
    this.mediaRecorder.stop();
  }

  // Level Meter Peak Data
  public getLevelData(deckId?: DeckId): { peak: number; spectrum: Uint8Array } {
    let analyser = this.masterAnalyser;
    if (deckId && this.decks && this.decks[deckId]) {
      analyser = this.decks[deckId].analyser;
    }

    if (!analyser) return { peak: 0, spectrum: new Uint8Array(0) };

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    return { peak: average / 255, spectrum: dataArray };
  }

  // State Subscription Listener
  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }
}

export const audioEngine = new AudioEngine();
