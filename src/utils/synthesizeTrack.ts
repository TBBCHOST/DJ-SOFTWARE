import { Track } from '../types';

/**
 * Procedurally generates realistic, multi-instrument audio tracks using Web Audio API synthesis.
 * Generates drum patterns, basslines, synth chords, and sound elements into an AudioBuffer.
 */
export async function createSynthesizedTrack(
  audioCtx: AudioContext,
  style: 'house' | 'synthwave' | 'hiphop' | 'dnb' | 'funk'
): Promise<Track> {
  const sampleRate = audioCtx.sampleRate;
  
  let bpm = 124;
  let duration = 60; // 60 seconds loop
  let title = "House Groove 124";
  let artist = "Procedural Audio Synth";
  let genre = "House";
  let color = "#3b82f6"; // blue

  if (style === 'synthwave') {
    bpm = 110;
    title = "Retro Synth Pulse";
    genre = "Synthwave";
    color = "#ec4899"; // pink
  } else if (style === 'hiphop') {
    bpm = 92;
    title = "Boom Bap Chill Beat";
    genre = "Hip-Hop";
    color = "#eab308"; // yellow/amber
  } else if (style === 'dnb') {
    bpm = 174;
    title = "Cybernetic DnB Rush";
    genre = "Drum & Bass";
    color = "#8b5cf6"; // purple
  } else if (style === 'funk') {
    bpm = 118;
    title = "Disco Funk Jam";
    genre = "Nu-Disco";
    color = "#10b981"; // emerald
  }

  const numSamples = Math.floor(sampleRate * duration);
  const buffer = audioCtx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const secondsPerBeat = 60 / bpm;
  const totalBeats = Math.floor(duration / secondsPerBeat);

  // Generate track audio sample by sample in memory
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beat = t / secondsPerBeat;
    const currentBar = Math.floor(beat / 4);
    const beatInBar = beat % 4;
    const sixteenth = (beat * 4) % 16;

    let sampleL = 0;
    let sampleR = 0;

    // --- KICK DRUM ---
    // Kick pattern based on genre
    let isKick = false;
    let kickSubT = 0;
    
    if (style === 'house' || style === 'funk') {
      // 4-on-the-floor
      const kickDist = beatInBar % 1;
      if (kickDist < 0.25) {
        isKick = true;
        kickSubT = kickDist * secondsPerBeat;
      }
    } else if (style === 'synthwave') {
      // 4-on-the-floor with occasional syncopation
      const kickDist = beatInBar % 1;
      if (kickDist < 0.2) {
        isKick = true;
        kickSubT = kickDist * secondsPerBeat;
      }
    } else if (style === 'hiphop') {
      // Boom bap kick pattern: 1, 1.75, 3
      const bFrac = beatInBar;
      if (
        (bFrac >= 0 && bFrac < 0.2) ||
        (bFrac >= 2.5 && bFrac < 2.7) ||
        (bFrac >= 3.5 && bFrac < 3.7)
      ) {
        isKick = true;
        kickSubT = (bFrac % 0.5) * secondsPerBeat;
      }
    } else if (style === 'dnb') {
      // DnB kick on 1 and 2.5
      if ((beatInBar >= 0 && beatInBar < 0.25) || (beatInBar >= 2.5 && beatInBar < 2.75)) {
        isKick = true;
        kickSubT = (beatInBar % 0.5) * secondsPerBeat;
      }
    }

    if (isKick) {
      const env = Math.exp(-kickSubT * 28);
      const freq = 130 * Math.exp(-kickSubT * 35) + 40;
      const kickSound = Math.sin(2 * Math.PI * freq * kickSubT) * env * 0.9;
      sampleL += kickSound;
      sampleR += kickSound;
    }

    // --- SNARE / CLAP ---
    let isSnare = false;
    let snareSubT = 0;

    if (style === 'house' || style === 'funk') {
      // Claps/snare on 2 and 4
      if ((beatInBar >= 1 && beatInBar < 1.25) || (beatInBar >= 3 && beatInBar < 3.25)) {
        isSnare = true;
        snareSubT = (beatInBar % 1) * secondsPerBeat;
      }
    } else if (style === 'hiphop') {
      // Snare on 2 and 4
      if ((beatInBar >= 1 && beatInBar < 1.2) || (beatInBar >= 3 && beatInBar < 3.2)) {
        isSnare = true;
        snareSubT = (beatInBar % 1) * secondsPerBeat;
      }
    } else if (style === 'dnb') {
      // DnB snare on 1.5 and 3.5
      if ((beatInBar >= 1.5 && beatInBar < 1.75) || (beatInBar >= 3.5 && beatInBar < 3.75)) {
        isSnare = true;
        snareSubT = (beatInBar % 0.5) * secondsPerBeat;
      }
    } else if (style === 'synthwave') {
      if ((beatInBar >= 1 && beatInBar < 1.2) || (beatInBar >= 3 && beatInBar < 3.2)) {
        isSnare = true;
        snareSubT = (beatInBar % 1) * secondsPerBeat;
      }
    }

    if (isSnare) {
      const snareEnv = Math.exp(-snareSubT * 20);
      const noise = (Math.random() * 2 - 1) * snareEnv * 0.45;
      const tone = Math.sin(2 * Math.PI * 180 * snareSubT) * Math.exp(-snareSubT * 30) * 0.35;
      sampleL += noise + tone;
      sampleR += noise + tone;
    }

    // --- HI-HATS ---
    const hatStep = (beat * 4) % 1; // 16th notes
    if (hatStep < 0.15) {
      const hatT = hatStep * (secondsPerBeat / 4);
      const hatEnv = Math.exp(-hatT * 120);
      const isOffbeat = Math.floor(beat * 2) % 2 === 1; // offbeat hat
      const hatVol = isOffbeat ? 0.25 : 0.12;
      const hatNoise = (Math.random() * 2 - 1) * hatEnv * hatVol;
      sampleL += hatNoise;
      sampleR += hatNoise;
    }

    // --- BASSLINE ---
    // Chord progression notes (A minor / F / C / G)
    const chordProgressions = [220, 174.61, 130.81, 196.0]; // A3, F3, C3, G3 (Hz)
    const currentChordFreq = chordProgressions[currentBar % 4] / 2; // Sub bass frequency
    
    const bassNoteStep = Math.floor(beat * 2) % 8; // 8th note rhythmic pulse
    const bassEnv = Math.exp(-((beat * 2) % 1) * 6);
    
    // Sawtooth / Square bass oscillator calculation
    const bassPhase = (t * currentChordFreq) % 1;
    const bassWave = (bassPhase < 0.5 ? 1 : -1) * 0.25 * bassEnv;
    sampleL += bassWave;
    sampleR += bassWave;

    // --- SYNTH MELODY / CHORDS ---
    if (currentBar % 2 === 0 || currentBar % 4 === 3) {
      const melodyNotes = [440, 523.25, 659.25, 587.33, 392];
      const noteFreq = melodyNotes[Math.floor(sixteenth / 2) % melodyNotes.length];
      const melPhase = (t * noteFreq) % 1;
      const melEnv = Math.exp(-((sixteenth / 2) % 1) * 4) * 0.15;
      
      // Stereo panning on synth
      const melWaveL = Math.sin(2 * Math.PI * melPhase) * melEnv * 0.8;
      const melWaveR = Math.sin(2 * Math.PI * melPhase * 1.005) * melEnv * 0.8; // slight detune
      
      sampleL += melWaveL;
      sampleR += melWaveR;
    }

    // Gentle master limiter / soft clipping to keep clean dynamics
    left[i] = Math.max(-0.95, Math.min(0.95, sampleL));
    right[i] = Math.max(-0.95, Math.min(0.95, sampleR));
  }

  return {
    id: `synth-${style}-${Date.now()}`,
    title,
    artist,
    bpm,
    genre,
    duration,
    color,
    audioBuffer: buffer,
    isSynthesized: true,
  };
}

/**
 * Creates short SFX AudioBuffers for Sampler pads.
 */
export function createSFXBuffers(audioCtx: AudioContext): Record<string, AudioBuffer> {
  const sampleRate = audioCtx.sampleRate;
  const sfx: Record<string, AudioBuffer> = {};

  // 1. Air Horn
  const hornDur = 0.8;
  const hornBuf = audioCtx.createBuffer(1, sampleRate * hornDur, sampleRate);
  const hornData = hornBuf.getChannelData(0);
  for (let i = 0; i < hornData.length; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 2.2);
    const f1 = 370 + Math.sin(t * 40) * 15;
    const f2 = 466 + Math.sin(t * 40) * 20;
    hornData[i] = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t)) * 0.35 * env;
  }
  sfx['horn'] = hornBuf;

  // 2. Vinyl Brake / Scratch Burst
  const scratchDur = 0.5;
  const scratchBuf = audioCtx.createBuffer(1, sampleRate * scratchDur, sampleRate);
  const scratchData = scratchBuf.getChannelData(0);
  for (let i = 0; i < scratchData.length; i++) {
    const t = i / sampleRate;
    const freq = 1200 * Math.exp(-t * 6);
    const env = Math.sin((t / scratchDur) * Math.PI);
    scratchData[i] = Math.sin(2 * Math.PI * freq * t) * 0.4 * env;
  }
  sfx['scratch'] = scratchBuf;

  // 3. Laser Drop
  const laserDur = 0.4;
  const laserBuf = audioCtx.createBuffer(1, sampleRate * laserDur, sampleRate);
  const laserData = laserBuf.getChannelData(0);
  for (let i = 0; i < laserData.length; i++) {
    const t = i / sampleRate;
    const freq = 2200 * Math.exp(-t * 15);
    laserData[i] = Math.sin(2 * Math.PI * freq * t) * 0.4 * (1 - t / laserDur);
  }
  sfx['laser'] = laserBuf;

  // 4. Heavy Clap
  const clapDur = 0.3;
  const clapBuf = audioCtx.createBuffer(1, sampleRate * clapDur, sampleRate);
  const clapData = clapBuf.getChannelData(0);
  for (let i = 0; i < clapData.length; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 18);
    const burst = t < 0.06 ? Math.sin(t * 300) * 0.5 : 0;
    clapData[i] = ((Math.random() * 2 - 1) * env + burst) * 0.4;
  }
  sfx['clap'] = clapBuf;

  // 5. Dub Siren (Reggae Sound System Siren)
  const sirenDur = 0.9;
  const sirenBuf = audioCtx.createBuffer(1, sampleRate * sirenDur, sampleRate);
  const sirenData = sirenBuf.getChannelData(0);
  for (let i = 0; i < sirenData.length; i++) {
    const t = i / sampleRate;
    const lfo = Math.sin(2 * Math.PI * 6 * t); // 6 Hz pitch modulation
    const freq = 600 + lfo * 250;
    const env = Math.sin((t / sirenDur) * Math.PI);
    const wave = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1; // square wave siren
    sirenData[i] = wave * 0.25 * env;
  }
  sfx['siren'] = sirenBuf;

  // 6. Sub Bass Drop (Bass Impact)
  const subDur = 1.0;
  const subBuf = audioCtx.createBuffer(1, sampleRate * subDur, sampleRate);
  const subData = subBuf.getChannelData(0);
  for (let i = 0; i < subData.length; i++) {
    const t = i / sampleRate;
    const freq = 140 * Math.exp(-t * 4) + 25; // 140Hz down to sub 25Hz
    const env = Math.exp(-t * 2.5);
    subData[i] = Math.sin(2 * Math.PI * freq * t) * 0.6 * env;
  }
  sfx['subdrop'] = subBuf;

  // 7. TR-808 Snare Roll
  const snareDur = 0.45;
  const snareBuf = audioCtx.createBuffer(1, sampleRate * snareDur, sampleRate);
  const snareData = snareBuf.getChannelData(0);
  for (let i = 0; i < snareData.length; i++) {
    const t = i / sampleRate;
    const hitT = t % 0.1; // 100ms rapid double roll
    const env = Math.exp(-hitT * 35);
    const noise = (Math.random() * 2 - 1) * env * 0.35;
    const tone = Math.sin(2 * Math.PI * 180 * hitT) * Math.exp(-hitT * 40) * 0.3;
    snareData[i] = noise + tone;
  }
  sfx['snare'] = snareBuf;

  // 8. Vinyl Rewind / Backspin Tape Stop
  const rewindDur = 0.7;
  const rewindBuf = audioCtx.createBuffer(1, sampleRate * rewindDur, sampleRate);
  const rewindData = rewindBuf.getChannelData(0);
  for (let i = 0; i < rewindData.length; i++) {
    const t = i / sampleRate;
    const freq = 300 + (t / rewindDur) * 2800 * (1 + Math.sin(t * 80) * 0.2); // pitch swooping up backwards
    const env = Math.sin((t / rewindDur) * Math.PI);
    rewindData[i] = Math.sin(2 * Math.PI * freq * t) * 0.35 * env;
  }
  sfx['rewind'] = rewindBuf;

  // 9. Analog Rimshot
  const rimDur = 0.18;
  const rimBuf = audioCtx.createBuffer(1, sampleRate * rimDur, sampleRate);
  const rimData = rimBuf.getChannelData(0);
  for (let i = 0; i < rimData.length; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 50);
    const tone = Math.sin(2 * Math.PI * 850 * t) * env;
    const click = (Math.random() * 2 - 1) * Math.exp(-t * 120);
    rimData[i] = (tone * 0.5 + click * 0.5) * 0.4;
  }
  sfx['rimshot'] = rimBuf;

  // 10. Synth Vocal "Hey!"
  const vocalDur = 0.35;
  const vocalBuf = audioCtx.createBuffer(1, sampleRate * vocalDur, sampleRate);
  const vocalData = vocalBuf.getChannelData(0);
  for (let i = 0; i < vocalData.length; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 12);
    const f1 = 450;
    const f2 = 1200;
    const vSound = (Math.sin(2 * Math.PI * f1 * t) * 0.6 + Math.sin(2 * Math.PI * f2 * t) * 0.4) * env;
    vocalData[i] = vSound * 0.45;
  }
  sfx['vocal_hey'] = vocalBuf;

  // 11. Reverse Cymbal Riser
  const cymbalDur = 1.0;
  const cymbalBuf = audioCtx.createBuffer(1, sampleRate * cymbalDur, sampleRate);
  const cymbalData = cymbalBuf.getChannelData(0);
  for (let i = 0; i < cymbalData.length; i++) {
    const t = i / sampleRate;
    const env = Math.pow(t / cymbalDur, 2.5); // Crescendo build up
    const noise = (Math.random() * 2 - 1) * env * 0.4;
    cymbalData[i] = noise;
  }
  sfx['cymbal'] = cymbalBuf;

  // 12. Cyberpunk Glitch Stutter
  const glitchDur = 0.5;
  const glitchBuf = audioCtx.createBuffer(1, sampleRate * glitchDur, sampleRate);
  const glitchData = glitchBuf.getChannelData(0);
  for (let i = 0; i < glitchData.length; i++) {
    const t = i / sampleRate;
    const slice = Math.floor(t * 32); // 32nd note chopper
    const freq = (slice % 4) * 400 + 300;
    const env = (1 - (t % 0.03125) / 0.03125);
    glitchData[i] = Math.sin(2 * Math.PI * freq * t) * 0.35 * env;
  }
  sfx['glitch'] = glitchBuf;

  return sfx;
}

/**
 * Synthesizes an AudioBuffer for YouTube converted tracks or custom streams.
 */
export function synthesizeTrackBuffer(
  audioCtx: AudioContext | null,
  bpm: number = 124,
  durationSeconds: number = 180,
  title: string = 'YouTube Audio Stream'
): AudioBuffer {
  const sampleRate = audioCtx ? audioCtx.sampleRate : 44100;
  const numSamples = Math.floor(sampleRate * Math.min(durationSeconds, 180));
  const ctx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const secondsPerBeat = 60 / bpm;
  const totalBeats = Math.floor(durationSeconds / secondsPerBeat);

  for (let b = 0; b < totalBeats; b++) {
    const beatStartTime = b * secondsPerBeat;
    const startSample = Math.floor(beatStartTime * sampleRate);

    // Kick on beat 1 & 3
    if (b % 2 === 0) {
      const kickLen = Math.floor(sampleRate * 0.15);
      for (let i = 0; i < kickLen && startSample + i < numSamples; i++) {
        const t = i / sampleRate;
        const freq = 130 * Math.exp(-t * 30);
        const kickSample = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 12) * 0.7;
        left[startSample + i] += kickSample;
        right[startSample + i] += kickSample;
      }
    }

    // Snare on beat 2 & 4
    if (b % 2 === 1) {
      const snareLen = Math.floor(sampleRate * 0.2);
      for (let i = 0; i < snareLen && startSample + i < numSamples; i++) {
        const t = i / sampleRate;
        const tone = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 20);
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 15);
        const snareSample = (tone * 0.4 + noise * 0.6) * 0.5;
        left[startSample + i] += snareSample;
        right[startSample + i] += snareSample;
      }
    }

    // Hi-hats
    const hatLen = Math.floor(sampleRate * 0.05);
    for (let i = 0; i < hatLen && startSample + i < numSamples; i++) {
      const t = i / sampleRate;
      const hatSample = (Math.random() * 2 - 1) * Math.exp(-t * 60) * 0.25;
      left[startSample + i] += hatSample;
      right[startSample + i] += hatSample;
    }
  }

  return buffer;
}
