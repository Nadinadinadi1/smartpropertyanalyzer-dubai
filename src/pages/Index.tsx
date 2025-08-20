import React, { useState, useEffect } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import PropertyAnalyzer from '@/components/PropertyAnalyzer';
import InvestmentDashboard from '@/components/InvestmentDashboard';
import InsightsPanel from '@/components/InsightsPanel';
import SettingsPanel from '@/components/SettingsPanel';
import JourneySimulator from '@/components/JourneySimulator';

import dubaiHeroImage from '@/assets/dubai-skyline-hero.jpg';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface PropertyData {
  propertyStatus: 'ready' | 'off-plan';
  name: string;
  price: number;
  priceInputMethod: 'slider' | 'manual';
  propertyType: string;
  area: string;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  dldFeeIncluded: boolean;
  monthlyRent: number;
  additionalIncome: number;
  vacancyRate: number;
  maintenanceRate: number;
  managementFee: number;
  managementBaseFee: number; // Base fee
  insurance: number;
  otherExpenses: number;
  rentGrowth: number;
  appreciationRate: number;
  expenseInflation: number;
  exitCapRate: number;
  sellingCosts: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('analyze');
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [investmentScore, setInvestmentScore] = useState<number>(0);
  const [scoreDetails, setScoreDetails] = useState<any[]>([]);
  const [projectionData, setProjectionData] = useState<any[]>([]);
  const [irrValue, setIrRValue] = useState<number>(0);

  // Listen for navigation events from child components
  useEffect(() => {
    const handleNavigateToInsights = (event: CustomEvent) => {
      if (event.detail?.targetTab === 'insights') {
        setActiveTab('insights');
        // Scroll to top when navigating to insights
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const handleNavigateToAnalyze = (event: CustomEvent) => {
      if (event.detail?.targetTab === 'analyze') {
        setActiveTab('analyze');
        // Scroll to top when navigating to analyze
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const handleNavigateToAnalyses = (event: CustomEvent) => {
      if (event.detail?.targetTab === 'analyses') {
        setActiveTab('analyses');
        // Scroll to top when navigating to analyses
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const handleNavigateToJourney = (event: CustomEvent) => {
      if (event.detail?.targetTab === 'journey') {
        setActiveTab('journey');
        // Scroll to top when navigating to journey
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('navigateToInsights', handleNavigateToInsights as EventListener);
    window.addEventListener('navigateToAnalyze', handleNavigateToAnalyze as EventListener);
    window.addEventListener('navigateToAnalyses', handleNavigateToAnalyses as EventListener);
    window.addEventListener('navigateToJourney', handleNavigateToJourney as EventListener);
    
    return () => {
      window.removeEventListener('navigateToInsights', handleNavigateToInsights as EventListener);
      window.removeEventListener('navigateToAnalyze', handleNavigateToAnalyze as EventListener);
      window.removeEventListener('navigateToAnalyses', handleNavigateToAnalyses as EventListener);
      window.removeEventListener('navigateToJourney', handleNavigateToJourney as EventListener);
    };
  }, []);

  // Auto-scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleAnalyze = (data: PropertyData) => {
    setPropertyData(data);
    setShowResults(true);
    setActiveTab('analyses');
    // Scroll to top when analysis results are shown
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = (score: number, details: any[], projections: any[], irrValue: number) => {
    console.log('=== INDEX RECEIVED ANALYSIS DEBUG ===');
    console.log('Score received:', score);
    console.log('Details received:', details);
    console.log('Projections received:', projections.length);
    console.log('IRR value received:', irrValue);
    console.log('=====================================');
    
    setInvestmentScore(score);
    setScoreDetails(details);
    setProjectionData(projections);
    setIrRValue(irrValue);
  };

  const renderTabContent = () => {
    if (activeTab === 'journey') {
      return (
        <JourneySimulator 
          onComplete={(data) => {
            console.log('Journey completed:', data);
            // You can store this data for later use
          }}
          onStartFullAnalysis={() => {
            setActiveTab('analyze');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    }
    
    if (activeTab === 'analyze') {
      return (
        <PropertyAnalyzer 
          onAnalyze={handleAnalyze}
        />
      );
    }
    
    if (activeTab === 'analyses') {
      if (!propertyData || !showResults) {
        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete the property analysis to see your investment dashboard
              </p>
              <button
                onClick={() => setActiveTab('analyze')}
                className="btn-premium px-6 py-2 rounded-lg font-medium"
              >
                Start Analysis
              </button>
            </div>
          </div>
        );
      }
      return (
        <InvestmentDashboard 
          propertyData={propertyData} 
        />
      );
    }
    
    if (activeTab === 'insights') {
      if (!propertyData || !showResults) {
        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Insights Ready</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete your analysis to unlock smart recommendations
              </p>
              <button
                onClick={() => setActiveTab('analyze')}
                className="btn-gold px-6 py-2 rounded-lg font-medium"
              >
                Get Insights
              </button>
            </div>
          </div>
        );
      }
      return (
        <InsightsPanel 
          propertyData={propertyData} 
          investmentScore={investmentScore}
          scoreDetails={scoreDetails}
          projectionData={projectionData}
          irrValue={irrValue}
        />
      );
    }
    
    if (activeTab === 'settings') {
      return <SettingsPanel />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background">

      
      {/* Hero Section - Show on analyze tab (Property Input) */}
      {activeTab === 'analyze' && (
        <div className="relative h-80 overflow-hidden mt-20">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${dubaiHeroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          
          {/* Main Hero Text - Centered with more space */}
          <div className="relative z-10 h-full flex items-center justify-center text-white p-6 pb-20">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">Smart Property Analyzer Dubai</h1>
              <p className="text-sm opacity-95 text-white drop-shadow-md">Professional investment analysis for Dubai real estate</p>
            </div>
          </div>

          {/* Investment Journey Simulator Banner - Overlay on Hero - Positioned lower */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-80 px-3 z-20">
            <div className="p-3 bg-gradient-to-r from-blue-100/90 to-blue-200/90 dark:from-blue-50/80 dark:to-blue-100/80 border border-blue-300/50 rounded-lg backdrop-blur-sm shadow-lg">
              <div className="text-center">
                <h3 className="text-xs font-bold text-blue-800 dark:text-blue-700 mb-1">
                  🚀 New Investment Journey Simulator
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-600 mb-2">
                  Curious about your investment potential? Try our guided journey first for instant insights!
                </p>
                <Button
                  onClick={() => {
                    // Navigate to journey tab
                    window.location.hash = '#journey';
                    // Dispatch event to trigger tab change
                    const journeyEvent = new CustomEvent('navigateToJourney', {
                      detail: { targetTab: 'journey' }
                    });
                    window.dispatchEvent(journeyEvent);
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs h-6"
                >
                  Start Journey
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${activeTab === 'analyze' ? 'min-h-[calc(100vh-20rem)]' : 'min-h-screen'} pb-16`}>
        {renderTabContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
