import React, { useState, useRef, useEffect } from 'react';

interface KnobProps {
  label: string;
  value: number; // min to max
  min: number;
  max: number;
  step?: number;
  unit?: string;
  size?: number;
  color?: string;
  onChange: (val: number) => void;
  defaultValue?: number;
}

export const Knob: React.FC<KnobProps> = ({
  label,
  value,
  min,
  max,
  step = 0.1,
  unit = '',
  size = 48,
  color = '#3b82f6',
  onChange,
  defaultValue = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(value);

  // Map value to angle (-135 deg to +135 deg)
  const norm = (value - min) / (max - min);
  const angle = -135 + norm * 270;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const deltaY = startYRef.current - e.clientY; // drag up increases
    const range = max - min;
    const change = (deltaY / 150) * range; // 150px full drag range
    let newValue = startValueRef.current + change;

    if (step) {
      newValue = Math.round(newValue / step) * step;
    }
    newValue = Math.max(min, Math.min(max, newValue));
    onChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = () => {
    onChange(defaultValue);
  };

  return (
    <div className="flex flex-col items-center select-none group">
      <div
        className="relative cursor-pointer flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 shadow-inner hover:border-slate-500 transition-colors"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title={`${label}: ${value.toFixed(1)}${unit} (Double click to reset)`}
      >
        {/* Arc Track SVG */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 5}
            fill="none"
            stroke="#1e293b"
            strokeWidth="3"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 5}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={Math.PI * (size - 10)}
            strokeDashoffset={Math.PI * (size - 10) * (1 - norm * 0.75)}
            strokeLinecap="round"
          />
        </svg>

        {/* Knob Body with Indicator Line */}
        <div
          className="w-3/4 h-3/4 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 shadow-md border border-slate-600/50 flex items-center justify-center transition-transform duration-75"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {/* Pointer Dot / Marker */}
          <div className="w-1 h-3/5 flex justify-center pt-0.5">
            <div
              className="w-1 h-2 rounded-full"
              style={{ backgroundColor: isDragging ? '#60a5fa' : color }}
            />
          </div>
        </div>
      </div>

      {/* Label and Numeric Value */}
      {label && (
        <div className="mt-1 flex flex-col items-center">
          <span className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
            {label}
          </span>
          <span className="text-[8px] font-mono text-slate-300">
            {value > 0 && unit !== '%' ? `+${value.toFixed(1)}` : value.toFixed(1)}
            {unit}
          </span>
        </div>
      )}
    </div>
  );
};
