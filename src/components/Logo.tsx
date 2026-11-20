import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  collapsed?: boolean;
  className?: string;
}

export const CGXMark: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="CGX Logo Mark"
    >
      <defs>
        {/* Blue to Cyan gradient for the vibrant X diagonal */}
        <linearGradient id="cgx-cyan-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0062FF" />
          <stop offset="50%" stopColor="#0099FF" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
        
        {/* Deep blue gradient for the second X diagonal */}
        <linearGradient id="cgx-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Soft shadow for depth between crossing strokes */}
        <filter id="cgx-overlap-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="-2" dy="2" stdDeviation="3" floodColor="#050B14" floodOpacity="0.7" />
        </filter>
      </defs>

      {/* Background container rounded rect */}
      <rect width="120" height="120" rx="26" fill="#0C101A" stroke="#263148" strokeWidth="2.5" />

      {/* Stylized geometric glyphs */}
      <g transform="translate(14, 28) scale(0.76)">
        {/* 'C' */}
        <path
          d="M 38 12 C 16 12 0 28 0 50 C 0 72 16 88 38 88 C 45 88 51 86 56 83 L 50 68 C 47 70 43 71 38 71 C 25 71 16 61 16 50 C 16 39 25 29 38 29 C 43 29 47 30 50 32 L 56 17 C 51 14 45 12 38 12 Z"
          fill="#FFFFFF"
        />

        {/* 'G' */}
        <path
          d="M 96 12 C 74 12 58 28 58 50 C 58 72 74 88 96 88 C 111 88 121 80 124 67 L 124 45 L 94 45 L 94 60 L 108 60 C 106 68 102 72 96 72 C 84 72 74 61 74 50 C 74 39 84 29 96 29 C 101 29 106 31 109 34 L 115 20 C 110 15 103 12 96 12 Z"
          fill="#F8FAFC"
        />

        {/* 'X' - Under stroke (blue) */}
        <path
          d="M 124 16 L 140 16 L 180 84 L 164 84 Z"
          fill="url(#cgx-blue-grad)"
        />

        {/* 'X' - Over stroke (cyan to electric blue with shadow) */}
        <path
          d="M 164 16 L 180 16 L 140 84 L 124 84 Z"
          fill="url(#cgx-cyan-grad)"
          filter="url(#cgx-overlap-shadow)"
        />
      </g>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showSubtitle = true, 
  collapsed = false,
  className = '' 
}) => {
  // Height sizing
  const dimensions = {
    sm: { markSize: 28, textScale: 'text-sm', subScale: 'text-[8.5px]' },
    md: { markSize: 36, textScale: 'text-base', subScale: 'text-[9.5px]' },
    lg: { markSize: 44, textScale: 'text-lg', subScale: 'text-[11px]' },
    xl: { markSize: 56, textScale: 'text-2xl', subScale: 'text-[13px]' }
  }[size];

  if (collapsed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <CGXMark size={dimensions.markSize} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Visual Vector Icon Mark */}
      <CGXMark size={dimensions.markSize} />

      {/* Brand Typographic Identity */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center tracking-tight leading-none font-bold">
          <span className="text-[#FFFFFF] tracking-tight font-extrabold font-sans" style={{ fontSize: size === 'xl' ? '1.75rem' : size === 'lg' ? '1.4rem' : size === 'md' ? '1.15rem' : '0.95rem' }}>
            CG
          </span>
          <span 
            className="font-extrabold font-sans bg-gradient-to-tr from-[#0062FF] via-[#0099FF] to-[#00E5FF] bg-clip-text text-transparent"
            style={{ fontSize: size === 'xl' ? '1.75rem' : size === 'lg' ? '1.4rem' : size === 'md' ? '1.15rem' : '0.95rem' }}
          >
            X
          </span>
        </div>

        {showSubtitle && (
          <span 
            className="text-[#94A3B8] font-bold uppercase tracking-[0.24em] font-sans mt-0.5 leading-none"
            style={{ fontSize: size === 'xl' ? '9px' : size === 'lg' ? '8px' : size === 'md' ? '7.5px' : '6.5px' }}
          >
            CHANGE INTELLIGENCE
          </span>
        )}
      </div>
    </div>
  );
};
