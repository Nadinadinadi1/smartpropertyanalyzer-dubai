import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Home, MapPin, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface PropertyAnalyzerProps {
  onAnalyze: (data: PropertyData) => void;
}

const steps = [
  { id: 1, title: 'Property Details', icon: Home },
  { id: 2, title: 'Financing', icon: Calculator },
  { id: 3, title: 'Revenue', icon: MapPin },
  { id: 4, title: 'Expenses', icon: ArrowRight },
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
  'Al Barsha'
];

const propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'Studio'];

export default function PropertyAnalyzer({ onAnalyze }: PropertyAnalyzerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    name: '',
    price: 1000000,
    propertyType: '',
    area: '',
    downPayment: 25,
    loanTerm: 25,
    interestRate: 4.5,
    monthlyRent: 8000,
    vacancyRate: 10,
    maintenanceRate: 2,
    managementFee: 8,
    insurance: 1500,
  });

  const updatePropertyData = (field: keyof PropertyData, value: any) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
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
    <div className="h-full flex flex-col">
      {/* Progress Header */}
      <div className="bg-gradient-hero p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Property Analyzer</h1>
          <span className="text-sm opacity-90">Step {currentStep} of 4</span>
        </div>
        
        <div className="flex space-x-2">
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
                <Label htmlFor="property-price">Purchase Price</Label>
                <div className="mt-2 space-y-3">
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

        {currentStep === 2 && (
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

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Additional Costs</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>DLD Fee (4%): {formatCurrency(propertyData.price * 0.04)}</div>
                  <div>Agent Fee (2%): {formatCurrency(propertyData.price * 0.02)}</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {currentStep === 3 && (
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

        {currentStep === 4 && (
          <Card className="form-step">
            <div className="text-center mb-6">
              <ArrowRight className="h-12 w-12 text-warning mx-auto mb-2" />
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
                <Input
                  type="number"
                  value={propertyData.insurance}
                  onChange={(e) => updatePropertyData('insurance', parseFloat(e.target.value) || 0)}
                  className="mt-2"
                  min="0"
                  step="100"
                />
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

          {currentStep < 4 ? (
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