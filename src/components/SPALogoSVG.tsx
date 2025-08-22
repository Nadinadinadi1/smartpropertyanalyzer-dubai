import React from 'react';
import './SPALogo.css';

interface SPALogoSVGProps {
  size?: number;
  className?: string;
}

const SPALogoSVG: React.FC<SPALogoSVGProps> = ({ size = 100, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    style={{
      filter: 'drop-shadow(0 12px 35px rgba(29, 78, 216, 0.4))'
    }}
  >
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1D4ED8"/>
        <stop offset="50%" stopColor="#1E3A8A"/>
        <stop offset="100%" stopColor="#312E81"/>
      </linearGradient>
    </defs>
    
    {/* Background with exact border-radius */}
    <rect width="100" height="100" rx="24" fill="url(#logoGrad)"/>
    
    {/* Pulsing dot - exact specifications */}
    <circle cx="82" cy="18" r="6" fill="#FBBF24" stroke="white" strokeWidth="2">
      <animate 
        attributeName="opacity" 
        values="1;0.7;1" 
        dur="2s" 
        repeatCount="indefinite"
      />
    </circle>
    
    {/* SPA Text - exact specifications */}
    <text 
      x="50" 
      y="62" 
      textAnchor="middle" 
      fill="white" 
      fontSize="20" 
      fontWeight="bold" 
      letterSpacing="1"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      SPA
    </text>
  </svg>
);

export default SPALogoSVG;
