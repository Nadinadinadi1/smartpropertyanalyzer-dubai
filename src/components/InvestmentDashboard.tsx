import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Target,
  Calendar,
  PieChart,
  BarChart3
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
  name: string;
  price: number;
  propertyType: string;
  area: string;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  monthlyRent: number;
  vacancyRate: number;
  maintenanceRate: number;
  managementFee: number;
  insurance: number;
}

interface InvestmentDashboardProps {
  propertyData: PropertyData;
}

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function InvestmentDashboard({ propertyData }: InvestmentDashboardProps) {
  // Calculate investment metrics
  const downPaymentAmount = propertyData.price * (propertyData.downPayment / 100);
  const loanAmount = propertyData.price - downPaymentAmount;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, propertyData.interestRate, propertyData.loanTerm);
  const effectiveRent = propertyData.monthlyRent * ((100 - propertyData.vacancyRate) / 100);
  const monthlyExpenses = calculateMonthlyExpenses(propertyData);
  const monthlyCashFlow = effectiveRent - monthlyPayment - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;
  const cashOnCashReturn = (annualCashFlow / downPaymentAmount) * 100;
  const grossYield = (propertyData.monthlyRent * 12 / propertyData.price) * 100;
  const netYield = (effectiveRent * 12 - monthlyExpenses * 12) / propertyData.price * 100;

  // Generate projection data
  const projectionData = generateProjectionData(propertyData, annualCashFlow);
  
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
    return Math.min(10, score);
  };

  const investmentScore = getInvestmentScore();
  const riskLevel = investmentScore >= 8 ? 'Low' : investmentScore >= 6 ? 'Medium' : 'High';

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gradient-primary mb-2">Investment Analysis</h1>
        <p className="text-muted-foreground">{propertyData.name || 'Your Property'}</p>
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

      {/* 10-Year Projection Chart */}
      <Card className="card-premium p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold">10-Year Wealth Projection</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tickFormatter={(value) => `${value / 1000}K`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelStyle={{ color: '#1e293b' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="totalReturn" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Expense Breakdown */}
      <Card className="card-premium p-6">
        <div className="flex items-center mb-4">
          <PieChart className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold">Monthly Expense Breakdown</h3>
        </div>
        <div className="h-48 mb-4">
          <div className="text-center text-sm text-muted-foreground mb-4">
            Monthly expense breakdown coming soon
          </div>
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
            <span className="font-semibold">{formatCurrency(downPaymentAmount + propertyData.price * 0.06)}</span>
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

function generateProjectionData(propertyData: PropertyData, annualCashFlow: number) {
  const data = [];
  let cumulativeCashFlow = 0;
  const appreciationRate = 0.05; // 5% annual appreciation
  
  for (let year = 1; year <= 10; year++) {
    cumulativeCashFlow += annualCashFlow;
    const propertyValue = propertyData.price * Math.pow(1 + appreciationRate, year);
    const totalReturn = cumulativeCashFlow + (propertyValue - propertyData.price);
    
    data.push({
      year,
      totalReturn,
      cashFlow: cumulativeCashFlow,
      propertyValue,
    });
  }
  
  return data;
}