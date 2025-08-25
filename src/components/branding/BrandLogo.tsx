import React from 'react';

type LogoVariant =
  | 'PropertyAnalyzer'
  | 'DataFlow'
  | 'PowerSync'
  | 'TargetPro'
  | 'LaunchKit'
  | 'IdeaHub'
  | 'ConnectBase'
  | 'StarMetrics'
  | 'DesignFlow';

interface BrandLogoProps {
  label?: string;
  showText?: boolean;
  iconSize?: number; // px, default 48
  gapPx?: number; // gap between icon and text, default 12
  animate?: boolean; // subtle movement animation
}

/**
 * BrandLogo renders the specified icon and optional brand text.
 * Icon spec:
 * - 48x48px rounded square (8px radius) with blue background (#2563eb)
 * - Inside: 5 white vertical bars, widths 3px, radius 1px, 2px gaps
 * - Heights (L→R): 8, 16, 12, 20, 6 px, bottom-aligned
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  label = 'PropertyAnalyzer',
  showText = true,
  iconSize = 48,
  gapPx = 12,
  animate = true,
}) => {
  const scale = iconSize / 48;
  const barWidth = 3 * scale;
  const barRadius = 1 * scale;
  const gap = 2 * scale;
  const barHeights = [8, 16, 12, 20, 6].map((h) => h * scale);

  const totalBarsWidth = 5 * barWidth + 4 * gap;
  const leftInset = (iconSize - totalBarsWidth) / 2;
  const bottomInset = 8 * scale;

  return (
    <div
      className="flex items-center"
      style={{ columnGap: `${gapPx}px` }}
      aria-label={label}
      role="img"
    >
      {/* Inline keyframes for subtle movement */}
      {animate && (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
@keyframes spaFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1.5px) } }
@keyframes spaBarWave { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-2px) } }
            `.trim(),
          }}
        />
      )}
      <div
        aria-hidden
        style={{
          width: iconSize,
          height: iconSize,
          backgroundColor: '#2563eb',
          borderRadius: 8 * scale,
          position: 'relative',
          animation: animate ? 'spaFloat 5s ease-in-out infinite' : undefined,
        }}
      >
        {barHeights.map((h, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: leftInset + i * (barWidth + gap),
              bottom: bottomInset,
              width: barWidth,
              height: h,
              backgroundColor: '#ffffff',
              borderRadius: barRadius,
              animation: animate ? `spaBarWave 3.2s ease-in-out ${i * 0.15}s infinite` : undefined,
            }}
          />
        ))}
      </div>

      {showText && (
        <span
          style={{
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
            fontSize: 22,
            fontWeight: 600,
            color: '#1f2937',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

// Convenience wrappers for variations
export const LogoPropertyAnalyzer = (p: Omit<BrandLogoProps, 'label'>) => (
  <BrandLogo label="PropertyAnalyzer" {...p} />
);
export const LogoDataFlow = (p: Omit<BrandLogoProps, 'label'>) => (
  <BrandLogo label="DataFlow" {...p} />
);
export const LogoPowerSync = (p: Omit<BrandLogoProps, 'label'>) => (
  <BrandLogo label="PowerSync" {...p} />
);
export const LogoTargetPro = (p: Omit<BrandLogoProps, 'label'>) => (
  <BrandLogo label="TargetPro" {...p} />
);
export const LogoLaunchKit = (p: Omit<BrandLogoProps, 'label'>) => (
  <BrandLogo label="LaunchKit" {...p} />
);
export const LogoIdeaHub = (p: Omit<BrandLogoProps, 'label'>) => (
  <BrandLogo label="IdeaHub" {...p} />
);
export const LogoConnectBase = (p: Omit<BrandLogoProps, 'label'>) => (
  <BrandLogo label="ConnectBase" {...p} />
);
export const LogoStarMetrics = (p: Omit<BrandLogoProps, 'label'>) => (
  <BrandLogo label="StarMetrics" {...p} />
);
export const LogoDesignFlow = (p: Omit<BrandLogoProps, 'label'>) => (
  <BrandLogo label="DesignFlow" {...p} />
);


