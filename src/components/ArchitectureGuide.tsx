import React, { useState } from 'react';
import { BookOpen, Code, Cpu, Disc, Music, Sliders, X, Check, Copy } from 'lucide-react';

interface ArchitectureGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureGuide: React.FC<ArchitectureGuideProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'audioGraph' | 'scratch' | 'eqCrossfade' | 'code'>('overview');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100">How to Build DJ Software From Scratch</h2>
              <p className="text-xs text-slate-400">Complete Web Audio API & Vinyl Physics Architecture Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 overflow-x-auto gap-1">
          <TabBtn id="overview" label="1. Overview & Setup" active={activeTab} onClick={setActiveTab} icon={Cpu} />
          <TabBtn id="audioGraph" label="2. Web Audio DSP Graph" active={activeTab} onClick={setActiveTab} icon={Music} />
          <TabBtn id="scratch" label="3. Vinyl Scratch Physics" active={activeTab} onClick={setActiveTab} icon={Disc} />
          <TabBtn id="eqCrossfade" label="4. EQ & Crossfader Math" active={activeTab} onClick={setActiveTab} icon={Sliders} />
          <TabBtn id="code" label="5. Core Code Implementation" active={activeTab} onClick={setActiveTab} icon={Code} />
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto text-slate-300 space-y-6 text-sm leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-blue-400 flex items-center gap-2">
                <Cpu className="w-5 h-5" /> Building Browser DJ Software: The Core Concepts
              </h3>
              <p>
                To build professional-grade DJ software in JavaScript or TypeScript, you do not need heavy native C++ plugins or WebAssembly audio drivers. Modern browsers include the **Web Audio API**—a high-performance, low-latency Digital Signal Processing (DSP) framework operating on a dedicated hardware audio thread.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-slate-200 text-sm mb-1 text-blue-400">1. Audio Engine</h4>
                  <p className="text-xs text-slate-400">
                    Creates an <code className="text-amber-300">AudioContext</code> managing sample rate conversion, buffer decoding, and zero-latency playback node pipelines.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-slate-200 text-sm mb-1 text-pink-400">2. Interactive Vinyl</h4>
                  <p className="text-xs text-slate-400">
                    Captures polar angle coordinates from pointer drag events and maps angular velocity directly to <code className="text-amber-300">playbackRate.value</code>.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-slate-200 text-sm mb-1 text-emerald-400">3. 2-Channel Mixer</h4>
                  <p className="text-xs text-slate-400">
                    Routes audio channels through low-shelf, peaking, and high-shelf <code className="text-amber-300">BiquadFilterNodes</code> into an equal-power crossfader.
                  </p>
                </div>
              </div>

              <div className="bg-blue-950/30 border border-blue-800/50 p-4 rounded-xl text-blue-200 text-xs space-y-2">
                <div><strong>💡 Fundamental Rule of Web Audio:</strong> Always initialize or resume the <code className="text-amber-300">AudioContext</code> inside a user gesture handler (e.g. click or touch event) to bypass browser autoplay safety restrictions.</div>
                <div><strong>🎛️ Deck-Integrated STEM Separation:</strong> Stems (Vocals, Drums, Bass, Melody) are now integrated directly inside each Turntable Deck for instant Acapella/Instrumental soloing, level mixing, and real-time stem toggles.</div>
                <div><strong>🎹 24-Pad Sampler Matrix:</strong> Expanded performance sampler featuring 24 high-definition sound effect pads across 6 banks (Club, FX, Perc, Drops, Synths, Chants) with instant keyboard hotkeys (<code className="text-amber-300">1-0</code>, <code className="text-amber-300">Q-I</code>, <code className="text-amber-300">O, P, A, S, D, F</code>).</div>
                <div><strong>🔴 YouTube MP3 Converter:</strong> Integrated YouTube URL streamer converts links directly into stereo AudioBuffers with real-time waveform rendering and deck routing.</div>
                <div><strong>🖥️ Standalone Windows PC Executables:</strong> Includes 1-click Windows PC <code className="text-cyan-300">.exe/.bat</code> and silent <code className="text-cyan-300">.vbs</code> desktop launchers, macOS <code className="text-cyan-300">.app</code> launchers, plus full Electron and Tauri PC compilation scripts.</div>
              </div>
            </div>
          )}

          {activeTab === 'audioGraph' && (
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-blue-400 flex items-center gap-2">
                <Music className="w-5 h-5" /> The Web Audio DSP Pipeline Graph
              </h3>
              <p>
                Web Audio operates as a directed acyclic graph of audio nodes connected together. Below is the exact node pipeline used in each deck of this DJ application:
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto">
                <pre className="text-emerald-400">
{` [ AudioBufferSourceNode ] (Track Playback & Pitch Rate)
           │
           ▼
     [ GainNode ] (Trim / Channel Gain Staging)
           │
           ▼
  [ BiquadFilterNode ] (EQ Low Shelf - 250Hz)
           │
           ▼
  [ BiquadFilterNode ] (EQ Mid Peaking - 1000Hz)
           │
           ▼
  [ BiquadFilterNode ] (EQ High Shelf - 4000Hz)
           │
           ▼
  [ BiquadFilterNode ] (Resonant LPF / HPF Sweep)
           │
     ┌─────┴────────────────┐
     │                      │
     ▼                      ▼
[ GainNode ] (Volume)   [ DelayNode ] (Echo FX Loop)
     │                      │
     ▼                      ▼
[ Crossfader Gain ] ◄───────┘
     │
     ▼
[ AnalyserNode ] (Visual VU Peak Metering)
     │
     ▼
[ Master GainNode ] ──► [ destination ] (Speakers / Headphones)`}
                </pre>
              </div>

              <p className="text-xs text-slate-400">
                By chaining multiple <code className="text-amber-300">BiquadFilterNodes</code> together, each frequency band (Bass, Mid, Treble) can be individually boosted (+12dB) or cut (-24dB to total isolation) without causing phase distortion or latency.
              </p>
            </div>
          )}

          {activeTab === 'scratch' && (
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-blue-400 flex items-center gap-2">
                <Disc className="w-5 h-5" /> Vinyl Scratch Physics & Mathematics
              </h3>
              <p>
                Realistic vinyl scratching requires calculating the **angular velocity** of the user's mouse/touch movement relative to the center of the turntable platter.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-amber-300 font-bold">Step 1: Calculate Polar Angle θ</div>
                <p className="text-slate-300">
                  Given cursor coordinates <code className="text-emerald-300">(x, y)</code> and platter center <code className="text-emerald-300">(cx, cy)</code>:
                </p>
                <div className="bg-slate-900 p-2 rounded text-blue-300">
                  θ = Math.atan2(y - cy, x - cx)  // Angle in radians (-π to +π)
                </div>

                <div className="text-amber-300 font-bold pt-2">Step 2: Calculate Angular Velocity ω</div>
                <p className="text-slate-300">
                  Difference between current angle and last angle divided by elapsed time Δt:
                </p>
                <div className="bg-slate-900 p-2 rounded text-blue-300">
                  Δθ = θ_current - θ_last
                  <br />
                  ω = Δθ / Δt  (radians per second)
                </div>

                <div className="text-amber-300 font-bold pt-2">Step 3: Mutate Playback Rate in Real Time</div>
                <div className="bg-slate-900 p-2 rounded text-emerald-300">
                  playbackRate.value = ω / (2 * Math.PI) * pitchFactor;
                </div>
              </div>

              <p className="text-xs text-slate-400">
                When moving clockwise, <code className="text-amber-300">playbackRate &gt; 0</code> (forward audio). When moving counter-clockwise, <code className="text-amber-300">playbackRate &lt; 0</code> or close to 0 (reverse pitch drop effect).
              </p>
            </div>
          )}

          {activeTab === 'eqCrossfade' && (
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-blue-400 flex items-center gap-2">
                <Sliders className="w-5 h-5" /> Equal Power Crossfader Mathematics
              </h3>
              <p>
                If you use a simple **linear crossfader** (<code className="text-amber-300">Gain_A = 1 - x</code>, <code className="text-amber-300">Gain_B = x</code>), the volume drops by approximately 3dB when the crossfader is centered. To maintain constant acoustic power, DJ software uses an **Equal Power Trigonometric Crossfade**:
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-cyan-300 font-bold">Equal Power Formula (x normalized 0..1):</div>
                <div className="bg-slate-900 p-3 rounded text-blue-300 space-y-1">
                  <div>Gain_DeckA = Math.cos(x * 0.5 * Math.PI);</div>
                  <div>Gain_DeckB = Math.sin(x * 0.5 * Math.PI);</div>
                </div>

                <p className="text-slate-400 text-[11px]">
                  Because <code className="text-amber-300">cos²(θ) + sin²(θ) = 1</code>, the total combined audio power remains exactly 1.0 (0dB loss) at all crossfader positions!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-blue-400 flex items-center gap-2">
                <Code className="w-5 h-5" /> Core Implementation Code Snippet
              </h3>
              <p className="text-xs text-slate-400">
                Here is the lightweight TypeScript code to set up a Web Audio DJ deck with pitch control, 3-band EQ, and track loading:
              </p>

              {codeSnippets.map((snippet, idx) => (
                <div key={idx} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-200">{snippet.title}</span>
                    <button
                      onClick={() => copyCode(snippet.code, idx)}
                      className="flex items-center gap-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> COPIED
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> COPY
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                    <code>{snippet.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabBtn: React.FC<{
  id: any;
  label: string;
  active: string;
  onClick: (id: any) => void;
  icon: any;
}> = ({ id, label, active, onClick, icon: Icon }) => (
  <button
    onClick={() => onClick(id)}
    className={`px-3 py-2.5 text-xs font-bold font-mono transition flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
      active === id
        ? 'border-blue-500 text-blue-400 bg-blue-500/10'
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    }`}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

const codeSnippets = [
  {
    title: '1. Web Audio DJ Deck Setup (TypeScript)',
    code: `const ctx = new AudioContext();

// Create nodes
const source = ctx.createBufferSource();
const gainNode = ctx.createGain();

// Create 3-Band EQ BiquadFilters
const eqLow = ctx.createBiquadFilter();
eqLow.type = 'lowshelf';
eqLow.frequency.value = 250; // Bass

const eqMid = ctx.createBiquadFilter();
eqMid.type = 'peaking';
eqMid.frequency.value = 1000; // Mid

const eqHigh = ctx.createBiquadFilter();
eqHigh.type = 'highshelf';
eqHigh.frequency.value = 4000; // Treble

// Connect pipeline: source -> low -> mid -> high -> gain -> output
source.connect(eqLow);
eqLow.connect(eqMid);
eqMid.connect(eqHigh);
eqHigh.connect(gainNode);
gainNode.connect(ctx.destination);`,
  },
  {
    title: '2. Real-Time Vinyl Scratch Listener',
    code: `let lastAngle = 0;
let lastTime = Date.now();

function onVinylMove(e) {
  const rect = platter.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
  let deltaAngle = currentAngle - lastAngle;

  const dt = (Date.now() - lastTime) / 1000;
  if (dt > 0) {
    const angularVel = deltaAngle / dt;
    const scratchRate = (angularVel / (Math.PI * 2)) * 1.5;
    
    // Set buffer source rate dynamically
    source.playbackRate.setValueAtTime(scratchRate, ctx.currentTime);
  }
  
  lastAngle = currentAngle;
  lastTime = Date.now();
}`,
  },
];
