import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  DollarSign, 
  Home, 
  Calculator,
  PieChart,
  Target,
  BarChart3,
  Percent,
  Info,
  CheckCircle,
  AlertTriangle,
  Settings,
  Download,
  Clock,
  HelpCircle,
  Edit3,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';

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
  managementBaseFee: number;
  insurance: number;
  otherExpenses: number;
  rentGrowth: number;
  appreciationRate: number;
  expenseInflation: number;
  exitCapRate: number;
  sellingCosts: number;
}

interface InvestmentDashboardProps {
  propertyData: PropertyData;
}

interface InvestmentMetrics {
  investmentScore: number;
  riskLevel: string;
  monthlyCashFlow: number;
  annualROI: number;
  cashOnCashReturn: number;
  grossYield: number;
  netYield: number;
  irr: number;
  totalInvestment: number;
  downPaymentAmount: number;
  loanAmount: number;
  additionalCosts: number;
  monthlyPayment: number;
  effectiveRent: number;
  monthlyExpenses: number;
  debtToEquityRatio: number;
  monthlyExpenseRatio: number;
  dscr: number;
  vacancyRate: number;
}

const InvestmentDashboard: React.FC<InvestmentDashboardProps> = ({ propertyData }) => {
  // Calculate all investment metrics
  const calculateMetrics = (): InvestmentMetrics => {
    // Basic financial calculations
    const loanAmount = propertyData.price * (100 - propertyData.downPayment) / 100;
    const downPaymentAmount = propertyData.price * propertyData.downPayment / 100;
    const agentFee = propertyData.price * propertyData.agentFeePercent / 100;
    const dldFee = propertyData.dldFeeIncluded ? propertyData.price * 0.04 : 0;
    const additionalCosts = agentFee + dldFee;
    const totalInvestment = downPaymentAmount + additionalCosts;
    
    // Monthly calculations
    const monthlyPayment = loanAmount > 0 ? 
      (loanAmount * (propertyData.interestRate / 100 / 12)) / 
      (1 - Math.pow(1 + propertyData.interestRate / 100 / 12, -propertyData.loanTerm * 12)) : 0;
    
    const grossMonthlyRent = propertyData.monthlyRent + propertyData.additionalIncome;
    const effectiveRent = grossMonthlyRent * (100 - propertyData.vacancyRate) / 100;
    
    const monthlyMaintenance = (propertyData.price * propertyData.maintenanceRate / 100) / 12;
    const monthlyManagement = (effectiveRent * propertyData.managementFee / 100) + propertyData.managementBaseFee;
    const monthlyInsurance = propertyData.insurance / 12;
    const monthlyOther = propertyData.otherExpenses;
    const monthlyExpenses = monthlyMaintenance + monthlyManagement + monthlyInsurance + monthlyOther;
    
    const monthlyCashFlow = effectiveRent - monthlyPayment - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    
    // Key metrics
    const grossYield = (grossMonthlyRent * 12 / propertyData.price) * 100;
    // Net rental yield should be based on NOI (exclude mortgage) relative to property price
    const annualNoi = (effectiveRent * 12) - (monthlyExpenses * 12);
    const netYield = (annualNoi / propertyData.price) * 100;
    const cashOnCashReturn = (annualCashFlow / totalInvestment) * 100;

    // Include principal paydown in first-year ROI
    const monthlyRate = propertyData.interestRate / 100 / 12;
    let remaining = loanAmount;
    let principalPaidYear = 0;
    for (let m = 0; m < 12; m++) {
      const interestPortion = remaining * monthlyRate;
      const principalPortion = Math.max(0, monthlyPayment - interestPortion);
      principalPaidYear += principalPortion;
      remaining = Math.max(0, remaining - principalPortion);
    }
    const annualReturn = annualCashFlow + principalPaidYear;
    const annualROI = (annualReturn / totalInvestment) * 100;
    
    // Ratios
    const debtToEquityRatio = (loanAmount / downPaymentAmount) * 100;
    const monthlyExpenseRatio = ((monthlyPayment + monthlyExpenses) / effectiveRent) * 100;
    
    // DSCR (Debt Service Coverage Ratio) - Net Operating Income / Total Debt Service
    const netOperatingIncome = effectiveRent - monthlyExpenses; // Monthly NOI
    const dscr = monthlyPayment > 0 ? netOperatingIncome / monthlyPayment : 0;
    
    // IRR calculation (3-year simplified)
    const calculateIRR = (): number => {
      const initialInvestment = -totalInvestment;
      const year1CashFlow = annualCashFlow;
      const year2CashFlow = annualCashFlow * Math.pow(1 + propertyData.rentGrowth / 100, 1);
      const year3CashFlow = annualCashFlow * Math.pow(1 + propertyData.rentGrowth / 100, 2);
      
      // Simplified property value calculation for year 3
      const year3PropertyValue = propertyData.price * Math.pow(1 + propertyData.appreciationRate / 100, 3);
      const remainingLoanBalance = loanAmount * 0.8; // Simplified
      const saleProceeds = year3PropertyValue * (1 - propertyData.sellingCosts / 100) - remainingLoanBalance;
      const year3Exit = year3CashFlow + saleProceeds;
      
      // Newton-Raphson method for IRR
      let irr = 0.1; // Start at 10%
      for (let i = 0; i < 100; i++) {
        const npv = initialInvestment + 
                    year1CashFlow / Math.pow(1 + irr, 1) +
                    year2CashFlow / Math.pow(1 + irr, 2) +
                    year3Exit / Math.pow(1 + irr, 3);
        
        if (Math.abs(npv) < 1) break;
        
        const npvDerivative = -year1CashFlow / Math.pow(1 + irr, 2) -
                             2 * year2CashFlow / Math.pow(1 + irr, 3) -
                             3 * year3Exit / Math.pow(1 + irr, 4);
        
        if (Math.abs(npvDerivative) < 0.0001) break;
        
        irr = irr - npv / npvDerivative;
        
        if (irr < -0.99) irr = -0.99;
        if (irr > 10) irr = 10;
      }
      
      return irr * 100;
    };
    
    const irr = calculateIRR();
    
    // Investment Score Calculation
    const calculateInvestmentScore = (): { score: number; riskLevel: string } => {
      let score = 0;
      
      // Cash Flow (4 points max)
      if (monthlyCashFlow > 0) score += 2;
      if (cashOnCashReturn > 6) score += 2;
      
      // Yield (3 points max)
      if (netYield > 5) score += 1;
      if (netYield > 7) score += 1;
      if (grossYield > 8) score += 1;
      
      // Risk (2 points max)
      if (monthlyExpenseRatio < 30) score += 2;
      else if (monthlyExpenseRatio < 50) score += 1;
      
      // Growth (1 point max)
      if (propertyData.appreciationRate > 3) score += 1;
      
      const finalScore = Math.round((score / 10) * 10);
      
      let riskLevel = "High Risk";
      if (finalScore >= 8) riskLevel = "Low Risk";
      else if (finalScore >= 6) riskLevel = "Medium Risk";
      
      return { score: finalScore, riskLevel };
    };
    
    const { score: investmentScore, riskLevel } = calculateInvestmentScore();
    
    return {
      investmentScore,
      riskLevel,
      monthlyCashFlow,
      annualROI,
      cashOnCashReturn,
      grossYield,
      netYield,
      irr,
      totalInvestment,
      downPaymentAmount,
      loanAmount,
      additionalCosts,
      monthlyPayment,
      effectiveRent,
      monthlyExpenses: monthlyExpenses + monthlyPayment,
      debtToEquityRatio,
      monthlyExpenseRatio,
      dscr,
      vacancyRate: propertyData.vacancyRate
    };
  };
  
  const metrics = calculateMetrics();
  // ROI period selector (years)
  const [roiYears, setRoiYears] = useState<number>(3);
  // Adjustable target net yield (% on price)
  const [targetNetYield, setTargetNetYield] = useState<number>(6);
  
  // Helpers: formatting and dynamic color coding
  const formatAED = (v: number) => `AED ${Math.round(Number.isFinite(v) ? v : 0).toLocaleString()}`;
  const formatCompact = (v: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(Math.round(v));
  const safeDiv = (num: number, den: number) => (den && Number.isFinite(den) && Math.abs(den) > 0 ? num / den : 0);

  type MetricKey = 'cashFlow' | 'coc' | 'irr' | 'annualRoi' | 'grossYield' | 'netYield' | 'dscr' | 'expenseRatio' | 'ltv';
  const getMetricColors = (key: MetricKey, value: number) => {
    // Return bg and text colors based on agreed thresholds
    // Colors: orange, yellow, blue, green
    const colorSet = (tone: 'orange'|'yellow'|'blue'|'green') => ({
      bg: tone === 'orange' ? 'bg-orange-50 border-orange-200' :
          tone === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
          tone === 'blue'   ? 'bg-blue-50 border-blue-200'     :
                              'bg-green-50 border-green-200',
      text: tone === 'orange' ? 'text-orange-600' :
            tone === 'yellow' ? 'text-yellow-600' :
            tone === 'blue'   ? 'text-blue-600'   :
                                'text-green-600'
    });

    switch (key) {
      case 'cashFlow': {
        if (value < 0) return colorSet('orange');
        if (value <= 500) return colorSet('yellow');
        if (value <= 1000) return colorSet('blue');
        return colorSet('green');
      }
      case 'coc': {
        if (value < 4) return colorSet('orange');
        if (value < 6) return colorSet('yellow');
        if (value < 8) return colorSet('blue');
        return colorSet('green');
      }
      case 'irr': {
        if (value < 10) return colorSet('orange');
        if (value < 15) return colorSet('yellow');
        if (value < 20) return colorSet('blue');
        return colorSet('green');
      }
      case 'annualRoi': {
        if (value < 6) return colorSet('orange');
        if (value < 8) return colorSet('yellow');
        if (value < 10) return colorSet('blue');
        return colorSet('green');
      }
      case 'grossYield': {
        if (value < 6) return colorSet('orange');
        if (value < 8) return colorSet('yellow');
        if (value < 10) return colorSet('blue');
        return colorSet('green');
      }
      case 'netYield': {
        if (value < 4) return colorSet('orange');
        if (value < 5) return colorSet('yellow');
        if (value < 7) return colorSet('blue');
        return colorSet('green');
      }
      case 'dscr': {
        if (value < 1.2) return colorSet('orange');
        if (value < 1.5) return colorSet('yellow');
        if (value < 2.0) return colorSet('blue');
        return colorSet('green');
      }
      case 'expenseRatio': {
        if (value > 50) return colorSet('orange');
        if (value > 30) return colorSet('yellow');
        if (value > 20) return colorSet('blue');
        return colorSet('green');
      }
      case 'ltv': {
        if (value > 80) return colorSet('orange');
        if (value > 70) return colorSet('yellow');
        if (value > 60) return colorSet('blue');
        return colorSet('green');
      }
    }
  };

  const getHealthLabel = (key: MetricKey, value: number) => {
    switch (key) {
      case 'cashFlow':
        if (value < 0) return 'Negative';
        if (value <= 500) return 'Acceptable';
        if (value <= 1000) return 'Very good';
        return 'Excellent';
      case 'coc':
        if (value < 4) return 'Weak';
        if (value < 6) return 'Acceptable';
        if (value < 8) return 'Good';
        return 'Excellent';
      case 'irr':
        if (value < 10) return 'Weak';
        if (value < 15) return 'Acceptable';
        if (value < 20) return 'Good';
        return 'Excellent';
      case 'annualRoi':
        if (value < 6) return 'Weak';
        if (value < 8) return 'Acceptable';
        if (value < 10) return 'Good';
        return 'Excellent';
      case 'grossYield':
        if (value < 6) return 'Weak';
        if (value < 8) return 'Acceptable';
        if (value < 10) return 'Good';
        return 'Excellent';
      case 'netYield':
        if (value < 4) return 'Weak';
        if (value < 5) return 'Acceptable';
        if (value < 7) return 'Good';
        return 'Excellent';
      case 'dscr':
        if (value < 1.2) return 'Weak';
        if (value < 1.5) return 'Acceptable';
        if (value < 2.0) return 'Good';
        return 'Excellent';
      case 'expenseRatio':
        if (value > 50) return 'Weak';
        if (value > 30) return 'Acceptable';
        if (value > 20) return 'Good';
        return 'Excellent';
    }
  };

  const getHealthIcon = (key: MetricKey, value: number) => {
    // Map bands to emoji-only icons per your design
    switch (key) {
      case 'cashFlow':
        if (value < 0) return '❌';
        if (value <= 500) return '🟨';
        if (value <= 1000) return '🔵';
        return '✅';
      case 'coc':
        if (value < 4) return '❌';
        if (value < 6) return '🟨';
        if (value < 8) return '🔵';
        return '✅';
      case 'irr':
        if (value < 10) return '❌';
        if (value < 15) return '🟨';
        if (value < 20) return '🔵';
        return '✅';
      case 'annualRoi':
        if (value < 6) return '❌';
        if (value < 8) return '🟨';
        if (value < 10) return '🔵';
        return '✅';
      case 'grossYield':
        if (value < 6) return '❌';
        if (value < 8) return '🟨';
        if (value < 10) return '🔵';
        return '✅';
      case 'netYield':
        if (value < 4) return '❌';
        if (value < 5) return '🟨';
        if (value < 7) return '🔵';
        return '✅';
      case 'dscr':
        if (value < 1.2) return '❌';
        if (value < 1.5) return '🟨';
        if (value < 2.0) return '🔵';
        return '✅';
      case 'expenseRatio':
        if (value > 50) return '❌';
        if (value > 30) return '🟨';
        if (value > 20) return '🔵';
        return '✅';
      case 'ltv':
        if (value > 80) return '❌';
        if (value > 70) return '🟨';
        if (value > 60) return '🔵';
        return '✅';
    }
  };
  
  // Monthly expense components used across sections
  const monthlyMaintenance = (propertyData.price * propertyData.maintenanceRate / 100) / 12;
  const monthlyManagement = (metrics.effectiveRent * propertyData.managementFee / 100) + propertyData.managementBaseFee;
  const monthlyInsurance = propertyData.insurance / 12;
  const monthlyOther = propertyData.otherExpenses;

  // Rental recommendation calculations (target net yield on price, NOI excludes mortgage)
  const vacancyFactor = Math.max(0.01, (100 - propertyData.vacancyRate) / 100);
  const managementPct = Math.max(0, propertyData.managementFee) / 100;
  const baseFee = propertyData.managementBaseFee;
  const fixedOperatingMonthly = baseFee + monthlyMaintenance + monthlyInsurance + monthlyOther;

  const monthlyNoiTarget = (targetNetYield / 100) * propertyData.price / 12; // AED/month

  // Solve for effective rent E where: NOI = E - (E*mgmt% + baseFee + fixed ops) = target
  const effectiveRentNeeded = (monthlyNoiTarget + fixedOperatingMonthly) / Math.max(0.01, (1 - managementPct));
  const recommendedGrossRent = effectiveRentNeeded / vacancyFactor;

  // Current NOI and yields (exclude mortgage)
  const currentEffectiveRent = (propertyData.monthlyRent + propertyData.additionalIncome) * vacancyFactor;
  const currentMonthlyNoi = currentEffectiveRent - (currentEffectiveRent * managementPct + fixedOperatingMonthly);
  const currentNetYieldOnPrice = safeDiv(currentMonthlyNoi * 12, propertyData.price) * 100;

  // Recommended NOI and yields
  const recommendedEffectiveRent = effectiveRentNeeded;
  const recommendedMonthlyNoi = monthlyNoiTarget; // by construction
  const recommendedNetYieldOnPrice = safeDiv(recommendedMonthlyNoi * 12, propertyData.price) * 100;
  
  // Expense breakdown for pie chart
  
  const expenseBreakdown = [
    { label: 'Mortgage', amount: metrics.monthlyPayment, color: '#3b82f6', percentage: (metrics.monthlyPayment / metrics.monthlyExpenses) * 100 },
    { label: 'Management', amount: monthlyManagement, color: '#06b6d4', percentage: (monthlyManagement / metrics.monthlyExpenses) * 100 },
    { label: 'Maintenance', amount: monthlyMaintenance, color: '#10b981', percentage: (monthlyMaintenance / metrics.monthlyExpenses) * 100 },
    { label: 'Insurance', amount: monthlyInsurance, color: '#f59e0b', percentage: (monthlyInsurance / metrics.monthlyExpenses) * 100 },
    { label: 'Other', amount: monthlyOther, color: '#ef4444', percentage: (monthlyOther / metrics.monthlyExpenses) * 100 }
  ];
  
  const getRecommendation = (score: number) => {
    if (score >= 8) return "Strong Buy";
    if (score >= 6) return "Buy";
    if (score >= 4) return "Hold";
    return "Avoid";
  };
  
  // ROI calculation for selected years
  const totalROI = ((Math.pow(1 + metrics.irr / 100, roiYears) - 1) * 100);

  return (
    <div className="min-h-screen bg-gray-50 pb-32 pt-4">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Investment Overview</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Home className="h-4 w-4" />
                <span>{propertyData.propertyStatus === 'ready' ? 'Ready Property' : 'Off-Plan Property'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Property Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
            <CardTitle className="text-base">Property Summary</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('goToAnalyzeFirstStep'))}
            >
              <Edit3 className="h-4 w-4 mr-2" /> Edit Inputs
            </Button>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-wrap gap-2 text-xs">
              {propertyData.name && (
                <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  Address: {propertyData.name}
                </div>
              )}
              <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                Price: {formatAED(propertyData.price)}
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                Status: {propertyData.propertyStatus === 'ready' ? 'Ready' : 'Off-Plan'}
              </div>
              {propertyData.area && (
                <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  Community: {propertyData.area}
                </div>
              )}
              <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                Beds/Baths: {propertyData.bedrooms === 'studio' ? 'Studio' : `${propertyData.bedrooms} BR`} / {propertyData.bathrooms} BA
              </div>
              {typeof propertyData.sizeSqft === 'number' && propertyData.sizeSqft > 0 && (
                <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  Size: {propertyData.sizeSqft.toLocaleString()} sqft
                </div>
              )}
              {propertyData.handoverBy && (
                <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  Handover: {propertyData.handoverBy}
                </div>
              )}
              {typeof propertyData.preHandoverPercent === 'number' && (
                <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  Handover Payment: {propertyData.preHandoverPercent}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <CardTitle>Key Metrics</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Essential financial metrics that determine the profitability and attractiveness of your property investment.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Monthly Cash Flow */}
              <div className={`${getMetricColors('cashFlow', metrics.monthlyCashFlow).bg} border rounded-xl p-4 relative`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <TrendingUp className={`h-4 w-4 ${getMetricColors('cashFlow', metrics.monthlyCashFlow).text}`} />
                  </div>
                  <Dialog>
                    <DialogTrigger>
                      <Info className="h-4 w-4 text-gray-500" />
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Monthly Cash Flow</DialogTitle>
                        <DialogDescription>Net monthly income after all expenses and mortgage payments.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div className="p-4 rounded-lg bg-blue-50">
                          <div className="font-semibold text-blue-700 mb-2">What it means:</div>
                          <p className="text-sm text-slate-700">This represents your monthly profit or loss from the property investment after covering all costs.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-50">
                          <div className="font-semibold text-green-700 mb-2">Healthy values:</div>
                          <ul className="text-sm text-slate-700 space-y-2">
                            <li>• Negative: ❌ High risk</li>
                            <li>• 0–500 AED: 🟨 Acceptable</li>
                            <li>• 500–1,000 AED: 🔵 Very good</li>
                            <li>• 1,000+ AED: ✅ Excellent</li>
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className={`text-2xl font-bold ${getMetricColors('cashFlow', metrics.monthlyCashFlow).text} mb-1`}>
                  {formatAED(metrics.monthlyCashFlow)}
                </div>
                <div className="text-sm text-gray-600">Monthly Cash Flow</div>
                {/* Health badge bottom-right */}
                <div className={`absolute bottom-2 right-2 text-base px-2 py-1 rounded ${getMetricColors('cashFlow', metrics.monthlyCashFlow).text}`}> 
                  {getHealthIcon('cashFlow', metrics.monthlyCashFlow)}
                </div>
              </div>

              {/* Cash-on-Cash Return */}
              <div className={`${getMetricColors('coc', metrics.cashOnCashReturn).bg} border rounded-xl p-4 relative`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                  </div>
                  <Dialog>
                    <DialogTrigger>
                      <Info className="h-4 w-4 text-gray-500" />
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Cash‑on‑Cash Return</DialogTitle>
                        <DialogDescription>Annual cash flow divided by total cash invested.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div className="p-4 rounded-lg bg-blue-50">
                          <div className="font-semibold text-blue-700 mb-2">What it means:</div>
                          <p className="text-sm text-slate-700">Shows the return on your actual cash invested after debt service and operating expenses.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-50">
                          <div className="font-semibold text-green-700 mb-2">Healthy values:</div>
                          <ul className="text-sm text-slate-700 space-y-2">
                            <li>• &lt; 4%: 🟧 Weak</li>
                            <li>• 4–6%: 🟨 Acceptable</li>
                            <li>• 6–8%: 🔵 Good</li>
                            <li>• &gt; 8%: ✅ Excellent</li>
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className={`text-2xl font-bold ${getMetricColors('coc', metrics.cashOnCashReturn).text} mb-1`}>
                  {metrics.cashOnCashReturn.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Cash-on-Cash Return</div>
                <div className={`absolute bottom-2 right-2 text-base px-2 py-1 rounded ${getMetricColors('coc', metrics.cashOnCashReturn).text}`}>
                  {getHealthIcon('coc', metrics.cashOnCashReturn)}
                </div>
              </div>

              {/* IRR */}
              <div className={`${getMetricColors('irr', metrics.irr).bg} border rounded-xl p-4 relative`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📈</span>
                  </div>
                  <Dialog>
                    <DialogTrigger>
                      <Info className="h-4 w-4 text-gray-500" />
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>IRR (Internal Rate of Return)</DialogTitle>
                        <DialogDescription>Annualized return that accounts for all cash flows and exit proceeds.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div className="p-4 rounded-lg bg-blue-50">
                          <div className="font-semibold text-blue-700 mb-2">What it means:</div>
                          <p className="text-sm text-slate-700">Balances cash flow timing and capital appreciation. Useful for comparing projects.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-50">
                          <div className="font-semibold text-green-700 mb-2">Healthy values:</div>
                          <ul className="text-sm text-slate-700 space-y-2">
                            <li>• &lt; 10%: 🟧 Weak</li>
                            <li>• 10–15%: 🟨 Acceptable</li>
                            <li>• 15–20%: 🔵 Good</li>
                            <li>• &gt; 20%: ✅ Excellent</li>
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className={`text-2xl font-bold ${getMetricColors('irr', metrics.irr).text} mb-1`}>
                  {metrics.irr.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">IRR (Internal Rate of Return)</div>
                <div className={`absolute bottom-2 right-2 text-base px-2 py-1 rounded ${getMetricColors('irr', metrics.irr).text}`}>
                  {getHealthIcon('irr', metrics.irr)}
                </div>
              </div>

              {/* Annual ROI */}
              <div className={`${getMetricColors('annualRoi', metrics.annualROI).bg} border rounded-xl p-4 relative`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                  </div>
                  <Dialog>
                    <DialogTrigger>
                      <Info className="h-4 w-4 text-gray-500" />
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Annual ROI (Year 1)</DialogTitle>
                        <DialogDescription>Includes cash flow and principal reduction during year one.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div className="p-4 rounded-lg bg-blue-50">
                          <div className="font-semibold text-blue-700 mb-2">What it means:</div>
                          <p className="text-sm text-slate-700">Your total first‑year return relative to cash invested.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-50">
                          <div className="font-semibold text-green-700 mb-2">Healthy values:</div>
                          <ul className="text-sm text-slate-700 space-y-2">
                            <li>• &lt; 6%: 🟧 Weak</li>
                            <li>• 6–8%: 🟨 Acceptable</li>
                            <li>• 8–10%: 🔵 Good</li>
                            <li>• &gt; 10%: ✅ Excellent</li>
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className={`text-2xl font-bold ${getMetricColors('annualRoi', metrics.annualROI).text} mb-1`}>
                  {metrics.annualROI.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Annual ROI (Year 1)</div>
                <div className={`absolute bottom-2 right-2 text-base px-2 py-1 rounded ${getMetricColors('annualRoi', metrics.annualROI).text}`}>
                  {getHealthIcon('annualRoi', metrics.annualROI)}
                </div>
              </div>

              {/* Total ROI (X Years) */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Period:</span>
                  <select 
                    className="text-sm border rounded px-2 py-1 bg-white"
                    value={roiYears}
                    onChange={(e) => setRoiYears(parseInt(e.target.value))}
                  >
                    <option value={3}>3Y</option>
                    <option value={5}>5Y</option>
                    <option value={7}>7Y</option>
                  </select>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p><strong>Total ROI ({roiYears} Years)</strong></p>
                        <p>Cumulative return over the selected period including cash flow and capital appreciation (based on IRR).</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {totalROI.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Total ROI ({roiYears} Years)</div>
              </div>

              {/* Gross Yield */}
              <div className={`${getMetricColors('grossYield', metrics.grossYield).bg} border rounded-xl p-4 relative`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏰</span>
                  </div>
                  <Dialog>
                    <DialogTrigger>
                      <Info className="h-4 w-4 text-gray-500" />
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Gross Yield</DialogTitle>
                        <DialogDescription>Annual rent divided by purchase price (before expenses).</DialogDescription>
                      </DialogHeader>
                      <div className="p-4 rounded-lg bg-green-50">
                        <div className="font-semibold text-green-700 mb-2">Healthy values:</div>
                        <ul className="text-sm text-slate-700 space-y-2">
                          <li>• &lt; 6%: 🟧 Weak</li>
                          <li>• 6–8%: 🟨 Acceptable</li>
                          <li>• 8–10%: 🔵 Good</li>
                          <li>• &gt; 10%: ✅ Excellent</li>
                        </ul>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className={`text-2xl font-bold ${getMetricColors('grossYield', metrics.grossYield).text} mb-1`}>
                  {metrics.grossYield.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Gross Yield</div>
                <div className={`absolute bottom-2 right-2 text-base px-2 py-1 rounded ${getMetricColors('grossYield', metrics.grossYield).text}`}>
                  {getHealthIcon('grossYield', metrics.grossYield)}
                </div>
              </div>

              {/* Net Yield */}
              <div className={`${getMetricColors('netYield', metrics.netYield).bg} border rounded-xl p-4 relative`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📉</span>
                  </div>
                  <Dialog>
                    <DialogTrigger>
                      <Info className="h-4 w-4 text-gray-500" />
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Net Yield</DialogTitle>
                        <DialogDescription>Net operating income (NOI) / price — excludes mortgage.</DialogDescription>
                      </DialogHeader>
                      <div className="p-4 rounded-lg bg-green-50">
                        <div className="font-semibold text-green-700 mb-2">Healthy values:</div>
                        <ul className="text-sm text-slate-700 space-y-2">
                          <li>• &lt; 4%: 🟧 Weak</li>
                          <li>• 4–5%: 🟨 Acceptable</li>
                          <li>• 5–7%: 🔵 Good</li>
                          <li>• &gt; 7%: ✅ Excellent</li>
                        </ul>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className={`text-2xl font-bold ${getMetricColors('netYield', metrics.netYield).text} mb-1`}>
                  {metrics.netYield.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Net Yield</div>
                <div className={`absolute bottom-2 right-2 text-base px-2 py-1 rounded ${getMetricColors('netYield', metrics.netYield).text}`}>
                  {getHealthIcon('netYield', metrics.netYield)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary & Monthly Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <CardTitle>Financial Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Investment</span>
                <span className="font-semibold">AED {metrics.totalInvestment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Down Payment</span>
                <span className="font-semibold">AED {metrics.downPaymentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Additional Costs</span>
                <span className="font-semibold">AED {metrics.additionalCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="text-gray-600">Loan Amount</span>
                <span className="font-semibold">AED {metrics.loanAmount.toLocaleString()}</span>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📊</span>
                  <span className="font-semibold">Key Ratios</span>
                </div>
                <div className="space-y-3">
                  <div className={`flex justify-between items-center p-2 rounded ${getMetricColors('ltv', ((metrics.loanAmount / propertyData.price) * 100)).bg}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Loan-to-Value (LTV)</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p><strong>Loan-to-Value Ratio</strong></p>
                            <p>Percentage of property value financed by loan. Lower LTV means less risk. Dubai banks typically allow up to 80% LTV for residents.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{((metrics.loanAmount / propertyData.price) * 100).toFixed(1)}%</span>
                      <span className={`text-base`}>{getHealthIcon('ltv', ((metrics.loanAmount / propertyData.price) * 100))}</span>
                    </div>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded ${getMetricColors('dscr', metrics.dscr).bg}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">DSCR (Debt Service Coverage)</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p><strong>Debt Service Coverage Ratio</strong></p>
                            <p>Net Operating Income divided by debt payments. Shows ability to service debt. Above 1.2 is good, above 1.5 is excellent.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{metrics.dscr.toFixed(2)}</span>
                      <span className={`text-base`}>{getHealthIcon('dscr', metrics.dscr)}</span>
                    </div>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded ${getMetricColors('expenseRatio', metrics.monthlyExpenseRatio).bg}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Expense Ratio</span>
                      <Dialog>
                        <DialogTrigger>
                          <Info className="h-3 w-3 text-gray-400" />
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>About Expense Ratio</DialogTitle>
                            <DialogDescription>Total monthly expenses expressed as a percentage of the effective rent (after vacancy). Lower is better.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-2">
                            <div className="p-4 rounded-lg bg-blue-50">
                              <div className="font-semibold text-blue-700 mb-2">What it includes:</div>
                              <ul className="text-sm text-slate-700 space-y-1">
                                <li>• Mortgage payment</li>
                                <li>• Management fee + base fee</li>
                                <li>• Maintenance</li>
                                <li>• Insurance</li>
                                <li>• Other monthly expenses</li>
                              </ul>
                            </div>
                            <div className="p-4 rounded-lg bg-green-50">
                              <div className="font-semibold text-green-700 mb-2">Healthy ranges:</div>
                              <ul className="text-sm text-slate-700 space-y-1">
                                <li>• ❌ &gt; 50%: High risk</li>
                                <li>• 🟨 30–50%: Acceptable</li>
                                <li>• 🔵 20–30%: Good</li>
                                <li>• ✅ &lt; 20%: Excellent</li>
                              </ul>
                            </div>
                            <div className="p-4 rounded-lg bg-amber-50">
                              <div className="font-semibold text-amber-700 mb-2">Current breakdown (monthly):</div>
                              <ul className="text-sm text-slate-700 space-y-1">
                                <li>• Mortgage: {formatAED(metrics.monthlyPayment)}</li>
                                <li>• Management: {formatAED(monthlyManagement)}</li>
                                <li>• Maintenance: {formatAED(monthlyMaintenance)}</li>
                                <li>• Insurance: {formatAED(monthlyInsurance)}</li>
                                <li>• Other: {formatAED(monthlyOther)}</li>
                                <li className="font-semibold">• Total: {formatAED(metrics.monthlyExpenses)}</li>
                              </ul>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{metrics.monthlyExpenseRatio.toFixed(1)}%</span>
                      <span className={`text-base`}>{getHealthIcon('expenseRatio', metrics.monthlyExpenseRatio)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expense Ratio Projections removed for MVP */}
            </CardContent>
          </Card>

          {/* Monthly Expenses */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-xl">💸</span>
                <CardTitle>Monthly Expenses</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Breakdown of all monthly costs associated with owning and operating this property.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                {/* Large Pie Chart on the Left */}
                <div className="flex-shrink-0">
                  <div className="relative w-44 h-44">
                    <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 48 48">
                      <circle
                        cx="24"
                        cy="24"
                        r="18"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="8"
                      />
                      {expenseBreakdown.map((expense, index) => {
                        const previousTotal = expenseBreakdown.slice(0, index).reduce((sum, exp) => sum + exp.percentage, 0);
                        const circumference = 2 * Math.PI * 18;
                        const strokeDasharray = `${(expense.percentage / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -((previousTotal / 100) * circumference);
                        
                        return (
                          <circle
                            key={expense.label}
                            cx="24"
                            cy="24"
                            r="18"
                            fill="none"
                            stroke={expense.color}
                            strokeWidth="8"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-300 hover:opacity-80"
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center leading-tight">
                        <div className="text-sm font-semibold text-gray-700">Total</div>
                        <div className="text-lg font-extrabold text-primary tabular-nums">{formatCompact(metrics.monthlyExpenses)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Legend on the Right */}
                <div className="flex-1 space-y-1">
                  {expenseBreakdown.map((expense) => (
                    <div key={expense.label} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: expense.color }}></span>
                        <span className="text-sm text-gray-800">{expense.label}</span>
                      </div>
                      <div className="text-sm font-semibold tabular-nums">
                        {formatCompact(expense.amount)} <span className="ml-1 text-xs text-gray-500">({expense.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rental Price Recommendation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏠</span>
              <CardTitle>Rental Price Recommendation</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm space-y-2">
                    <p className="font-semibold">About Current vs Recommended Rent</p>
                    <p className="text-xs text-slate-600">
                      Current rent is what you entered for the property. Recommended rent is an estimate based on price, expected yields, and expenses to help achieve healthier cash flow and return.
                    </p>
                    <div className="p-2 rounded bg-blue-50 text-xs text-slate-700">
                      <span className="font-semibold">Current Rent: </span>
                      the existing/assumed monthly rent for the property.
                    </div>
                    <div className="p-2 rounded bg-green-50 text-xs text-slate-700">
                      <span className="font-semibold">Recommended Rent: </span>
                      model-based estimate to target improved yield and IRR given the inputs.
                    </div>
                    <div className="pt-1 text-xs text-slate-600">
                      <div className="font-semibold mb-1">How we calculate</div>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Target net yield: {targetNetYield}% on price (NOI basis)</li>
                        <li>Monthly NOI target = (target × price) ÷ 12</li>
                        <li>Effective rent needed = (NOI target + base fee + fixed ops) ÷ (1 − management%)</li>
                        <li>Recommended gross rent = effective rent ÷ (1 − vacancy)</li>
                      </ul>
                      <div className="mt-1 text-slate-500">This accounts for your current expense structure and vacancy to hit the chosen net yield.</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-gray-600">Expert advice for optimal rental pricing and investment health</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 order-2 md:order-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  AED {(propertyData.monthlyRent + propertyData.additionalIncome).toLocaleString()}
                </div>
                <div className="font-medium text-green-600 mb-2">Current Rent</div>
                <div className="text-sm space-y-1">
                  <div>{currentNetYieldOnPrice.toFixed(1)}% net yield (on price)</div>
                  <div className="text-green-600 font-medium">
                    {(propertyData.monthlyRent + propertyData.additionalIncome) > recommendedGrossRent ? 'Above recommended' : 'Below recommended'}
                  </div>
                  <div className="text-xs text-gray-500">Entered by user</div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 order-1 md:order-2">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  AED {Math.round(recommendedGrossRent).toLocaleString()}
                </div>
                <div className="font-medium text-blue-600 mb-2">Recommended Rent</div>
                <div className="text-sm space-y-1">
                  <div>{recommendedNetYieldOnPrice.toFixed(1)}% net yield (on price) • target {targetNetYield}%</div>
                  <div className="text-blue-600 font-medium">Target value</div>
                  <div className="text-xs text-gray-500">Net yield aligns with Key Metrics methodology</div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-600">Target net yield</span>
                  <select
                    aria-label="Target net yield"
                    className="text-xs border rounded px-2 py-1 bg-white"
                    value={targetNetYield}
                    onChange={(e) => setTargetNetYield(parseFloat(e.target.value))}
                  >
                    <option value={4}>4%</option>
                    <option value={5}>5%</option>
                    <option value={5.5}>5.5%</option>
                    <option value={6}>6%</option>
                    <option value={6.5}>6.5%</option>
                    <option value={7}>7%</option>
                    <option value={8}>8%</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-600">Action Items:</span>
              </div>
              <div className="mt-2 text-sm text-green-700">
                Current rent is {(propertyData.monthlyRent + propertyData.additionalIncome) > recommendedGrossRent ? 'above' : 'below'} recommended — {(propertyData.monthlyRent + propertyData.additionalIncome) > recommendedGrossRent ? 'favorable' : 'consider adjustment'} position
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Score */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <h2 className="text-2xl font-bold">Deal Score</h2>
                  <p className="text-blue-100 text-sm">Comprehensive investment analysis</p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-6 w-6 text-blue-200 hover:text-white" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md" side="left">
                    <div className="space-y-2">
                      <p><strong>Investment Score Methodology</strong></p>
                      <p>• <strong>Cash Flow (4 pts):</strong> Monthly income and cash-on-cash return</p>
                      <p>• <strong>Yield (3 pts):</strong> Gross and net rental yields</p>
                      <p>• <strong>Risk (2 pts):</strong> Debt ratios and expense management</p>
                      <p>• <strong>Growth (1 pt):</strong> Capital appreciation potential</p>
                      <p className="text-xs text-gray-400 mt-2">Score: 8-10 = Excellent, 6-7 = Good, 4-5 = Fair, 0-3 = Poor</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-7xl font-bold">{metrics.investmentScore}/10</div>
                <div className="flex items-center gap-2">
                  <Badge className={`${metrics.riskLevel === 'Low Risk' ? 'bg-green-500' : metrics.riskLevel === 'Medium Risk' ? 'bg-yellow-500' : 'bg-red-500'} text-white px-3 py-1 text-lg`}>
                    {metrics.riskLevel}
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-5 w-5 text-blue-100 hover:text-white" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm text-sm space-y-2">
                        <div>
                          <span className="font-semibold">Low Risk</span> – typically DSCR ≥ 1.5, expense ratio &lt; 30%, LTV ≤ 60–70. Strong cash flow resilience. Good for conservative buyers and agents advising yield‑focused clients.
                        </div>
                        <div>
                          <span className="font-semibold">Medium Risk</span> – DSCR 1.2–1.5, expenses 30–50%, LTV 60–80. Balanced leverage and returns. Suitable for investors targeting growth with manageable risk.
                        </div>
                        <div>
                          <span className="font-semibold">High Risk</span> – DSCR &lt; 1.2 or expenses &gt; 50% or LTV &gt; 80. Sensitive to rate/rent changes; may require value‑add strategy or higher tolerance.
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-6 text-xl">Score Breakdown</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💰</span>
                      <span className="font-medium">Cash Flow</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-blue-200" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Evaluates monthly cash flow and cash-on-cash return. Higher scores for positive cash flow and returns above 6%.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-bold">3/4 pts</span>
                  </div>
                  <Progress value={75} className="h-3 mb-3" />
                  <div className="space-y-2">
                    {metrics.monthlyCashFlow > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span>Positive monthly cash flow</span>
                      </div>
                    )}
                    {metrics.cashOnCashReturn > 6 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span>Good cash-on-cash return (&gt;6%)</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📈</span>
                      <span className="font-medium">Yield</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-blue-200" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Measures rental yields. Points awarded for net yield &gt;5%, &gt;7%, and gross yield &gt;8%.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-bold">3/3 pts</span>
                  </div>
                  <Progress value={100} className="h-3 mb-3" />
                  <div className="space-y-2">
                    {metrics.netYield > 5 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span>Good net yield (&gt;5%)</span>
                      </div>
                    )}
                    {metrics.netYield > 7 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span>Excellent net yield (&gt;7%)</span>
                      </div>
                    )}
                    {metrics.grossYield > 8 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span>Strong gross yield (&gt;8%)</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span className="font-medium">Risk</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-blue-200" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Assesses financial risk through expense ratios. Lower expense ratios indicate better risk management.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-bold">1/2 pts</span>
                  </div>
                  <Progress value={50} className="h-3 mb-3" />
                  <div className="space-y-2">
                    {metrics.dscr >= 1.5 ? (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span>Excellent debt service coverage</span>
                      </div>
                    ) : metrics.dscr >= 1.2 ? (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-300" />
                        <span>Adequate debt service coverage</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-red-300" />
                        <span>Low debt service coverage</span>
                      </div>
                    )}
                    {metrics.monthlyExpenseRatio < 30 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span>Low expense ratio (&lt;30%)</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚀</span>
                      <span className="font-medium">Growth</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-blue-200" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Evaluates capital appreciation potential. Points awarded for annual appreciation rates above 3%.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-bold">1/1 pts</span>
                  </div>
                  <Progress value={100} className="h-3 mb-3" />
                  <div className="space-y-2">
                    {propertyData.appreciationRate > 3 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span>Good appreciation potential (&gt;3%)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-xl flex items-center gap-2">
                <span className="text-lg">💡</span>
                Recommendations to Improve Your Score
              </h3>
              <div className="space-y-3">
                {metrics.monthlyCashFlow <= 0 && (
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-300 mt-0.5" />
                    <div>
                      <p className="font-medium">Improve Cash Flow</p>
                      <p className="text-sm text-blue-100">Consider increasing rent, reducing vacancy rate, or negotiating lower management fees.</p>
                    </div>
                  </div>
                )}
                {metrics.dscr < 1.5 && (
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-yellow-300 mt-0.5" />
                    <div>
                      <p className="font-medium">Strengthen Debt Coverage</p>
                      <p className="text-sm text-blue-100">Increase down payment to reduce loan amount, or optimize rental income to improve DSCR above 1.5.</p>
                    </div>
                  </div>
                )}
                {metrics.monthlyExpenseRatio > 30 && (
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-red-300 mt-0.5" />
                    <div>
                      <p className="font-medium">Reduce Expense Ratio</p>
                      <p className="text-sm text-blue-100">Negotiate lower management fees, consider self-management, or shop for better insurance rates.</p>
                    </div>
                  </div>
                )}
                {propertyData.appreciationRate <= 3 && (
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                    <Home className="h-5 w-5 text-blue-300 mt-0.5" />
                    <div>
                      <p className="font-medium">Consider Growth Areas</p>
                      <p className="text-sm text-blue-100">Look for properties in developing areas with infrastructure projects or upcoming metro stations.</p>
                    </div>
                  </div>
                )}
                {metrics.investmentScore >= 8 && (
                  <div className="flex items-start gap-3 bg-green-500/20 p-3 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-300 mt-0.5" />
                    <div>
                      <p className="font-medium">Excellent Investment!</p>
                      <p className="text-sm text-blue-100">This property shows strong fundamentals across all metrics. Consider proceeding with confidence.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Edit Inputs Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full h-14 w-14 p-0"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('goToAnalyzeFirstStep'));
                }}
              >
                <Edit3 className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm">
              <p><strong>Edit Property Inputs</strong></p>
              <p>Go back to modify property details, financing parameters, or investment assumptions.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Secondary Floating Edit Inputs (bottom-center) */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
        <Button
          aria-label="Edit Inputs"
          className="px-5 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('goToAnalyzeFirstStep'));
          }}
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Inputs
        </Button>
      </div>
    </div>
  );
};

export default InvestmentDashboard;