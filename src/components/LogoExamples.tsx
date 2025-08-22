import React from 'react';
import SPALogo from './SPALogo';
import SPALogoSVG from './SPALogoSVG';
import './SPALogo.css';

const LogoExamples: React.FC = () => {
  return (
    <div className="logo-examples p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">SPA Logo Usage Examples</h2>
      
      {/* Header/Navbar */}
      <div className="example-section">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Header/Navbar</h3>
        <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg">
          <SPALogo size={40} />
          <span className="text-gray-600">Smart Property Analyzer</span>
        </div>
      </div>

      {/* Landing page - groot */}
      <div className="example-section">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Landing Page - Groot</h3>
        <div className="flex flex-col items-center space-y-4 p-6 bg-blue-50 rounded-lg">
          <SPALogo size={120} />
          <h1 className="text-3xl font-bold text-blue-900">Welcome to SPA</h1>
          <p className="text-blue-700 text-center">Advanced Dubai Real Estate Analysis</p>
        </div>
      </div>

      {/* Sidebar - klein */}
      <div className="example-section">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Sidebar - Klein</h3>
        <div className="flex flex-col items-center space-y-4 p-4 bg-gray-100 rounded-lg w-32">
          <SPALogo size={32} showPulse={false} />
          <span className="text-xs text-gray-600 text-center">Smart Property Analyzer</span>
        </div>
      </div>

      {/* Loading screen */}
      <div className="example-section">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Loading Screen</h3>
        <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg">
          <SPALogo size={80} className="animate-bounce" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>

      {/* SVG Version Examples */}
      <div className="example-section">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">SVG Version (Better Performance)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center space-y-2 p-4 bg-blue-50 rounded-lg">
            <SPALogoSVG size={60} />
            <span className="text-sm text-blue-700">SVG Logo</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-green-50 rounded-lg">
            <SPALogoSVG size={60} className="spa-logo-loading" />
            <span className="text-sm text-green-700">Loading SVG</span>
          </div>
        </div>
      </div>

      {/* Size Variants */}
      <div className="example-section">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Size Variants</h3>
        <div className="flex items-center justify-center space-x-4 p-4 bg-gray-100 rounded-lg">
          <SPALogoSVG size={32} />
          <SPALogoSVG size={48} />
          <SPALogoSVG size={64} />
          <SPALogoSVG size={80} />
          <SPALogoSVG size={100} />
        </div>
      </div>
    </div>
  );
};

export default LogoExamples;
