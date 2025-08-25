import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Target,
  Calendar,
  PieChart,
  BarChart3,
  Calculator,
  ArrowUpRight,
  Settings,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Legend,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
// Alias Recharts Tooltip to avoid conflict with UI Tooltip
import { Tooltip as RechartsTooltip } from 'recharts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PropertyData {
  propertyStatus: 'ready' | 'off-plan';
  name: string;
  sizeSqft: number;
  price: number;
  priceInputMethod: 'slider' | 'manual';
  propertyType: string;
  area: string;
  handoverBy?: string | null;
  preHandoverPercent?: number;
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

interface InvestmentDashboardProps {
  propertyData: PropertyData;
}

interface YearlyProjection {
  year: number;
  netCashFlow: number;
  cumulativeCash: number;
  equity: number;
  dscr: number;
  totalReturn: number;
  propertyValue: number;
  remainingDebt: number;
}

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function InvestmentDashboard({ propertyData }: InvestmentDashboardProps) {
  const [selectedYear, setSelectedYear] = useState<string>('3');

  // Insights disabled for beta: remove loader state

  // Guards & clamps (silent sanity checks for beta)
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : 0));
  const priceSafe = clamp(propertyData.price, 100000, 20000000);
  const downPaymentPct = clamp(propertyData.downPayment, 0, 100);
  const interestRateSafe = clamp(propertyData.interestRate, 0, 20);
  const loanTermSafe = clamp(propertyData.loanTerm, 1, 40);
  const monthlyRentSafe = Math.max(0, Number.isFinite(propertyData.monthlyRent) ? propertyData.monthlyRent : 0);
  const vacancySafe = clamp(propertyData.vacancyRate, 0, 100);
  const additionalIncomeSafe = Math.max(0, Number.isFinite(propertyData.additionalIncome) ? propertyData.additionalIncome : 0);

  // Calculate investment metrics (using safe values)
  const downPaymentAmount = priceSafe * (downPaymentPct / 100);
  const additionalCosts = (priceSafe * (propertyData.agentFeePercent / 100)) + (propertyData.dldFeeIncluded ? priceSafe * 0.04 : 0) + 5000; // Agent + DLD + legal
  const totalInvestment = downPaymentAmount + additionalCosts;
  const loanAmount = priceSafe - downPaymentAmount;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRateSafe, loanTermSafe);
  const effectiveRent = monthlyRentSafe * ((100 - vacancySafe) / 100);
  const totalMonthlyIncome = effectiveRent + additionalIncomeSafe;
  const monthlyExpenses = calculateMonthlyExpenses(propertyData);
  const monthlyCashFlow = totalMonthlyIncome - monthlyPayment - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;
  
  // Improved cash-on-cash return (using actual cash flow, not just rent)
  const cashOnCashReturn = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;
  
  // Yield calculations
  const grossYield = priceSafe > 0 ? ((monthlyRentSafe + additionalIncomeSafe) * 12 / priceSafe) * 100 : 0;
  const netYield = priceSafe > 0 ? (((totalMonthlyIncome - monthlyExpenses) * 12) / priceSafe) * 100 : 0;
  
  // Additional metrics
  // D/E computed but not displayed (beta) – kept for potential future use
  const debtToEquityRatio = totalInvestment > 0 ? (loanAmount / totalInvestment) * 100 : 0;
  // DSCR: NOI / Debt Service (use monthly values to avoid rounding)
  const monthlyNOI = totalMonthlyIncome - monthlyExpenses;
  const dscr = monthlyPayment > 0 ? (monthlyNOI / monthlyPayment) : NaN;
  // Cap rate: annual NOI / price
  const capRate = priceSafe > 0 ? ((monthlyNOI * 12) / priceSafe) * 100 : NaN;

  // Safe display helpers
  const ltvPct = priceSafe > 0 ? (loanAmount / priceSafe) * 100 : NaN;
  const expenseRatioPct = effectiveRent > 0 ? (monthlyExpenses / effectiveRent) * 100 : NaN;
  const fmtPct1 = (v: number) => Number.isFinite(v) ? v.toFixed(1) + '%' : '—';
  const fmtX2 = (v: number) => Number.isFinite(v) ? v.toFixed(2) : '—';
  const monthlyExpenseRatio = (monthlyExpenses / effectiveRent) * 100;

  // Risk rating (Low/Medium/High with emoji) – weighted model per spec
  const riskRating = (() => {
    const ltv = Number.isFinite(ltvPct) ? ltvPct : 100;
    const exp = Number.isFinite(expenseRatioPct) ? expenseRatioPct : 100;
    const dscrVal = Number.isFinite(dscr) ? dscr : 0;
    // Inline rental recommendation estimate (avoids ordering issues)
    const targetNetYieldForRisk = 6.0;
    const monthlyOpExForRisk = (propertyData.monthlyRent * (propertyData.maintenanceRate / 100)) +
                               (propertyData.monthlyRent * (propertyData.managementFee / 100)) + propertyData.managementBaseFee +
                               (propertyData.insurance / 12) + (propertyData.otherExpenses / 12);
    const requiredAnnualRentForRisk = (targetNetYieldForRisk / 100 * priceSafe) + (monthlyOpExForRisk * 12);
    let suggestedRentForRisk = requiredAnnualRentForRisk / 12;
    if (propertyData.propertyType.toLowerCase().includes('villa')) {
      suggestedRentForRisk *= 1.15;
    } else if (propertyData.propertyType.toLowerCase().includes('penthouse')) {
      suggestedRentForRisk *= 1.25;
    }
    if (propertyData.area.toLowerCase().includes('downtown') || propertyData.area.toLowerCase().includes('marina')) {
      suggestedRentForRisk *= 1.20;
    }
    const rentGapPct = monthlyRentSafe > 0 ? ((suggestedRentForRisk - monthlyRentSafe) / monthlyRentSafe) * 100 : 0;
    const yieldSpread = Number.isFinite(capRate) ? (capRate - interestRateSafe) : -Infinity;

    // Weights
    const W = { dscr: 0.40, spread: 0.25, ltv: 0.20, expense: 0.10, rentGap: 0.05 } as const;

    // Pillar scorings: 1 = low risk, 0.5 = medium, 0 = high
    const dscrScore = dscrVal >= 1.5 ? 1 : dscrVal >= 1.25 ? 0.5 : 0;
    const spreadScore = yieldSpread >= 2.5 ? 1 : yieldSpread >= 1 ? 0.5 : 0; // negative implicitly 0
    const ltvScore = ltv <= 60 ? 1 : ltv <= 70 ? 0.5 : 0;
    const expenseScore = exp <= 25 ? 1 : exp <= 35 ? 0.5 : 0;
    const rentGapAbs = Math.abs(rentGapPct);
    const rentGapScore = rentGapAbs < 10 ? 0.5 : (rentGapPct <= -10 ? 1 : 0); // ≤ -10% better than suggested

    // Weighted base score (0..100)
    let score100 =
      dscrScore * W.dscr * 100 +
      spreadScore * W.spread * 100 +
      ltvScore * W.ltv * 100 +
      expenseScore * W.expense * 100 +
      rentGapScore * W.rentGap * 100;

    // Gating & cashflow adjustment
    if (monthlyCashFlow < 0) score100 -= 10; // malus
    else if (monthlyCashFlow < 500) score100 -= 5;
    else if (monthlyCashFlow >= 1000) score100 += 5;

    // Clamp
    score100 = Math.max(0, Math.min(100, score100));

    // Map to levels
    let level = 'Medium';
    let emoji = '🟡';
    let className = 'bg-warning';
    if (score100 >= 70) { level = 'Low'; emoji = '🟢'; className = 'bg-success'; }
    else if (score100 <= 35) { level = 'High'; emoji = '🔴'; className = 'bg-danger'; }

    return { level, emoji, className, score100, breakdown: {
      dscr: { value: dscrVal, weight: W.dscr, score: dscrScore },
      spread: { value: yieldSpread, weight: W.spread, score: spreadScore },
      ltv: { value: ltv, weight: W.ltv, score: ltvScore },
      expense: { value: exp, weight: W.expense, score: expenseScore },
      rentGap: { value: rentGapPct, weight: W.rentGap, score: rentGapScore },
      cashflowAdj: monthlyCashFlow < 0 ? -10 : monthlyCashFlow < 500 ? -5 : monthlyCashFlow >= 1000 ? 5 : 0,
    } };
  })();

  // Calculate IRR and ROI
  const projectionData = generateDetailedProjectionData(propertyData, totalInvestment);
  const irr = calculateIRR(projectionData, totalInvestment);
  
  // Annual ROI (Year 1): Cash flow + equity growth in first year (minimum 0)
  const annualROI = projectionData.length > 0 ? 
    ((projectionData[0].netCashFlow + Math.max(0, projectionData[0].equity - (propertyData.price - downPaymentAmount))) / totalInvestment) * 100 : 0;
  
  // Total ROI (dynamic years): Total return over selected period
  const totalROI = projectionData.length > 0 ? 
    (() => {
      if (selectedYear === '10') {
        // 10 years total return
        return ((projectionData[9].cumulativeCash + projectionData[9].equity - totalInvestment) / totalInvestment) * 100;
      } else {
        // Selected year return - use same logic as Annual ROI for consistency
        const year = parseInt(selectedYear);
        const yearIndex = year - 1;
        if (yearIndex >= 0 && yearIndex < projectionData.length) {
          // For single year, use same calculation as Annual ROI
          if (year === 1) {
            return ((projectionData[yearIndex].netCashFlow + Math.max(0, projectionData[yearIndex].equity - (propertyData.price - downPaymentAmount))) / totalInvestment) * 100;
          } else {
            // For multi-year periods, calculate cumulative return
            return ((projectionData[yearIndex].cumulativeCash + Math.max(0, projectionData[yearIndex].equity - (propertyData.price - downPaymentAmount))) / totalInvestment) * 100;
          }
        }
        return 0;
      }
    })() : 0;
  
  // Expense breakdown data
  const expenseData = [
    { name: 'Mortgage Payment', value: monthlyPayment, color: COLORS[0] },
    { name: 'Maintenance', value: propertyData.monthlyRent * (propertyData.maintenanceRate / 100), color: COLORS[1] },
    { name: 'Management', value: (propertyData.monthlyRent * (propertyData.managementFee / 100)) + propertyData.managementBaseFee, color: COLORS[2] }, // Percentage + Base fee
    { name: 'Insurance', value: propertyData.insurance / 12, color: COLORS[3] },
    { name: 'Other Expenses', value: propertyData.otherExpenses / 12, color: COLORS[4] },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate suggested rental price for healthy investment (ported from Insights)
  const calculateSuggestedRentalPrice = (data: PropertyData, totalInvest: number): {
    monthlyRent: number;
    annualYield: number;
    cashFlow: number;
    reasoning: string[];
  } => {
    const targetNetYield = 6.0;

    const monthlyOpEx = (data.monthlyRent * (data.maintenanceRate / 100)) +
                        (data.monthlyRent * (data.managementFee / 100)) + data.managementBaseFee +
                        (data.insurance / 12) + (data.otherExpenses / 12);

    const requiredAnnualRent = (targetNetYield / 100 * data.price) + (monthlyOpEx * 12);
    const suggestedMonthlyRentBase = requiredAnnualRent / 12;

    const resultingNetYield = ((suggestedMonthlyRentBase * 12) - (monthlyOpEx * 12)) / data.price * 100;
    const resultingGrossYield = (suggestedMonthlyRentBase * 12) / data.price * 100;

    const loanAmountForCalc = data.price * ((100 - data.downPayment) / 100);
    const monthlyDebtService = calculateMonthlyPayment(loanAmountForCalc, data.interestRate, data.loanTerm);
    const resultingCashFlowBase = suggestedMonthlyRentBase - monthlyDebtService - monthlyOpEx;

    const reasoning: string[] = [
      `Target Net Yield: ${targetNetYield}%`,
      `Gross Yield: ${resultingGrossYield.toFixed(1)}%`,
      `Net Yield: ${resultingNetYield.toFixed(1)}%`,
      `Monthly Cash Flow: ${resultingCashFlowBase >= 0 ? 'Positive' : 'Negative'}`
    ];

    // Market/type adjustments
    let adjustedRent = suggestedMonthlyRentBase;
    let marketAdjustment = '';
    if (data.propertyType.toLowerCase().includes('villa')) {
      adjustedRent *= 1.15;
      marketAdjustment = 'Villa premium (+15%)';
    } else if (data.propertyType.toLowerCase().includes('penthouse')) {
      adjustedRent *= 1.25;
      marketAdjustment = 'Penthouse premium (+25%)';
    }
    if (data.area.toLowerCase().includes('downtown') || data.area.toLowerCase().includes('marina')) {
      adjustedRent *= 1.20;
      marketAdjustment += marketAdjustment ? ' + Location premium (+20%)' : 'Location premium (+20%)';
    }
    if (marketAdjustment) reasoning.push(marketAdjustment);

    // Recompute cash flow with adjusted rent
    const resultingCashFlow = adjustedRent - monthlyDebtService - monthlyOpEx;

    return {
      monthlyRent: Math.round(adjustedRent),
      annualYield: resultingNetYield,
      cashFlow: resultingCashFlow,
      reasoning
    };
  };

  const suggestedRentalPrice = calculateSuggestedRentalPrice(propertyData, totalInvestment);

  const getInvestmentScore = () => {
    let score = 0;
    const scoreDetails: { category: string; points: number; maxPoints: number; details: string[] }[] = [];
    
    // 1. Cash Flow Analysis (40% weight - 4 points)
    const cashFlowScore = (() => {
      let points = 0;
      const details: string[] = [];
      
      if (monthlyCashFlow > 0) {
        points += 2;
        details.push('✅ Positive monthly cash flow');
      } else {
        details.push('❌ Negative monthly cash flow');
      }
      
      if (cashOnCashReturn > 6) {
        points += 1;
        details.push('✅ Good cash-on-cash return (>6%)');
      } else {
        details.push('⚠️ Low cash-on-cash return');
      }
      
      if (cashOnCashReturn > 10) {
        points += 1;
        details.push('✅ Excellent cash-on-cash return (>10%)');
      }
      
      return { points, details };
    })();
    
    score += cashFlowScore.points;
    scoreDetails.push({
      category: 'Cash Flow',
      points: cashFlowScore.points,
      maxPoints: 4,
      details: cashFlowScore.details
    });
    
    // 2. Yield & Pricing Alignment (30% weight - 3 points)
    const yieldScore = (() => {
      let points = 0;
      const details: string[] = [];
      const rentGapPct = monthlyRentSafe > 0 ? ((suggestedRentalPrice.monthlyRent - monthlyRentSafe) / monthlyRentSafe) * 100 : 0;
      
      if (netYield > 5) {
        points += 1;
        details.push('✅ Good net yield (>5%)');
      } else {
        details.push('⚠️ Low net yield');
      }
      
      if (grossYield > 8) {
        points += 1;
        details.push('✅ Strong gross yield (>8%)');
      } else {
        details.push('⚠️ Moderate gross yield');
      }

      // Pricing alignment with recommendation (within ±10% or above recommended)
      if (Math.abs(rentGapPct) < 10) {
        points += 1;
        details.push('✅ Pricing aligned with recommendation (within ±10%)');
      } else if (rentGapPct <= -10) {
        points += 1;
        details.push('✅ Current rent above recommendation (favorable)');
      } else {
        details.push('⚠️ Rent ≥ 10% below recommendation');
      }
      
      return { points, details };
    })();
    
    score += yieldScore.points;
    scoreDetails.push({
      category: 'Yield & Pricing',
      points: yieldScore.points,
      maxPoints: 3,
      details: yieldScore.details
    });
    
    // 3. Risk Analysis (20% weight - 2 points)
    const riskScore = (() => {
      let points = 0;
      const details: string[] = [];
      
      // Use LTV proxy instead of D/E for risk in beta
      if ((100 - propertyData.downPayment) <= 70) {
        points += 1;
        details.push('✅ Conservative LTV (≤70%)');
      } else {
        details.push('⚠️ Higher LTV (>70%)');
      }
      
      if (monthlyExpenseRatio < 30) {
        points += 1;
        details.push('✅ Low expense ratio (<30%)');
      } else {
        details.push('⚠️ High expense ratio');
      }
      
      return { points, details };
    })();
    
    score += riskScore.points;
    scoreDetails.push({
      category: 'Risk',
      points: riskScore.points,
      maxPoints: 2,
      details: riskScore.details
    });
    
    // 4. Growth Potential (10% weight - 1 point)
    const growthScore = (() => {
      let points = 0;
      const details: string[] = [];
      
      if (propertyData.appreciationRate > 3) {
        points += 1;
        details.push('✅ Good appreciation potential (>3%)');
      } else {
        details.push('⚠️ Low appreciation potential');
      }
      
      return { points, details };
    })();
    
    score += growthScore.points;
    scoreDetails.push({
      category: 'Growth',
      points: growthScore.points,
      maxPoints: 1,
      details: growthScore.details
    });
    
    return { score, scoreDetails };
  };

  const { score: investmentScore, scoreDetails } = getInvestmentScore();

    const filteredProjectionData = selectedYear === '10' ? projectionData :
    projectionData.filter(item => item.year <= parseInt(selectedYear));

  // Track active section on scroll to show label next to active button
  const [activeSection, setActiveSection] = useState<string>('key-metrics');
  useEffect(() => {
    const onScroll = () => {
      const sections = ['key-metrics','year-by-year-projection','investment-overview','investment-score','rental-price-recommendation'];
      let current = 'key-metrics';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.35) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-3 sm:p-6 pb-16">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Vertical Floating Navigation with Active Labels */}
      <div className="fixed right-2 top-1/2 transform -translate-y-1/2 z-40 pointer-events-none">
        <div className="pointer-events-auto bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-full p-2 shadow-md border border-transparent opacity-30 hover:opacity-90 transition-opacity duration-200">
          <nav className="flex flex-col space-y-3">
            <button
              onClick={() => document.getElementById('key-metrics')?.scrollIntoView({ behavior: 'smooth' })}
              className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${activeSection==='key-metrics' ? 'bg-green-200' : 'bg-green-100/40 dark:bg-green-900/20 hover:bg-green-200/80 dark:hover:bg-green-800/60'}`}
              aria-label="Key Metrics"
            >
              <Target className="w-5 h-5 text-green-600/70 dark:text-green-400/70 group-hover:text-green-700 dark:group-hover:text-green-300" />
              <span className="pointer-events-none absolute right-full mr-2 px-2 py-1 rounded-md text-xs font-medium bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">Key Metrics</span>
            </button>
            <button
              onClick={() => document.getElementById('year-by-year-projection')?.scrollIntoView({ behavior: 'smooth' })}
              className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${activeSection==='year-by-year-projection' ? 'bg-blue-200' : 'bg-blue-100/40 dark:bg-blue-900/20 hover:bg-blue-200/80 dark:hover:bg-blue-800/60'}`}
              aria-label="Year-by-Year & Wealth Projection"
            >
              <Calculator className="w-5 h-5 text-blue-600/70 dark:text-blue-400/70 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
              <span className="pointer-events-none absolute right-full mr-2 px-2 py-1 rounded-md text-xs font-medium bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">Projection</span>
            </button>
            <button
              onClick={() => document.getElementById('investment-overview')?.scrollIntoView({ behavior: 'smooth' })}
              className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${activeSection==='investment-overview' ? 'bg-purple-200' : 'bg-purple-100/40 dark:bg-purple-900/20 hover:bg-purple-200/80 dark:hover:bg-purple-800/60'}`}
              aria-label="Overview"
            >
              <Home className="w-5 h-5 text-purple-600/70 dark:text-purple-400/70 group-hover:text-purple-700 dark:group-hover:text-purple-300" />
              <span className="pointer-events-none absolute right-full mr-2 px-2 py-1 rounded-md text-xs font-medium bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">Overview</span>
            </button>
            <button
              onClick={() => document.getElementById('investment-score')?.scrollIntoView({ behavior: 'smooth' })}
              className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${activeSection==='investment-score' ? 'bg-indigo-200' : 'bg-indigo-100/40 dark:bg-indigo-900/20 hover:bg-indigo-200/80 dark:hover:bg-indigo-800/60'}`}
              aria-label="Investment Score"
            >
              <TrendingUp className="w-5 h-5 text-indigo-600/70 dark:text-indigo-400/70 group-hover:text-indigo-700 dark:group-hover:text-indigo-300" />
              <span className="pointer-events-none absolute right-full mr-2 px-2 py-1 rounded-md text-xs font-medium bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">Score</span>
            </button>
            <button
              onClick={() => document.getElementById('rental-price-recommendation')?.scrollIntoView({ behavior: 'smooth' })}
              className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${activeSection==='rental-price-recommendation' ? 'bg-amber-200' : 'bg-amber-100/50 dark:bg-amber-900/20 hover:bg-amber-200/80 dark:hover:bg-amber-800/60'}`}
              aria-label="Rental Recommendation"
            >
              <DollarSign className="w-5 h-5 text-amber-600/80 dark:text-amber-300/80 group-hover:text-amber-700" />
              <span className="pointer-events-none absolute right-full mr-2 px-2 py-1 rounded-md text-xs font-medium bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">Rental Price</span>
            </button>
          </nav>
        </div>
        </div>
        
      {/* Header */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 border border-blue-200 shadow-lg text-center">
        <h1 className="text-lg sm:text-2xl font-bold text-gradient-primary mb-2 sm:mb-3">Smart Property Analyzer Dubai</h1>
        <div className="mx-auto inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 bg-muted/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-muted/40">
          {propertyData.name && (
            <Badge variant="outline" className="text-sm font-semibold px-3 py-1">🏠 {propertyData.name}</Badge>
          )}
          {propertyData.propertyType && (
            <Badge variant="secondary" className="text-sm px-3 py-1">🏢 {propertyData.propertyType}</Badge>
          )}
          {propertyData.area && (
            <Badge variant="secondary" className="text-sm px-3 py-1">📍 {propertyData.area}</Badge>
          )}
          <Badge variant="outline" className="text-sm px-3 py-1">
          {propertyData.propertyStatus === 'ready' ? '🏠 Ready Property' : '🏗️ Off-Plan Property'}
        </Badge>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 border border-blue-200 shadow-lg sticky top-16 z-10 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2 justify-center">
           <div className="text-sm font-medium text-muted-foreground">📊 Property Analyses</div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div id="key-metrics" className="bg-white rounded-2xl p-3 sm:p-6 border border-blue-200 shadow-lg">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-primary mr-2" />
             <div>
            <h3 className="font-semibold">Key Metrics</h3>
               {propertyData.name && (
                 <p className="text-xs text-muted-foreground mt-1">{propertyData.name}</p>
               )}
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors"
                  title="Color legend"
                >
                  <Info className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Key Metrics Color Legend</DialogTitle>
                  <DialogDescription>
                    Drempels voor kleurcodering van de KPI-tegels
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">Monthly Cash Flow</h4>
                    <ul className="space-y-1">
                      <li className="text-green-600">Groen: ≥ AED 1,000</li>
                      <li className="text-blue-600">Blauw: ≥ AED 500</li>
                      <li className="text-yellow-600">Geel: ≥ AED 0</li>
                      <li className="text-red-600">Rood: &lt; AED 0</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Cash-on-Cash Return</h4>
                    <ul className="space-y-1">
                      <li className="text-green-600">Groen: ≥ 8%</li>
                      <li className="text-blue-600">Blauw: ≥ 6%</li>
                      <li className="text-yellow-600">Geel: ≥ 4%</li>
                      <li className="text-red-600">Rood: &lt; 4%</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">IRR</h4>
                    <ul className="space-y-1">
                      <li className="text-green-600">Groen: ≥ 12%</li>
                      <li className="text-blue-600">Blauw: ≥ 8%</li>
                      <li className="text-yellow-600">Geel: ≥ 6%</li>
                      <li className="text-red-600">Rood: &lt; 6%</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Annual ROI (Year 1)</h4>
                    <ul className="space-y-1">
                      <li className="text-green-600">Groen: ≥ 15%</li>
                      <li className="text-blue-600">Blauw: ≥ 10%</li>
                      <li className="text-yellow-600">Geel: ≥ 7%</li>
                      <li className="text-red-600">Rood: &lt; 7%</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Gross Yield</h4>
                    <ul className="space-y-1">
                      <li className="text-green-600">Groen: ≥ 8%</li>
                      <li className="text-yellow-600">Geel: ≥ 6%</li>
                      <li className="text-red-600">Rood: &lt; 6%</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Net Yield</h4>
                    <ul className="space-y-1">
                      <li className="text-green-600">Groen: ≥ 6%</li>
                      <li className="text-yellow-600">Geel: ≥ 4%</li>
                      <li className="text-red-600">Rood: &lt; 4%</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className={`rounded-2xl p-4 sm:p-6 border shadow-lg metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
            monthlyCashFlow >= 1000 ? 'bg-green-100 border-green-300' :
            monthlyCashFlow >= 500 ? 'bg-blue-100 border-blue-300' :
            monthlyCashFlow >= 0 ? 'bg-yellow-100 border-yellow-300' :
            'bg-red-100 border-red-300'
          }`}>
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-6 w-6 text-success mr-2" />
              {monthlyCashFlow >= 0 ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-danger" />}
            </div>
            <div className={`metric-value ${
              monthlyCashFlow >= 1000 ? 'text-green-600' :
              monthlyCashFlow >= 500 ? 'text-blue-600' :
              monthlyCashFlow >= 0 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {formatCurrency(monthlyCashFlow)}
            </div>
            <div className="metric-label">Monthly Cash Flow</div>
             
             {/* Health Score Indicator */}
             <div className="absolute bottom-2 right-2">
               {monthlyCashFlow >= 1000 ? (
                 <span className="text-2xl">🎯</span>
               ) : monthlyCashFlow >= 500 ? (
                 <span className="text-2xl">👍</span>
               ) : monthlyCashFlow >= 0 ? (
                 <span className="text-2xl">⚠️</span>
               ) : (
                 <span className="text-2xl">❌</span>
               )}
             </div>
             <div className="absolute top-2 right-2">
               <Dialog>
                 <DialogTrigger asChild>
                   <button className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                     <Info className="w-4 h-4" />
                   </button>
                 </DialogTrigger>
                 <DialogContent className="max-w-md">
                   <DialogHeader>
                     <DialogTitle className="text-lg">Monthly Cash Flow</DialogTitle>
                     <DialogDescription className="text-sm text-muted-foreground">
                       Net monthly income after all expenses and mortgage payments.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="space-y-3 text-sm">
                     <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What it means:</h4>
                       <p>This represents your monthly profit or loss from the property investment after covering all costs.</p>
                     </div>
                     <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Healthy values:</h4>
                       <ul className="space-y-1">
                         <li>• <strong>Positive:</strong> ✅ Good investment</li>
                         <li>• <strong>1,000+ AED:</strong> 🎯 Excellent</li>
                         <li>• <strong>500-1,000 AED:</strong> 👍 Very good</li>
                         <li>• <strong>0-500 AED:</strong> ⚠️ Acceptable</li>
                         <li>• <strong>Negative:</strong> ❌ High risk</li>
                       </ul>
                     </div>
                   </div>
                 </DialogContent>
               </Dialog>
             </div>
          </div>

          <div className={`rounded-2xl p-4 border shadow-lg metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
            cashOnCashReturn >= 8 ? 'bg-green-100 border-green-300' :
            cashOnCashReturn >= 6 ? 'bg-blue-100 border-blue-300' :
            cashOnCashReturn >= 4 ? 'bg-yellow-100 border-yellow-300' :
            'bg-red-100 border-red-300'
          }`}>
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-primary mr-2" />
            </div>
             <div className={`metric-value ${
               cashOnCashReturn >= 8 ? 'text-green-600' :
               cashOnCashReturn >= 6 ? 'text-blue-600' :
               cashOnCashReturn >= 4 ? 'text-yellow-600' :
               'text-red-600'
             }`}>
              {cashOnCashReturn.toFixed(1)}%
            </div>
            <div className="metric-label">Cash-on-Cash Return</div>
             
             {/* Health Score Indicator */}
             <div className="absolute bottom-2 right-2">
               {cashOnCashReturn >= 8 ? (
                 <span className="text-2xl">🎯</span>
               ) : cashOnCashReturn >= 6 ? (
                 <span className="text-2xl">👍</span>
               ) : cashOnCashReturn >= 4 ? (
                 <span className="text-2xl">⚠️</span>
               ) : (
                 <span className="text-2xl">❌</span>
               )}
             </div>
             <div className="absolute top-2 right-2">
               <Dialog>
                 <DialogTrigger asChild>
                   <button className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                     <Info className="w-4 h-4" />
                   </button>
                 </DialogTrigger>
                 <DialogContent className="max-w-md">
                   <DialogHeader>
                     <DialogTitle className="text-lg">Cash-on-Cash Return</DialogTitle>
                     <DialogDescription className="text-sm text-muted-foreground">
                       Annual cash flow divided by total cash investment.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="space-y-3 text-sm">
                     <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What it means:</h4>
                       <p>Shows how much cash you earn annually relative to your initial investment amount.</p>
                     </div>
                     <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Healthy values:</h4>
                       <ul className="space-y-1">
                         <li>• <strong>8%+:</strong> 🎯 Excellent investment</li>
                         <li>• <strong>6-8%:</strong> 👍 Very good</li>
                         <li>• <strong>4-6%:</strong> ⚠️ Acceptable</li>
                         <li>• <strong>2-4%:</strong> ⚠️ Below average</li>
                         <li>• <strong>Below 2%:</strong> ❌ Poor return</li>
                       </ul>
                     </div>
                   </div>
                 </DialogContent>
               </Dialog>
             </div>
          </div>

          <div className={`rounded-2xl p-4 border shadow-lg metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
            irr >= 12 ? 'bg-green-100 border-green-300' :
            irr >= 8 ? 'bg-blue-100 border-blue-300' :
            irr >= 6 ? 'bg-yellow-100 border-yellow-300' :
            'bg-red-100 border-red-300'
          }`}>
            <div className="flex items-center justify-center mb-2">
              <Calculator
                className={`h-6 w-6 mr-2 ${
                  irr >= 12
                    ? 'text-green-600'
                    : irr >= 8
                    ? 'text-blue-600'
                    : irr >= 6
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              />
            </div>
             <div className={`metric-value ${
               irr >= 12 ? 'text-green-600' :
               irr >= 8 ? 'text-blue-600' :
               irr >= 6 ? 'text-yellow-600' :
               'text-red-600'
             }`}>
              {irr.toFixed(1)}%
            </div>
            <div className="metric-label">IRR (Internal Rate of Return)</div>
             
             {/* Health Score Indicator */}
             <div className="absolute bottom-2 right-2">
               {irr >= 12 ? (
                 <span className="text-2xl">🎯</span>
               ) : irr >= 8 ? (
                 <span className="text-2xl">👍</span>
               ) : irr >= 6 ? (
                 <span className="text-2xl">⚠️</span>
               ) : (
                 <span className="text-2xl">❌</span>
               )}
             </div>
             <div className="absolute top-2 right-2">
               <Dialog>
                 <DialogTrigger asChild>
                   <button className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                     <Info className="w-4 h-4" />
                   </button>
                 </DialogTrigger>
                 <DialogContent className="max-w-md">
                   <DialogHeader>
                     <DialogTitle className="text-lg">Internal Rate of Return (IRR)</DialogTitle>
                     <DialogDescription className="text-sm text-muted-foreground">
                       The annualized rate of return considering time value of money.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="space-y-3 text-sm">
                     <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What it means:</h4>
                       <p>IRR accounts for when cash flows occur, making it more accurate than simple ROI calculations.</p>
                     </div>
                     <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Healthy values:</h4>
                       <ul className="space-y-1">
                         <li>• <strong>12%+:</strong> 🎯 Excellent investment</li>
                         <li>• <strong>8-12%:</strong> 👍 Very good</li>
                         <li>• <strong>6-8%:</strong> ⚠️ Acceptable</li>
                         <li>• <strong>4-6%:</strong> ⚠️ Below average</li>
                         <li>• <strong>Below 4%:</strong> ❌ Poor return</li>
                       </ul>
                     </div>
                   </div>
                 </DialogContent>
               </Dialog>
             </div>
          </div>

          <div className={`rounded-2xl p-4 border shadow-lg metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
            annualROI >= 15 ? 'bg-green-100 border-green-300' :
            annualROI >= 10 ? 'bg-blue-100 border-blue-300' :
            annualROI >= 7 ? 'bg-yellow-100 border-yellow-300' :
            'bg-red-100 border-red-300'
          }`}>
            <div className="flex items-center justify-center mb-2">
              <ArrowUpRight className="h-6 w-6 text-accent mr-2" />
            </div>
             <div className={`metric-value ${
               annualROI >= 15 ? 'text-green-600' :
               annualROI >= 10 ? 'text-blue-600' :
               annualROI >= 7 ? 'text-yellow-600' :
               'text-red-600'
             }`}>
              {annualROI.toFixed(1)}%
            </div>
             <div className="metric-label">Annual ROI (Year 1)</div>
             
             {/* Health Score Indicator */}
             <div className="absolute bottom-2 right-2">
               {annualROI >= 15 ? (
                 <span className="text-2xl">🎯</span>
               ) : annualROI >= 10 ? (
                 <span className="text-2xl">👍</span>
               ) : annualROI >= 7 ? (
                 <span className="text-2xl">⚠️</span>
               ) : (
                 <span className="text-2xl">❌</span>
               )}
             </div>
             <div className="absolute top-2 right-2">
               <Dialog>
                 <DialogTrigger asChild>
                   <button className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                     <Info className="w-4 h-4" />
                   </button>
                 </DialogTrigger>
                 <DialogContent className="max-w-md">
                   <DialogHeader>
                     <DialogTitle className="text-lg">Annual ROI (Year 1)</DialogTitle>
                     <DialogDescription className="text-sm text-muted-foreground">
                       First-year return including cash flow and equity growth.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="space-y-3 text-sm">
                     <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What it means:</h4>
                       <p>Combines rental income and property appreciation to show total first-year return on investment.</p>
                     </div>
                     <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Healthy values:</h4>
                       <ul className="space-y-1">
                         <li>• <strong>15%+:</strong> 🎯 Excellent investment</li>
                         <li>• <strong>10-15%:</strong> 👍 Very good</li>
                         <li>• <strong>7-10%:</strong> ⚠️ Acceptable</li>
                         <li>• <strong>5-7%:</strong> ⚠️ Below average</li>
                         <li>• <strong>Below 5%:</strong> ❌ Poor return</li>
                       </ul>
                     </div>
                   </div>
                 </DialogContent>
               </Dialog>
             </div>
          </div>

          <div className={`rounded-2xl p-4 border shadow-lg metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${(() => {
            const yearMultiplier = selectedYear === '10' ? 1 : parseInt(selectedYear) / 10;
            const adjustedThresholds = {
              success: 100 * yearMultiplier,
              warning: 60 * yearMultiplier,
              acceptable: 40 * yearMultiplier
            };
            return totalROI >= adjustedThresholds.success ? 'bg-green-100 border-green-300' : 
                   totalROI >= adjustedThresholds.warning ? 'bg-blue-100 border-blue-300' : 
                   totalROI >= adjustedThresholds.acceptable ? 'bg-yellow-100 border-yellow-300' : 
                   'bg-red-100 border-red-300';
          })()}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Period:</span>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-20 h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10Y</SelectItem>
                    <SelectItem value="3">3Y</SelectItem>
                    <SelectItem value="5">5Y</SelectItem>
                    <SelectItem value="7">7Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-purple-500 mr-2" />
            </div>
             <div className={`metric-value ${(() => {
               const yearMultiplier = selectedYear === '10' ? 1 : parseInt(selectedYear) / 10;
               const adjustedThresholds = {
                 success: 100 * yearMultiplier,
                 warning: 60 * yearMultiplier,
                 acceptable: 40 * yearMultiplier
               };
               return totalROI >= adjustedThresholds.success ? 'text-green-700' : 
                      totalROI >= adjustedThresholds.warning ? 'text-blue-700' : 
                      totalROI >= adjustedThresholds.acceptable ? 'text-yellow-700' : 
                      'text-red-700';
             })()}`}>
               {totalROI.toFixed(1)}%
             </div>
             <div className="metric-label">
               Total ROI {selectedYear === '10' ? '(10 Years)' : `(${selectedYear} Year${parseInt(selectedYear) > 1 ? 's' : ''})`}
             </div>
             
             {/* Health Score Indicator */}
             <div className="absolute bottom-2 right-2">
               {(() => {
                 const yearMultiplier = selectedYear === '10' ? 1 : parseInt(selectedYear) / 10;
                 const adjustedThresholds = {
                   success: 100 * yearMultiplier,
                   warning: 60 * yearMultiplier,
                   acceptable: 40 * yearMultiplier
                 };
                 return totalROI >= adjustedThresholds.success ? (
                   <span className="text-2xl">🎯</span>
                 ) : totalROI >= adjustedThresholds.warning ? (
                   <span className="text-2xl">👍</span>
                 ) : totalROI >= adjustedThresholds.acceptable ? (
                   <span className="text-2xl">⚠️</span>
                 ) : (
                   <span className="text-2xl">❌</span>
                 );
               })()}
             </div>
             <div className="absolute top-2 right-2">
               <Dialog>
                 <DialogTrigger asChild>
                   <button className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                     <Info className="w-4 h-4" />
                   </button>
                 </DialogTrigger>
                 <DialogContent className="max-w-md">
                   <DialogHeader>
                     <DialogTitle className="text-lg">
                       Total ROI {selectedYear === '10' ? '(10 Years)' : `(${selectedYear} Year${parseInt(selectedYear) > 1 ? 's' : ''})`}
                     </DialogTitle>
                     <DialogDescription className="text-sm text-muted-foreground">
                       Total return over {selectedYear === '10' ? '10 years' : `${selectedYear} year${parseInt(selectedYear) > 1 ? 's' : ''}`} including all cash flows and equity.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="space-y-3 text-sm">
                     <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What it means:</h4>
                       <p>Shows the total wealth creation over {selectedYear === '10' ? 'a decade' : `${selectedYear} year${parseInt(selectedYear) > 1 ? 's' : ''}`}, including rental income and property appreciation.</p>
                     </div>
                     <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Healthy values:</h4>
                       <ul className="space-y-1">
                         {(() => {
                           const yearMultiplier = selectedYear === '10' ? 1 : parseInt(selectedYear) / 10;
                           const adjustedThresholds = {
                             excellent: Math.round(100 * yearMultiplier),
                             veryGood: Math.round(60 * yearMultiplier),
                             acceptable: Math.round(40 * yearMultiplier),
                             belowAverage: Math.round(20 * yearMultiplier)
                           };
                           return (
                             <>
                               <li>• <strong>{adjustedThresholds.excellent}%+:</strong> 🎯 Excellent {selectedYear === '10' ? 'long-term' : `${selectedYear}-year`} investment</li>
                               <li>• <strong>{adjustedThresholds.veryGood}-{adjustedThresholds.excellent}%:</strong> 👍 Very good</li>
                               <li>• <strong>{adjustedThresholds.acceptable}-{adjustedThresholds.veryGood}%:</strong> ⚠️ Acceptable</li>
                               <li>• <strong>{adjustedThresholds.belowAverage}-{adjustedThresholds.acceptable}%:</strong> ⚠️ Below average</li>
                               <li>• <strong>Below {adjustedThresholds.belowAverage}%:</strong> ❌ Poor {selectedYear === '10' ? 'long-term' : `${selectedYear}-year`} return</li>
                             </>
                           );
                         })()}
                       </ul>
                     </div>
                   </div>
                 </DialogContent>
               </Dialog>
             </div>
           </div>

          <div className={`rounded-2xl p-4 border shadow-lg metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${grossYield >= 8 ? 'bg-green-100 border-green-300' : grossYield >= 6 ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300'}`}>
            <div className="flex items-center justify-center mb-2">
              <PieChart className="h-6 w-6 text-success mr-2" />
            </div>
             <div className={`metric-value ${grossYield >= 8 ? 'text-green-700' : grossYield >= 6 ? 'text-yellow-700' : 'text-red-700'}`}>
              {grossYield.toFixed(1)}%
             </div>
            <div className="metric-label">Gross Yield</div>
             
             {/* Health Score Indicator */}
             <div className="absolute bottom-2 right-2">
               {grossYield >= 8 ? (
                 <span className="text-2xl">🎯</span>
               ) : grossYield >= 6 ? (
                 <span className="text-2xl">👍</span>
               ) : grossYield >= 5 ? (
                 <span className="text-2xl">⚠️</span>
               ) : (
                 <span className="text-2xl">❌</span>
               )}
             </div>
             <div className="absolute top-2 right-2">
               <Dialog>
                 <DialogTrigger asChild>
                   <button className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                     <Info className="w-4 h-4" />
                   </button>
                 </DialogTrigger>
                 <DialogContent className="max-w-md">
                   <DialogHeader>
                     <DialogTitle className="text-lg">Gross Yield</DialogTitle>
                     <DialogDescription className="text-sm text-muted-foreground">
                       Annual rental income (including additional income) as percentage of property value.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="space-y-3 text-sm">
                     <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What it means:</h4>
                       <p>Shows rental income potential before expenses, indicating if the property price aligns with rental market.</p>
                     </div>
                     <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Healthy values:</h4>
                       <ul className="space-y-1">
                         <li>• <strong>8%+:</strong> 🎯 Excellent rental yield</li>
                         <li>• <strong>6-8%:</strong> 👍 Very good</li>
                         <li>• <strong>5-6%:</strong> ⚠️ Acceptable</li>
                         <li>• <strong>4-5%:</strong> ⚠️ Below average</li>
                         <li>• <strong>Below 4%:</strong> ❌ Low yield</li>
                       </ul>
                     </div>
                   </div>
                 </DialogContent>
               </Dialog>
             </div>
          </div>

          <div className={`rounded-2xl p-4 border shadow-lg metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${netYield >= 6 ? 'bg-green-100 border-green-300' : netYield >= 4 ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300'}`}>
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-6 w-6 text-warning mr-2" />
            </div>
             <div className={`metric-value ${netYield >= 6 ? 'text-green-700' : netYield >= 4 ? 'text-yellow-700' : 'text-red-700'}`}>
              {netYield.toFixed(1)}%
             </div>
            <div className="metric-label">Net Yield</div>
             
                          {/* Health Score Indicator */}
             <div className="absolute bottom-2 right-2">
               {netYield >= 6 ? (
                 <span className="text-2xl">🎯</span>
               ) : netYield >= 4 ? (
                 <span className="text-2xl">👍</span>
               ) : netYield >= 3 ? (
                 <span className="text-2xl">⚠️</span>
               ) : (
                 <span className="text-2xl">❌</span>
               )}
          </div>
             <div className="absolute top-2 right-2">
               <Dialog>
                 <DialogTrigger asChild>
                   <button className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                     <Info className="w-4 h-4" />
                   </button>
                 </DialogTrigger>
                 <DialogContent className="max-w-md">
                   <DialogHeader>
                     <DialogTitle className="text-lg">Net Yield</DialogTitle>
                     <DialogDescription className="text-sm text-muted-foreground">
                       Annual rental income minus expenses as percentage of property value.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="space-y-3 text-sm">
                     <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What it means:</h4>
                       <p>Shows actual profit margin after all operating expenses, giving a realistic view of investment returns.</p>
                     </div>
                     <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                       <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Healthy values:</h4>
                       <ul className="space-y-1">
                         <li>• <strong>6%+:</strong> 🎯 Excellent net yield</li>
                         <li>• <strong>4-6%:</strong> 👍 Very good</li>
                         <li>• <strong>3-4%:</strong> ⚠️ Acceptable</li>
                         <li>• <strong>2-3%:</strong> ⚠️ Below average</li>
                         <li>• <strong>Below 2%:</strong> ❌ Low net yield</li>
                       </ul>
                     </div>
                   </div>
                 </DialogContent>
               </Dialog>
             </div>
           </div>
        </div>
      </div>

      {/* Overview - Enhanced (moved directly under Key Metrics) */}
      <div id="investment-overview" className="bg-white rounded-2xl p-2 sm:p-5 border border-blue-200 shadow-lg leading-tight">
        <div className="flex items-center justify-between mb-2.5 sm:mb-4">
           <div>
          <h3 className="font-semibold text-sm sm:text-lg">Overview</h3>
          </div>
        </div>
        
        {/* Property Info Badges - Ordered */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2.5 sm:mb-4">
          {/* 1. Address/Name */}
          {propertyData.name && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">🏠 {propertyData.name}</Badge>
          )}
          {/* 2. Ready/Off-plan */}
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
            {propertyData.propertyStatus === 'ready' ? '🏠 Ready Property' : '🏗️ Off-Plan Property'}
            </Badge>
          {/* 3. Price */}
          {propertyData.price > 0 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">💵 {formatCurrency(propertyData.price)}</Badge>
          )}
          {/* 4. Community */}
          {propertyData.area && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">📍 {propertyData.area}</Badge>
          )}
          {/* Rest */}
          {propertyData.propertyType && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">🏢 {propertyData.propertyType}</Badge>
          )}
          {propertyData.sizeSqft > 0 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">📐 {propertyData.sizeSqft.toLocaleString()} sqft</Badge>
          )}
          {propertyData.bedrooms && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">🛏️ {String(propertyData.bedrooms)}</Badge>
          )}
          {propertyData.bathrooms && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">🛁 {String(propertyData.bathrooms)}</Badge>
          )}
          {propertyData.propertyStatus === 'off-plan' && propertyData.handoverBy && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">🗓️ Handover {propertyData.handoverBy}</Badge>
          )}
          {propertyData.propertyStatus === 'off-plan' && typeof propertyData.preHandoverPercent === 'number' && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">💳 Pre-handover {propertyData.preHandoverPercent}%</Badge>
          )}
          
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
          {/* Financial Summary */}
          <div className="space-y-2.5 sm:space-y-3.5">
            <h4 className="font-medium text-primary border-b border-primary/20 pb-1 text-xs sm:text-sm">💰 Financial Summary</h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight">Total Investment</span>
                <span className="font-semibold text-[13px] sm:text-sm leading-tight">{formatCurrency(totalInvestment)}</span>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight">Down Payment</span>
                <span className="font-semibold text-[13px] sm:text-sm leading-tight">{formatCurrency(downPaymentAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight">Additional Costs</span>
                <span className="font-semibold text-[13px] sm:text-sm leading-tight">{formatCurrency(additionalCosts)}</span>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight">Loan Amount</span>
                <span className="font-semibold text-[13px] sm:text-sm leading-tight">{formatCurrency(loanAmount)}</span>
              </div>
            </div>
          </div>
          
          {/* Key Ratios */}
          <div className="space-y-2.5 sm:space-y-3.5">
            <h4 className="font-medium text-accent border-b border-accent/20 pb-1 text-xs sm:text-sm">📊 Key Ratios</h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight flex items-center gap-1">Loan-to-Value (LTV)
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center justify-center text-[11px] text-accent hover:underline" aria-label="Info LTV">i</button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="max-w-sm text-[11px] leading-snug rounded-lg border border-blue-200 bg-white shadow-xl p-2">
                        <div className="space-y-2">
                          <div className="rounded-md bg-blue-50 p-2">
                            <div className="font-semibold text-blue-800 text-xs mb-1">What it means</div>
                            <p className="text-blue-900">Percentage of the property value financed with debt. Higher LTV means higher leverage and risk.</p>
                          </div>
                          <div className="rounded-md bg-green-50 p-2">
                            <div className="font-semibold text-green-800 text-xs mb-1">Healthy values</div>
                            <ul className="text-green-900 space-y-1">
                              <li>• ≤ 60%: ✅ Excellent</li>
                              <li>• 60–70%: 🙂 Very good</li>
                              <li>• 70–80%: ⚠️ Acceptable</li>
                              <li>• {'>'} 80%: ❌ High leverage</li>
                            </ul>
                          </div>
                        </div>
                    </PopoverContent>
                  </Popover>
                </span>
                <div className="flex items-center gap-1 text-right">
                  <span className="font-semibold text-[13px] sm:text-sm leading-tight">{fmtPct1(ltvPct)}</span>
                  <span className="text-[12px]">
                    {Number.isFinite(ltvPct) ? (ltvPct <= 60 ? '✅' : ltvPct <= 70 ? '🙂' : ltvPct <= 80 ? '⚠️' : '❌') : '—'}
                  </span>
                </div>
              </div>
              {/* Debt-to-Equity removed for beta to reduce complexity */}
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight flex items-center gap-1">Expense Ratio
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center justify-center text-[11px] text-accent hover:underline" aria-label="Info Expense Ratio">i</button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="max-w-sm text-[11px] leading-snug rounded-lg border border-blue-200 bg-white shadow-xl p-2">
                        <div className="space-y-2">
                          <div className="rounded-md bg-blue-50 p-2">
                            <div className="font-semibold text-blue-800 text-xs mb-1">What it means</div>
                            <p className="text-blue-900">Operating expenses as a share of gross rent. Shows cost efficiency of the asset.</p>
                          </div>
                          <div className="rounded-md bg-green-50 p-2">
                            <div className="font-semibold text-green-800 text-xs mb-1">Healthy values</div>
                            <ul className="text-green-900 space-y-1">
                              <li>• ≤ 20%: ✅ Excellent</li>
                              <li>• 20–30%: 🙂 Very good</li>
                              <li>• 30–40%: ⚠️ Acceptable</li>
                              <li>• {'>'} 40%: ❌ High expenses</li>
                            </ul>
                          </div>
                        </div>
                    </PopoverContent>
                  </Popover>
                </span>
                <div className="flex items-center gap-1 text-right">
                  <span className="font-semibold text-[13px] sm:text-sm leading-tight">{fmtPct1(expenseRatioPct)}</span>
                  <span className="text-[12px]">
                    {Number.isFinite(expenseRatioPct) ? (expenseRatioPct <= 20 ? '✅' : expenseRatioPct <= 30 ? '🙂' : expenseRatioPct <= 40 ? '⚠️' : '❌') : '—'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight flex items-center gap-1">DSCR
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center justify-center text-[11px] text-accent hover:underline" aria-label="Info DSCR">i</button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="max-w-sm text-[11px] leading-snug rounded-lg border border-blue-200 bg-white shadow-xl p-2">
                      <div className="space-y-2">
                        <div className="rounded-md bg-blue-50 p-2">
                          <div className="font-semibold text-blue-800 text-xs mb-1">What it means</div>
                          <p className="text-blue-900">Debt Service Coverage Ratio = NOI / Debt service. Waarde {'>'} 1.0 betekent dat de cashflow de schuldlast dekt.</p>
                        </div>
                        <div className="rounded-md bg-green-50 p-2">
                          <div className="font-semibold text-green-800 text-xs mb-1">Healthy values</div>
                          <ul className="text-green-900 space-y-1">
                            <li>• ≥ 1.50: ✅ Excellent</li>
                            <li>• 1.25–1.50: 🙂 Strong</li>
                            <li>• 1.10–1.25: ⚠️ Thin cushion</li>
                            <li>• {'<'} 1.10: ❌ Insufficient</li>
                          </ul>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </span>
                <div className="flex items-center gap-1 text-right">
                  <span className="font-semibold text-[13px] sm:text-sm leading-tight">{dscr.toFixed(2)}</span>
                  <span className="text-[12px]">{dscr >= 1.25 ? '✅' : dscr >= 1.1 ? '⚠️' : '❌'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight flex items-center gap-1">Cap Rate
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center justify-center text-[11px] text-accent hover:underline" aria-label="Info Cap Rate">i</button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="max-w-sm text-[11px] leading-snug rounded-lg border border-blue-200 bg-white shadow-xl p-2">
                      <div className="space-y-2">
                        <div className="rounded-md bg-blue-50 p-2">
                          <div className="font-semibold text-blue-800 text-xs mb-1">What it means</div>
                          <p className="text-blue-900">Capitalization Rate = Annual NOI / Purchase price. Indicatie van rendement los van financiering.</p>
                        </div>
                        <div className="rounded-md bg-green-50 p-2">
                          <div className="font-semibold text-green-800 text-xs mb-1">Healthy values (Dubai rental)</div>
                          <ul className="text-green-900 space-y-1">
                            <li>• ≥ 7%: ✅ Excellent</li>
                            <li>• 5–7%: 🙂 Good</li>
                            <li>• 4–5%: ⚠️ Borderline</li>
                            <li>• {'<'} 4%: ❌ Low cap</li>
                          </ul>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </span>
                <div className="flex items-center gap-1 text-right">
                  <span className="font-semibold text-[13px] sm:text-sm leading-tight">{fmtPct1(capRate)}</span>
                  <span className="text-[12px]">
                    {Number.isFinite(capRate) ? (capRate >= 7 ? '✅' : capRate >= 5 ? '🙂' : capRate >= 4 ? '⚠️' : '❌') : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Monthly Expenses - Donut under Investment Overview */}
        <div className="mt-4 sm:mt-6">
          <h4 className="font-medium text-primary text-xs sm:text-sm border-b border-primary/20 pb-2 mb-2 sm:mb-3">💸 Monthly Expenses</h4>
          {(() => {
            const expensesData = [
              { label: 'Mortgage', value: monthlyPayment, color: COLORS[0] },
              { label: 'Management', value: (propertyData.monthlyRent * (propertyData.managementFee / 100)) + propertyData.managementBaseFee, color: COLORS[1] },
              { label: 'Maintenance', value: propertyData.monthlyRent * (propertyData.maintenanceRate / 100), color: COLORS[2] },
              { label: 'Insurance', value: propertyData.insurance / 12, color: COLORS[3] },
              { label: 'Other', value: propertyData.otherExpenses / 12, color: COLORS[4] },
            ];
            const total = expensesData.reduce((sum, d) => sum + d.value, 0);
            let current = 0;
            const stops = expensesData.map(d => {
              const pct = total > 0 ? (d.value / total) * 100 : 0;
              const start = current;
              const end = current + pct;
              current = end;
              return `${d.color} ${start}% ${end}%`;
            }).join(', ');

            return (
              <div className="flex items-center justify-center gap-4 sm:gap-6 mb-3 sm:mb-4">
                <div className="relative z-0 w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-muted/40 shadow-md shadow-black/5" style={{ background: `conic-gradient(${stops})` }}>
                  <div className="absolute inset-6 sm:inset-10 bg-white rounded-full border border-muted/40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">Total</div>
                      <div className="text-sm sm:text-base font-semibold">{formatCurrency(total)}</div>
                    </div>
                  </div>
                </div>
                <div className="relative z-10 grid grid-cols-1 gap-y-2 text-[11px] sm:text-xs w-40 sm:w-56">
                  {expensesData.map((d, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="inline-block flex-none w-3.5 h-3.5 rounded-sm border border-muted/40" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="ml-auto font-medium whitespace-nowrap">{formatCurrency(d.value)} ({total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0'}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Year-by-Year Projection and Wealth Projection - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Year-by-Year Projection */}
        <div id="year-by-year-projection" className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calculator className="h-5 w-5 text-primary mr-2" />
              <div>
                <h3 className="font-semibold">Year-by-Year Projection</h3>
                {propertyData.name && (
                  <p className="text-xs text-muted-foreground mt-1">{propertyData.name}</p>
                )}
            </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors"
                    title="Color legend"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Color Legend</DialogTitle>
                    <DialogDescription>
                      Drempels voor kleurcodering in de tabel
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">Net Cash Flow</h4>
                      <ul className="space-y-1">
                        <li className="text-green-600">Groen: ≥ AED 1,000</li>
                        <li className="text-blue-600">Blauw: ≥ AED 500</li>
                        <li className="text-yellow-600">Geel: ≥ AED 0</li>
                        <li className="text-red-600">Rood: &lt; AED 0</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Total Return %</h4>
                      <ul className="space-y-1">
                        <li className="text-green-600">Groen: ≥ 15%</li>
                        <li className="text-blue-600">Blauw: ≥ 10%</li>
                        <li className="text-yellow-600">Geel: ≥ 5%</li>
                        <li className="text-red-600">Rood: &lt; 5%</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">DSCR</h4>
                      <ul className="space-y-1">
                        <li className="text-green-600">Groen: ≥ 1.25</li>
                        <li className="text-blue-600">Blauw: ≥ 1.10</li>
                        <li className="text-yellow-600">Geel: ≥ 1.00</li>
                        <li className="text-red-600">Rood: &lt; 1.00</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-1.5 sm:p-2">Year</th>
                  <th className="text-right p-1.5 sm:p-2">Net Cash Flow</th>
                  <th className="text-right p-1.5 sm:p-2">Cumulative Cash</th>
                  <th className="text-right p-1.5 sm:p-2">Equity</th>
                  <th className="text-right p-1.5 sm:p-2">DSCR</th>
                  <th className="text-right p-1.5 sm:p-2">Total Return %</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjectionData.map((item, index) => {
                  const cfClass = item.netCashFlow >= 1000 ? 'text-green-600' : item.netCashFlow >= 500 ? 'text-blue-600' : item.netCashFlow >= 0 ? 'text-yellow-600' : 'text-red-600';
                  const trClass = item.totalReturn >= 15 ? 'text-green-600' : item.totalReturn >= 10 ? 'text-blue-600' : item.totalReturn >= 5 ? 'text-yellow-600' : 'text-red-600';
                  const dscrClass = item.dscr >= 1.25 ? 'text-green-600' : item.dscr >= 1.1 ? 'text-blue-600' : item.dscr >= 1.0 ? 'text-yellow-600' : 'text-red-600';
                  return (
                    <tr key={index} className="border-b border-border/50">
                      <td className="p-1.5 sm:p-2 font-medium">{item.year}</td>
                      <td className={`text-right p-1.5 sm:p-2 ${cfClass}`}>{formatCurrency(item.netCashFlow)}</td>
                      <td className="text-right p-1.5 sm:p-2">{formatCurrency(item.cumulativeCash)}</td>
                      <td className="text-right p-1.5 sm:p-2 text-accent">{formatCurrency(item.equity)}</td>
                      <td className={`text-right p-1.5 sm:p-2 ${dscrClass}`}>{item.dscr.toFixed(1)}</td>
                      <td className="text-right p-1.5 sm:p-2 font-semibold">
                        <span className={trClass}>{item.totalReturn.toFixed(1)}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 10-Year Wealth Projection */}
        <div id="wealth-projection" className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-primary mr-2" />
            <div>
              <h3
                className="font-semibold"
                title={(() => {
                  const d = filteredProjectionData;
                  if (!d || d.length === 0) return '';
                  const last = d[d.length - 1];
                  const prev = d.length > 1 ? d[d.length - 2] : null;
                  const lastWealth = (last.equity + last.cumulativeCash);
                  const prevWealth = prev ? (prev.equity + prev.cumulativeCash) : 0;
                  const yoyDelta = prev ? (lastWealth - prevWealth) : 0;
                  const equityShare = lastWealth > 0 ? (last.equity / lastWealth) * 100 : 0;
                  const cashShare = lastWealth > 0 ? (last.cumulativeCash / lastWealth) * 100 : 0;
                  return yoyDelta >= 0
                    ? `Wealth increased last year by ${formatCurrency(Math.abs(yoyDelta))}; main driver: ${equityShare >= cashShare ? 'equity build-up' : 'cash flow'}.`
                    : `Wealth declined last year by ${formatCurrency(Math.abs(yoyDelta))}; review expenses, rent growth or financing terms.`;
                })()}
              >
                10-Year Wealth Projection
              </h3>
              {propertyData.name && (
                <p className="text-xs text-muted-foreground mt-1">{propertyData.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" title="About this chart">
                  <Info className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Wealth Projection Explained</DialogTitle>
                  <DialogDescription>
                    This chart shows how your wealth builds up over time through equity and cumulative cash flow.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 text-sm">
                  <p><strong>Equity</strong> = Property value − Remaining debt (calculated yearly with principal paydown).</p>
                  <p><strong>Cumulative Cash</strong> = Sum of yearly net cash flows (rent and other income minus operating expenses and mortgage payments).</p>
                  <p><strong>Total Wealth</strong> = Equity + Cumulative Cash.</p>
                  <p>Growth factors include rent growth, appreciation, expense inflation, and amortization of the loan.</p>
                </div>
              </DialogContent>
            </Dialog>
            {/* Removed toggle */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 Years</SelectItem>
                <SelectItem value="3">3 Years</SelectItem>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="7">7 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredProjectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                domain={['dataMin', 'dataMax']}
                ticks={(() => {
                  const data = filteredProjectionData;
                  if (data.length === 0) return [];
                  const minValue = Math.min(...data.map(d => Math.min(d.cumulativeCash + d.equity, d.equity, d.cumulativeCash)));
                  const maxValue = Math.max(...data.map(d => Math.max(d.cumulativeCash + d.equity, d.equity, d.cumulativeCash)));
                  const minTick = Math.floor(minValue / 50000) * 50000;
                  const maxTick = Math.ceil(maxValue / 50000) * 50000;
                  const ticks = [] as number[];
                  for (let i = minTick; i <= maxTick; i += 50000) ticks.push(i);
                  return ticks;
                })()}
              />
              <RechartsTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const point = filteredProjectionData.find(d => d.year === label);
                    const equity = point?.equity || 0;
                    const cash = point?.cumulativeCash || 0;
                    const totalWealth = equity + cash;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[220px]">
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">Year {label}</p>
                        <div className="text-sm">
                          <div className="flex justify-between"><span className="text-purple-600">Equity</span><span>{formatCurrency(equity)}</span></div>
                          <div className="flex justify-between"><span className="text-green-600">Cumulative Cash</span><span>{formatCurrency(cash)}</span></div>
                          <div className="border-t my-1 border-gray-200 dark:border-gray-700" />
                          <div className="flex justify-between font-semibold"><span>Total Wealth</span><span>{formatCurrency(totalWealth)}</span></div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="equity" name="Equity" stackId="wealth" stroke="#8B5CF6" fill="url(#equityGradient)" />
              <Area type="monotone" dataKey="cumulativeCash" name="Cumulative Cash" stackId="wealth" stroke="#10B981" fill="url(#cashGradient)" />
              <Line type="monotone" dataKey={(d:any) => (d.equity + d.cumulativeCash)} name="Total Wealth" stroke="#2563EB" strokeWidth={2} dot={false} />
              <ReferenceLine x={3} stroke="#9CA3AF" strokeDasharray="4 4" label={{ value: 'Year 3', position: 'insideTopRight', fill: '#9CA3AF', fontSize: 10 }} />
              <ReferenceLine x={5} stroke="#9CA3AF" strokeDasharray="4 4" label={{ value: 'Year 5', position: 'insideTopRight', fill: '#9CA3AF', fontSize: 10 }} />
              <ReferenceLine x={7} stroke="#9CA3AF" strokeDasharray="4 4" label={{ value: 'Year 7', position: 'insideTopRight', fill: '#9CA3AF', fontSize: 10 }} />
              <ReferenceLine x={10} stroke="#9CA3AF" strokeDasharray="4 4" label={{ value: 'Year 10', position: 'insideTopRight', fill: '#9CA3AF', fontSize: 10 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Wealth Insights */}
        {(() => {
          const data = filteredProjectionData;
          if (!data || data.length === 0) return null;
          const last = data[data.length - 1];
          const prev = data.length > 1 ? data[data.length - 2] : null;
          const lastWealth = (last.equity + last.cumulativeCash);
          const prevWealth = prev ? (prev.equity + prev.cumulativeCash) : 0;
          const yoyDelta = prev ? (lastWealth - prevWealth) : 0;
          const yoyPct = prevWealth !== 0 ? (yoyDelta / prevWealth) * 100 : 0;
          const deltas = data.slice(1).map((p, i) => ({
            year: p.year,
            delta: (p.equity + p.cumulativeCash) - (data[i].equity + data[i].cumulativeCash)
          }));
          const maxYoY = deltas.length ? deltas.reduce((a, b) => (b.delta > a.delta ? b : a)) : { year: last.year, delta: 0 };
          const equityShare = lastWealth > 0 ? (last.equity / lastWealth) * 100 : 0;
          const cashShare = lastWealth > 0 ? (last.cumulativeCash / lastWealth) * 100 : 0;
          return (
            <div className="mt-2 space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px] px-2 py-0.5">Wealth {last.year}y: <span className="font-semibold">{formatCurrency(lastWealth)}</span></Badge>
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border ${yoyDelta >= 0 ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'}`}>YoY: <span className="font-semibold">{yoyDelta >= 0 ? '+' : ''}{formatCurrency(yoyDelta)}</span> ({yoyPct.toFixed(1)}%)</Badge>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5">Peak growth: <span className="font-semibold">Y{maxYoY.year}</span> (+{formatCurrency(maxYoY.delta)})</Badge>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5">Mix: <span className="font-semibold">{equityShare.toFixed(0)}% equity</span> / <span className="font-semibold">{cashShare.toFixed(0)}% cash</span></Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Conclusion: <span className="text-foreground font-medium">{yoyDelta >= 0 ? `Wealth increased last year by ${formatCurrency(Math.abs(yoyDelta))}, mainly driven by ${equityShare >= cashShare ? 'equity build-up' : 'cash flow'}.` : `Wealth declined last year by ${formatCurrency(Math.abs(yoyDelta))}; review expenses, rent growth or financing terms.`}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Alternative View: 10-Year Wealth Projection (v2) - removed per request */}
      {/* Monthly Expense Breakdown removed per request (consolidated into overview) */}
      

      {/* Investment Score (moved below Rental Price Recommendation) */}
      {false && (
      <div id="investment-score" className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{investmentScore}/10</div>
            <div className="text-sm opacity-90">Investment Score</div>
          </div>
          <div className="text-center">
            <Badge className={`bg-warning text-white`}>
              Medium Risk
            </Badge>
            <div className="text-sm opacity-90 mt-1">Risk Level</div>
          </div>
        </div>
        
        {/* Info Button - Top Right Corner */}
        <div className="absolute top-4 right-4">
          <Dialog>
            <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
                className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-full"
          >
                <Info className="h-4 w-4" />
          </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Investment Score Explanation</DialogTitle>
                <DialogDescription>
                  Understanding how your property investment is scored across different criteria.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 text-sm">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-primary mb-3">📊 Total Score: 10 Points (100%)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-accent mb-2">💰 Cash Flow Analysis (40% - 4 points)</h5>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>2 points:</strong> Positive monthly cash flow</li>
                    <li>• <strong>1 point:</strong> Cash-on-cash return {'>'} 6%</li>
                    <li>• <strong>1 point:</strong> Cash-on-cash return {'>'} 10%</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-accent mb-2">📈 Yield Analysis (30% - 3 points)</h5>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>1 point:</strong> Net yield {'>'} 5%</li>
                    <li>• <strong>1 point:</strong> Net yield {'>'} 7%</li>
                    <li>• <strong>1 point:</strong> Gross yield {'>'} 8%</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-accent mb-2">⚠️ Risk Analysis (20% - 2 points)</h5>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>1 point:</strong> Debt-to-equity ratio {'<'} 80%</li>
                    <li>• <strong>1 point:</strong> Monthly expense ratio {'<'} 30%</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-accent mb-2">🚀 Growth Potential (10% - 1 point)</h5>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>1 point:</strong> Appreciation rate {'>'} 3%</li>
                  </ul>
                </div>
              </div>
            </div>
            
                <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                  <h5 className="font-semibold text-success mb-3">🎯 Score Interpretation:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="text-center">
                  <div className="font-bold text-success">8-10 points</div>
                  <div>✅ Strong Buy</div>
                  <div className="text-success/70">Low Risk</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-warning">6-7 points</div>
                  <div>🔄 Consider</div>
                  <div className="text-warning/70">Medium Risk</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-danger">0-5 points</div>
                  <div>❌ Pass</div>
                  <div className="text-danger/70">High Risk</div>
                </div>
              </div>
            </div>
          </div>
            </DialogContent>
          </Dialog>
          </div>
        
        <div className="text-center mb-4">
          <div className="text-lg font-semibold">
            {investmentScore >= 8 ? '✅ Strong Buy' : investmentScore >= 6 ? '🔄 Consider' : '❌ Pass'}
          </div>
        </div>
        
        {/* Detailed Score Breakdown */}
        <div className="bg-white/10 rounded-lg p-4 text-left">
          <h4 className="font-semibold mb-3 text-center">Score Breakdown</h4>
          <div className="space-y-3">
            {scoreDetails.map((category, index) => {
              const ratio = category.maxPoints > 0 ? category.points / category.maxPoints : 0;
              const barColor = ratio >= 0.8 ? 'bg-green-400' : ratio >= 0.5 ? 'bg-yellow-400' : 'bg-red-400';
              const textColor = ratio >= 0.8 ? 'text-green-200' : ratio >= 0.5 ? 'text-yellow-200' : 'text-red-200';
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.category}</span>
                    <span className={`text-sm ${textColor}`}>
                      {category.points}/{category.maxPoints} pts
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-full h-2">
                    <div 
                      className={`${barColor} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                  <div className="text-xs space-y-1">
                    {category.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="opacity-90">{detail}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Investment Overview - Enhanced (original location removed after move) */}
      {false && (
      <div id="investment-overview" className="bg-white rounded-2xl p-2 sm:p-5 border border-blue-200 shadow-lg leading-tight">
        <div className="flex items-center justify-between mb-2.5 sm:mb-4">
           <div>
          <h3 className="font-semibold text-sm sm:text-lg">Investment Overview</h3>
          </div>
        </div>
        
        {/* Property Info Badges */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2.5 sm:mb-4">
          {propertyData.name && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              🏠 {propertyData.name}
            </Badge>
          )}
          {propertyData.propertyType && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              🏢 {propertyData.propertyType}
            </Badge>
          )}
          {propertyData.area && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              📍 {propertyData.area}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
            {propertyData.propertyStatus === 'ready' ? '🏠 Ready Property' : '🏗️ Off-Plan Property'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
          {/* Financial Summary */}
          <div className="space-y-2.5 sm:space-y-3.5">
            <h4 className="font-medium text-primary border-b border-primary/20 pb-1 text-xs sm:text-sm">💰 Financial Summary</h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight">Total Investment</span>
                <span className="font-semibold text-[13px] sm:text-sm leading-tight">{formatCurrency(totalInvestment)}</span>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight">Down Payment</span>
                <span className="font-semibold text-[13px] sm:text-sm leading-tight">{formatCurrency(downPaymentAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight">Additional Costs</span>
                <span className="font-semibold text-[13px] sm:text-sm leading-tight">{formatCurrency(additionalCosts)}</span>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight">Loan Amount</span>
                <span className="font-semibold text-[13px] sm:text-sm leading-tight">{formatCurrency(loanAmount)}</span>
              </div>
            </div>
          </div>
          
          {/* Key Ratios */}
          <div className="space-y-2.5 sm:space-y-3.5">
            <h4 className="font-medium text-accent border-b border-accent/20 pb-1 text-xs sm:text-sm">📊 Key Ratios</h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight">Loan-to-Value (LTV)</span>
                <div className="flex items-center gap-1 text-right">
                  <span className="font-semibold text-[13px] sm:text-sm leading-tight">{((100 - propertyData.downPayment)).toFixed(1)}%</span>
                  <span className="text-[12px]">{((100 - propertyData.downPayment)) > 80 ? '⚠️' : '✅'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight">Debt-to-Equity</span>
                <div className="flex items-center gap-1 text-right">
                  <span className="font-semibold text-[13px] sm:text-sm leading-tight">{debtToEquityRatio.toFixed(1)}%</span>
                  <span className="text-[12px]">{debtToEquityRatio > 80 ? '⚠️' : '✅'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 sm:p-2.5 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[12px] leading-tight">Expense Ratio</span>
                <div className="flex items-center gap-1 text-right">
                  <span className="font-semibold text-[13px] sm:text-sm leading-tight">{monthlyExpenseRatio.toFixed(1)}%</span>
                  <span className="text-[12px]">{monthlyExpenseRatio > 30 ? '⚠️' : '✅'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Monthly Expenses - Donut under Investment Overview */}
        <div className="mt-4 sm:mt-6">
          <h4 className="font-medium text-primary text-xs sm:text-sm border-b border-primary/20 pb-2 mb-2 sm:mb-3">💸 Monthly Expenses</h4>
          {(() => {
            const expensesData = [
              { label: 'Mortgage', value: monthlyPayment, color: COLORS[0] },
              { label: 'Management', value: (propertyData.monthlyRent * (propertyData.managementFee / 100)) + propertyData.managementBaseFee, color: COLORS[1] },
              { label: 'Maintenance', value: propertyData.monthlyRent * (propertyData.maintenanceRate / 100), color: COLORS[2] },
              { label: 'Insurance', value: propertyData.insurance / 12, color: COLORS[3] },
              { label: 'Other', value: propertyData.otherExpenses / 12, color: COLORS[4] },
            ];
            const total = expensesData.reduce((sum, d) => sum + d.value, 0);
            let current = 0;
            const stops = expensesData.map(d => {
              const pct = total > 0 ? (d.value / total) * 100 : 0;
              const start = current;
              const end = current + pct;
              current = end;
              return `${d.color} ${start}% ${end}%`;
            }).join(', ');

            return (
              <div className="flex items-center justify-center gap-4 sm:gap-6 mb-3 sm:mb-4">
                <div className="relative z-0 w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-muted/40 shadow-md shadow-black/5" style={{ background: `conic-gradient(${stops})` }}>
                  <div className="absolute inset-6 sm:inset-10 bg-white rounded-full border border-muted/40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">Total</div>
                      <div className="text-sm sm:text-base font-semibold">{formatCurrency(total)}</div>
                    </div>
                  </div>
                </div>
                <div className="relative z-10 grid grid-cols-1 gap-y-2 text-[11px] sm:text-xs w-40 sm:w-56">
                  {expensesData.map((d, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="inline-block flex-none w-3.5 h-3.5 rounded-sm border border-muted/40" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="ml-auto font-medium whitespace-nowrap">{formatCurrency(d.value)} ({total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0'}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      )}

      {/* Rental Price Recommendation - Moved to Analysis Bottom */}
      <div id="rental-price-recommendation" className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">🏠 Rental Price Recommendation</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-5 h-5 text-blue-600/80 hover:text-blue-700 transition-colors" title="Info about rent recommendations">
                    <Info className="w-4 h-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base">About Current vs Recommended Rent</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Current rent is what you entered for the property. Recommended rent is an estimate based on price, expected yields, and expenses to help achieve healthier cash flow and return.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="text-sm space-y-2">
                    <div className="bg-blue-50 p-2 rounded">
                      <strong>Current Rent:</strong> the existing/assumed monthly rent for the property.
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <strong>Recommended Rent:</strong> model-based estimate to target improved yield and IRR given the inputs.
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-muted-foreground">Expert advice for optimal rental pricing and investment health</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className={`relative p-2.5 sm:p-3 rounded-lg border ${
            propertyData.monthlyRent < suggestedRentalPrice.monthlyRent
              ? 'bg-yellow-50 border-yellow-300'
              : propertyData.monthlyRent > suggestedRentalPrice.monthlyRent
              ? 'bg-green-50 border-green-300'
              : 'bg-white/50 border-blue-200'
          }`}>
            <div className="text-center">
              <div className={`absolute top-1 right-1 text-lg ${
                propertyData.monthlyRent < suggestedRentalPrice.monthlyRent
                  ? 'text-yellow-600'
                  : propertyData.monthlyRent > suggestedRentalPrice.monthlyRent
                  ? 'text-green-600'
                  : 'text-blue-600'
              }`}>
                {propertyData.monthlyRent < suggestedRentalPrice.monthlyRent ? '⚠️' : propertyData.monthlyRent > suggestedRentalPrice.monthlyRent ? '👍' : '➖'}
              </div>
              <div className={`text-base sm:text-lg font-semibold mb-1 ${
                propertyData.monthlyRent < suggestedRentalPrice.monthlyRent
                  ? 'text-yellow-700'
                  : propertyData.monthlyRent > suggestedRentalPrice.monthlyRent
                  ? 'text-green-700'
                  : 'text-blue-700'
              }`}>
                {formatCurrency(propertyData.monthlyRent)}
              </div>
              <div className={`text-sm ${
                propertyData.monthlyRent < suggestedRentalPrice.monthlyRent
                  ? 'text-yellow-700'
                  : propertyData.monthlyRent > suggestedRentalPrice.monthlyRent
                  ? 'text-green-700'
                  : 'text-blue-600'
              }`}>Current Rent</div>
              <div className={`text-[11px] sm:text-xs mt-1 flex items-center justify-center gap-2 ${
                propertyData.monthlyRent < suggestedRentalPrice.monthlyRent
                  ? 'text-yellow-600'
                  : propertyData.monthlyRent > suggestedRentalPrice.monthlyRent
                  ? 'text-green-600'
                  : 'text-blue-500'
              }`}>
                <span>{((propertyData.monthlyRent * 12 / propertyData.price) * 100).toFixed(1)}% gross yield</span>
                <span className="text-muted-foreground">•</span>
                <span>{(((propertyData.monthlyRent - monthlyPayment - monthlyExpenses) * 12) / propertyData.price * 100).toFixed(1)}% net yield</span>
              </div>
              
              <div className={`text-[11px] sm:text-xs mt-1 ${
                propertyData.monthlyRent < suggestedRentalPrice.monthlyRent
                  ? 'text-yellow-700'
                  : propertyData.monthlyRent > suggestedRentalPrice.monthlyRent
                  ? 'text-green-700'
                  : 'text-blue-600'
              }`}>
                {propertyData.monthlyRent < suggestedRentalPrice.monthlyRent
                  ? 'Below recommended'
                  : propertyData.monthlyRent > suggestedRentalPrice.monthlyRent
                  ? 'Above recommended'
                  : 'At recommended'}
              </div>
              <div className={`text-[10px] sm:text-xs mt-0.5 ${
                propertyData.monthlyRent < suggestedRentalPrice.monthlyRent
                  ? 'text-yellow-600'
                  : propertyData.monthlyRent > suggestedRentalPrice.monthlyRent
                  ? 'text-green-600'
                  : 'text-blue-500'
              }`}>
                Entered by user
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-2.5 sm:p-3 rounded-lg border border-blue-300">
            <div className="text-center">
              <div className="text-base sm:text-lg font-semibold text-blue-700 mb-1">
                {formatCurrency(suggestedRentalPrice.monthlyRent)}
              </div>
              <div className="text-sm text-blue-700">Recommended Rent</div>
              <div className="text-[11px] sm:text-xs text-blue-700 mt-1 flex items-center justify-center gap-2">
                <span>{((suggestedRentalPrice.monthlyRent * 12 / propertyData.price) * 100).toFixed(1)}% gross yield</span>
                <span className="text-muted-foreground">•</span>
                <span>{suggestedRentalPrice.annualYield.toFixed(1)}% net yield</span>
              </div>
              
              <div className="text-[11px] sm:text-xs text-blue-700 mt-1">
                Target value
              </div>
              <div className="text-[10px] sm:text-xs text-blue-700 mt-0.5">
                Based on target net yield
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200">
          <h4 className="font-semibold text-blue-700 text-xs sm:text-sm mb-2">🎯 Action Items:</h4>
          <div className="space-y-1.5 sm:space-y-2">
            {propertyData.monthlyRent < suggestedRentalPrice.monthlyRent * 0.95 && (
              <div className="text-[11px] sm:text-xs text-amber-700 bg-amber-100 p-2 rounded">
                ⚠️ Current rent is below recommended — consider increasing to {formatCurrency(suggestedRentalPrice.monthlyRent * 0.95)} - {formatCurrency(suggestedRentalPrice.monthlyRent)}
              </div>
            )}
            {propertyData.monthlyRent > suggestedRentalPrice.monthlyRent * 1.05 && (
              <div className="text-[11px] sm:text-xs text-green-700 bg-green-100 p-2 rounded">
                ✅ Current rent is above recommended — favorable position
              </div>
            )}
            {suggestedRentalPrice.cashFlow < 0 && (
              <div className="text-[11px] sm:text-xs text-red-700 bg-red-100 p-2 rounded">
                ❌ Recommended rent still results in negative cash flow — review financing terms
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Investment Score - now after Rental Recommendation */}
      <div id="investment-score" className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{investmentScore}/10</div>
            <div className="text-sm opacity-90">Investment Score</div>
            {(propertyData.name || propertyData.area) && (
              <div className="text-xs opacity-80 mt-1">
                {propertyData.name}
                {propertyData.area ? ` — ${propertyData.area}` : ''}
              </div>
            )}
          </div>
          <div className="text-center">
            <Badge className={`${riskRating.level === 'Low' ? 'bg-success' : riskRating.level === 'Medium' ? 'bg-warning' : 'bg-danger'} text-white`}>
              {riskRating.emoji} {riskRating.level} Risk
            </Badge>
          </div>
        </div>

        {/* Subscore summary chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {scoreDetails.map((s, idx) => (
            <span key={idx} className="px-2 py-1 rounded-full text-[11px] bg-white/15 border border-white/30">
              {s.category}: <span className="font-semibold">{s.points}/{s.maxPoints}</span>
            </span>
          ))}
        </div>

        {/* Detailed Score Breakdown */}
        <div className="bg-white/10 rounded-lg p-4 text-left">
          <h4 className="font-semibold mb-3 text-center">Score Breakdown</h4>
          <div className="space-y-3">
            {scoreDetails.map((category, index) => {
              const ratio = category.maxPoints > 0 ? category.points / category.maxPoints : 0;
              const barColor = ratio >= 0.8 ? 'bg-green-400' : ratio >= 0.5 ? 'bg-yellow-400' : 'bg-red-400';
              const textColor = ratio >= 0.8 ? 'text-green-200' : ratio >= 0.5 ? 'text-yellow-200' : 'text-red-200';
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.category}</span>
                    <span className={`text-sm ${textColor}`}>
                      {category.points}/{category.maxPoints} pts
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-full h-2">
                    <div 
                      className={`${barColor} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                  <div className="text-xs space-y-1">
                    {category.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="opacity-90">{detail}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Non-prescriptive explanation trigger */}
        <div className="mt-4 flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-xs px-2 py-1 rounded-md border border-white/60 text-white/90 hover:bg-white/10">Score explanation</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>How the score is constructed</DialogTitle>
                <DialogDescription>Uitleg per categorie; indicatief, geen advies.</DialogDescription>
              </DialogHeader>
              <div className="text-sm space-y-3">
                <div className="p-3 rounded-md border bg-muted/30">
                  <div className="font-medium mb-1">Weging (indicatief)</div>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Cash Flow: 40%</li>
                    <li>Yield & Pricing alignment (incl. rent-gap ±10% band): 30%</li>
                    <li>Risicoparameters (DSCR, yield spread, LTV, expense, rent-gap): informatief in badge</li>
                  </ul>
                </div>
                <div className="p-3 rounded-md border bg-muted/30">
                  <div className="font-medium mb-1">Actuele waarden</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex justify-between"><span>DSCR</span><span>{Number.isFinite(dscr) ? dscr.toFixed(2) : '—'}</span></div>
                    <div className="flex justify-between"><span>Yield spread</span><span>{Number.isFinite(capRate) ? (capRate - interestRateSafe).toFixed(1) + '%' : '—'}</span></div>
                    <div className="flex justify-between"><span>LTV</span><span>{fmtPct1(ltvPct)}</span></div>
                    <div className="flex justify-between"><span>Expense ratio</span><span>{fmtPct1(expenseRatioPct)}</span></div>
                    <div className="flex justify-between"><span>Current rent</span><span>{formatCurrency(monthlyRentSafe)}</span></div>
                    <div className="flex justify-between"><span>Recommended rent</span><span>{formatCurrency(suggestedRentalPrice.monthlyRent)}</span></div>
                    <div className="flex justify-between"><span>Rent gap</span><span>{monthlyRentSafe > 0 ? (((suggestedRentalPrice.monthlyRent - monthlyRentSafe) / monthlyRentSafe) * 100).toFixed(1) + '%' : '—'}</span></div>
                  </div>
                </div>
                {scoreDetails.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-md border bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">{s.category}</div>
                      <div className="text-xs">{s.points}/{s.maxPoints} pts</div>
                    </div>
                    <ul className="list-disc ml-5 space-y-1">
                      {s.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="p-3 rounded-md border bg-blue-50 text-blue-800">
                  Overall: <span className="font-semibold">{investmentScore}/10</span>. Samenvattende indicator op basis van cashflow (40%), yield & pricing alignment (30%) en overige factoren. Gebruik als referentiepunt.
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Suggested improvements */}
        <div className="mt-3 text-left">
          <h4 className="font-semibold text-white/90 mb-2 text-sm">Actions to improve score</h4>
          <div className="grid grid-cols-1 gap-2">
            {monthlyCashFlow < 0 && (
              <div className="text-xs bg-red-500/15 border border-red-400/40 text-red-100 rounded p-2">❌ Cash flow negatief — overweeg huur te verhogen richting aanbeveling of herfinanciering.</div>
            )}
            {(() => {
              const rentGap = monthlyRentSafe > 0 ? ((suggestedRentalPrice.monthlyRent - monthlyRentSafe) / monthlyRentSafe) * 100 : 0;
              if (rentGap >= 10) {
                return <div className="text-xs bg-amber-500/15 border border-amber-400/40 text-amber-100 rounded p-2">⚠️ Huidige huur ligt ≥ 10% onder aanbeveling — overweeg +{Math.round(Math.min(rentGap, 20))}% verhoging.</div>;
              }
              return null;
            })()}
            {Number.isFinite(dscr) && dscr < 1.25 && (
              <div className="text-xs bg-amber-500/15 border border-amber-400/40 text-amber-100 rounded p-2">⚠️ DSCR laag — verlaag lening/prijs, of verhoog huur om {'>'} 1.25 te bereiken.</div>
            )}
            {Number.isFinite(expenseRatioPct) && expenseRatioPct > 35 && (
              <div className="text-xs bg-amber-500/15 border border-amber-400/40 text-amber-100 rounded p-2">⚠️ Expense ratio {'>'} 35% — optimaliseer beheer, onderhoud of overige kosten.</div>
            )}
          </div>
        </div>
      </div>

                                  {/* Floating Action Buttons - Fixed at Bottom */}
       <div className="fixed bottom-14 left-1/2 transform -translate-x-1/2 z-[9999] opacity-50 hover:opacity-95 transition-opacity">
         <div className="flex gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-300 rounded-lg p-1.5 shadow-md">
           <Button
             variant="outline"
             size="sm"
             onClick={() => {
               // Navigate back to analyze tab to edit inputs
               window.location.hash = '#analyze';
               // Dispatch event to trigger tab change
               const analyzeEvent = new CustomEvent('navigateToAnalyze', {
                 detail: { targetTab: 'analyze', scrollToId: 'input-details' }
               });
               window.dispatchEvent(analyzeEvent);
               // Scroll to top
               window.scrollTo({ top: 0, behavior: 'smooth' });
             }}
             className="flex items-center gap-1 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-300 px-2.5 py-1.5 rounded-md transition-all duration-200 text-blue-700 text-[11px] font-medium"
           >
             <Settings className="h-3.5 w-3.5" />
             Edit Inputs
           </Button>
                 </div>
       </div>
      
             {/* Loading Overlay for Smart Insights */}
      
      </div>
      </div>
    </div>
  );
}

// Helper functions
function calculateMonthlyPayment(loanAmount: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1);
}

function calculateMonthlyExpenses(propertyData: PropertyData): number {
  const effectiveRent = propertyData.monthlyRent * ((100 - propertyData.vacancyRate) / 100);
  const maintenance = propertyData.monthlyRent * (propertyData.maintenanceRate / 100);
  const management = effectiveRent * (propertyData.managementFee / 100) + propertyData.managementBaseFee; // Percentage (on effective rent) + Base fee
  const insurance = propertyData.insurance / 12;
  const otherExpenses = propertyData.otherExpenses / 12;
  return maintenance + management + insurance + otherExpenses;
}

function generateDetailedProjectionData(propertyData: PropertyData, totalInvestment: number): YearlyProjection[] {
  const data: YearlyProjection[] = [];
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
    const annualAdditionalIncome = propertyData.additionalIncome * 12;
    const totalAnnualIncome = annualRent + annualAdditionalIncome;
         // Maintenance and management are percentages of current rent, not growing absolute values
     const annualExpenses = (currentRent * propertyData.maintenanceRate / 100 * 12) + 
                           (currentRent * propertyData.managementFee / 100 * 12) + propertyData.managementBaseFee + // Percentage + Fixed fee
                           currentInsurance + propertyData.otherExpenses;
    const annualDebtService = monthlyPayment * 12;
    const netCashFlow = totalAnnualIncome - annualExpenses - annualDebtService;
    
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
    const netOperatingIncome = totalAnnualIncome - annualExpenses;
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

// Alternative projection with recommended corrections:
// - Management fee on effective rent
// - Base fee ×12 annually
// - Equity net of selling costs in exit year
// (removed alt generator)

function calculateIRR(projections: YearlyProjection[], initialInvestment: number): number {
  // More accurate IRR calculation using cash flow analysis
  if (projections.length === 0) return 0;
  
  // Create cash flow array: negative initial investment, then yearly cash flows
  const cashFlows = [-initialInvestment];
  
  for (let i = 0; i < projections.length; i++) {
    const projection = projections[i];
    if (i === projections.length - 1) {
      // Last year: include final equity value
      cashFlows.push(projection.netCashFlow + projection.equity);
    } else {
      cashFlows.push(projection.netCashFlow);
    }
  }
  
  // Use Newton-Raphson method for IRR approximation
  let guess = 0.1; // Start with 10%
  const tolerance = 0.0001;
  const maxIterations = 100;
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const npv = calculateNPV(cashFlows, guess);
    const derivative = calculateNPVDerivative(cashFlows, guess);
    
    if (Math.abs(derivative) < tolerance) break;
    
    const newGuess = guess - npv / derivative;
    if (Math.abs(newGuess - guess) < tolerance) break;
    
    guess = newGuess;
  }
  
  return Math.max(0, guess * 100);
}

function calculateNPV(cashFlows: number[], rate: number): number {
  let npv = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    npv += cashFlows[i] / Math.pow(1 + rate, i);
  }
  return npv;
}

function calculateNPVDerivative(cashFlows: number[], rate: number): number {
  let derivative = 0;
  for (let i = 1; i < cashFlows.length; i++) {
    derivative -= i * cashFlows[i] / Math.pow(1 + rate, i + 1);
  }
  return derivative;
}