import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  TrendingUp, 
  Shield, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Target,
  BookOpen
} from 'lucide-react';

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

interface InsightsPanelProps {
  propertyData: PropertyData;
}

export default function InsightsPanel({ propertyData }: InsightsPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const grossYield = (propertyData.monthlyRent * 12 / propertyData.price) * 100;
  const pricePerSqm = propertyData.price / getEstimatedArea(propertyData.propertyType);

  // Market data (simplified for demo)
  const marketData = getMarketData(propertyData.area);
  
  const insights = generateInsights(propertyData, grossYield, marketData);
  const recommendations = generateRecommendations(propertyData, grossYield, marketData);
  const riskFactors = generateRiskFactors(propertyData);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Lightbulb className="h-6 w-6 text-accent mr-2 animate-glow" />
          <h1 className="text-2xl font-bold text-gradient-primary">AI Insights</h1>
        </div>
        <p className="text-muted-foreground">Smart analysis and recommendations</p>
      </div>

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

      {/* Market Comparison */}
      <Card className="card-premium p-6">
        <div className="flex items-center mb-4">
          <MapPin className="h-5 w-5 text-secondary mr-2" />
          <h3 className="font-semibold">Market Comparison - {propertyData.area}</h3>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Average Rental Yield</span>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{marketData.avgYield.toFixed(1)}%</span>
              <Badge variant={grossYield > marketData.avgYield ? "default" : "secondary"}>
                {grossYield > marketData.avgYield ? "Above Market" : "Below Market"}
              </Badge>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Your Yield vs Market</span>
              <span>{grossYield.toFixed(1)}%</span>
            </div>
            <Progress value={(grossYield / marketData.avgYield) * 100} className="h-2" />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Price per sqm</span>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{formatCurrency(pricePerSqm)}</span>
              <Badge variant={pricePerSqm < marketData.avgPricePerSqm ? "default" : "secondary"}>
                {pricePerSqm < marketData.avgPricePerSqm ? "Good Value" : "Premium"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Optimization Recommendations */}
      <Card className="card-premium p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-success mr-2" />
          <h3 className="font-semibold">Optimization Recommendations</h3>
        </div>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="border-l-4 border-primary pl-4">
              <h4 className="font-medium text-sm">{rec.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
              {rec.impact && (
                <p className="text-xs text-success mt-2">💡 {rec.impact}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Risk Assessment */}
      <Card className="card-premium p-6">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-warning mr-2" />
          <h3 className="font-semibold">Risk Assessment</h3>
        </div>
        <div className="space-y-4">
          {riskFactors.map((risk, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                risk.level === 'low' ? 'bg-success/10' : 
                risk.level === 'medium' ? 'bg-warning/10' : 'bg-danger/10'
              }`}>
                <AlertTriangle className={`h-4 w-4 ${
                  risk.level === 'low' ? 'text-success' : 
                  risk.level === 'medium' ? 'text-warning' : 'text-danger'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{risk.factor}</h4>
                  <Badge variant={
                    risk.level === 'low' ? 'default' : 
                    risk.level === 'medium' ? 'secondary' : 'destructive'
                  }>
                    {risk.level.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{risk.description}</p>
                {risk.mitigation && (
                  <p className="text-xs text-primary mt-2">🛡️ {risk.mitigation}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Market Trends */}
      <Card className="card-premium p-6">
        <div className="flex items-center mb-4">
          <BookOpen className="h-5 w-5 text-accent mr-2" />
          <h3 className="font-semibold">Market Trends & Outlook</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-1">Dubai Real Estate Outlook 2024</h4>
            <p className="text-xs text-muted-foreground">
              Continued growth expected with new infrastructure projects and Expo legacy effects.
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-1">{propertyData.area} Specific Trends</h4>
            <p className="text-xs text-muted-foreground">
              {getAreaSpecificTrend(propertyData.area)}
            </p>
          </div>
        </div>
      </Card>
    </div>
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