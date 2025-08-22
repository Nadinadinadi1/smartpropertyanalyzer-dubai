import React from 'react';
import './SPALogo.css';

interface SPALogoProps {
  size?: number;
  showPulse?: boolean;
  className?: string;
  debug?: boolean; // Debug mode for testing
}

const SPALogo: React.FC<SPALogoProps> = ({ 
  size = 100, 
  showPulse = true, 
  className = '',
  debug = false
}) => {
  const scale = size / 100; // Scale factor based on 100x100 base size
  
  return (
    <div 
      className={`spa-logo ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 50%, #312E81 100%)',
        borderRadius: 24 * scale,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 12px 35px rgba(29, 78, 216, 0.4)',
        fontSize: 18 * scale, // Slightly smaller for SPAD
        fontWeight: 'bold',
        letterSpacing: `${0.5 * scale}px`, // Tighter spacing for SPAD
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      SPAD
      
      {/* Yellow pulsing dot - positioned more in the right corner of SPAD text */}
      <div
        className="pulse-dot"
        style={{
          position: 'absolute',
          width: 18 * scale, // Increased from 12 to 18 (50% larger)
          height: 18 * scale, // Increased from 12 to 18 (50% larger)
          background: '#FBBF24', // Yellow color
          borderRadius: '50%',
          top: 8 * scale, // Positioned more towards the text
          right: 12 * scale, // Positioned more towards the text
          border: `${2 * scale}px solid white`,
          zIndex: 100,
        }}
      />
    </div>
  );
};

export default SPALogo;
