import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  theme?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  theme = 'light',
}) => {
  const iconSizes = {
    sm: 32,
    md: 44,
    lg: 64,
    xl: 96,
  };

  const textSizes = {
    sm: { main: 18, tag: 10 },
    md: { main: 24, tag: 12 },
    lg: { main: 36, tag: 14 },
    xl: { main: 48, tag: 16 },
  };

  const iconDim = iconSizes[size];
  const { main: mainFontSize, tag: tagFontSize } = textSizes[size];

  const agriColor = theme === 'dark' ? '#FFFFFF' : '#153E24';
  const rentColor = '#388E3C';
  const taglineColor = theme === 'dark' ? '#C8E6C9' : '#2E7D32';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
      
      {/* Brand Icon (Gear + Tractor + Field + Leaf) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: size === 'sm' ? 0 : 6 }}>
        <svg
          width={iconDim}
          height={iconDim}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 3px 6px rgba(27, 77, 46, 0.15))' }}
        >
          {/* Outer Cog / Gear Teeth */}
          <path
            d="M60 14 C62 14 63 15 63.5 17 L65 22 C67 22.5 69 23.3 71 24.3 L75.5 21.5 C77 20.6 79 21.2 80 22.8 L84 29.8 C84.8 31.2 84.3 33.2 83 34.2 L79 37.2 C79.6 39.2 80 41.2 80.2 43.3 L85.5 44 C87.2 44.2 88.5 45.8 88.5 47.5 L88.5 55.5 C88.5 57.2 87.2 58.8 85.5 59 L80.2 59.7 C80 61.8 79.6 63.8 79 65.8 L83 68.8 C84.3 69.8 84.8 71.8 84 73.2 L80 80.2 C79 81.8 77 82.4 75.5 81.5 L71 78.7 C69 79.7 67 80.5 65 81 L63.5 86 C63 88 62 89 60 89 L52 89 C50 89 49 88 48.5 86 L47 81 C45 80.5 43 79.7 41 78.7 L36.5 81.5 C35 82.4 33 81.8 32 80.2 L28 73.2 C27.2 71.8 27.7 69.8 29 68.8 L33 65.8 C32.4 63.8 32 61.8 31.8 59.7 L26.5 59 C24.8 58.8 23.5 57.2 23.5 55.5 L23.5 47.5 C23.5 45.8 24.8 44.2 26.5 44 L31.8 43.3 C32 41.2 32.4 39.2 33 37.2 L29 34.2 C27.7 33.2 27.2 31.2 28 29.8 L32 22.8 C33 21.2 35 20.6 36.5 21.5 L41 24.3 C43 23.3 45 22.5 47 22 L48.5 17 C49 15 50 14 52 14 Z"
            fill="#1E5E35"
          />

          {/* Inner Cog Hollow Circle */}
          <circle cx="56" cy="51" r="26" fill="#FFFFFF" />

          {/* Tractor Silhouette Inside Gear */}
          <g fill="#1E5E35">
            {/* Rear Large Wheel */}
            <circle cx="46" cy="56" r="8.5" fill="#1E5E35" />
            <circle cx="46" cy="56" r="4.5" fill="#FFFFFF" />
            {/* Front Small Wheel */}
            <circle cx="67" cy="59" r="5.5" fill="#1E5E35" />
            <circle cx="67" cy="59" r="2.5" fill="#FFFFFF" />
            {/* Tractor Body & Cabin */}
            <path d="M46 47 L46 40 L56 40 L56 47 Z" />
            <path d="M57 44 L69 46 L69 55 L57 55 Z" />
            <rect x="58" y="38" width="3" height="7" rx="1.5" />
            {/* Steering & Seat */}
            <path d="M50 43 L54 43 L54 46 L49 46 Z" />
          </g>

          {/* Flowing Green Farmland Waves */}
          <path
            d="M16 88 C32 75 58 76 74 88 C82 94 92 98 106 97 C90 106 58 106 28 98 C22 96 18 92 16 88 Z"
            fill="#1E5E35"
          />
          <path
            d="M24 94 C42 84 66 84 84 94 C92 98 100 100 110 99 C94 108 62 108 36 102 C30 100 26 97 24 94 Z"
            fill="#388E3C"
          />
          <path
            d="M34 100 C50 92 72 92 88 100 C96 103 103 104 112 103 C96 111 68 111 44 106 C39 104 36 102 34 100 Z"
            fill="#4CAF50"
          />

          {/* Sprouting Growth Leaf at the Right */}
          <path
            d="M74 84 C84 68 104 68 110 74 C112 86 96 98 78 92 Z"
            fill="#43A047"
          />
          <path
            d="M76 86 C88 78 102 76 108 76 C102 84 90 92 78 90 Z"
            fill="#81C784"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div style={{ display: 'flex', alignItems: 'baseline', letterSpacing: -0.5, lineHeight: 1 }}>
        <span style={{ fontSize: mainFontSize, fontWeight: 900, color: agriColor, fontFamily: 'var(--font-heading)' }}>
          AGRI
        </span>
        <span style={{ fontSize: mainFontSize, fontWeight: 900, color: rentColor, fontFamily: 'var(--font-heading)' }}>
          RENT
        </span>
      </div>

      {/* Tagline */}
      {showTagline && (
        <div style={{
          marginTop: 6,
          fontSize: tagFontSize,
          fontWeight: 700,
          color: taglineColor,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          letterSpacing: 0.2,
        }}>
          <span>🌿</span>
          <span>Smart Equipment Rental for Smarter Farming</span>
          <span>🌿</span>
        </div>
      )}
    </div>
  );
};
