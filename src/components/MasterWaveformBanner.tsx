import React, { useRef, useEffect } from 'react';
import { DeckState, DeckId } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface MasterWaveformBannerProps {
  deckStates: Record<DeckId, DeckState>;
  activeDeckCount: 2 | 4 | 6 | 8;
}

const DECK_DRAGON_COLORS: Record<DeckId, string> = {
  A: '#ef4444', // Dragon Fire Red
  B: '#f59e0b', // Ember Gold
  C: '#10b981', // Toxic Dragon Green
  D: '#06b6d4', // Flame Cyan
  E: '#a855f7', // Dragon Purple Flame
  F: '#f43f5e', // Blood Crimson
  G: '#eab308', // Dragon Blaze Yellow
  H: '#e11d48', // Infernal Ruby
};

export const MasterWaveformBanner: React.FC<MasterWaveformBannerProps> = ({
  deckStates,
  activeDeckCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const masterFreqData = new Uint8Array(64);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark obsidian dragon scale background
      ctx.fillStyle = '#0a0406';
      ctx.fillRect(0, 0, width, height);

      // Fetch master audio analyser data
      audioEngine.getMasterAnalyserData(masterFreqData);

      // Check if any deck is currently playing
      const isAnyPlaying = (Object.values(deckStates) as DeckState[]).some((d) => d && d.isPlaying);

      // Render live bouncing frequency spectrum bars in background when music plays
      if (isAnyPlaying) {
        const barWidth = width / masterFreqData.length;
        for (let i = 0; i < masterFreqData.length; i++) {
          const val = masterFreqData[i] / 255;
          const barHeight = val * height * 0.9;
          const x = i * barWidth;

          // Dragon fire gradient
          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.25)'); // Red
          grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.35)'); // Amber
          grad.addColorStop(1, 'rgba(16, 185, 129, 0.45)'); // Dragon green

          ctx.fillStyle = grad;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        }
      }

      // Grid background lines
      ctx.strokeStyle = '#2b0c11';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Center playhead needle
      const centerX = width / 2;

      // Render top half for Deck A, bottom half for Deck B
      const deckAState = deckStates['A'];
      const deckBState = deckStates['B'];

      // Draw Deck A Waveform (Top Half)
      if (deckAState && deckAState.track && deckAState.track.audioBuffer) {
        drawDeckWaveform(
          ctx,
          deckAState,
          DECK_DRAGON_COLORS['A'],
          0,
          height / 2 - 1,
          width,
          centerX
        );
      } else {
        ctx.fillStyle = '#7a222a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('DECK A: NO TRACK LOADED', 20, height / 4 + 4);
      }

      // Draw Center Divider
      ctx.strokeStyle = '#3d1217';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw Deck B Waveform (Bottom Half)
      if (deckBState && deckBState.track && deckBState.track.audioBuffer) {
        drawDeckWaveform(
          ctx,
          deckBState,
          DECK_DRAGON_COLORS['B'],
          height / 2 + 1,
          height / 2 - 1,
          width,
          centerX
        );
      } else {
        ctx.fillStyle = '#7a222a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('DECK B: NO TRACK LOADED', width - 20, (height * 3) / 4 + 4);
      }

      // Center Dragon Fire Needle Line
      ctx.strokeStyle = isAnyPlaying ? '#f97316' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();

      if (isAnyPlaying) {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
      }

      // Playhead top & bottom dragon fire marker caps
      ctx.fillStyle = isAnyPlaying ? '#f59e0b' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(centerX - 6, 0);
      ctx.lineTo(centerX + 6, 0);
      ctx.lineTo(centerX, 8);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX - 6, height);
      ctx.lineTo(centerX + 6, height);
      ctx.lineTo(centerX, height - 8);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [deckStates, activeDeckCount]);

  const drawDeckWaveform = (
    ctx: CanvasRenderingContext2D,
    deckState: DeckState,
    color: string,
    topY: number,
    h: number,
    width: number,
    centerX: number
  ) => {
    const buffer = deckState.track?.audioBuffer;
    if (!buffer) return;

    const channelData = buffer.getChannelData(0);
    const duration = deckState.duration || buffer.duration;
    const currentTime = deckState.currentTime || 0;

    const zoomPxPerSec = 120; // Scrolling resolution
    const sampleRate = buffer.sampleRate;
    const halfWidthSec = centerX / zoomPxPerSec;

    const startSec = currentTime - halfWidthSec;
    const endSec = currentTime + halfWidthSec;

    const startSample = Math.floor(startSec * sampleRate);
    const endSample = Math.floor(endSec * sampleRate);

    const step = Math.max(1, Math.floor((endSample - startSample) / width));
    const midY = topY + h / 2;

    ctx.fillStyle = color;

    for (let x = 0; x < width; x++) {
      const sampleIdx = startSample + Math.floor((x / width) * (endSample - startSample));
      if (sampleIdx >= 0 && sampleIdx < channelData.length) {
        let max = 0;
        for (let s = 0; s < step; s++) {
          const val = Math.abs(channelData[sampleIdx + s] || 0);
          if (val > max) max = val;
        }
        const amp = max * (h / 2 - 2);
        ctx.fillRect(x, midY - amp, 1, Math.max(2, amp * 2));
      }
    }
  };

  const handleBannerClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;

    const deckAState = deckStates['A'];
    const deckBState = deckStates['B'];

    const zoomPxPerSec = 120;
    const deltaSec = (x - centerX) / zoomPxPerSec;

    if (y < rect.height / 2 && deckAState?.track) {
      const targetTime = Math.max(0, Math.min(deckAState.duration, deckAState.currentTime + deltaSec));
      audioEngine.seekDeck('A', targetTime);
    } else if (y >= rect.height / 2 && deckBState?.track) {
      const targetTime = Math.max(0, Math.min(deckBState.duration, deckBState.currentTime + deltaSec));
      audioEngine.seekDeck('B', targetTime);
    }
  };

  return (
    <div className={`relative w-full bg-[#0a0406] border-b border-[#3d1217] overflow-hidden select-none shadow-inner ${
      activeDeckCount > 2 ? 'h-[32px]' : 'h-[40px]'
    }`}>
      <canvas
        ref={canvasRef}
        width={1200}
        height={activeDeckCount > 2 ? 32 : 40}
        className="w-full h-full block cursor-pointer"
        onClick={handleBannerClick}
        title="Master Waveform Banner: Click top half to seek Deck A, bottom half to seek Deck B!"
      />
    </div>
  );
};

