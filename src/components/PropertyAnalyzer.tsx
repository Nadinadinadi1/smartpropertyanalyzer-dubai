import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight, Home, MapPin, Calculator, Building, TrendingUp, Target, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  // Growth Parameters
  rentGrowth: number;
  appreciationRate: number;
  expenseInflation: number;
  // Exit Parameters
  exitCapRate: number;
  sellingCosts: number;
}

interface PropertyAnalyzerProps {
  onAnalyze: (data: PropertyData) => void;
}

const steps = [
  { id: 1, title: 'Property Type', icon: Building },
  { id: 2, title: 'Property Details', icon: Home },
  { id: 3, title: 'Financing', icon: Calculator },
  { id: 4, title: 'Revenue', icon: MapPin },
  { id: 5, title: 'Expenses', icon: Settings },
  { id: 6, title: 'Growth & Exit', icon: TrendingUp },
];

const dubaiAreas = [
  'Dubai Marina',
  'Downtown Dubai',
  'Jumeirah Village Circle',
  'Business Bay',
  'Dubai Hills Estate',
  'Arabian Ranches',
  'Palm Jumeirah',
  'Dubai Investment Park',
  'Jumeirah Beach Residence',
  'Al Barsha',
  'Dubai South',
  'Dubai Creek Harbour',
  'Mohammed Bin Rashid City',
  'Dubai Silicon Oasis'
];

const propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'Studio', 'Penthouse', 'Office', 'Retail'];

export default function PropertyAnalyzer({ onAnalyze }: PropertyAnalyzerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    propertyStatus: 'ready',
    name: '',
    price: 1000000,
    priceInputMethod: 'slider',
    propertyType: '',
    area: '',
    downPayment: 25,
    loanTerm: 25,
    interestRate: 4.5,
    dldFeeIncluded: true,
    monthlyRent: 8000,
    vacancyRate: 10,
    maintenanceRate: 2,
    managementFee: 8,
    insurance: 1500,
    rentGrowth: 3,
    appreciationRate: 4,
    expenseInflation: 2.5,
    exitCapRate: 6,
    sellingCosts: 3,
  });

  const updatePropertyData = (field: keyof PropertyData, value: any) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAnalyze = () => {
    onAnalyze(propertyData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Progress Header */}
      <div className="bg-gradient-hero p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Smart Property Analyser Dubai</h1>
          <span className="text-sm opacity-90">Step {currentStep} of 6</span>
        </div>
        
        <div className="flex space-x-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                'flex-1 h-1 rounded-full transition-all',
                step.id <= currentStep ? 'bg-white' : 'bg-white/30'
              )}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {currentStep === 1 && (
          <Card className="form-step">
            <div className="text-center mb-6">
              <Building className="h-12 w-12 text-primary mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gradient-primary">Property Type</h2>
              <p className="text-muted-foreground">What type of property are you analyzing?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">Property Status</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={cn(
                      "p-4 cursor-pointer transition-all border-2",
                      propertyData.propertyStatus === 'ready' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => updatePropertyData('propertyStatus', 'ready')}
                  >
                    <div className="text-center">
                      <Home className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-semibold">Ready Property</h3>
                      <p className="text-xs text-muted-foreground">Existing completed property</p>
                    </div>
                  </Card>
                  
                  <Card
                    className={cn(
                      "p-4 cursor-pointer transition-all border-2",
                      propertyData.propertyStatus === 'off-plan' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => updatePropertyData('propertyStatus', 'off-plan')}
                  >
                    <div className="text-center">
                      <Building className="h-8 w-8 mx-auto mb-2 text-secondary" />
                      <h3 className="font-semibold">Off-Plan Property</h3>
                      <p className="text-xs text-muted-foreground">Under construction</p>
                    </div>
                  </Card>
                </div>
              </div>

              {propertyData.propertyStatus === 'off-plan' && (
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <p className="text-sm text-secondary">
                    ℹ️ Off-plan properties may have developer incentives like DLD fee coverage and flexible payment plans.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="form-step">
            <div className="text-center mb-6">
              <Home className="h-12 w-12 text-primary mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gradient-primary">Property Details</h2>
              <p className="text-muted-foreground">Tell us about your investment property</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="property-name">Property Name/Address</Label>
                <Input
                  id="property-name"
                  placeholder="e.g., Marina Heights Tower"
                  value={propertyData.name}
                  onChange={(e) => updatePropertyData('name', e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Purchase Price Input Method</Label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button
                    variant={propertyData.priceInputMethod === 'slider' ? 'default' : 'outline'}
                    onClick={() => updatePropertyData('priceInputMethod', 'slider')}
                    className="h-12"
                  >
                    Slider
                  </Button>
                  <Button
                    variant={propertyData.priceInputMethod === 'manual' ? 'default' : 'outline'}
                    onClick={() => updatePropertyData('priceInputMethod', 'manual')}
                    className="h-12"
                  >
                    Manual Input
                  </Button>
                </div>

                {propertyData.priceInputMethod === 'slider' ? (
                  <div className="space-y-3">
                    <Slider
                      value={[propertyData.price]}
                      onValueChange={(value) => updatePropertyData('price', value[0])}
                      max={10000000}
                      min={300000}
                      step={50000}
                      className="w-full"
                    />
                    <div className="text-center">
                      <span className="text-2xl font-bold text-gradient-primary">
                        {formatCurrency(propertyData.price)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Input
                    type="number"
                    placeholder="Enter purchase price"
                    value={propertyData.price}
                    onChange={(e) => updatePropertyData('price', parseFloat(e.target.value) || 0)}
                    className="text-lg"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Property Type</Label>
                  <Select value={propertyData.propertyType} onValueChange={(value) => updatePropertyData('propertyType', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Area</Label>
                  <Select value={propertyData.area} onValueChange={(value) => updatePropertyData('area', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {dubaiAreas.map((area) => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="form-step">
            <div className="text-center mb-6">
              <Calculator className="h-12 w-12 text-secondary mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gradient-primary">Financing</h2>
              <p className="text-muted-foreground">Configure your loan and payment terms</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Down Payment</Label>
                <div className="mt-2 space-y-3">
                  <Slider
                    value={[propertyData.downPayment]}
                    onValueChange={(value) => updatePropertyData('downPayment', value[0])}
                    max={50}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{propertyData.downPayment}%</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(propertyData.price * (propertyData.downPayment / 100))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Loan Term (Years)</Label>
                  <div className="mt-2 space-y-3">
                    <Slider
                      value={[propertyData.loanTerm]}
                      onValueChange={(value) => updatePropertyData('loanTerm', value[0])}
                      max={30}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                    <div className="text-center text-sm font-medium">
                      {propertyData.loanTerm} years
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Interest Rate (%)</Label>
                  <Input
                    type="number"
                    value={propertyData.interestRate}
                    onChange={(e) => updatePropertyData('interestRate', parseFloat(e.target.value) || 0)}
                    className="mt-2"
                    min="1"
                    max="15"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-base font-semibold">DLD Fee (4%)</Label>
                  <p className="text-sm text-muted-foreground">
                    {propertyData.propertyStatus === 'off-plan' 
                      ? 'Often covered by developer for off-plan' 
                      : 'Dubai Land Department registration fee'
                    }
                  </p>
                </div>
                <Switch
                  checked={propertyData.dldFeeIncluded}
                  onCheckedChange={(checked) => updatePropertyData('dldFeeIncluded', checked)}
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Additional Costs</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>DLD Fee (4%): {propertyData.dldFeeIncluded ? formatCurrency(propertyData.price * 0.04) : 'Not included'}</div>
                  <div>Agent Fee (2%): {formatCurrency(propertyData.price * 0.02)}</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {currentStep === 4 && (
          <Card className="form-step">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-success mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gradient-primary">Revenue</h2>
              <p className="text-muted-foreground">Expected rental income and occupancy</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Monthly Rent</Label>
                <div className="mt-2 space-y-3">
                  <Slider
                    value={[propertyData.monthlyRent]}
                    onValueChange={(value) => updatePropertyData('monthlyRent', value[0])}
                    max={50000}
                    min={2000}
                    step={500}
                    className="w-full"
                  />
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gradient-success">
                      {formatCurrency(propertyData.monthlyRent)}/month
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Vacancy Rate</Label>
                <div className="mt-2 space-y-3">
                  <Slider
                    value={[propertyData.vacancyRate]}
                    onValueChange={(value) => updatePropertyData('vacancyRate', value[0])}
                    max={20}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{propertyData.vacancyRate}% vacant</span>
                    <span className="font-semibold">
                      {100 - propertyData.vacancyRate}% occupied
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-success/10 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-success">Effective Annual Rent</h4>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(propertyData.monthlyRent * 12 * ((100 - propertyData.vacancyRate) / 100))}
                </p>
              </div>
            </div>
          </Card>
        )}

        {currentStep === 5 && (
          <Card className="form-step">
            <div className="text-center mb-6">
              <Settings className="h-12 w-12 text-warning mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gradient-primary">Expenses</h2>
              <p className="text-muted-foreground">Operating costs and maintenance</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Maintenance Rate (% of rent)</Label>
                <div className="mt-2 space-y-3">
                  <Slider
                    value={[propertyData.maintenanceRate]}
                    onValueChange={(value) => updatePropertyData('maintenanceRate', value[0])}
                    max={10}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{propertyData.maintenanceRate}%</span>
                    <span className="font-semibold text-warning">
                      {formatCurrency(propertyData.monthlyRent * 12 * (propertyData.maintenanceRate / 100))}/year
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Management Fee (% of rent)</Label>
                <div className="mt-2 space-y-3">
                  <Slider
                    value={[propertyData.managementFee]}
                    onValueChange={(value) => updatePropertyData('managementFee', value[0])}
                    max={15}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{propertyData.managementFee}%</span>
                    <span className="font-semibold text-warning">
                      {formatCurrency(propertyData.monthlyRent * 12 * (propertyData.managementFee / 100))}/year
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Annual Insurance</Label>
                <div className="mt-2 space-y-3">
                  <Slider
                    value={[propertyData.insurance]}
                    onValueChange={(value) => updatePropertyData('insurance', value[0])}
                    max={5000}
                    min={500}
                    step={100}
                    className="w-full"
                  />
                  <div className="text-center">
                    <span className="text-lg font-bold text-warning">
                      {formatCurrency(propertyData.insurance)}/year
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {currentStep === 6 && (
          <Card className="form-step">
            <div className="text-center mb-6">
              <TrendingUp className="h-12 w-12 text-accent mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gradient-primary">Growth & Exit Parameters</h2>
              <p className="text-muted-foreground">Long-term projections and exit strategy</p>
            </div>

            <div className="space-y-6">
              <div className="bg-accent/10 p-4 rounded-lg">
                <h4 className="font-semibold text-accent mb-4">Growth Parameters</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label>Rent Growth (% per year)</Label>
                    <div className="mt-2 space-y-3">
                      <Slider
                        value={[propertyData.rentGrowth]}
                        onValueChange={(value) => updatePropertyData('rentGrowth', value[0])}
                        max={8}
                        min={0}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="text-center">
                        <span className="text-lg font-bold text-accent">
                          {propertyData.rentGrowth}% annually
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Property Appreciation (% per year)</Label>
                    <div className="mt-2 space-y-3">
                      <Slider
                        value={[propertyData.appreciationRate]}
                        onValueChange={(value) => updatePropertyData('appreciationRate', value[0])}
                        max={10}
                        min={0}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="text-center">
                        <span className="text-lg font-bold text-accent">
                          {propertyData.appreciationRate}% annually
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Expense Inflation (% per year)</Label>
                    <div className="mt-2 space-y-3">
                      <Slider
                        value={[propertyData.expenseInflation]}
                        onValueChange={(value) => updatePropertyData('expenseInflation', value[0])}
                        max={6}
                        min={0}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="text-center">
                        <span className="text-lg font-bold text-warning">
                          {propertyData.expenseInflation}% annually
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-danger/10 p-4 rounded-lg">
                <h4 className="font-semibold text-danger mb-4">Exit Strategy</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label>Exit Cap Rate (%)</Label>
                    <div className="mt-2 space-y-3">
                      <Slider
                        value={[propertyData.exitCapRate]}
                        onValueChange={(value) => updatePropertyData('exitCapRate', value[0])}
                        max={12}
                        min={3}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="text-center">
                        <span className="text-lg font-bold text-danger">
                          {propertyData.exitCapRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Selling Costs (%)</Label>
                    <div className="mt-2 space-y-3">
                      <Slider
                        value={[propertyData.sellingCosts]}
                        onValueChange={(value) => updatePropertyData('sellingCosts', value[0])}
                        max={8}
                        min={1}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="text-center">
                        <span className="text-lg font-bold text-danger">
                          {propertyData.sellingCosts}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < 6 ? (
            <Button
              onClick={nextStep}
              className="btn-premium flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleAnalyze}
              className="btn-gold flex items-center gap-2 px-8"
            >
              <Calculator className="h-4 w-4" />
              Analyze Investment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}