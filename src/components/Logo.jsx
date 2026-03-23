import React from 'react'

/* Artha logo — stylised "A" formed by an upward arrow intersecting a horizontal bar,
   suggesting growth + financial stability. Clean geometric mark. */
export function ArthaLogo({ size = 32, showText = true, textSize = 20 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background square */}
        <rect width="40" height="40" rx="10" fill="#1a1a1d" />
        <rect width="40" height="40" rx="10" fill="url(#grad)" />
        {/* Stylised A — two diagonal strokes meeting at apex + crossbar */}
        <path d="M20 8 L30 30 H26 L20 15 L14 30 H10 Z" fill="#d4933a" />
        <rect x="13" y="23" width="14" height="2.5" rx="1.25" fill="#0e0e0f" />
        {/* Bottom accent line */}
        <rect x="8" y="33" width="24" height="1.5" rx="0.75" fill="rgba(212,147,58,0.4)" />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(212,147,58,0.15)" />
            <stop offset="100%" stopColor="rgba(42,144,128,0.08)" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span style={{ fontFamily: 'var(--font-display)', fontSize: textSize, fontWeight: 700, color: 'var(--text-0)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          Artha
        </span>
      )}
    </div>
  )
}

export function ArthaWordmark({ color = 'var(--text-0)', size = 22 }) {
  return (
    <span style={{ fontFamily: 'var(--font-display)', fontSize: size, fontWeight: 700, color, letterSpacing: '-0.03em' }}>
      Artha
    </span>
  )
}
