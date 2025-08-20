import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';

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

  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsProgress, setInsightsProgress] = useState(0);

  // Calculate investment metrics
  const downPaymentAmount = propertyData.price * (propertyData.downPayment / 100);
  const additionalCosts = propertyData.price * 0.02 + (propertyData.dldFeeIncluded ? propertyData.price * 0.04 : 0) + 5000; // Agent + DLD + legal
  const totalInvestment = downPaymentAmount + additionalCosts;
  const loanAmount = propertyData.price - downPaymentAmount;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, propertyData.interestRate, propertyData.loanTerm);
  const effectiveRent = propertyData.monthlyRent * ((100 - propertyData.vacancyRate) / 100);
  const totalMonthlyIncome = effectiveRent + propertyData.additionalIncome;
  const monthlyExpenses = calculateMonthlyExpenses(propertyData);
  const monthlyCashFlow = totalMonthlyIncome - monthlyPayment - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;
  
  // Improved cash-on-cash return (using actual cash flow, not just rent)
  const cashOnCashReturn = (annualCashFlow / totalInvestment) * 100;
  
  // Yield calculations
  const grossYield = ((propertyData.monthlyRent + propertyData.additionalIncome) * 12 / propertyData.price) * 100;
  const netYield = ((totalMonthlyIncome * 12 - monthlyExpenses * 12) / propertyData.price) * 100;
  
  // Additional metrics
  const debtToEquityRatio = (loanAmount / downPaymentAmount) * 100;
  const monthlyExpenseRatio = (monthlyExpenses / effectiveRent) * 100;

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
    
    // 2. Yield Analysis (30% weight - 3 points)
    const yieldScore = (() => {
      let points = 0;
      const details: string[] = [];
      
      if (netYield > 5) {
        points += 1;
        details.push('✅ Good net yield (>5%)');
      } else {
        details.push('⚠️ Low net yield');
      }
      
      if (netYield > 7) {
        points += 1;
        details.push('✅ Excellent net yield (>7%)');
      }
      
      if (grossYield > 8) {
        points += 1;
        details.push('✅ Strong gross yield (>8%)');
      } else {
        details.push('⚠️ Moderate gross yield');
      }
      
      return { points, details };
    })();
    
    score += yieldScore.points;
    scoreDetails.push({
      category: 'Yield',
      points: yieldScore.points,
      maxPoints: 3,
      details: yieldScore.details
    });
    
    // 3. Risk Analysis (20% weight - 2 points)
    const riskScore = (() => {
      let points = 0;
      const details: string[] = [];
      
      if (debtToEquityRatio < 80) {
        points += 1;
        details.push('✅ Conservative debt ratio (<80%)');
      } else {
        details.push('⚠️ High debt ratio');
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
  const riskLevel = investmentScore >= 8 ? 'Low' : investmentScore >= 6 ? 'Medium' : 'High';

    const filteredProjectionData = selectedYear === '10' ? projectionData :
    projectionData.filter(item => item.year <= parseInt(selectedYear));

  return (
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
        <h1 className="text-2xl font-bold text-gradient-primary mb-3">Smart Property Analyzer Dubai</h1>
        <div className="mx-auto inline-flex flex-wrap items-center justify-center gap-2 bg-muted/30 px-4 py-2 rounded-xl border border-muted/40">
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
      <Card className="card-premium p-4 mb-4 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2 justify-center">
           <div className="text-sm font-medium text-muted-foreground">📊 Property Analyses</div>
        </div>
      </Card>

      {/* Year-by-Year Projection - MOVED UP (Feiten eerst) */}
      <Card className="card-premium p-6">
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
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2">Year</th>
                <th className="text-right p-2">Net Cash Flow</th>
                <th className="text-right p-2">Cumulative Cash</th>
                <th className="text-right p-2">Equity</th>
                <th className="text-right p-2">DSCR</th>
                <th className="text-right p-2">Total Return %</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjectionData.map((item, index) => (
                <tr key={index} className="border-b border-border/50">
                  <td className="p-2 font-medium">{item.year}</td>
                  <td className="text-right p-2 text-success">{formatCurrency(item.netCashFlow)}</td>
                  <td className="text-right p-2">{formatCurrency(item.cumulativeCash)}</td>
                  <td className="text-right p-2 text-accent">{formatCurrency(item.equity)}</td>
                  <td className="text-right p-2">{item.dscr.toFixed(1)}</td>
                  <td className="text-right p-2 font-semibold">
                    <span className={item.totalReturn >= 0 ? 'text-success' : 'text-danger'}>
                      {item.totalReturn.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 10-Year Wealth Projection - MOVED UP (Feiten eerst) */}
      <Card className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-primary mr-2" />
            <div>
              <h3 className="font-semibold">10-Year Wealth Projection</h3>
              {propertyData.name && (
                <p className="text-xs text-muted-foreground mt-1">{propertyData.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <LineChart data={filteredProjectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                domain={['dataMin', 'dataMax']}
                ticks={(() => {
                  // Generate ticks every 50K for better readability
                  const data = filteredProjectionData;
                  if (data.length === 0) return [];
                  
                  const minValue = Math.min(...data.map(d => 
                    Math.min(d.propertyValue, d.cumulativeCash, d.equity, d.remainingDebt)
                  ));
                  const maxValue = Math.max(...data.map(d => 
                    Math.max(d.propertyValue, d.cumulativeCash, d.equity, d.remainingDebt)
                  ));
                  
                  // Round to nearest 50K
                  const minTick = Math.floor(minValue / 50000) * 50000;
                  const maxTick = Math.ceil(maxValue / 50000) * 50000;
                  
                  const ticks = [];
                  for (let i = minTick; i <= maxTick; i += 50000) {
                    ticks.push(i);
                  }
                  return ticks;
                })()}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelStyle={{ color: '#F3F4F6' }}
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="propertyValue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Property Value"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeCash" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Cumulative Cash"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="remainingDebt" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Remaining Debt"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="equity" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Equity"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Monthly Expense Breakdown - MOVED UP (Feiten eerst) */}
      <Card className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <PieChart className="h-5 w-5 text-primary mr-2" />
            <div>
              <h3 className="font-semibold">Monthly Expense Breakdown</h3>
              {propertyData.name && (
                <p className="text-xs text-muted-foreground mt-1">{propertyData.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Total: {formatCurrency(expenseData.reduce((sum, item) => sum + item.value, 0))}/month
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <RechartsPieChart dataKey="value">
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Detailed Breakdown */}
          <div className="space-y-3">
            {expenseData.map((item, index) => {
              const totalExpenses = expenseData.reduce((sum, exp) => sum + exp.value, 0);
              const percentage = (item.value / totalExpenses) * 100;
              
              return (
                <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3 shadow-sm" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg" style={{ color: item.color }}>{formatCurrency(item.value)}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 ease-out shadow-sm"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">Total Expenses</div>
            <div className="font-bold text-lg text-blue-700 dark:text-blue-300">
              {formatCurrency(expenseData.reduce((sum, item) => sum + item.value, 0))}
            </div>
            <div className="text-xs text-blue-500 dark:text-blue-400">per month</div>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xs text-orange-600 dark:text-orange-400 mb-1 font-medium">vs. Rent</div>
            <div className="font-bold text-lg text-orange-700 dark:text-orange-300">
              {((expenseData.reduce((sum, item) => sum + item.value, 0) / effectiveRent) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-orange-500 dark:text-orange-400">expense ratio</div>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xs text-purple-600 dark:text-purple-400 mb-1 font-medium">Annual Expenses</div>
            <div className="font-bold text-lg text-purple-700 dark:text-purple-300">
              {formatCurrency(expenseData.reduce((sum, item) => sum + item.value, 0) * 12)}
            </div>
            <div className="text-xs text-purple-500 dark:text-purple-400">per year</div>
          </div>
          
          <div className={`p-4 rounded-lg border text-center shadow-sm hover:shadow-md transition-shadow ${
            monthlyCashFlow >= 0 
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          }`}>
            <div className={`text-xs mb-1 font-medium ${
              monthlyCashFlow >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>Net Income</div>
            <div className={`font-bold text-lg ${
              monthlyCashFlow >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {formatCurrency(effectiveRent - expenseData.reduce((sum, item) => sum + item.value, 0))}
            </div>
            <div className={`text-xs ${
              monthlyCashFlow >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}>after expenses</div>
          </div>
        </div>
      </Card>

      {/* Investment Score */}
      <Card className="card-floating p-6 text-center bg-gradient-hero text-white">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{investmentScore}/10</div>
            <div className="text-sm opacity-90">Investment Score</div>
          </div>
          <div className="text-center">
            <Badge className={`${riskLevel === 'Low' ? 'bg-success' : riskLevel === 'Medium' ? 'bg-warning' : 'bg-danger'} text-white`}>
              {riskLevel} Risk
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
            {scoreDetails.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm">
                    {category.points}/{category.maxPoints} pts
                  </span>
                </div>
                <div className="bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(category.points / category.maxPoints) * 100}%` }}
                  />
                </div>
                <div className="text-xs space-y-1">
                  {category.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="opacity-90">{detail}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <Card className="card-premium p-4">

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-primary mr-2" />
             <div>
            <h3 className="font-semibold">Key Metrics</h3>
               {propertyData.name && (
                 <p className="text-xs text-muted-foreground mt-1">{propertyData.name}</p>
               )}
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
                       <Card className={`metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${monthlyCashFlow >= 0 ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}>
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-6 w-6 text-success mr-2" />
              {monthlyCashFlow >= 0 ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-danger" />}
            </div>
            <div className={`metric-value ${monthlyCashFlow >= 0 ? 'text-success' : 'text-danger'}`}>
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
          </Card>

                       <Card className={`metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${cashOnCashReturn >= 8 ? 'border-success/30 bg-success/5' : cashOnCashReturn >= 6 ? 'border-warning/30 bg-warning/5' : 'border-danger/30 bg-danger/5'}`}>
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-primary mr-2" />
            </div>
             <div className={`metric-value ${cashOnCashReturn >= 8 ? 'text-success' : cashOnCashReturn >= 6 ? 'text-warning' : 'text-danger'}`}>
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
          </Card>

                       <Card className={`metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${irr >= 12 ? 'border-success/30 bg-success/5' : irr >= 8 ? 'border-warning/30 bg-warning/5' : 'border-danger/30 bg-danger/5'}`}>
            <div className="flex items-center justify-center mb-2">
              <Calculator className="h-6 w-6 text-secondary mr-2" />
            </div>
             <div className={`metric-value ${irr >= 12 ? 'text-success' : irr >= 8 ? 'text-warning' : 'text-danger'}`}>
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
          </Card>

                       <Card className={`metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${annualROI >= 15 ? 'border-success/30 bg-success/5' : annualROI >= 10 ? 'border-warning/30 bg-warning/5' : 'border-danger/30 bg-danger/5'}`}>
            <div className="flex items-center justify-center mb-2">
              <ArrowUpRight className="h-6 w-6 text-accent mr-2" />
            </div>
             <div className={`metric-value ${annualROI >= 15 ? 'text-success' : annualROI >= 10 ? 'text-warning' : 'text-danger'}`}>
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
          </Card>

                       <Card className={`metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${(() => {
                         const yearMultiplier = selectedYear === '10' ? 1 : parseInt(selectedYear) / 10;
                         const adjustedThresholds = {
                           success: 100 * yearMultiplier,
                           warning: 60 * yearMultiplier
                         };
                         return totalROI >= adjustedThresholds.success ? 'border-success/30 bg-success/5' : 
                                totalROI >= adjustedThresholds.warning ? 'border-warning/30 bg-warning/5' : 
                                'border-danger/30 bg-danger/5';
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
                 warning: 60 * yearMultiplier
               };
               return totalROI >= adjustedThresholds.success ? 'text-success' : 
                      totalROI >= adjustedThresholds.warning ? 'text-warning' : 
                      'text-danger';
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
           </Card>

                       <Card className={`metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${grossYield >= 8 ? 'border-success/30 bg-success/5' : grossYield >= 6 ? 'border-warning/30 bg-warning/5' : 'border-danger/30 bg-danger/5'}`}>
            <div className="flex items-center justify-center mb-2">
              <PieChart className="h-6 w-6 text-success mr-2" />
            </div>
             <div className={`metric-value ${grossYield >= 8 ? 'text-success' : grossYield >= 6 ? 'text-warning' : 'text-danger'}`}>
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
          </Card>

                       <Card className={`metric-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${netYield >= 6 ? 'border-success/30 bg-success/5' : netYield >= 4 ? 'border-warning/30 bg-warning/5' : 'border-danger/30 bg-danger/5'}`}>
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-6 w-6 text-warning mr-2" />
            </div>
             <div className={`metric-value ${netYield >= 6 ? 'text-success' : netYield >= 4 ? 'text-warning' : 'text-danger'}`}>
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
           </Card>
        </div>
      </Card>



      {/* Detailed Year-by-Year Table */}
      <Card className="card-premium p-6">
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
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2">Year</th>
                <th className="text-right p-2">Net Cash Flow</th>
                <th className="text-right p-2">Cumulative Cash</th>
                <th className="text-right p-2">Equity</th>
                <th className="text-right p-2">DSCR</th>
                <th className="text-right p-2">Total Return %</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjectionData.map((item, index) => (
                <tr key={index} className="border-b border-border/50">
                  <td className="p-2 font-medium">{item.year}</td>
                  <td className="text-right p-2 text-success">{formatCurrency(item.netCashFlow)}</td>
                  <td className="text-right p-2">{formatCurrency(item.cumulativeCash)}</td>
                  <td className="text-right p-2 text-accent">{formatCurrency(item.equity)}</td>
                  <td className="text-right p-2">{item.dscr.toFixed(1)}</td>
                  <td className="text-right p-2 font-semibold">
                    <span className={item.totalReturn >= 0 ? 'text-success' : 'text-danger'}>
                      {item.totalReturn.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      

      {/* Investment Overview - Enhanced */}
      <Card className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
           <div>
          <h3 className="font-semibold text-lg">Investment Overview</h3>
          </div>
        </div>
        
        {/* Property Info Badges */}
        <div className="flex flex-wrap gap-3 mb-6">
          {propertyData.name && (
            <Badge variant="outline" className="text-sm px-3 py-1">
              🏠 {propertyData.name}
            </Badge>
          )}
          {propertyData.propertyType && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              🏢 {propertyData.propertyType}
            </Badge>
          )}
          {propertyData.area && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              📍 {propertyData.area}
            </Badge>
          )}
          <Badge variant="outline" className="text-sm px-3 py-1">
            {propertyData.propertyStatus === 'ready' ? '🏠 Ready Property' : '🏗️ Off-Plan Property'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Financial Summary */}
          <div className="space-y-4">
            <h4 className="font-medium text-primary border-b border-primary/20 pb-2">💰 Financial Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Property Type</span>
                <span className="font-semibold">{propertyData.propertyType || '—'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Area</span>
                <span className="font-semibold">{propertyData.area || '—'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Total Investment</span>
                <span className="font-semibold text-lg">{formatCurrency(totalInvestment)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Down Payment</span>
                <span className="font-semibold">{formatCurrency(downPaymentAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Additional Costs</span>
                <span className="font-semibold">{formatCurrency(additionalCosts)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Loan Amount</span>
                <span className="font-semibold">{formatCurrency(loanAmount)}</span>
              </div>
            </div>
          </div>
          
          {/* Key Ratios */}
          <div className="space-y-4">
            <h4 className="font-medium text-accent border-b border-accent/20 pb-2">📊 Key Ratios</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Loan-to-Value (LTV)</span>
                <div className="text-right">
                  <span className="font-semibold">{((100 - propertyData.downPayment)).toFixed(1)}%</span>
                  <div className="text-xs text-muted-foreground">
                    {((100 - propertyData.downPayment)) > 80 ? '⚠️ High' : '✅ Good'}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Debt-to-Equity</span>
                <div className="text-right">
                  <span className="font-semibold">{debtToEquityRatio.toFixed(1)}%</span>
                  <div className="text-xs text-muted-foreground">
                    {debtToEquityRatio > 80 ? '⚠️ High' : '✅ Good'}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Expense Ratio</span>
                <div className="text-right">
                  <span className="font-semibold">{monthlyExpenseRatio.toFixed(1)}%</span>
                  <div className="text-xs text-muted-foreground">
                    {monthlyExpenseRatio > 30 ? '⚠️ High' : '✅ Good'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Monthly Breakdown */}
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-success border-b border-success/20 pb-2">📅 Monthly Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-success mb-1">
                  {formatCurrency(effectiveRent)}
                </div>
                <div className="text-sm text-success/70">Monthly Rent (Net)</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {propertyData.vacancyRate}% vacancy rate
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-warning mb-1">
                  {formatCurrency(monthlyExpenses)}
                </div>
                <div className="text-sm text-warning/70">Monthly Expenses</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {monthlyExpenseRatio.toFixed(1)}% of rent
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {formatCurrency(monthlyPayment)}
                </div>
                <div className="text-sm text-primary/70">Monthly Mortgage</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {propertyData.interestRate}% interest
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cash Flow Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium mb-1">💵 Cash Flow Summary</h4>
              <p className="text-sm text-muted-foreground">
                Monthly net cash flow after all expenses and mortgage
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${monthlyCashFlow >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(monthlyCashFlow)}
              </div>
              <div className="text-sm text-muted-foreground">
                {monthlyCashFlow >= 0 ? 'Positive' : 'Negative'} cash flow
              </div>
            </div>
          </div>
          
          {/* Annual Projection */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Annual Cash Flow</span>
              <span className={`font-semibold ${annualCashFlow >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(annualCashFlow)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">Cash-on-Cash Return</span>
              <span className="font-semibold text-accent">
                {cashOnCashReturn.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </Card>

                                  {/* Floating Action Buttons - Fixed at Bottom */}
       <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-[9999]">
         <div className="flex gap-2 bg-white dark:bg-gray-800 border border-blue-500 rounded-xl p-2 shadow-lg">
           <Button
             variant="outline"
             size="sm"
             onClick={() => {
               // Navigate back to analyze tab to edit inputs
               window.location.hash = '#analyze';
               // Dispatch event to trigger tab change
               const analyzeEvent = new CustomEvent('navigateToAnalyze', {
                 detail: { targetTab: 'analyze' }
               });
               window.dispatchEvent(analyzeEvent);
               // Scroll to top
               window.scrollTo({ top: 0, behavior: 'smooth' });
             }}
             className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 border border-blue-300 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-blue-700 text-xs font-medium"
           >
             <Settings className="h-4 w-4" />
             Edit Input Fields
           </Button>
           
                       <Button
              size="sm"
                           onClick={() => {
               // Start loading state
               setIsLoadingInsights(true);
               setInsightsProgress(0);
               
               // Scroll to top when insights loading starts
               window.scrollTo({ top: 0, behavior: 'smooth' });
               
               // Simulate loading progress over 5 seconds
               const interval = setInterval(() => {
                 setInsightsProgress(prev => {
                   if (prev >= 100) {
                     clearInterval(interval);
                     // Navigate to insights tab after loading completes
                     const insightsEvent = new CustomEvent('navigateToInsights', {
                       detail: { targetTab: 'insights' }
                     });
                     window.dispatchEvent(insightsEvent);
                     window.location.hash = '#insights';
                     setIsLoadingInsights(false);
                     // Scroll to top when insights tab opens
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                     return 100;
                   }
                   return prev + 2; // Increment by 2% every 100ms (5 seconds total)
                 });
               }, 100);
             }}
              disabled={isLoadingInsights}
              className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border border-purple-400 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                           <TrendingUp className="h-4 w-4" />
              {isLoadingInsights ? 'Loading...' : 'Run Smart Insights'}
           </Button>
                 </div>
      </div>
      
             {/* Loading Overlay for Smart Insights */}
       {isLoadingInsights && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl border border-border">
             {/* Animated Brain Icon - Perfect for Smart AI Insights */}
             <div className="relative w-20 h-20 mx-auto mb-6">
               <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                 <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                 </svg>
               </div>
               
               {/* Rotating Rings - Same as Analysis Loading */}
               <div className="absolute inset-0 w-20 h-20 border-2 border-primary/30 border-t-transparent rounded-full animate-spin"></div>
               <div className="absolute inset-2 w-16 h-16 border-2 border-accent/40 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
               <div className="absolute inset-4 w-12 h-12 border-2 border-primary/20 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
             </div>
             
             {/* Loading Text - Same Style as Analysis Loading */}
             <div className="text-center space-y-2">
               <h3 className="text-xl font-bold text-gradient-primary">Smart Insights Loading</h3>
               <p className="text-sm text-muted-foreground">
                 Our smart algorithms are analyzing your investment data...
               </p>
             </div>
             
             {/* Enhanced Progress Bar - Same Style as Analysis Loading */}
             <div className="w-full space-y-3 mt-6">
               <div className="flex justify-between text-xs text-muted-foreground">
                 <span>Processing...</span>
                 <span>{insightsProgress}%</span>
               </div>
               <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden border border-muted/50">
                 <div
                   className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-300 ease-out shadow-lg"
                   style={{ width: `${insightsProgress}%` }}
                 />
               </div>
               <div className="text-center text-xs text-muted-foreground">
                 ~{Math.max(0, Math.ceil((100 - insightsProgress) / 10))} seconds remaining
               </div>
             </div>
             
             {/* Animated Dots - Same as Analysis Loading */}
             <div className="flex space-x-1 justify-center mt-4">
               <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

function calculateMonthlyPayment(loanAmount: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1);
}

function calculateMonthlyExpenses(propertyData: PropertyData): number {
  const maintenance = propertyData.monthlyRent * (propertyData.maintenanceRate / 100);
  const management = propertyData.monthlyRent * (propertyData.managementFee / 100) + propertyData.managementBaseFee; // Percentage + Base fee
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