import React from "react";

interface CircularProgressProps {
  completed: number;
  required: number;
  size?: number; // optional: diameter in px
  stroke?: number; // optional: stroke width
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  completed,
  required,
  size = 90,
  stroke = 6,
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(completed / required, 1);
  const strokeDashoffset = circumference * (1 - percent);

  return (
    <div className="relative inline-block animate-pulse" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          stroke="#ffffff33"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          fill="transparent"
          stroke="url(#gradient)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="gradient" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8800" />
            <stop offset="50%" stopColor="#ffaa00" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-semibold">
        {completed} / {required}
      </div>
    </div>
  );
};

export default CircularProgress;
