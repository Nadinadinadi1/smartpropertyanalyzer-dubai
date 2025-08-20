import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

import { 
  Lightbulb, 
  TrendingUp, 
  Shield, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Target,
  BookOpen,
  Download,
  Share2,
  Sun,
  Moon
} from 'lucide-react';
import { generateInvestmentReport } from '@/lib/pdfGenerator';

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
  monthlyRent: number;
  additionalIncome: number;
  vacancyRate: number;
  maintenanceRate: number;
  managementFee: number;
  managementBaseFee: number; // Base fee
  insurance: number;
  otherExpenses: number;
  rentGrowth?: number;
  appreciationRate?: number;
  expenseInflation?: number;
  exitCapRate?: number;
  sellingCosts?: number;
  dldFeeIncluded?: boolean;
}

interface InsightsPanelProps {
  propertyData: PropertyData;
  investmentScore?: number;
  scoreDetails?: any[];
  projectionData?: any[];
  irrValue?: number;
}

export default function InsightsPanel({ propertyData, investmentScore, scoreDetails, projectionData, irrValue }: InsightsPanelProps) {
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  
  // Show feedback prompt after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFeedbackPrompt(true);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Debug: Log received props
  console.log('=== INSIGHTS PANEL DEBUG ===');
  console.log('Property data:', propertyData);
  console.log('Investment score:', investmentScore);
  console.log('Score details:', scoreDetails);
  console.log('Projection data length:', projectionData?.length);
  console.log('IRR value received:', irrValue);
  console.log('============================');
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateMonthlyPayment = (loanAmount: number, annualRate: number, years: number): number => {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  const calculateMonthlyExpenses = (propertyData: PropertyData): number => {
    const maintenance = propertyData.monthlyRent * (propertyData.maintenanceRate / 100);
    const management = propertyData.monthlyRent * (propertyData.managementFee / 100) + propertyData.managementBaseFee; // Percentage + Base fee
    const insurance = propertyData.insurance / 12;
    const otherExpenses = propertyData.otherExpenses / 12;
    return maintenance + management + insurance + otherExpenses;
  };

  const calculateSuggestedRentalPrice = (propertyData: PropertyData, totalInvestment: number): {
    monthlyRent: number;
    annualYield: number;
    cashFlow: number;
    reasoning: string[];
  } => {
    // Financial real estate sector logic for rental price recommendations
    
    // 1. Target Net Yield Approach (Industry Standard: 5-7% for healthy investments)
    const targetNetYield = 6.0; // 6% is considered healthy in Dubai market
    
    // 2. Calculate monthly expenses (excluding mortgage for yield calculation)
    const monthlyExpenses = (propertyData.monthlyRent * (propertyData.maintenanceRate / 100)) + 
                           (propertyData.monthlyRent * (propertyData.managementFee / 100)) + propertyData.managementBaseFee + // Percentage + Base fee
                           (propertyData.insurance / 12) + (propertyData.otherExpenses / 12);
    
    // 3. Calculate required annual rental income for target yield
    // Net Yield = (Annual Rent - Annual Expenses) / Property Price
    // Target Net Yield = (Annual Rent - Annual Expenses) / Property Price
    // Annual Rent = (Target Net Yield * Property Price) + Annual Expenses
    const requiredAnnualRent = (targetNetYield / 100 * propertyData.price) + (monthlyExpenses * 12);
    const suggestedMonthlyRent = requiredAnnualRent / 12;
    
    // 4. Calculate resulting metrics
    const resultingNetYield = ((suggestedMonthlyRent * 12) - (monthlyExpenses * 12)) / propertyData.price * 100;
    const resultingGrossYield = (suggestedMonthlyRent * 12) / propertyData.price * 100;
    
    // 5. Calculate cash flow with suggested rent
    const monthlyPayment = calculateMonthlyPayment(
      propertyData.price * ((100 - propertyData.downPayment) / 100), 
      propertyData.interestRate, 
      propertyData.loanTerm
    );
    const resultingCashFlow = suggestedMonthlyRent - monthlyPayment - monthlyExpenses;
    
    // 6. Build reasoning based on market standards
    const reasoning: string[] = [
      `🎯 Target Net Yield: ${targetNetYield}% (Dubai market standard for healthy investments)`,
      `💰 Gross Yield: ${resultingGrossYield.toFixed(1)}% (Industry target: 8-12%)`,
      `📊 Net Yield: ${resultingNetYield.toFixed(1)}% (After all operating expenses)`,
      `💵 Monthly Cash Flow: ${resultingCashFlow >= 0 ? 'Positive' : 'Negative'} (${resultingCashFlow >= 0 ? 'Healthy' : 'Needs attention'})`,
      `🏠 Property Price: ${(propertyData.price / 1000000).toFixed(1)}M AED`,
      `📈 Market Position: ${resultingGrossYield >= 10 ? 'Premium' : resultingGrossYield >= 8 ? 'Competitive' : 'Below Market'}`
    ];
    
    // 7. Adjust for market conditions and property type
    let adjustedRent = suggestedMonthlyRent;
    let marketAdjustment = '';
    
    if (propertyData.propertyType.toLowerCase().includes('villa')) {
      adjustedRent *= 1.15; // Villas typically command 15% premium
      marketAdjustment = 'Villa premium applied (+15%)';
    } else if (propertyData.propertyType.toLowerCase().includes('penthouse')) {
      adjustedRent *= 1.25; // Penthouses command 25% premium
      marketAdjustment = 'Penthouse premium applied (+25%)';
    }
    
    if (propertyData.area.toLowerCase().includes('downtown') || propertyData.area.toLowerCase().includes('marina')) {
      adjustedRent *= 1.20; // Premium locations command 20% premium
      marketAdjustment += marketAdjustment ? ' + Location premium (+20%)' : 'Location premium applied (+20%)';
    }
    
    if (marketAdjustment) {
      reasoning.push(`📍 Market Adjustment: ${marketAdjustment}`);
    }
    
    return {
      monthlyRent: Math.round(adjustedRent),
      annualYield: resultingNetYield,
      cashFlow: resultingCashFlow,
      reasoning: reasoning
    };
  };

  // Calculate total investment
  const downPaymentAmount = propertyData.price * (propertyData.downPayment / 100);
  const additionalCosts = propertyData.price * 0.02 + (propertyData.dldFeeIncluded ? propertyData.price * 0.04 : 0) + 5000; // Agent + DLD + legal
  const totalInvestment = downPaymentAmount + additionalCosts;

  // Calculate monthly expenses and payment
  const monthlyExpenses = calculateMonthlyExpenses(propertyData);
  const loanAmount = propertyData.price - downPaymentAmount;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, propertyData.interestRate, propertyData.loanTerm);

  // Calculate suggested rental price for healthy investment
  const suggestedRentalPrice = calculateSuggestedRentalPrice(propertyData, totalInvestment);

  const grossYield = (propertyData.monthlyRent * 12 / propertyData.price) * 100;
  const netYield = ((propertyData.monthlyRent * 12 - monthlyExpenses * 12 - monthlyPayment * 12) / propertyData.price) * 100;

  const pricePerSqm = propertyData.price / getEstimatedArea(propertyData.propertyType);

  // Market data (simplified for demo)
  const marketData = getMarketData(propertyData.area);
  
  const insights = generateInsights(propertyData, grossYield, marketData);
  const recommendations = generateRecommendations(propertyData, grossYield, marketData);
  const riskFactors = generateRiskFactors(propertyData);

  // Helper function for detailed projection data
  function generateDetailedProjectionData(propertyData: PropertyData, totalInvestment: number): any[] {
    const data: any[] = [];
    const loanAmount = propertyData.price * ((100 - propertyData.downPayment) / 100);
    const monthlyPayment = calculateMonthlyPayment(loanAmount, propertyData.interestRate, propertyData.loanTerm);
    
    let currentRent = propertyData.monthlyRent;
    let currentInsurance = propertyData.insurance;
    let remainingDebt = loanAmount;
    let cumulativeCash = 0;
    
    for (let year = 1; year <= 10; year++) {
      // Apply growth rates to absolute values, not percentages
      currentRent = currentRent * (1 + propertyData.rentGrowth / 100);
      currentInsurance = currentInsurance * (1 + propertyData.expenseInflation / 100);
      
      // Calculate income and expenses
      const effectiveRent = currentRent * ((100 - propertyData.vacancyRate) / 100);
      const annualRent = effectiveRent * 12;
      // Maintenance and management are percentages of current rent, not growing absolute values
      const annualExpenses = (currentRent * propertyData.maintenanceRate / 100 * 12) + 
                            (currentRent * propertyData.managementFee / 100 * 12) + 
                            currentInsurance;
      const annualDebtService = monthlyPayment * 12;
      const netCashFlow = annualRent - annualExpenses - annualDebtService;
      
      // Calculate principal paydown correctly
      // For each month, calculate interest and principal portions
      let remainingDebtThisYear = remainingDebt;
      for (let month = 1; month <= 12; month++) {
        const monthlyInterest = remainingDebtThisYear * (propertyData.interestRate / 100 / 12);
        const monthlyPrincipal = monthlyPayment - monthlyInterest;
        remainingDebtThisYear = Math.max(0, remainingDebtThisYear - monthlyPrincipal);
      }
      remainingDebt = remainingDebtThisYear;
      
      // Calculate property value
      const propertyValue = propertyData.price * Math.pow(1 + propertyData.appreciationRate / 100, year);
      
      // Calculate equity and total return (minimum 0)
      const equity = Math.max(0, propertyValue - remainingDebt);
      cumulativeCash += netCashFlow;
      const totalReturnValue = cumulativeCash + equity - totalInvestment;
      const totalReturnPercent = (totalReturnValue / totalInvestment) * 100;
      
      // Calculate DSCR correctly (Net Operating Income / Debt Service)
      const netOperatingIncome = annualRent - annualExpenses;
      const dscr = netOperatingIncome / annualDebtService;
      
      data.push({
        year,
        netCashFlow,
        cumulativeCash,
        equity,
        dscr,
        totalReturn: totalReturnPercent,
        propertyValue,
        remainingDebt
      });
    }
    
    return data;
  }

  return (
    <>
      <div className="h-full overflow-y-auto p-4 space-y-6 pb-20">
        {/* Logo and Theme Toggle */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => window.location.hash = '#analyze'}
            className="relative hover:scale-105 transition-transform duration-200"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            {/* BETA Badge */}
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md border border-white">
              BETA
            </div>
          </button>
        </div>

        {/* Theme Toggle - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => {
              // Toggle theme logic here
              document.documentElement.classList.toggle('dark');
            }}
            className="w-10 h-10 bg-card/80 backdrop-blur-sm border border-border rounded-xl flex items-center justify-center shadow-md hover:bg-card transition-colors"
          >
            <Sun className="h-5 w-5 text-primary dark:hidden" />
            <Moon className="h-5 w-5 text-primary hidden dark:block" />
          </button>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Lightbulb className="h-6 w-6 text-accent mr-2 animate-glow" />
            <h1 className="text-2xl font-bold text-gradient-primary">Smart Insights</h1>
          </div>
          <p className="text-muted-foreground">Smart analysis and recommendations</p>
        </div>



      {/* Smart Insights Content */}
      <div className="space-y-6">
        {/* Rental Price Recommendation - New Section */}
        <Card className="card-premium p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-1">🏠 Rental Price Recommendation</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Expert advice for optimal rental pricing and investment health
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(suggestedRentalPrice.monthlyRent)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Suggested Monthly Rent
              </div>
            </div>
          </div>
          
                       {/* Current vs Recommended Analysis */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div className="bg-white/50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                 <div className="text-center">
                   <div className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-1">
                     {formatCurrency(propertyData.monthlyRent)}
                   </div>
                   <div className="text-sm text-blue-600 dark:text-blue-400">Current Rent</div>
                   <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                     {((propertyData.monthlyRent * 12 / propertyData.price) * 100).toFixed(1)}% gross yield
                   </div>
                   <div className="text-xs text-blue-400 dark:text-blue-500 mt-1">
                     {((propertyData.monthlyRent * 12 - (propertyData.monthlyRent * (propertyData.maintenanceRate / 100) * 12 + propertyData.monthlyRent * (propertyData.managementFee / 100) * 12 + propertyData.insurance)) / propertyData.price * 100).toFixed(1)}% net yield
                   </div>
                 </div>
               </div>
               
               <div className="bg-white/50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                 <div className="text-center">
                   <div className="text-lg font-semibold text-green-700 dark:text-green-300 mb-1">
                     {formatCurrency(suggestedRentalPrice.monthlyRent)}
                   </div>
                   <div className="text-sm text-green-600 dark:text-green-400">Recommended Rent</div>
                   <div className="text-xs text-green-500 dark:text-green-400 mt-1">
                     {((suggestedRentalPrice.monthlyRent * 12 / propertyData.price) * 100).toFixed(1)}% gross yield
                   </div>
                   <div className="text-xs text-green-400 dark:text-green-500 mt-1">
                     {suggestedRentalPrice.annualYield.toFixed(1)}% net yield
                   </div>
                 </div>
               </div>
             </div>
          
          {/* Recommendation Details */}
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 text-sm">📊 Financial Analysis:</h4>
            {suggestedRentalPrice.reasoning.map((reason, index) => (
              <div key={index} className="text-xs text-blue-600 dark:text-blue-400 bg-white/30 dark:bg-blue-900/20 p-2 rounded">
                {reason}
              </div>
            ))}
          </div>
          
          {/* Action Items */}
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 text-sm mb-2">🎯 Action Items:</h4>
            <div className="space-y-2">
              {propertyData.monthlyRent < suggestedRentalPrice.monthlyRent * 0.9 && (
                <div className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 p-2 rounded">
                  ✅ Consider increasing rent to {formatCurrency(suggestedRentalPrice.monthlyRent * 0.9)} - {formatCurrency(suggestedRentalPrice.monthlyRent)} for better returns
                </div>
              )}
              {propertyData.monthlyRent > suggestedRentalPrice.monthlyRent * 1.1 && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded">
                  ⚠️ Current rent may be above market - consider market research for optimal pricing
                </div>
              )}
              {suggestedRentalPrice.cashFlow < 0 && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-2 rounded">
                  ❌ Recommended rent still results in negative cash flow - review financing terms
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Market Analysis */}
        <Card className="card-premium p-6">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-secondary mr-2" />
            <h3 className="font-semibold">Market Analysis</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Your Property vs Market</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gross Rent Yield:</span>
                    <span className="font-semibold">{grossYield.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Rent Yield:</span>
                    <span className="font-semibold">{netYield.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per sqm:</span>
                    <span className="font-semibold">{formatCurrency(pricePerSqm)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-accent mb-2">Market Standards</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Dubai Avg Gross Yield:</span>
                    <span className="font-semibold">8-12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dubai Avg Net Yield:</span>
                    <span className="font-semibold">5-7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Healthy Cash Flow:</span>
                    <span className="font-semibold">&gt; 0 AED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Insights */}
        <Card className="card-premium p-6">
          <div className="flex items-center mb-4">
            <Target className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-semibold">Key Insights</h3>
          </div>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${insight.type === 'positive' ? 'bg-success/10' : insight.type === 'negative' ? 'bg-danger/10' : 'bg-warning/10'}`}>
                  {insight.type === 'positive' ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : insight.type === 'negative' ? (
                    <AlertTriangle className="h-4 w-4 text-danger" />
                  ) : (
                    <Lightbulb className="h-4 w-4 text-warning" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{insight.message}</p>
                  {insight.impact && (
                    <p className="text-xs text-muted-foreground mt-1">{insight.impact}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Floating Export Buttons */}
      <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-[9999] flex gap-2 bg-white dark:bg-gray-900 p-2 rounded-xl border border-primary/30 shadow-lg">
                  <Button 
            size="sm"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-md hover:shadow-lg transition-all duration-300 font-medium text-xs px-3 py-2"
                         onClick={async () => {
               try {
                 // Calculate comprehensive metrics for PDF
                 const loanAmount = propertyData.price - downPaymentAmount;
                 const monthlyPayment = calculateMonthlyPayment(loanAmount, propertyData.interestRate, propertyData.loanTerm);
                 const effectiveRent = propertyData.monthlyRent * ((100 - propertyData.vacancyRate) / 100);
                 const monthlyExpenses = calculateMonthlyExpenses(propertyData);
                 const monthlyCashFlow = effectiveRent - monthlyPayment - monthlyExpenses;
                 const annualCashFlow = monthlyCashFlow * 12;
                 const cashOnCashReturn = (annualCashFlow / totalInvestment) * 100;
                 const grossYield = (propertyData.monthlyRent * 12 / propertyData.price) * 100;
                 const netYield = ((effectiveRent * 12 - monthlyExpenses * 12) / propertyData.price) * 100;
                 const debtToEquityRatio = (loanAmount / downPaymentAmount) * 100;
                 const monthlyExpenseRatio = (monthlyExpenses / effectiveRent) * 100;

                  // Use IRR value directly from the analysis
                  const realIRR = irrValue || 8.5; // Fallback to 8.5 if not provided
                  
                  console.log('IRR value from analysis:', irrValue);
                  
                  const finalInvestmentScore = investmentScore || 7;
                  const finalScoreDetails = scoreDetails || [
                    { category: 'Cash Flow', points: monthlyCashFlow > 0 ? 2 : 0, maxPoints: 2 },
                    { category: 'Yield', points: netYield > 5 ? 2 : 0, maxPoints: 2 },
                    { category: 'Risk', points: debtToEquityRatio < 80 ? 1 : 0, maxPoints: 1 }
                  ];
                  const finalProjectionData = projectionData || generateBasicProjection(propertyData, totalInvestment);
                  
                  // Generate detailed projection data for accurate annual ROI calculation
                  const detailedProjectionData = generateDetailedProjectionData(propertyData, totalInvestment);
                  
                  const metrics = {
                    investmentScore: finalInvestmentScore,
                    riskLevel: debtToEquityRatio > 80 ? 'High' : debtToEquityRatio > 60 ? 'Medium' : 'Low',
                    monthlyCashFlow,
                    cashOnCashReturn,
                    irr: realIRR, // Use real calculated IRR
                    annualROI: detailedProjectionData.length > 0 ? 
                      ((detailedProjectionData[0].netCashFlow + Math.max(0, detailedProjectionData[0].equity - (propertyData.price - downPaymentAmount))) / totalInvestment) * 100 : 0,
                    grossYield,
                    netYield,
                    debtToEquityRatio,
                    monthlyExpenseRatio,
                    totalInvestment,
                    downPaymentAmount,
                    loanAmount,
                    additionalCosts: totalInvestment - downPaymentAmount,
                    monthlyPayment,
                    effectiveRent,
                    monthlyExpenses,
                    vacancyRate: propertyData.vacancyRate
                  };

                  console.log('Generating PDF with data:', {
                    propertyData,
                    metrics,
                    finalScoreDetails,
                    finalProjectionData
                  });

                  const pdf = generateInvestmentReport(
                    {
                      ...propertyData,
                      propertyStatus: propertyData.propertyStatus || 'ready',
                      priceInputMethod: propertyData.priceInputMethod || 'manual',
                      dldFeeIncluded: propertyData.dldFeeIncluded || false,
                      rentGrowth: propertyData.rentGrowth || 3,
                      appreciationRate: propertyData.appreciationRate || 4,
                      expenseInflation: propertyData.expenseInflation || 2,
                      exitCapRate: propertyData.exitCapRate || 5,
                      sellingCosts: propertyData.sellingCosts || 2
                    }, 
                    metrics, 
                    finalScoreDetails, 
                    finalProjectionData
                  );
                  
                  // Generate filename
                  const fileName = `Property_Analysis_${propertyData.name || 'Investment'}_${new Date().toISOString().split('T')[0]}.pdf`;
                  
                  // Save the PDF
                  pdf.save(fileName);
               } catch (error) {
                 console.error('Error generating PDF:', error);
               }
             }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF Report
          </Button>
         
                  <Button 
            variant="outline" 
            size="sm"
            className="bg-white dark:bg-gray-800 border border-primary hover:bg-primary/10 hover:border-primary/70 shadow-md hover:shadow-lg transition-all duration-300 font-medium text-xs px-3 py-2"
            onClick={() => {
              // Share link functionaliteit
              console.log('Sharing report link...');
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Link Report
          </Button>
        </div>
      </div>
      

      
      {/* Feedback Prompt - Shows after 15 seconds */}
      {showFeedbackPrompt && (
        <div className="fixed bottom-24 left-4 right-4 z-[9999] bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">💡 How was your experience?</h3>
              <p className="text-sm opacity-90">We'd love to hear your feedback about the Smart Property Analyzer!</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={() => setShowFeedbackPrompt(false)}
              >
                Later
              </Button>
              <Button
                size="sm"
                className="bg-white text-blue-600 hover:bg-white/90"
                onClick={() => {
                  // Open feedback dialog and close prompt
                  setShowFeedbackPrompt(false);
                  // Trigger feedback button click
                  setTimeout(() => {
                    const feedbackButton = document.querySelector('[data-feedback-trigger]') as HTMLElement;
                    if (feedbackButton) {
                      feedbackButton.click();
                    }
                  }, 100);
                }}
              >
                Give Feedback
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getMarketData(area: string) {
  // Simplified market data - in real app would fetch from API
  const marketData: Record<string, any> = {
    'Dubai Marina': { avgYield: 6.5, avgPricePerSqm: 15000, growth: 8.2 },
    'Downtown Dubai': { avgYield: 5.8, avgPricePerSqm: 18000, growth: 7.5 },
    'Jumeirah Village Circle': { avgYield: 7.2, avgPricePerSqm: 12000, growth: 9.1 },
    'Business Bay': { avgYield: 6.8, avgPricePerSqm: 14000, growth: 8.7 },
    'Dubai Hills Estate': { avgYield: 5.5, avgPricePerSqm: 16000, growth: 6.8 },
  };
  
  return marketData[area] || { avgYield: 6.2, avgPricePerSqm: 14500, growth: 7.8 };
}

function getEstimatedArea(propertyType: string): number {
  const areas: Record<string, number> = {
    'Studio': 450,
    'Apartment': 800,
    'Townhouse': 1500,
    'Villa': 2500,
  };
  return areas[propertyType] || 800;
}

// Helper functions for PDF generation
function calculateMonthlyPayment(loanAmount: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1);
}

function calculateMonthlyExpenses(propertyData: PropertyData): number {
  const maintenance = propertyData.monthlyRent * (propertyData.maintenanceRate / 100);
  const management = propertyData.monthlyRent * (propertyData.managementFee / 100);
  const insurance = propertyData.insurance / 12;
  return maintenance + management + insurance;
}

function generateBasicProjection(propertyData: PropertyData, downPaymentAmount: number): any[] {
  const data = [];
  const loanAmount = propertyData.price - downPaymentAmount;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, propertyData.interestRate, propertyData.loanTerm);
  
  let currentRent = propertyData.monthlyRent;
  let remainingDebt = loanAmount;
  let cumulativeCash = 0;
  
  for (let year = 1; year <= 10; year++) {
    const rentGrowth = propertyData.rentGrowth || 3;
    const appreciationRate = propertyData.appreciationRate || 4;
    
    currentRent = currentRent * (1 + rentGrowth / 100);
    const effectiveRent = currentRent * ((100 - propertyData.vacancyRate) / 100);
    const annualRent = effectiveRent * 12;
    const annualExpenses = calculateMonthlyExpenses(propertyData) * 12;
    const annualDebtService = monthlyPayment * 12;
    const netCashFlow = annualRent - annualExpenses - annualDebtService;
    
    const interestPayment = remainingDebt * (propertyData.interestRate / 100);
    const principalPayment = annualDebtService - interestPayment;
    remainingDebt = Math.max(0, remainingDebt - principalPayment);
    
    const propertyValue = propertyData.price * Math.pow(1 + appreciationRate / 100, year);
    const equity = Math.max(0, propertyValue - remainingDebt);
    cumulativeCash += netCashFlow;
    const totalReturnValue = cumulativeCash + equity - downPaymentAmount;
    const totalReturnPercent = (totalReturnValue / downPaymentAmount) * 100;
    
    data.push({
      year,
      netCashFlow,
      cumulativeCash,
      equity,
      propertyValue,
      remainingDebt,
      totalReturn: totalReturnPercent
    });
  }
  
  return data;
}

function generateInsights(propertyData: PropertyData, grossYield: number, marketData: any) {
  const insights = [];
  
  if (grossYield > marketData.avgYield) {
    insights.push({
      type: 'positive',
      message: `Excellent rental yield of ${grossYield.toFixed(1)}% exceeds market average by ${(grossYield - marketData.avgYield).toFixed(1)}%`,
      impact: 'Strong cash flow potential'
    });
  }
  
  if (propertyData.downPayment >= 30) {
    insights.push({
      type: 'positive',
      message: 'Conservative financing with high down payment reduces risk',
      impact: 'Lower monthly obligations and interest costs'
    });
  }
  
  if (propertyData.vacancyRate <= 5) {
    insights.push({
      type: 'positive',
      message: 'Low vacancy rate assumption indicates strong rental demand',
      impact: 'Stable income stream expected'
    });
  }
  
  if (propertyData.interestRate > 5.5) {
    insights.push({
      type: 'warning',
      message: 'Interest rate is above current market average',
      impact: 'Consider negotiating better rates with lenders'
    });
  }
  
  return insights;
}

function generateRecommendations(propertyData: PropertyData, grossYield: number, marketData: any) {
  const recommendations = [];
  
  if (propertyData.managementFee > 10) {
    recommendations.push({
      title: 'Reduce Management Fees',
      description: 'Consider self-managing or negotiating lower fees to improve cash flow',
      impact: 'Could increase annual return by AED 5,000+'
    });
  }
  
  if (propertyData.downPayment < 25) {
    recommendations.push({
      title: 'Increase Down Payment',
      description: 'Higher down payment reduces monthly mortgage and improves cash flow',
      impact: 'Better loan terms and reduced financial risk'
    });
  }
  
  recommendations.push({
    title: 'Optimize Rental Pricing',
    description: 'Research comparable properties to ensure competitive rental rates',
    impact: 'Maximize rental income potential'
  });
  
  return recommendations;
}

function generateRiskFactors(propertyData: PropertyData) {
  const risks = [];
  
  risks.push({
    factor: 'Market Risk',
    level: 'medium' as const,
    description: 'Property values and rental rates may fluctuate with market conditions',
    mitigation: 'Long-term investment horizon helps weather market cycles'
  });
  
  if (propertyData.downPayment < 25) {
    risks.push({
      factor: 'Leverage Risk',
      level: 'high' as const,
      description: 'High loan-to-value ratio increases financial risk',
      mitigation: 'Consider increasing down payment or building cash reserves'
    });
  }
  
  risks.push({
    factor: 'Vacancy Risk',
    level: 'low' as const,
    description: 'Risk of extended vacancy periods affecting cash flow',
    mitigation: 'Good area selection and competitive pricing reduce vacancy risk'
  });
  
  return risks;
}

function getAreaSpecificTrend(area: string): string {
  const trends: Record<string, string> = {
    'Dubai Marina': 'High demand from young professionals, strong rental market.',
    'Downtown Dubai': 'Premium location with consistent appreciation, corporate demand.',
    'Jumeirah Village Circle': 'Family-friendly area with good value, growing popularity.',
    'Business Bay': 'Business district with mixed-use development, strong rental demand.',
    'Dubai Hills Estate': 'New development with modern amenities, premium family market.',
  };
  
  return trends[area] || 'Stable growth area with good investment potential.';
}