import React, { useRef, useEffect, useState } from 'react';
import { Activity, Radio, Sliders } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { DeckId } from '../types';

interface FrequencyVisualizerProps {
  selectedDeck?: DeckId | 'MASTER';
  height?: number;
  isCompact?: boolean;
}

export const FrequencyVisualizer: React.FC<FrequencyVisualizerProps> = ({
  selectedDeck = 'MASTER',
  height = 90,
  isCompact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'spectrum' | 'waveform' | '3d'>('spectrum');
  const [currentDeck, setCurrentDeck] = useState<DeckId | 'MASTER'>(selectedDeck);

  useEffect(() => {
    setCurrentDeck(selectedDeck);
  }, [selectedDeck]);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fftSize = 64;
    const freqData = new Uint8Array(fftSize);
    const peaks = new Float32Array(fftSize);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark obsidian background
      ctx.fillStyle = '#06080d';
      ctx.fillRect(0, 0, w, h);

      // Grid background
      ctx.strokeStyle = '#121824';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 20) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 15) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Retrieve audio data
      if (currentDeck === 'MASTER') {
        audioEngine.getMasterAnalyserData(freqData);
      } else {
        audioEngine.getDeckAnalyserData(currentDeck, freqData);
      }

      if (mode === 'spectrum') {
        const barWidth = (w / fftSize) * 1.8;
        const gap = 1.5;

        for (let i = 0; i < fftSize; i++) {
          const val = freqData[i] / 255;
          const barHeight = val * (h - 16);
          const x = i * (barWidth + gap);

          // Update peak hold
          if (val > peaks[i]) {
            peaks[i] = val;
          } else {
            peaks[i] = Math.max(0, peaks[i] - 0.015);
          }

          // Dynamic multi-stage neon gradient
          const grad = ctx.createLinearGradient(0, h, 0, 0);
          if (i < fftSize * 0.25) {
            // Sub/Bass frequencies - Crimson / Red
            grad.addColorStop(0, '#7f1d1d');
            grad.addColorStop(0.5, '#ef4444');
            grad.addColorStop(1, '#f97316');
          } else if (i < fftSize * 0.6) {
            // Mid frequencies - Gold / Amber
            grad.addColorStop(0, '#78350f');
            grad.addColorStop(0.5, '#f59e0b');
            grad.addColorStop(1, '#eab308');
          } else {
            // Treble frequencies - Cyan / Emerald
            grad.addColorStop(0, '#064e3b');
            grad.addColorStop(0.5, '#10b981');
            grad.addColorStop(1, '#06b6d4');
          }

          ctx.fillStyle = grad;
          ctx.fillRect(x, h - 14 - barHeight, barWidth, barHeight);

          // Peak cap line
          const peakY = h - 14 - peaks[i] * (h - 16);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, peakY, barWidth, 1.5);
        }

        // Frequency Band Labels (Bass, Mid, High)
        ctx.fillStyle = '#64748b';
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SUB / BASS', w * 0.15, h - 3);
        ctx.fillText('MIDRANGE', w * 0.5, h - 3);
        ctx.fillText('TREBLE / HIGH', w * 0.85, h - 3);

      } else if (mode === 'waveform') {
        // Oscilloscope Waveform line
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 6;
        ctx.beginPath();

        const sliceWidth = w / fftSize;
        let x = 0;

        for (let i = 0; i < fftSize; i++) {
          const v = freqData[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

      } else if (mode === '3d') {
        // Mirrored Center Spectrum
        const midX = w / 2;
        const halfSize = Math.floor(fftSize / 2);
        const barWidth = midX / halfSize;

        for (let i = 0; i < halfSize; i++) {
          const val = freqData[i] / 255;
          const barHeight = val * (h - 16);

          const grad = ctx.createLinearGradient(0, h / 2 + barHeight / 2, 0, h / 2 - barHeight / 2);
          grad.addColorStop(0, '#ec4899');
          grad.addColorStop(0.5, '#f59e0b');
          grad.addColorStop(1, '#3b82f6');

          ctx.fillStyle = grad;

          // Right bar
          ctx.fillRect(midX + i * barWidth, h / 2 - barHeight / 2, barWidth - 1, barHeight);
          // Left bar (mirrored)
          ctx.fillRect(midX - (i + 1) * barWidth, h / 2 - barHeight / 2, barWidth - 1, barHeight);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, currentDeck]);

  return (
    <div className="bg-[#0a0d14] border border-[#23293a] rounded-none p-1 flex flex-col gap-1 select-none shadow-inner w-full">
      {/* Header Bar with Deck Selector & Mode Toggle */}
      <div className="flex items-center justify-between text-[8px] font-mono border-b border-[#1b2030] pb-1">
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="font-black text-cyan-300 uppercase tracking-wider">
            AUDIO SPECTRUM
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Deck Select */}
          <select
            value={currentDeck}
            onChange={(e) => setCurrentDeck(e.target.value as DeckId | 'MASTER')}
            className="bg-[#141926] text-amber-300 border border-[#2c344a] rounded px-1 py-0.2 font-bold focus:outline-none text-[7px]"
          >
            <option value="MASTER">MASTER BUS</option>
            <option value="A">DECK A</option>
            <option value="B">DECK B</option>
            <option value="C">DECK C</option>
            <option value="D">DECK D</option>
            <option value="E">DECK E</option>
            <option value="F">DECK F</option>
            <option value="G">DECK G</option>
            <option value="H">DECK H</option>
          </select>

          {/* Mode Selector */}
          <div className="flex items-center gap-0.5 bg-[#121622] p-0.5 rounded border border-[#222838]">
            <button
              onClick={() => setMode('spectrum')}
              className={`px-1 py-0.2 text-[6.5px] font-bold rounded ${
                mode === 'spectrum' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FFT
            </button>
            <button
              onClick={() => setMode('waveform')}
              className={`px-1 py-0.2 text-[6.5px] font-bold rounded ${
                mode === 'waveform' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WAVE
            </button>
            <button
              onClick={() => setMode('3d')}
              className={`px-1 py-0.2 text-[6.5px] font-bold rounded ${
                mode === '3d' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              STEREO
            </button>
          </div>
        </div>
      </div>

      {/* Visualizer Canvas */}
      <div className="relative w-full rounded overflow-hidden border border-[#1b2030] bg-[#06080d]">
        <canvas
          ref={canvasRef}
          width={280}
          height={height}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
