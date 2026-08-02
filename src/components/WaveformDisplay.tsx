import React, { useRef, useEffect } from 'react';
import { Track, HotCue, DeckId } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface WaveformDisplayProps {
  deckId?: DeckId;
  isPlaying?: boolean;
  track: Track | null;
  currentTime: number;
  duration: number;
  bpm: number;
  hotCues: (HotCue | null)[];
  color?: string;
  onSeek: (time: number) => void;
  height?: number;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  deckId,
  isPlaying = false,
  track,
  currentTime,
  duration,
  bpm,
  hotCues,
  color = '#ef4444',
  onSeek,
  height = 72,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const freqArray = new Uint8Array(32);

    const render = () => {
      const width = canvas.width;
      const chHeight = canvas.height;

      // Dark dragon obsidian background
      ctx.fillStyle = '#0d0507';
      ctx.fillRect(0, 0, width, chHeight);

      if (!track || !track.audioBuffer || duration === 0) {
        // Empty waveform grid with dragon red subtle grid
        ctx.strokeStyle = '#2d0c11';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 20) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, chHeight);
          ctx.stroke();
        }
        ctx.fillStyle = '#78232b';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NO TRACK LOADED', width / 2, chHeight / 2 + 4);
        return;
      }

      // Live Analyser Data when music is playing
      if (deckId && isPlaying) {
        audioEngine.getDeckAnalyserData(deckId, freqArray);
        // Draw live bouncing frequency bars in background
        const barWidth = width / freqArray.length;
        for (let i = 0; i < freqArray.length; i++) {
          const val = freqArray[i] / 255;
          const barHeight = val * chHeight * 0.85;
          const x = i * barWidth;

          // Dragon fire gradient for frequency bars
          const grad = ctx.createLinearGradient(0, chHeight, 0, chHeight - barHeight);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.15)'); // Dragon red
          grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)'); // Ember gold
          grad.addColorStop(1, 'rgba(16, 185, 129, 0.35)'); // Dragon cyan/green glow

          ctx.fillStyle = grad;
          ctx.fillRect(x, chHeight - barHeight, barWidth - 1, barHeight);
        }
      }

      const buffer = track.audioBuffer;
      const channelData = buffer.getChannelData(0);
      const step = Math.ceil(channelData.length / width);
      const amp = chHeight / 2;

      // Render Beat Grid lines with Downbeats & Measure Markers
      if (bpm > 0) {
        const beatIntervalSec = 60 / bpm;
        const totalBeats = duration / beatIntervalSec;

        for (let b = 0; b < totalBeats; b++) {
          const beatTime = b * beatIntervalSec;
          const x = (beatTime / duration) * width;
          const isDownbeat = b % 4 === 0;

          ctx.beginPath();
          if (isDownbeat) {
            // Bright downbeat marker (bar start)
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)'; // Bright cyan
            ctx.lineWidth = 1.5;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, chHeight);
            ctx.stroke();

            // Measure number text at top
            const barNum = Math.floor(b / 4) + 1;
            ctx.fillStyle = '#06b6d4';
            ctx.font = '8px monospace';
            ctx.textAlign = 'left';
            if (x < width - 15) {
              ctx.fillText(`${barNum}`, x + 2, 9);
            }
          } else {
            // Subtle beat ticks
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)'; // Gold tick
            ctx.lineWidth = 1;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, chHeight);
            ctx.stroke();
          }
        }
      }

      // Render Waveform Amplitude Peaks
      const progressRatio = duration > 0 ? currentTime / duration : 0;
      const xProgress = progressRatio * width;

      for (let x = 0; x < width; x++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
          const datum = channelData[x * step + j] || 0;
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }

        // Unplayed vs Played dragon colors
        if (x <= xProgress) {
          ctx.fillStyle = color || '#ef4444';
        } else {
          ctx.fillStyle = '#451a20'; // Unplayed dark crimson
        }

        const y1 = (1 + min) * amp;
        const y2 = (1 + max) * amp;
        ctx.fillRect(x, y1, 1, Math.max(1, y2 - y1));
      }

      // Render Hot Cues Markers
      hotCues.forEach((cue) => {
        if (!cue) return;
        const cueX = (cue.time / duration) * width;
        ctx.fillStyle = cue.color;
        ctx.beginPath();
        ctx.moveTo(cueX - 4, 0);
        ctx.lineTo(cueX + 4, 0);
        ctx.lineTo(cueX, 10);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = cue.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cueX, 0);
        ctx.lineTo(cueX, chHeight);
        ctx.stroke();
      });

      // Render Playhead Line (Dragon Fire Playhead)
      const playheadX = xProgress;
      ctx.strokeStyle = isPlaying ? '#f97316' : '#ef4444'; // Glowing orange/red when playing
      ctx.lineWidth = isPlaying ? 2.5 : 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, chHeight);
      ctx.stroke();

      // Playhead Dragon Fire Glow
      ctx.fillStyle = isPlaying ? '#f59e0b' : '#ef4444';
      ctx.beginPath();
      ctx.arc(playheadX, chHeight / 2, isPlaying ? 5 : 4, 0, Math.PI * 2);
      ctx.fill();

      if (isPlaying) {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(playheadX, chHeight / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [deckId, isPlaying, track, currentTime, duration, bpm, hotCues, color]);

  const handleSeekFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!duration || !onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const clickedTime = (x / rect.width) * duration;
    onSeek(clickedTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleSeekFromEvent(e);
  };

  return (
    <div className="relative w-full rounded-none overflow-hidden border-b border-[#3d1117] bg-[#0d0507] shadow-inner group">
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        className="w-full h-full cursor-pointer block"
        onMouseDown={handleMouseDown}
        onClick={handleSeekFromEvent}
        title="Click or drag anywhere on waveform to needle search / seek!"
      />
      {/* Beat Grid Alignment Badge */}
      {bpm > 0 && (
        <div className="absolute top-1 left-2 bg-[#080305]/90 px-1 py-0.2 rounded text-[8px] font-mono font-bold text-cyan-400 border border-[#2b0f15] flex items-center gap-1 shadow pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span>GRID 4/4 @ {bpm} BPM</span>
        </div>
      )}

      {/* Time Display Badge */}
      <div className="absolute bottom-1 right-2 bg-[#1c080d]/90 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-300 border border-[#4a131b]">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

