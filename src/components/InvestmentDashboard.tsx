import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ArrowUpRight
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
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Calculate investment metrics
  const downPaymentAmount = propertyData.price * (propertyData.downPayment / 100);
  const additionalCosts = propertyData.price * 0.02 + (propertyData.dldFeeIncluded ? propertyData.price * 0.04 : 0) + 5000; // Agent + DLD + legal
  const totalInvestment = downPaymentAmount + additionalCosts;
  const loanAmount = propertyData.price - downPaymentAmount;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, propertyData.interestRate, propertyData.loanTerm);
  const effectiveRent = propertyData.monthlyRent * ((100 - propertyData.vacancyRate) / 100);
  const monthlyExpenses = calculateMonthlyExpenses(propertyData);
  const monthlyCashFlow = effectiveRent - monthlyPayment - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;
  const cashOnCashReturn = (annualCashFlow / totalInvestment) * 100;
  const grossYield = (propertyData.monthlyRent * 12 / propertyData.price) * 100;
  const netYield = (effectiveRent * 12 - monthlyExpenses * 12) / propertyData.price * 100;

  // Calculate IRR and ROI
  const projectionData = generateDetailedProjectionData(propertyData, totalInvestment);
  const irr = calculateIRR(projectionData, totalInvestment);
  const tenYearROI = projectionData.length > 0 ? 
    ((projectionData[projectionData.length - 1].totalReturn / totalInvestment) - 1) * 100 : 0;
  
  // Expense breakdown data
  const expenseData = [
    { name: 'Mortgage Payment', value: monthlyPayment, color: COLORS[0] },
    { name: 'Maintenance', value: propertyData.monthlyRent * (propertyData.maintenanceRate / 100), color: COLORS[1] },
    { name: 'Management', value: propertyData.monthlyRent * (propertyData.managementFee / 100), color: COLORS[2] },
    { name: 'Insurance', value: propertyData.insurance / 12, color: COLORS[3] },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getInvestmentScore = () => {
    let score = 5;
    if (cashOnCashReturn > 8) score += 2;
    if (cashOnCashReturn > 12) score += 1;
    if (netYield > 6) score += 1;
    if (monthlyCashFlow > 0) score += 1;
    if (irr > 10) score += 1;
    return Math.min(10, score);
  };

  const investmentScore = getInvestmentScore();
  const riskLevel = investmentScore >= 8 ? 'Low' : investmentScore >= 6 ? 'Medium' : 'High';

  const filteredProjectionData = selectedYear === 'all' ? projectionData : 
    projectionData.filter(item => item.year <= parseInt(selectedYear));

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gradient-primary mb-2">Smart Property Analyser Dubai</h1>
        <p className="text-muted-foreground">{propertyData.name || 'Your Property Analysis'}</p>
        <Badge variant="outline" className="mt-2">
          {propertyData.propertyStatus === 'ready' ? '🏠 Ready Property' : '🏗️ Off-Plan Property'}
        </Badge>
      </div>

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
        <div className="text-center">
          <div className="text-lg font-semibold">
            {investmentScore >= 8 ? '✅ Strong Buy' : investmentScore >= 6 ? '🔄 Consider' : '❌ Pass'}
          </div>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="metric-card">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="h-6 w-6 text-success mr-2" />
            {monthlyCashFlow >= 0 ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-danger" />}
          </div>
          <div className={`metric-value ${monthlyCashFlow >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatCurrency(monthlyCashFlow)}
          </div>
          <div className="metric-label">Monthly Cash Flow</div>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-6 w-6 text-primary mr-2" />
          </div>
          <div className="metric-value">
            {cashOnCashReturn.toFixed(1)}%
          </div>
          <div className="metric-label">Cash-on-Cash Return</div>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-center mb-2">
            <Calculator className="h-6 w-6 text-secondary mr-2" />
          </div>
          <div className="metric-value">
            {irr.toFixed(1)}%
          </div>
          <div className="metric-label">IRR (Internal Rate of Return)</div>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-center mb-2">
            <ArrowUpRight className="h-6 w-6 text-accent mr-2" />
          </div>
          <div className="metric-value">
            {tenYearROI.toFixed(1)}%
          </div>
          <div className="metric-label">10-Year ROI</div>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-center mb-2">
            <Home className="h-6 w-6 text-secondary mr-2" />
          </div>
          <div className="metric-value">
            {grossYield.toFixed(1)}%
          </div>
          <div className="metric-label">Gross Rental Yield</div>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-6 w-6 text-accent mr-2" />
          </div>
          <div className="metric-value">
            {netYield.toFixed(1)}%
          </div>
          <div className="metric-label">Net Rental Yield</div>
        </Card>
      </div>

      {/* Enhanced 10-Year Projection Chart */}
      <Card className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-semibold">10-Year Wealth Projection</h3>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="5">5 Years</SelectItem>
              <SelectItem value="7">7 Years</SelectItem>
              <SelectItem value="10">10 Years</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Detailed Year-by-Year Table */}
      <Card className="card-premium p-6">
        <div className="flex items-center mb-4">
          <Calculator className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold">Year-by-Year Projection</h3>
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

      {/* Expense Breakdown */}
      <Card className="card-premium p-6">
        <div className="flex items-center mb-4">
          <PieChart className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold">Monthly Expense Breakdown</h3>
        </div>
        <div className="h-48 mb-4">
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
        <div className="space-y-2">
          {expenseData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-semibold">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Investment Summary */}
      <Card className="card-premium p-6">
        <h3 className="font-semibold mb-4">Investment Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Investment</span>
            <span className="font-semibold">{formatCurrency(totalInvestment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Annual Cash Flow</span>
            <span className={`font-semibold ${annualCashFlow >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(annualCashFlow)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Loan-to-Value</span>
            <span className="font-semibold">{((100 - propertyData.downPayment)).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monthly Mortgage</span>
            <span className="font-semibold">{formatCurrency(monthlyPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exit Cap Rate</span>
            <span className="font-semibold">{propertyData.exitCapRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Property Status</span>
            <span className="font-semibold capitalize">{propertyData.propertyStatus.replace('-', ' ')}</span>
          </div>
        </div>
      </Card>
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
  const management = propertyData.monthlyRent * (propertyData.managementFee / 100);
  const insurance = propertyData.insurance / 12;
  return maintenance + management + insurance;
}

function generateDetailedProjectionData(propertyData: PropertyData, totalInvestment: number): YearlyProjection[] {
  const data: YearlyProjection[] = [];
  const loanAmount = propertyData.price * ((100 - propertyData.downPayment) / 100);
  const monthlyPayment = calculateMonthlyPayment(loanAmount, propertyData.interestRate, propertyData.loanTerm);
  
  let currentRent = propertyData.monthlyRent;
  let currentExpenseRate = (propertyData.maintenanceRate + propertyData.managementFee) / 100;
  let remainingDebt = loanAmount;
  let cumulativeCash = 0;
  
  for (let year = 1; year <= 10; year++) {
    // Apply growth rates
    currentRent = currentRent * (1 + propertyData.rentGrowth / 100);
    currentExpenseRate = currentExpenseRate * (1 + propertyData.expenseInflation / 100);
    
    // Calculate income and expenses
    const effectiveRent = currentRent * ((100 - propertyData.vacancyRate) / 100);
    const annualRent = effectiveRent * 12;
    const annualExpenses = (currentRent * currentExpenseRate * 12) + propertyData.insurance;
    const annualDebtService = monthlyPayment * 12;
    const netCashFlow = annualRent - annualExpenses - annualDebtService;
    
    // Calculate principal paydown (simplified)
    const interestPayment = remainingDebt * (propertyData.interestRate / 100);
    const principalPayment = annualDebtService - interestPayment;
    remainingDebt = Math.max(0, remainingDebt - principalPayment);
    
    // Calculate property value
    const propertyValue = propertyData.price * Math.pow(1 + propertyData.appreciationRate / 100, year);
    
    // Calculate equity and total return
    const equity = propertyValue - remainingDebt;
    cumulativeCash += netCashFlow;
    const totalReturnValue = cumulativeCash + equity - totalInvestment;
    const totalReturnPercent = (totalReturnValue / totalInvestment) * 100;
    
    // Calculate DSCR
    const dscr = annualRent / annualDebtService;
    
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
  // Simplified IRR calculation using approximation
  if (projections.length === 0) return 0;
  
  const lastYear = projections[projections.length - 1];
  const totalCashFlow = lastYear.cumulativeCash;
  const finalValue = lastYear.equity;
  const totalReturn = totalCashFlow + finalValue;
  
  // Approximate IRR using compound annual growth rate
  const years = projections.length;
  const irr = (Math.pow(totalReturn / initialInvestment, 1 / years) - 1) * 100;
  
  return Math.max(0, irr);
}