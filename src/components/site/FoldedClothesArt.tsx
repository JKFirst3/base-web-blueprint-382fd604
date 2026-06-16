export function FoldedClothesArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      role="img"
      aria-label="Abstrakte Illustration gefalteter Textilien"
    >
      <defs>
        <linearGradient id="lv-sand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EAE4D5" />
          <stop offset="100%" stopColor="#CCC2AC" />
        </linearGradient>
        <linearGradient id="lv-sand-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3F2EE" />
          <stop offset="100%" stopColor="#EAE4D5" />
        </linearGradient>
      </defs>

      {/* Soft circular halo */}
      <circle cx="250" cy="250" r="220" fill="url(#lv-sand-2)" opacity="0.6" />

      {/* Stack of three folded clothing rectangles, slightly offset */}
      <g transform="translate(120 320)">
        <rect width="260" height="44" rx="6" fill="url(#lv-sand)" stroke="#CCC2AC" strokeWidth="1.5" />
        <line x1="130" y1="6" x2="130" y2="38" stroke="#CCC2AC" strokeWidth="1" opacity="0.7" />
      </g>
      <g transform="translate(110 258)">
        <rect width="280" height="50" rx="7" fill="#EAE4D5" stroke="#CCC2AC" strokeWidth="1.5" />
        <line x1="140" y1="7" x2="140" y2="43" stroke="#CCC2AC" strokeWidth="1" opacity="0.7" />
        <circle cx="20" cy="25" r="2.5" fill="#CCC2AC" />
      </g>
      <g transform="translate(125 188)">
        <rect width="250" height="58" rx="8" fill="url(#lv-sand)" stroke="#CCC2AC" strokeWidth="1.5" />
        <line x1="125" y1="8" x2="125" y2="50" stroke="#CCC2AC" strokeWidth="1" opacity="0.7" />
      </g>

      {/* Hanging shirt silhouette behind */}
      <g transform="translate(195 70)" stroke="#CCC2AC" strokeWidth="1.6" strokeLinejoin="round" fill="#EAE4D5" opacity="0.95">
        <polygon points="55,0 0,30 0,80 25,75 25,140 85,140 85,75 110,80 110,30" />
        <line x1="55" y1="0" x2="55" y2="12" />
      </g>

      {/* Floating subtle dots / sensor pings */}
      <circle cx="380" cy="120" r="4" fill="#CCC2AC" />
      <circle cx="400" cy="150" r="2.5" fill="#CCC2AC" opacity="0.7" />
      <circle cx="110" cy="140" r="3" fill="#CCC2AC" opacity="0.6" />
    </svg>
  );
}
