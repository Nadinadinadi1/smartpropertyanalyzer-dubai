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
  scoreDetails: ScoreCategory[];
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

// Detailed deal score types
type ReasonType =
  | 'CASHFLOW_POSITIVE'
  | 'COC_OVER_6'
  | 'NET_OVER_5'
  | 'NET_OVER_7'
  | 'GROSS_OVER_8'
  | 'MER_UNDER_30'
  | 'MER_UNDER_50'
  | 'APP_OVER_3';

type ScoreReason = { type: ReasonType; met: boolean; points: number };

type ScoreCategory = {
  key: 'cashFlow' | 'yield' | 'risk' | 'growth';
  title: string;
  earned: number;
  max: number;
  reasons: ScoreReason[];
};

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
    const calculateInvestmentScore = (): { score: number; riskLevel: string; details: ScoreCategory[] } => {
      // Cash Flow (4 points max)
      const cashFlowReasons: ScoreReason[] = [
        { type: 'CASHFLOW_POSITIVE', met: monthlyCashFlow > 0, points: monthlyCashFlow > 0 ? 2 : 0 },
        { type: 'COC_OVER_6', met: cashOnCashReturn > 6, points: cashOnCashReturn > 6 ? 2 : 0 },
      ];
      const cashFlowEarned = cashFlowReasons.reduce((s, r) => s + r.points, 0);
      
      // Yield (3 points max)
      const yieldReasons: ScoreReason[] = [
        { type: 'NET_OVER_5', met: netYield > 5, points: netYield > 5 ? 1 : 0 },
        { type: 'NET_OVER_7', met: netYield > 7, points: netYield > 7 ? 1 : 0 },
        { type: 'GROSS_OVER_8', met: grossYield > 8, points: grossYield > 8 ? 1 : 0 },
      ];
      const yieldEarned = yieldReasons.reduce((s, r) => s + r.points, 0);
      
      // Risk (2 points max)
      const riskReasons: ScoreReason[] = [
        { type: 'MER_UNDER_30', met: monthlyExpenseRatio < 30, points: monthlyExpenseRatio < 30 ? 2 : 0 },
        { type: 'MER_UNDER_50', met: monthlyExpenseRatio >= 30 && monthlyExpenseRatio < 50, points: monthlyExpenseRatio >= 30 && monthlyExpenseRatio < 50 ? 1 : 0 },
      ];
      const riskEarned = riskReasons.reduce((s, r) => s + r.points, 0);
      
      // Growth (1 point max)
      const growthReasons: ScoreReason[] = [
        { type: 'APP_OVER_3', met: propertyData.appreciationRate > 3, points: propertyData.appreciationRate > 3 ? 1 : 0 },
      ];
      const growthEarned = growthReasons.reduce((s, r) => s + r.points, 0);

      const details: ScoreCategory[] = [
        { key: 'cashFlow', title: 'Cash Flow', earned: cashFlowEarned, max: 4, reasons: cashFlowReasons },
        { key: 'yield', title: 'Yield', earned: yieldEarned, max: 3, reasons: yieldReasons },
        { key: 'risk', title: 'Risk', earned: riskEarned, max: 2, reasons: riskReasons },
        { key: 'growth', title: 'Growth', earned: growthEarned, max: 1, reasons: growthReasons },
      ];

      const score = details.reduce((s, c) => s + c.earned, 0);
      const finalScore = Math.round((score / 10) * 10);
      
      let riskLevel = "High Risk";
      if (finalScore >= 8) riskLevel = "Low Risk";
      else if (finalScore >= 6) riskLevel = "Medium Risk";
      
      return { score: finalScore, riskLevel, details };
    };
    
    const { score: investmentScore, riskLevel, details: scoreDetails } = calculateInvestmentScore();
    
    return {
      investmentScore,
      riskLevel,
      scoreDetails,
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
  
  // Helpers: formatting and dynamic color coding
  const formatAED = (v: number) => `AED ${Math.round(Number.isFinite(v) ? v : 0).toLocaleString()}`;
  const formatCompact = (v: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(Math.round(v));
  const safeDiv = (num: number, den: number) => (den && Number.isFinite(den) && Math.abs(den) > 0 ? num / den : 0);

  // Simple Dubai benchmarks (default ranges). In a next iteration, make these area/type-specific.
  const dubaiBenchmarks = {
    monthlyProfit: 'AED 500–1,000+ / mo',
    cashReturn: '5–8% / yr',
    irr: '10–15% / yr',
    annualRoi: '8–12% (year 1)',
    grossYield: '7–10% / yr',
    netYield: '5–7% / yr',
  } as const;

  // Map numeric 0–10 score to a letter grade and plain-language label
  const getInvestmentGrade = (score: number): { grade: string; label: string } => {
    if (score >= 9) return { grade: 'A', label: 'Excellent deal' };
    if (score >= 8) return { grade: 'A−', label: 'Very strong deal' };
    if (score >= 7) return { grade: 'B+', label: 'Good deal' };
    if (score >= 6) return { grade: 'B', label: 'Solid deal' };
    if (score >= 5) return { grade: 'C+', label: 'Average deal with improvement points' };
    if (score >= 4) return { grade: 'C', label: 'Below average; needs work' };
    return { grade: 'D', label: 'High risk; proceed with caution' };
  };

  // New Investment Grade system (0–100) with weighted categories
  const INVESTMENT_GRADES = {
    'A+': { label: 'Excellent Investment', color: '#10b981', risk: 'Very Low' },
    'A':  { label: 'Very Good Investment', color: '#059669', risk: 'Low' },
    'A-': { label: 'Good Investment',      color: '#22c55e', risk: 'Low' },
    'B+': { label: 'Above‑Average Deal',   color: '#84cc16', risk: 'Low‑Medium' },
    'B':  { label: 'Solid Investment',     color: '#a3a3a3', risk: 'Medium' },
    'B-': { label: 'Average Deal',         color: '#f59e0b', risk: 'Medium' },
    'C+': { label: 'Below Average',        color: '#f97316', risk: 'Medium‑High' },
    'C':  { label: 'Weak Investment',      color: '#ef4444', risk: 'High' },
    'C-': { label: 'Risky',                color: '#dc2626', risk: 'High' },
    'D':  { label: 'Very Risky',           color: '#b91c1c', risk: 'Very High' },
    'F':  { label: 'Avoid this Deal',      color: '#7f1d1d', risk: 'Extreme' },
  } as const;

  const getGradeLetter100 = (score: number): keyof typeof INVESTMENT_GRADES => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 40) return 'D';
    return 'F';
  };

  const getRecommendationText = (letter: keyof typeof INVESTMENT_GRADES): string => {
    const map: Record<string, string> = {
      'A+': 'Excellent deal — proceed with confidence.',
      'A':  'Very strong investment — highly recommended.',
      'A-': 'Good investment opportunity — proceed.',
      'B+': 'Above average deal — consider proceeding.',
      'B':  'Solid investment — review terms carefully.',
      'B-': 'Average deal — negotiate improvements.',
      'C+': 'Below average — significant improvements needed.',
      'C':  'Weak investment — major concerns to address.',
      'C-': 'High risk — only for experienced investors.',
      'D':  'Very risky — strongly consider alternatives.',
      'F':  'Avoid — fundamental issues present.',
    };
    return map[letter] || 'Review required.';
  };

  type GradeBreakdownItem = { name: string; description: string; score: number; maxScore: number; rating: string };

  const getAgentNotes = (m: InvestmentMetrics): string => {
    const notes: string[] = [];
    if (m.monthlyCashFlow <= 0) notes.push('Improve monthly earnings: increase rent or lower fees');
    if (m.monthlyExpenseRatio > 70) notes.push('High cost pressure: reduce management/maintenance/insurance');
    if (m.netYield < 5) notes.push('Low net yield: target higher rent or price negotiation');
    if (notes.length === 0) notes.push('Strong fundamentals: consider proceeding');
    return notes.slice(0, 2).join(' • ');
  };

  const calculateInvestmentGradeReport = (m: InvestmentMetrics): { totalScore: number; letter: keyof typeof INVESTMENT_GRADES; breakdown: GradeBreakdownItem[] } => {
    const roi = Math.max(0, m.annualROI);
    const cashFlow = m.monthlyCashFlow;
    const netYield = Math.max(0, m.netYield);
    const expenseRatio = Math.max(0, m.monthlyExpenseRatio);
    const dscr = Math.max(0, m.dscr);

    // ROI (30)
    let roiScore = 0;
    if (roi >= 12) roiScore = 30; else if (roi >= 8) roiScore = 24; else if (roi >= 5) roiScore = 18; else if (roi >= 2) roiScore = 12; else roiScore = 6;

    // Cash Flow (25)
    let cfScore = 0;
    if (cashFlow >= 1500) cfScore = 25; else if (cashFlow >= 1000) cfScore = 20; else if (cashFlow >= 500) cfScore = 15; else if (cashFlow >= 100) cfScore = 10; else if (cashFlow >= 0) cfScore = 5; else cfScore = 0;

    // Net Yield (20)
    let nyScore = 0;
    if (netYield >= 7) nyScore = 20; else if (netYield >= 5) nyScore = 16; else if (netYield >= 3) nyScore = 12; else if (netYield >= 1) nyScore = 8; else nyScore = 4;

    // Expense Management (15) — lower is better. Use expense ratio (incl. mortgage) already computed
    let expScore = 0;
    if (expenseRatio <= 60) expScore = 15; else if (expenseRatio <= 70) expScore = 12; else if (expenseRatio <= 80) expScore = 9; else if (expenseRatio <= 90) expScore = 6; else expScore = 3;

    // Financial Health (10) — DSCR
    let dscrScore = 0;
    if (dscr >= 1.4) dscrScore = 10; else if (dscr >= 1.25) dscrScore = 8; else if (dscr >= 1.1) dscrScore = 6; else if (dscr >= 1.0) dscrScore = 4; else dscrScore = 2;

    const totalScore = Math.max(0, Math.min(100, roiScore + cfScore + nyScore + expScore + dscrScore));
    const letter = getGradeLetter100(totalScore);

    const breakdown: GradeBreakdownItem[] = [
      { name: 'Return on Investment', description: `${roi.toFixed(1)}% year‑1 ROI`, score: roiScore, maxScore: 30, rating: roi >= 12 ? 'Excellent' : roi >= 8 ? 'Good' : roi >= 5 ? 'Average' : roi >= 2 ? 'Poor' : 'Very poor' },
      { name: 'Monthly Cash Flow', description: `${formatAED(cashFlow)} per month`, score: cfScore, maxScore: 25, rating: cashFlow >= 1000 ? 'Good' : cashFlow >= 500 ? 'Average' : cashFlow >= 0 ? 'Break‑even' : 'Negative' },
      { name: 'Rental Yield', description: `${netYield.toFixed(1)}% net yield`, score: nyScore, maxScore: 20, rating: netYield >= 7 ? 'Excellent' : netYield >= 5 ? 'Good' : netYield >= 3 ? 'Average' : 'Poor' },
      { name: 'Cost Management', description: `${expenseRatio.toFixed(1)}% expense ratio`, score: expScore, maxScore: 15, rating: expenseRatio <= 60 ? 'Excellent' : expenseRatio <= 70 ? 'Good' : expenseRatio <= 80 ? 'Average' : 'High' },
      { name: 'Financial Health', description: `${dscr.toFixed(2)}× coverage`, score: dscrScore, maxScore: 10, rating: dscr >= 1.25 ? 'Good' : dscr >= 1.1 ? 'Average' : 'Weak' },
    ];

    return { totalScore, letter, breakdown };
  };
  
  const metrics = calculateMetrics();
  const gradeInfo = getInvestmentGrade(metrics.investmentScore);
  // ROI period selector (years)
  const [roiYears, setRoiYears] = useState<number>(3);
  // Adjustable target net yield (% on price)
  const [targetNetYield, setTargetNetYield] = useState<number>(6);
  
  // (Removed duplicate: dubaiBenchmarks, getInvestmentGrade)

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
  
  // Outlook helpers
  const breakEvenEffectiveRent = (metrics.monthlyPayment + baseFee + monthlyMaintenance + monthlyInsurance + monthlyOther) / Math.max(0.01, (1 - managementPct));
  const breakEvenGrossRent = breakEvenEffectiveRent / vacancyFactor;
  const paybackYears = metrics.monthlyCashFlow > 0 ? (metrics.totalInvestment / (metrics.monthlyCashFlow * 12)) : null;

  const monthlyRateOut = propertyData.interestRate / 100 / 12;
  const powOut = (x: number, y: number) => Math.pow(x, y);
  const remainingLoanAfterYearsSimple = (years: number): number => {
    const n = Math.max(0, Math.floor(years * 12));
    if (metrics.loanAmount <= 0) return 0;
    if (monthlyRateOut === 0) return Math.max(0, metrics.loanAmount - metrics.monthlyPayment * n);
    const a = powOut(1 + monthlyRateOut, n);
    return Math.max(0, metrics.loanAmount * a - metrics.monthlyPayment * ((a - 1) / monthlyRateOut));
  };
  const salePriceAtYears = (years: number) => propertyData.price * powOut(1 + propertyData.appreciationRate / 100, years);
  const sellingCostPct = Math.max(0, propertyData.sellingCosts) / 100;
  const annualCashFlowAtYearApprox = (yearIndexZeroBased: number) => metrics.monthlyCashFlow * 12 * powOut(1 + propertyData.rentGrowth / 100, yearIndexZeroBased);
  const cumulativeCashFlowUntilYears = (years: number) => {
    let total = 0;
    for (let y = 0; y < years; y++) total += annualCashFlowAtYearApprox(y);
    return total;
  };
  const previewAt = (years: number) => {
    const sp = salePriceAtYears(years);
    const remain = remainingLoanAfterYearsSimple(years);
    const net = sp * (1 - sellingCostPct) - remain;
    const cum = cumulativeCashFlowUntilYears(years);
    const em = safeDiv(net + cum, metrics.totalInvestment);
    return { years, net, em };
  };
  const outlookPreviews = [3, 5, 7].map(previewAt);

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
                <div className="mt-1 text-xs text-gray-600">
                  <span className="font-medium">Health:</span> {getHealthLabel('cashFlow', metrics.monthlyCashFlow)}
                  <span className="mx-2">•</span>
                  <span className="font-medium">Benchmark (Dubai):</span> {dubaiBenchmarks.monthlyProfit}
                </div>
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
                <div className="text-sm text-gray-600">Cash Return (on Cash Invested)</div>
                <div className="mt-1 text-xs text-gray-600">
                  <span className="font-medium">Health:</span> {getHealthLabel('coc', metrics.cashOnCashReturn)}
                  <span className="mx-2">•</span>
                  <span className="font-medium">Benchmark (Dubai):</span> {dubaiBenchmarks.cashReturn}
                </div>
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
                <div className="mt-1 text-xs text-gray-600">
                  <span className="font-medium">Health:</span> {getHealthLabel('irr', metrics.irr)}
                  <span className="mx-2">•</span>
                  <span className="font-medium">Benchmark (Dubai):</span> {dubaiBenchmarks.irr}
                </div>
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
                <div className="mt-1 text-xs text-gray-600">
                  <span className="font-medium">Health:</span> {getHealthLabel('annualRoi', metrics.annualROI)}
                  <span className="mx-2">•</span>
                  <span className="font-medium">Benchmark (Dubai):</span> {dubaiBenchmarks.annualRoi}
                </div>
                <div className={`absolute bottom-2 right-2 text-base px-2 py-1 rounded ${getMetricColors('annualRoi', metrics.annualROI).text}`}>
                  {getHealthIcon('annualRoi', metrics.annualROI)}
                </div>
              </div>

              {/* Total ROI card removed per request */}

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
                <div className="mt-1 text-xs text-gray-600">
                  <span className="font-medium">Health:</span> {getHealthLabel('grossYield', metrics.grossYield)}
                  <span className="mx-2">•</span>
                  <span className="font-medium">Benchmark (Dubai):</span> {dubaiBenchmarks.grossYield}
                </div>
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
                <div className="mt-1 text-xs text-gray-600">
                  <span className="font-medium">Health:</span> {getHealthLabel('netYield', metrics.netYield)}
                  <span className="mx-2">•</span>
                  <span className="font-medium">Benchmark (Dubai):</span> {dubaiBenchmarks.netYield}
                </div>
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

        {/* Outlook */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔭</span>
              <CardTitle>Outlook</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <button aria-label="About Outlook" className="text-gray-400 hover:text-gray-700">
                    <Info className="h-4 w-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Outlook — Methodology</DialogTitle>
                    <DialogDescription>Formulas used for break‑even, target rent, payback time and exit preview</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <div className="font-semibold text-blue-700 mb-1">Break‑even rent</div>
                      <p>Effective rent where monthly cash flow = 0.</p>
                      <p className="text-xs text-slate-600 mt-1">E<sub>be</sub> = (mortgage + base fee + maintenance + insurance + other) ÷ (1 − management%) • Gross rent = E<sub>be</sub> ÷ (1 − vacancy)</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <div className="font-semibold text-green-700 mb-1">Target rent</div>
                      <p>Rent to hit the chosen net‑yield on price.</p>
                      <p className="text-xs text-slate-600 mt-1">NOI target = price × target net‑yield ÷ 12 • E<sub>target</sub> = (NOI target + fixed ops) ÷ (1 − management%) • Gross rent = E<sub>target</sub> ÷ (1 − vacancy)</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50">
                      <div className="font-semibold text-emerald-700 mb-1">Payback time</div>
                      <p>Years of cash flow to recover initial cash.</p>
                      <p className="text-xs text-slate-600 mt-1">payback = total investment ÷ (monthly cash flow × 12)</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50">
                      <div className="font-semibold text-purple-700 mb-1">Exit preview (3/5/7y)</div>
                      <p>Net proceeds and equity multiple at sale.</p>
                      <p className="text-xs text-slate-600 mt-1">sale price = price × (1 + appreciation%)^years • net proceeds = sale × (1 − selling costs%) − remaining loan • equity multiple = (net proceeds + cumulative cash flow) ÷ total investment</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* Subtitle removed per request */}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Break-even & Target Rent */}
              <div className="p-4 rounded-xl border bg-white">
                <div className="text-sm text-gray-600 mb-1">Break-even rent</div>
                <div className="text-xl font-bold text-slate-800">AED {Math.round(breakEvenGrossRent).toLocaleString()}</div>
                <div className="mt-3 text-sm text-gray-600">Target rent</div>
                <div className="text-lg font-semibold text-blue-700">AED {Math.round(recommendedGrossRent).toLocaleString()}</div>
                <div className="mt-2 text-xs text-gray-500">Rent where cash flow is zero and rent to hit your target net yield</div>
              </div>

              {/* Payback Time */}
              <div className="p-4 rounded-xl border bg-white">
                <div className="text-sm text-gray-600 mb-1">Payback time</div>
                <div className="text-xl font-bold text-slate-800">{paybackYears ? `${paybackYears.toFixed(1)} years` : 'N/A'}</div>
                <div className="mt-2 text-xs text-gray-500">Years of cash flow needed to recover your initial cash</div>
              </div>

              {/* Mini Exit Preview */}
              <div className="p-4 rounded-xl border bg-white">
                <div className="text-sm text-gray-600 mb-2">Exit preview (Net proceeds)</div>
                <div className="flex items-center justify-between text-sm">
                  {outlookPreviews.map(p => (
                    <div key={p.years} className="text-center">
                      <div className="text-xs text-gray-500">{p.years}y</div>
                      <div className="font-semibold">{formatAED(p.net)}</div>
                      <div className="text-xs text-gray-500">{p.em.toFixed(2)}x</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">Net proceeds at exit and simple equity multiple</div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <div className={`text-2xl font-bold mb-1 ${((propertyData.monthlyRent + propertyData.additionalIncome) > recommendedGrossRent) ? 'text-green-600' : 'text-orange-600'}`}>
                  AED {(propertyData.monthlyRent + propertyData.additionalIncome).toLocaleString()}
                </div>
                <div className={`font-medium mb-2 ${((propertyData.monthlyRent + propertyData.additionalIncome) > recommendedGrossRent) ? 'text-green-600' : 'text-orange-600'}`}>Current Rent</div>
                <div className="text-sm space-y-1">
                  <div>{currentNetYieldOnPrice.toFixed(1)}% net yield (on price)</div>
                  <div className={`${((propertyData.monthlyRent + propertyData.additionalIncome) > recommendedGrossRent) ? 'text-green-600' : 'text-orange-600'} font-medium`}>
                    {(propertyData.monthlyRent + propertyData.additionalIncome) > recommendedGrossRent ? 'Above recommended' : 'Below recommended'}
                  </div>
                  {((propertyData.monthlyRent + propertyData.additionalIncome) <= recommendedGrossRent) && (
                    <div className="text-xs text-gray-600">
                      To reach target net yield of {targetNetYield}%, aim for AED {Math.round(recommendedGrossRent).toLocaleString()} per month.
                    </div>
                  )}
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
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-700">Action Items:</span>
              </div>
              <div className="mt-2 text-sm text-orange-700">
                Current rent is {(propertyData.monthlyRent + propertyData.additionalIncome) > recommendedGrossRent ? 'above' : 'below'} recommended — {(propertyData.monthlyRent + propertyData.additionalIncome) > recommendedGrossRent ? 'favorable' : 'consider adjustment'} position
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exit Strategy removed per request */}

        {/* Investment Score */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <h2 className="text-2xl font-bold">Investment Grade</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-blue-100 text-sm">Comprehensive deal assessment</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button aria-label="About Investment Grade" className="text-blue-200 hover:text-white">
                          <Info className="h-4 w-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Investment Grade — Methodology</DialogTitle>
                          <DialogDescription>How we calculate the letter grade and points</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 text-sm">
                          <div className="p-4 rounded-lg bg-blue-50">
                            <div className="font-semibold text-blue-700 mb-1">What it means</div>
                            <p>Your grade (A+–F) comes from a 0–100 score across five weighted pillars.</p>
                          </div>
                          <div className="p-4 rounded-lg bg-green-50">
                            <div className="font-semibold text-green-700 mb-2">How points are awarded</div>
                            <ul className="space-y-1">
                              <li><strong>Return on Investment (30)</strong>: 12%+: 30 • 8–11.9%: 24 • 5–7.9%: 18 • 2–4.9%: 12 • &lt;2%: 6</li>
                              <li><strong>Monthly Cash Flow (25)</strong>: ≥1,500 AED: 25 • ≥1,000: 20 • ≥500: 15 • ≥100: 10 • ≥0: 5 • negative: 0</li>
                              <li><strong>Net Yield (20)</strong>: ≥7%: 20 • ≥5%: 16 • ≥3%: 12 • ≥1%: 8 • &lt;1%: 4</li>
                              <li><strong>Cost Management (15)</strong> (expense ratio): ≤60%: 15 • ≤70%: 12 • ≤80%: 9 • ≤90%: 6 • &gt;90%: 3</li>
                              <li><strong>Financial Health (10)</strong> (DSCR): ≥1.40: 10 • ≥1.25: 8 • ≥1.10: 6 • ≥1.00: 4 • &lt;1.00: 2</li>
                            </ul>
                          </div>
                          <div className="p-4 rounded-lg bg-emerald-50">
                            <div className="font-semibold text-emerald-700 mb-1">From score to grade</div>
                            <p>A+: 90–100 • A: 85–89 • A‑: 80–84 • B+: 75–79 • B: 70–74 • B‑: 65–69 • C+: 60–64 • C: 55–59 • C‑: 50–54 • D: 40–49 • F: &lt;40</p>
                          </div>
                          <div className="text-xs text-slate-600">Tip: Improve the lowest-scoring pillar first for the quickest grade uplift.</div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              {(() => {
                const report = calculateInvestmentGradeReport(metrics);
                const gi = INVESTMENT_GRADES[report.letter];
                return (
                  <div className="text-center">
                    <div className="text-7xl font-extrabold" style={{ color: gi.color }}>{report.letter}</div>
                    <div className="text-xl font-semibold mt-1">{gi.label}</div>
                    {/* risk line removed */}
                    <div className="mt-3 inline-block bg-white/10 rounded-lg px-4 py-2">
                      <div className="text-xs text-blue-100">Overall Score</div>
                      <div className="text-2xl font-bold text-white">{report.totalScore}/100</div>
                        </div>
                    <div className="mt-3 text-sm text-blue-100">{getRecommendationText(report.letter)}</div>
                    <div className="mt-1 text-xs text-blue-100/90">Notes: {getAgentNotes(metrics)}</div>
                        </div>
                );
              })()}
            </div>
            
            <div className="bg-white/10 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-6 text-xl">Investment Grade Breakdown</h3>
              <div className="space-y-6">
                {(() => {
                  const r = calculateInvestmentGradeReport(metrics);
                  return r.breakdown.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex justify-between items-center mb-2">
                <div>
                          <div className="font-medium">{cat.name}</div>
                          <div className="text-xs text-blue-100">{cat.description}</div>
                    </div>
                        <div className="text-right">
                          <div className="font-bold">{cat.score}/{cat.maxScore}</div>
                          <div className="text-xs text-blue-100">{cat.rating}</div>
                  </div>
                      </div>
                      <Progress value={(cat.score / cat.maxScore) * 100} className="h-2" />
                      </div>
                  ));
                })()}
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="bg-yellow-400/20 ring-1 ring-yellow-300/40 rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-xl flex items-center gap-2">
                <span className="text-lg">💡</span>
                Recommendations to Improve Your Score
              </h3>
              <div className="space-y-3">
                {metrics.monthlyCashFlow <= 0 && (
                  <div className="flex items-start gap-3 bg-yellow-400/10 p-3 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-300 mt-0.5" />
                    <div>
                      <p className="font-medium">Improve Cash Flow</p>
                      <p className="text-sm text-blue-100">Consider increasing rent, reducing vacancy rate, or negotiating lower management fees.</p>
                    </div>
                  </div>
                )}
                {metrics.dscr < 1.5 && (
                  <div className="flex items-start gap-3 bg-yellow-400/10 p-3 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-yellow-300 mt-0.5" />
                    <div>
                      <p className="font-medium">Strengthen Debt Coverage</p>
                      <p className="text-sm text-blue-100">Increase down payment to reduce loan amount, or optimize rental income to improve DSCR above 1.5.</p>
                    </div>
                  </div>
                )}
                {metrics.monthlyExpenseRatio > 30 && (
                  <div className="flex items-start gap-3 bg-yellow-400/10 p-3 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-red-300 mt-0.5" />
                    <div>
                      <p className="font-medium">Reduce Expense Ratio</p>
                      <p className="text-sm text-blue-100">Negotiate lower management fees, consider self-management, or shop for better insurance rates.</p>
                    </div>
                  </div>
                )}
                {propertyData.appreciationRate <= 3 && (
                  <div className="flex items-start gap-3 bg-yellow-400/10 p-3 rounded-lg">
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