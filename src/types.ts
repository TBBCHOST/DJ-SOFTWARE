export type DeckId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
export type CrossfaderAssign = 'left' | 'right' | 'thru';

export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  genre: string;
  duration: number; // in seconds
  color: string;
  audioBuffer?: AudioBuffer;
  isSynthesized?: boolean;
  youtubeUrl?: string;
  youtubeVideoId?: string;
}

export interface HotCue {
  id: number;
  time: number; // in seconds
  color: string;
}

export type CrossfaderCurve = 'linear' | 'smooth' | 'cut';

export interface StemsState {
  vocals: boolean;
  drums: boolean;
  bass: boolean;
  melody: boolean;
  vocalLevel: number;
  drumLevel: number;
  bassLevel: number;
  melodyLevel: number;
}

export interface DeckState {
  id: DeckId;
  crossfaderAssign: CrossfaderAssign;
  isPlaying: boolean;
  isScratching: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number; // 0.5 to 1.5 (1 = 100% normal speed)
  pitchLock: boolean;
  volume: number; // 0 to 1
  gain: number; // 0 to 2
  bpm: number;
  originalBpm: number;
  hotCues: (HotCue | null)[];
  loopActive: boolean;
  loopLength: number; // in beats (e.g., 0.25, 0.5, 1, 2, 4, 8, 16)
  loopStart: number | null;
  eqLow: number; // -24dB to +12dB (0 = flat)
  eqMid: number; // -24dB to +12dB
  eqHigh: number; // -24dB to +12dB
  filterCutoff: number; // -1 to +1 (-1 = LP filter, 0 = bypassed, +1 = HP filter)
  fxEcho: boolean;
  fxEchoWet: number; // 0 to 1
  fxReverb: boolean;
  fxReverbWet: number; // 0 to 1
  fxFilter: boolean;
  headphoneCue: boolean;
  stems: StemsState;
  track: Track | null;
}

export interface MixerState {
  crossfader: number; // -1 (Deck A) to 0 (Center) to 1 (Deck B)
  crossfaderCurve: CrossfaderCurve;
  masterVolume: number; // 0 to 1
  headphoneVolume: number; // 0 to 1
  headphoneMix: number; // 0 (Cue) to 1 (Master)
}

export interface SoundEffect {
  id: string;
  name: string;
  key: string;
  category: 'sfx' | 'drums' | 'vox';
  color: string;
}

export type BroadcastServerType = 'icecast2' | 'shoutcast' | 'shoutcast2' | 'webstream';
export type AudioFormat = 'audio/webm;codecs=opus' | 'audio/ogg;codecs=opus' | 'audio/mpeg';

export interface BroadcastConfig {
  serverType: BroadcastServerType;
  host: string;
  port: number;
  mount: string; // e.g. /stream or /live
  password: string;
  username: string; // e.g. source or admin
  stationName: string;
  stationGenre: string;
  stationDescription: string;
  stationUrl: string;
  bitrate: number; // e.g. 128, 192, 256, 320 kbps
  format: AudioFormat;
  autoIcyMetadata: boolean;
  webSocketProxyUrl?: string;
}

export interface BroadcastLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'metadata';
  message: string;
}

export interface BroadcastStatus {
  isBroadcasting: boolean;
  isConnecting: boolean;
  error: string | null;
  durationSeconds: number;
  bytesSent: number;
  currentTrackTitle: string;
  listenersCount: number;
  peakLevel: number;
  serverType: BroadcastServerType;
  stationName: string;
  mountUrl: string;
}
