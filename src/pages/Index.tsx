import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BottomNavigation from '@/components/BottomNavigation';
import PropertyAnalyzer from '@/components/PropertyAnalyzer';
import InvestmentDashboard from '@/components/InvestmentDashboard';
import InsightsPanel from '@/components/InsightsPanel';
import SettingsPanel from '@/components/SettingsPanel';
import FeedbackButton from '@/components/FeedbackButton';
import dubaiHeroImage from '@/assets/dubai-skyline-hero.jpg';

const queryClient = new QueryClient();

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
  vacancyRate: number;
  maintenanceRate: number;
  managementFee: number;
  insurance: number;
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

  const handleAnalyze = (data: PropertyData) => {
    setPropertyData(data);
    setShowResults(true);
    setActiveTab('dashboard');
  };

  const renderTabContent = () => {
    if (activeTab === 'analyze') {
      return <PropertyAnalyzer onAnalyze={handleAnalyze} />;
    }
    
    if (activeTab === 'dashboard') {
      if (!propertyData || !showResults) {
        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
      return <InvestmentDashboard propertyData={propertyData} />;
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
              <h3 className="text-lg font-semibold mb-2">AI Insights Ready</h3>
              <p className="text-muted-foreground mb-4">
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
      return <InsightsPanel propertyData={propertyData} />;
    }
    
    if (activeTab === 'settings') {
      return <SettingsPanel />;
    }

    return null;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-background">
          {/* Hero Section - Only show on analyze tab when no results */}
          {activeTab === 'analyze' && !showResults && (
            <div className="relative h-48 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${dubaiHeroImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-hero opacity-90" />
              <div className="relative h-full flex items-center justify-center text-white p-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">Smart Property Analyser Dubai</h1>
                  <p className="text-sm opacity-90">Professional investment analysis for Dubai real estate</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={`${activeTab === 'analyze' && !showResults ? 'min-h-[calc(100vh-12rem)]' : 'min-h-screen'} pb-16`}>
            {renderTabContent()}
          </div>

          {/* Bottom Navigation */}
          <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          {/* Feedback Button */}
          <FeedbackButton />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Index;
