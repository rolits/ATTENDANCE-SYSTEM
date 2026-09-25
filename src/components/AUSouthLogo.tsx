import React from 'react';

interface AUSouthLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  lightMode?: boolean;
}

export const AUSouthLogo: React.FC<AUSouthLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  lightMode = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* College Seal Emblem */}
      <div
        className={`${sizeMap[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0B3B60] to-[#07243c] p-1.5 shadow-md border-2 border-amber-400/80 text-white shrink-0`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full fill-current text-amber-400"
        >
          {/* Shield Outline */}
          <path
            d="M50 8 C68 8, 88 18, 88 40 C88 68, 62 88, 50 94 C38 88, 12 68, 12 40 C12 18, 32 8, 50 8 Z"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="5"
          />
          {/* Torch & Book Motif */}
          <path
            d="M50 20 L54 36 L46 36 Z"
            fill="#FBBF24"
          />
          {/* Flame */}
          <path
            d="M50 14 Q53 19, 50 23 Q47 19, 50 14 Z"
            fill="#EF4444"
          />
          {/* Open Book */}
          <path
            d="M30 52 C38 48, 48 48, 50 54 C52 48, 62 48, 70 52 L68 64 C60 61, 52 61, 50 66 C48 61, 40 61, 32 64 Z"
            fill="#FFFFFF"
          />
          {/* AU Monogram text */}
          <text
            x="50"
            y="44"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="14"
            fontWeight="bold"
            letterSpacing="1"
            fontFamily="sans-serif"
          >
            AU
          </text>
          <text
            x="50"
            y="78"
            textAnchor="middle"
            fill="#F59E0B"
            fontSize="8"
            fontWeight="bold"
            letterSpacing="1.5"
            fontFamily="sans-serif"
          >
            SOUTH
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight leading-none ${
                lightMode ? 'text-white' : 'text-[#0B3B60]'
              } ${size === 'lg' ? 'text-xl' : size === 'xl' ? 'text-2xl' : 'text-base'}`}
            >
              COLLEGE OF AU SOUTH
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-600 border border-amber-400/40">
              AMS
            </span>
          </div>
          <span
            className={`text-[11px] font-medium tracking-wide ${
              lightMode ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            QR Attendance Management System
          </span>
        </div>
      )}
    </div>
  );
};
