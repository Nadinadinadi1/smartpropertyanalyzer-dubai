import React from 'react';

/** Renders an SVG favicon icon (icon-only, no text) per spec */
export const FaviconIcon: React.FC<{ size?: number }> = ({ size = 48 }) => {
  const scale = size / 48;
  const barWidth = 3 * scale;
  const gap = 2 * scale;
  const barHeights = [8, 16, 12, 20, 6].map((h) => h * scale);
  const leftInset = (size - (5 * barWidth + 4 * gap)) / 2;
  const bottomInset = 8 * scale;
  const radius = 8 * scale;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width={size} height={size} rx={radius} fill="#2563eb" />
      {barHeights.map((h, i) => (
        <rect
          key={i}
          x={leftInset + i * (barWidth + gap)}
          y={size - bottomInset - h}
          width={barWidth}
          height={h}
          rx={1 * scale}
          fill="#ffffff"
        />
      ))}
    </svg>
  );
};

/** Inline link tags for favicons (add in <head>) */
export const FaviconLinks: React.FC = () => (
  <>
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
    <link rel="manifest" href="/site.webmanifest" />
  </>
);



