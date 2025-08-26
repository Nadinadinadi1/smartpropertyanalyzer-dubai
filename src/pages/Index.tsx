import React, { useState, useEffect } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import PropertyAnalyzer from '@/components/PropertyAnalyzer';
import InvestmentDashboard from '@/components/InvestmentDashboard';
import SettingsPanel from '@/components/SettingsPanel';
// JourneySimulator removed for beta

import dubaiHeroImage from '@/assets/dubai-skyline-hero.jpg';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

interface PropertyData {
  propertyStatus: 'ready' | 'off-plan';
  name: string;
  sizeSqft: number;
  price: number;
  priceInputMethod: 'slider' | 'manual';
  propertyType: string;
  area: string;
  handoverBy?: string | null;
  preHandoverPercent: number;
  bedrooms: number | 'studio' | '8+';
  bathrooms: number | '6+';
  downPayment: number;
  agentFeePercent: number;
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

    const handleNavigateToAnalyze = (event: CustomEvent) => {
      if (event.detail?.targetTab === 'analyze') {
        setActiveTab('analyze');
        const targetId = event.detail?.scrollToId;
        // Give React a tick to render tab content, then scroll
        setTimeout(() => {
          if (targetId) {
            const el = document.getElementById(targetId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              return;
            }
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
      }
    };

    const handleNavigateToAnalyses = (event: CustomEvent) => {
      if (event.detail?.targetTab === 'analyses') {
        setActiveTab('analyses');
        // Scroll to top when navigating to analyses
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Journey navigation removed

    window.addEventListener('navigateToAnalyze', handleNavigateToAnalyze as EventListener);
    window.addEventListener('navigateToAnalyses', handleNavigateToAnalyses as EventListener);
    // window.addEventListener('navigateToJourney', handleNavigateToJourney as EventListener);
    
    return () => {
      window.removeEventListener('navigateToAnalyze', handleNavigateToAnalyze as EventListener);
      window.removeEventListener('navigateToAnalyses', handleNavigateToAnalyses as EventListener);
      // window.removeEventListener('navigateToJourney', handleNavigateToJourney as EventListener);
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

  // Listen for explicit requests to jump to analyze step 1
  useEffect(() => {
    const handleGoFirstStep = () => {
      setActiveTab('analyze');
      // allow the analyzer to render and then scroll to first field if present
      setTimeout(() => {
        const el = document.getElementById('property-name');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          (el as HTMLInputElement).focus();
        }
      }, 60);
    };
    window.addEventListener('goToAnalyzeFirstStep', handleGoFirstStep as EventListener);
    return () => window.removeEventListener('goToAnalyzeFirstStep', handleGoFirstStep as EventListener);
  }, []);

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
    // Journey tab removed
    
    if (activeTab === 'analyze') {
      return (
        <PropertyAnalyzer 
          onAnalyze={handleAnalyze}
          initialData={propertyData || undefined}
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
    
    
    
    if (activeTab === 'settings') {
      return <SettingsPanel />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
 
       
       {/* Hero Section - Show on analyze tab (Property Input) */}
       {activeTab === 'analyze' && (
        <div id="hero-top" className="relative h-80 overflow-hidden mt-16">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${dubaiHeroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          
           {/* Main Hero Text - Centered with more space */}
           <div className="relative z-10 h-full flex items-center justify-center text-white p-6 pb-20">
             <div className="text-center">
               <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">Smart Property Analyzer — Dubai</h1>
               <p className="text-xl md:text-2xl opacity-95 text-white drop-shadow-md mb-3">Professional-grade ROI, Cash Flow & IRR Analysis</p>
               <p className="text-lg opacity-90 text-white drop-shadow-md">Built for Dubai real estate</p>
             </div>
           </div>
         </div>
       )}
 
       {/* Main Content */}
       <div className={`${activeTab === 'analyze' ? 'min-h-[calc(100vh-20rem)]' : 'min-h-screen'} pb-28`}>
         {renderTabContent()}
       </div>
 
       {/* Bottom Navigation */}
       <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
     </div>
   );
};

export default Index;
