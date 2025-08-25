import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Command, CommandGroup, CommandItem, CommandInput, CommandList, CommandEmpty, CommandSeparator } from '@/components/ui/command';
import CommunityCombobox from '@/components/CommunityCombobox';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Home, MapPin, Calculator, Building, TrendingUp, Target, Settings, MessageCircle, Send, Star, Sun, Moon, HardHat, Info, ChevronDown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import dubaiHeroImage from '@/assets/dubai-skyline-hero.jpg';
import SPALogo from './SPALogo';
import FeedbackButton from './FeedbackButton';
import React from 'react'; // Added for React.createElement


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
  // New: Beds & Baths
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
  initialData?: PropertyData;
}

const steps = [
  { id: 1, title: 'Property Type', icon: Building },
  { id: 2, title: 'Property Details', icon: Home },
  { id: 3, title: 'Financing', icon: Calculator },
  { id: 4, title: 'Revenue', icon: MapPin },
  { id: 5, title: 'Expenses', icon: Settings },
  { id: 6, title: 'Growth & Exit', icon: TrendingUp },
];

// Seed list, augmented by public/data/dubai-communities.json when available
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

const bayutPropertyTypes = {
  residential: [
    'Apartment',
    'Villa',
    'Townhouse',
    'Penthouse',
    'Hotel Apartment',
    'Villa Compound',
    'Land',
    'Building',
    'Floor',
  ],
  commercial: [
    'Office',
    'Shop',
    'Warehouse',
    'Labour Camp',
    'Bulk Unit',
    'Factory',
    'Mixed Use Land',
    'Land',
    'Building',
    'Industrial Land',
    'Showroom',
    'Floor',
    'Other Commercial',
  ],
} as const;

export default function PropertyAnalyzer({ onAnalyze, initialData }: PropertyAnalyzerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [progress, setProgress] = useState(0);
  const [allCommunities, setAllCommunities] = useState<string[] | null>(null);

  // Titles for compact per-step progress display
  const stepTitles: string[] = ['Property Details', 'Financing', 'Revenue', 'Expenses', 'Growth & Exit'];

  // Auto-scroll to top when step changes - REMOVED for better UX
  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // }, [currentStep]);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    propertyStatus: 'ready',
    name: '',
    sizeSqft: 0,
    price: 1000000,
    priceInputMethod: 'slider',
    propertyType: '',
    area: '',
    handoverBy: null,
    preHandoverPercent: 0,
    bedrooms: 'studio',
    bathrooms: 1,
    downPayment: 25,
    agentFeePercent: 2,
    loanTerm: 25,
    interestRate: 4.5,
    dldFeeIncluded: true,
    monthlyRent: 8000,
    additionalIncome: 500,
    vacancyRate: 10,
    maintenanceRate: 2,
    managementFee: 8,
    managementBaseFee: 200, // Base fee
    insurance: 1500,
    otherExpenses: 200,
    rentGrowth: 3,
    appreciationRate: 4,
    expenseInflation: 2.5,
    exitCapRate: 6,
    sellingCosts: 3,
  });

  // Original behavior: step 1 shows progress immediately

  // Hydrate form with previously analyzed data when returning to Analyze tab
  useEffect(() => {
    if (initialData) {
      setPropertyData(prev => ({ ...prev, ...initialData }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Lazy-load complete communities list
  useEffect(() => {
    fetch('/data/dubai-communities.json')
      .then(r => r.ok ? r.json() : null)
      .then((data: string[] | null) => {
        if (Array.isArray(data) && data.length) setAllCommunities(data);
      })
      .catch(() => {});
  }, []);

  const updatePropertyData = (field: keyof PropertyData, value: any) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      setTimeout(() => {
        const el = document.getElementById('step-progress');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setTimeout(() => {
        const el = document.getElementById('step-progress');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const durationMs = 3000;
    const startTime = Date.now();
    const progressInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(progressInterval);
        // Finish analysis automatically after short delay
        setTimeout(() => {
          setIsAnalyzing(false);
          onAnalyze(propertyData);
        }, 300);
      }
    }, 100);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    setIsSubmittingFeedback(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Thank you for your feedback! We\'ll review it soon.');
      setShowFeedback(false);
      setRating(0);
      setFeedback('');
      setEmail('');
      setIsSubmittingFeedback(false);
      
      // Scroll to top when analysis completes
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Complete the analysis after feedback is submitted
      setIsAnalyzing(false);
      onAnalyze(propertyData);
    }, 1000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      {/* Header Bar - removed (now global in AppHeader) */}
      <div className="hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SPALogo size={32} showPulse={false} />
            <div>
              <div className="text-sm font-semibold">Smart Property Analyzer — Dubai</div>
              <div className="text-xs text-gray-500">Professional-grade ROI, Cash Flow & IRR Analysis</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FeedbackButton variant="compact" />
            <button
              onClick={() => {
                document.documentElement.classList.toggle('dark');
              }}
              className="w-10 h-10 bg-card/80 backdrop-blur-sm border border-border rounded-xl flex items-center justify-center shadow-md hover:bg-card transition-colors"
            >
              <Sun className="h-5 w-5 text-primary dark:hidden" />
              <Moon className="h-5 w-5 text-primary hidden dark:block" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section removed */}

      {/* Journey Promo removed */}

      {/* New Promotional Section - Blue tones and positioned higher */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border-b border-blue-200">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-lg">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">🎯 In Just 5 Steps: Complete Investment Insight</h3>
                <p className="text-base sm:text-lg text-gray-700 mb-3">
                  Transform your property dreams into data-driven decisions. Our step-by-step analysis reveals your true investment potential.
                </p>
              </div>
              
              {/* Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="text-blue-700 text-sm font-semibold">📊 ROI Analysis</div>
                  <p className="text-xs text-gray-600 mt-1">Calculate exact returns on your investment</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                  <div className="text-indigo-700 text-sm font-semibold">💰 Cash Flow</div>
                  <p className="text-xs text-gray-600 mt-1">Monthly income vs. expenses breakdown</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="text-purple-700 text-sm font-semibold">📈 Growth Projections</div>
                  <p className="text-xs text-gray-600 mt-1">1-10 year investment forecasts</p>
                </div>
              </div>
              
                                              {/* Continue text + scroll arrow */}
                              <div className="text-center mb-6">
                                <p className="text-sm text-gray-600">Continue below to use the full property calculator</p>
                                <button
                                  onClick={() => {
                                    const anchor = document.getElementById('input-details');
                                    if (anchor) {
                                      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      return;
                                    }
                                    const fallback = document.querySelector('.bg-gradient-to-br.from-slate-100');
                                    if (fallback) {
                                      (fallback as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                  }}
                                  aria-label="Scroll to calculator"
                                  className="mt-3 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                                >
                                  <ChevronDown className="w-6 h-6" />
                                </button>
                              </div>
                
              </div>
            </div>
          </div>
        </div>

        {/* Journey Section - Investment Journey Simulator (original lower placement) */}
        

        {/* Hero removed; integrated into Step 1 header below */}

        {/* Step Content */}
        <div className="bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4 sm:p-6 pb-40">
          <div className="max-w-4xl mx-auto">
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
                <div id="input-details" className="h-0"></div>
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">🎯 Start Detailed Analysis</h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-2">
                    Begin your investment journey by filling out the form below. Each step will guide you through the essential information needed for a comprehensive property analysis.
                  </p>
                </div>
                {/* Progress moved below header */}
                <div id="step-progress" className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Step {currentStep} of 5</span>
                    <span className="text-xs text-blue-600">{Math.round((currentStep / 5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${(currentStep / 5) * 100}%` }} />
                  </div>
                </div>
                {/* Top Nav - Step 1 */}
                <div className="mb-4 flex justify-end">
                  <Button onClick={nextStep} className="h-9 px-4">Next</Button>
                </div>

                {/* Property Details section header (consistent style) */}
                <div className="text-center mb-4 sm:mb-6">
                  <Home className="h-8 w-8 sm:h-12 sm:w-12 text-primary mx-auto mb-2" />
                  <h2 className="text-xl sm:text-2xl font-bold">Property Details</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Basic property information</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Completion status */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Completion status</Label>
                    <div className="inline-flex rounded-xl border border-border bg-card p-1">
                      <button
                        type="button"
                        onClick={() => updatePropertyData('propertyStatus', 'ready')}
                        className={cn(
                          'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          propertyData.propertyStatus === 'ready'
                            ? 'bg-primary text-white'
                            : 'text-foreground hover:bg-muted'
                        )}
                        aria-pressed={propertyData.propertyStatus === 'ready'}
                      >
                        <Home className={cn('h-5 w-5', propertyData.propertyStatus === 'ready' ? 'text-white' : 'text-primary')} />
                        Completed
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePropertyData('propertyStatus', 'off-plan')}
                        className={cn(
                          'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          propertyData.propertyStatus === 'off-plan'
                            ? 'bg-primary text-white'
                            : 'text-foreground hover:bg-muted'
                        )}
                        aria-pressed={propertyData.propertyStatus === 'off-plan'}
                      >
                        <HardHat className={cn('h-5 w-5', propertyData.propertyStatus === 'off-plan' ? 'text-white' : 'text-primary')} />
                        Off-plan
                      </button>
                    </div>
                  </div>

                  {/* Name/Address, Size and Off-plan details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {propertyData.propertyStatus === 'off-plan' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Select
                              value={propertyData.handoverBy ?? ''}
                              onValueChange={(v) => updatePropertyData('handoverBy', v === 'any' ? null : v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Handover By" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="any">Any</SelectItem>
                                {[
                                  'Q3 2025','Q4 2025',
                                  'Q1 2026','Q2 2026','Q3 2026','Q4 2026',
                                  '2027',
                                  '2028','2029','2030','2031',
                                ].map((q) => (
                                  <SelectItem key={q} value={q}>{q}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Pre-handover Payment (%)</Label>
                            <div className="mt-3">
                              <Slider
                                value={[propertyData.preHandoverPercent]}
                                onValueChange={(v) => updatePropertyData('preHandoverPercent', v[0])}
                                min={0}
                                max={100}
                                step={1}
                              />
                              <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                                <span>0%</span>
                                <span>{propertyData.preHandoverPercent}%</span>
                                <span>100%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className={propertyData.propertyStatus === 'off-plan' ? 'md:col-span-2' : ''}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          id="property-name"
                          placeholder="Property name / address"
                          value={propertyData.name}
                          onChange={(e) => updatePropertyData('name', e.target.value)}
                          className="md:col-span-2"
                        />
                        <Input
                          id="property-size-sqft"
                          inputMode="numeric"
                          placeholder="Size (sqft)"
                          value={propertyData.sizeSqft ? propertyData.sizeSqft.toLocaleString() : ''}
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                            const next = Number(digitsOnly || '0');
                            updatePropertyData('sizeSqft', next);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Area and Property Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <CommunityCombobox
                        value={propertyData.area}
                        onChange={(v) => updatePropertyData('area', v)}
                        options={(allCommunities ?? dubaiAreas)}
                        placeholder="Select community"
                      />
                    </div>

                    <div>
                      <CommunityCombobox
                        value={propertyData.propertyType}
                        onChange={(v) => updatePropertyData('propertyType', v)}
                        options={[...bayutPropertyTypes.residential, ...bayutPropertyTypes.commercial]}
                        groups={[
                          { label: 'Residential', items: [...bayutPropertyTypes.residential] },
                          { label: 'Commercial', items: [...bayutPropertyTypes.commercial] },
                        ]}
                        placeholder="Select property type"
                      />
                    </div>
                  </div>

                  {/* Purchase Price */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Price (AED)</Label>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-2 rounded-md bg-muted text-sm font-medium">AED</span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter price"
                          value={propertyData.price.toLocaleString()}
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                            const next = Number(digitsOnly || '0');
                            updatePropertyData('price', next);
                          }}
                          onBlur={() => {
                            const min = 100000;
                            const max = 20000000;
                            const clamped = Math.min(max, Math.max(min, propertyData.price || 0));
                            if (clamped !== propertyData.price) {
                              updatePropertyData('price', clamped);
                            }
                          }}
                          className="mt-0"
                        />
                      </div>
                      <div className="flex-1 md:pt-1">
                        <Slider
                          value={[propertyData.price]}
                          onValueChange={(value) => updatePropertyData('price', value[0])}
                          max={20000000}
                          min={100000}
                          step={50000}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>AED 100k</span>
                          <span>AED 20M</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Beds & Baths (dropdowns in app style) */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Beds & Baths</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Beds */}
                      <div>
                        <Label className="text-sm text-muted-foreground">Beds</Label>
                        <Select
                          value={String(propertyData.bedrooms)}
                          onValueChange={(val) => {
                            if (val === 'studio' || val === '8+') {
                              updatePropertyData('bedrooms', val);
                            } else {
                              updatePropertyData('bedrooms', parseInt(val, 10));
                            }
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select beds" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="studio">Studio</SelectItem>
                            {['1','2','3','4','5','6','7'].map((b) => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                            <SelectItem value="8+">8+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Baths */}
                      <div>
                        <Label className="text-sm text-muted-foreground">Baths</Label>
                        <Select
                          value={String(propertyData.bathrooms)}
                          onValueChange={(val) => {
                            if (val === '6+') {
                              updatePropertyData('bathrooms', val);
                            } else {
                              updatePropertyData('bathrooms', parseInt(val, 10));
                            }
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select baths" />
                          </SelectTrigger>
                          <SelectContent>
                            {['1','2','3','4','5'].map((b) => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                            <SelectItem value="6+">6+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Next */}
                  <div className="pt-2 flex justify-center">
                    <Button onClick={nextStep} className="h-9 px-4">Next</Button>
                  </div>

                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
                <div id="step-progress" className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs text-blue-600">Step {currentStep} of 5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${(currentStep / 5) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 mt-2">
                    {stepTitles.map((title, idx) => (
                      <span key={title} className={idx + 1 === currentStep ? 'font-semibold text-gray-700' : ''}>{title}</span>
                    ))}
                  </div>
                </div>
                <div className="text-center mb-4 sm:mb-6">
                  <Calculator className="h-8 w-8 sm:h-12 sm:w-12 text-primary mx-auto mb-2" />
                  <h2 className="text-xl sm:text-2xl font-bold">Financing</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Configure your loan and payment terms</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Down Payment + Agent Fee */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Down Payment</Label>
                        <span className="text-sm font-semibold text-primary">
                          {formatCurrency(propertyData.price * (propertyData.downPayment / 100))}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[propertyData.downPayment]}
                          onValueChange={(value) => updatePropertyData('downPayment', value[0])}
                          max={80}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-sm text-gray-700">{propertyData.downPayment}%</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Agent Fee (%)</Label>
                        <span className="text-sm font-semibold text-primary">
                          {formatCurrency(propertyData.price * (propertyData.agentFeePercent / 100))}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[propertyData.agentFeePercent]}
                          onValueChange={(value) => updatePropertyData('agentFeePercent', value[0])}
                          max={5}
                          min={0}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="text-sm text-gray-700">{propertyData.agentFeePercent}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Loan Term and Interest Rate */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Loan Term (Years)</Label>
                      <div className="space-y-2 mt-2">
                        <Slider
                          value={[propertyData.loanTerm]}
                          onValueChange={(value) => updatePropertyData('loanTerm', value[0])}
                          max={35}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-sm text-gray-700">{propertyData.loanTerm} years</div>
                      </div>
                    </div>

                    <div>
                      <Label>Interest Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="e.g., 4.5"
                        value={propertyData.interestRate}
                        onChange={(e) => updatePropertyData('interestRate', Number(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* DLD Fee toggle */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-muted/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">DLD Fee (4%)</h4>
                        <p className="text-sm text-muted-foreground">Dubai Land Department registration fee (one-time)</p>
                      </div>
                      <Switch
                        checked={propertyData.dldFeeIncluded}
                        onCheckedChange={(checked) => updatePropertyData('dldFeeIncluded', checked)}
                      />
                    </div>
                  </div>

                  {/* Additional Costs */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-muted/30">
                    <h4 className="font-semibold mb-1">Additional Costs</h4>
                    <p className="text-xs text-muted-foreground mb-2">One-time purchase costs paid at acquisition</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>DLD Fee (4%) (one-time):</span>
                        <span className="font-medium">{formatCurrency(propertyData.dldFeeIncluded ? propertyData.price * 0.04 : 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Agent Fee ({propertyData.agentFeePercent}%) (one-time):</span>
                        <span className="font-medium">{formatCurrency(propertyData.price * (propertyData.agentFeePercent / 100))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="pt-6 border-t border-gray-200 mb-24">
                    <div className="flex justify-center items-center gap-6">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="h-9 px-4"
                      >
                        Previous
                      </Button>

                      <Button
                        onClick={nextStep}
                        className="h-9 px-4"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
                <div id="step-progress" className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs text-blue-600">Step {currentStep} of 5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${(currentStep / 5) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 mt-2">
                    {stepTitles.map((title, idx) => (
                      <span key={title} className={idx + 1 === currentStep ? 'font-semibold text-gray-700' : ''}>{title}</span>
                    ))}
                  </div>
                </div>
                <div className="text-center mb-4 sm:mb-6">
                  <MapPin className="h-8 w-8 sm:h-12 sm:w-12 text-success mx-auto mb-2" />
                  <h2 className="text-xl sm:text-2xl font-bold">Revenue</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Expected rental income and occupancy</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <Label>Additional Income</Label>
                      <div className="mt-2 space-y-3">
                        <Slider
                          value={[propertyData.additionalIncome]}
                          onValueChange={(value) => updatePropertyData('additionalIncome', value[0])}
                          max={10000}
                          min={0}
                          step={100}
                          className="w-full"
                        />
                        <div className="text-center">
                          <span className="text-lg font-bold text-accent">
                            {formatCurrency(propertyData.additionalIncome)}/month
                          </span>
                        </div>
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
                    <h4 className="font-semibold text-sm mb-2 text-success">Effective Annual Income</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-success/70">Rent (net):</span>
                        <span className="font-semibold text-success">
                          {formatCurrency(propertyData.monthlyRent * 12 * ((100 - propertyData.vacancyRate) / 100))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-accent/70">Additional Income:</span>
                        <span className="font-semibold text-accent">
                          {formatCurrency(propertyData.additionalIncome * 12)}
                        </span>
                      </div>
                      <div className="border-t border-success/20 pt-2 flex justify-between items-center">
                        <span className="text-sm font-semibold text-success">Total:</span>
                        <span className="text-xl font-bold text-success">
                          {formatCurrency((propertyData.monthlyRent * 12 * ((100 - propertyData.vacancyRate) / 100)) + (propertyData.additionalIncome * 12))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="pt-6 border-t border-gray-200 mb-24">
                    <div className="flex justify-center items-center gap-6">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="h-9 px-4"
                      >
                        Previous
                      </Button>

                      <Button
                        onClick={nextStep}
                        className="h-9 px-4"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
                <div id="step-progress" className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs text-blue-600">Step {currentStep} of 5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${(currentStep / 5) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 mt-2">
                    {stepTitles.map((title, idx) => (
                      <span key={title} className={idx + 1 === currentStep ? 'font-semibold text-gray-700' : ''}>{title}</span>
                    ))}
                  </div>
                </div>
                <div className="text-center mb-4 sm:mb-6">
                  <Settings className="h-8 w-8 sm:h-12 sm:w-12 text-warning mx-auto mb-2" />
                  <h2 className="text-xl sm:text-2xl font-bold">Expenses</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Operating costs and maintenance</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <Label>Base Fee</Label>
                      <div className="mt-2 space-y-3">
                        <Slider
                          value={[propertyData.managementBaseFee]}
                          onValueChange={(value) => updatePropertyData('managementBaseFee', value[0])}
                          max={1000}
                          min={0}
                          step={50}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm">
                          <span>{formatCurrency(propertyData.managementBaseFee)}</span>
                          <span className="font-semibold text-warning">
                            {formatCurrency(propertyData.managementBaseFee * 12)}/year
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Total Management Cost</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Percentage Fee:</span>
                        <span className="font-semibold text-warning">
                          {formatCurrency(propertyData.monthlyRent * (propertyData.managementFee / 100))}/month
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Base Fee:</span>
                        <span className="font-semibold text-warning">
                          {formatCurrency(propertyData.managementBaseFee)}/month
                        </span>
                      </div>
                      <div className="border-t border-muted/20 pt-2 flex justify-between items-center">
                        <span className="text-sm font-semibold text-primary">Total:</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency((propertyData.monthlyRent * (propertyData.managementFee / 100)) + propertyData.managementBaseFee)}/month
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div>
                      <Label>Other Expenses</Label>
                      <div className="mt-2 space-y-3">
                        <Slider
                          value={[propertyData.otherExpenses]}
                          onValueChange={(value) => updatePropertyData('otherExpenses', value[0])}
                          max={3000}
                          min={0}
                          step={100}
                          className="w-full"
                        />
                        <div className="text-center">
                          <span className="text-lg font-bold text-warning">
                            {formatCurrency(propertyData.otherExpenses)}/year
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="pt-6 border-t border-gray-200 mb-24">
                    <div className="flex justify-center items-center gap-6">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="h-9 px-4"
                      >
                        Previous
                      </Button>

                      <Button
                        onClick={nextStep}
                        className="h-9 px-4"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
                <div id="step-progress" className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs text-blue-600">Step {currentStep} of 5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(currentStep / 5) * 100}%` }} />
                  </div>
                </div>
                <div className="text-center mb-4 sm:mb-6">
                  <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-accent mx-auto mb-2" />
                  <h2 className="text-xl sm:text-2xl font-bold">Growth & Exit Parameters</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Long-term projections and exit strategy</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-accent mb-4">Growth Parameters</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label>Rent Growth (% per year)</Label>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                                <Info className="w-4 h-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-lg">Rent Growth Rate</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                  The annual percentage increase in rental income over time.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 text-sm">
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What it means:</h4>
                                  <p>This represents how much your rental income is expected to grow each year due to market conditions, property improvements, and inflation.</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Typical ranges:</h4>
                                  <ul className="space-y-1">
                                    <li>• <strong>0-2%:</strong> Conservative estimate</li>
                                    <li>• <strong>2-4%:</strong> Moderate growth</li>
                                    <li>• <strong>4-6%:</strong> Strong growth</li>
                                    <li>• <strong>6-8%:</strong> High growth (Dubai premium areas)</li>
                                  </ul>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">Consider:</h4>
                                  <p>Dubai's rental market has historically shown strong growth, but consider current market conditions and your property's location.</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
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
                        <div className="flex items-center gap-2 mb-2">
                          <Label>Property Appreciation (% per year)</Label>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                                <Info className="w-4 h-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-lg">Property Appreciation Rate</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                  The annual percentage increase in your property's market value over time.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 text-sm">
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What it means:</h4>
                                  <p>This represents how much your property's value is expected to increase each year due to market demand, location development, and economic factors.</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Dubai market ranges:</h4>
                                  <ul className="space-y-1">
                                    <li>• <strong>2-4%:</strong> Established areas (conservative)</li>
                                    <li>• <strong>4-6%:</strong> Growing areas (moderate)</li>
                                    <li>• <strong>6-8%:</strong> Premium areas (strong)</li>
                                    <li>• <strong>8-10%:</strong> Emerging areas (high potential)</li>
                                  </ul>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">Important factors:</h4>
                                  <p>Consider infrastructure development, new projects in the area, and Dubai's long-term growth plans when estimating appreciation.</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
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
                        <div className="flex items-center gap-2 mb-2">
                          <Label>Expense Inflation (% per year)</Label>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                                <Info className="w-4 h-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-lg">Expense Inflation Rate</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                  The annual percentage increase in property-related expenses over time.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 text-sm">
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What it means:</h4>
                                  <p>This represents how much your property expenses (maintenance, insurance, management fees) are expected to increase each year due to inflation and market changes.</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Typical ranges:</h4>
                                  <ul className="space-y-1">
                                    <li>• <strong>1-2%:</strong> Low inflation (conservative)</li>
                                    <li>• <strong>2-3%:</strong> Moderate inflation</li>
                                    <li>• <strong>3-4%:</strong> Standard inflation</li>
                                    <li>• <strong>4-6%:</strong> High inflation (emerging markets)</li>
                                  </ul>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">Why it matters:</h4>
                                  <p>Higher expense inflation reduces your net cash flow over time, so it's important to account for this in long-term projections.</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
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
                        <div className="flex items-center gap-2 mb-2">
                          <Label>Exit Cap Rate (%)</Label>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                                <Info className="w-4 h-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-lg">Exit Cap Rate</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                  The capitalization rate used to estimate your property's selling price when you exit the investment.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 text-sm">
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What it means:</h4>
                                  <p>Cap rate = Annual Net Operating Income ÷ Property Value. A lower cap rate means higher property value, while a higher cap rate means lower value.</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Dubai market ranges:</h4>
                                  <ul className="space-y-1">
                                    <li>• <strong>3-5%:</strong> Premium areas (high value)</li>
                                    <li>• <strong>5-7%:</strong> Established areas (moderate value)</li>
                                    <li>• <strong>7-9%:</strong> Growing areas (good value)</li>
                                    <li>• <strong>9-12%:</strong> Emerging areas (high yield)</li>
                                  </ul>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">Formula:</h4>
                                  <p><strong>Property Value = Annual Net Operating Income ÷ Cap Rate</strong><br/>
                                  Example: If NOI is AED 100,000 and cap rate is 5%, property value = AED 2,000,000</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
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
                        <div className="flex items-center gap-2 mb-2">
                          <Label>Selling Costs (%)</Label>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors">
                                <Info className="w-4 h-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-lg">Selling Costs</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                  The total percentage of your property's selling price that goes to transaction costs and fees.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 text-sm">
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What it includes:</h4>
                                  <ul className="space-y-1">
                                    <li>• Real estate agent commission (2-3%)</li>
                                    <li>• DLD transfer fees (4% for non-GCC)</li>
                                    <li>• Legal and documentation fees</li>
                                    <li>• Bank processing fees</li>
                                    <li>• Marketing and staging costs</li>
                                  </ul>
                                </div>
                                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Dubai typical costs:</h4>
                                  <ul className="space-y-1">
                                    <li>• <strong>1-3%:</strong> Agent commission</li>
                                    <li>• <strong>4%:</strong> DLD transfer fee</li>
                                    <li>• <strong>1-2%:</strong> Other fees</li>
                                    <li>• <strong>Total: 6-9%</strong> of selling price</li>
                                  </ul>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                                  <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">Impact on returns:</h4>
                                  <p>Higher selling costs reduce your net profit when you sell. For example, if you sell for AED 2M with 7% costs, you'll receive AED 1.86M.</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
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

                  {/* Navigation Buttons */}
                  <div className="pt-6 border-t border-gray-200 mb-24">
                    <div className="flex justify-center items-center gap-6">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="h-9 px-4"
                      >
                        Previous
                      </Button>

                      <Button
                        onClick={() => onAnalyze(propertyData)}
                        className="h-9 px-4"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>





      {/* Enhanced Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center gap-6">
              {/* Animated Brain Icon */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center border-2 border-primary/30">
                  <svg 
                    className="w-12 h-12 text-primary animate-pulse" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                    />
                  </svg>
                </div>
                
                {/* Rotating Rings */}
                <div className="absolute inset-0 w-20 h-20 border-2 border-primary/30 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 w-16 h-16 border-2 border-accent/40 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
                <div className="absolute inset-4 w-12 h-12 border-2 border-primary/20 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
              </div>
              
              {/* Loading Text */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gradient-primary">Analysis in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Our smart algorithms are analyzing your investment data...
                </p>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="w-full space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden border border-muted/50">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-300 ease-out shadow-lg"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  ~{Math.max(0, Math.ceil((100 - progress) / 10))} seconds remaining
                </div>
              </div>
              
              {/* Animated Dots */}
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={(open) => {
        if (!open) {
          // User is trying to close the dialog - complete the analysis
          setShowFeedback(false);
          // Scroll to top when analysis completes
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setIsAnalyzing(false);
          onAnalyze(propertyData);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Beta User Feedback</DialogTitle>
            <DialogDescription>
              Help us improve the app! Please share your experience while we analyze your investment. 
              Feel free to provide feedback during the analysis - it won't interrupt the process.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <Label htmlFor="rating">How would you rate your experience?</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="feedback">What could we improve?</Label>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts about the app..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowFeedback(false);
                  // Scroll to top when analysis completes
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  // Complete the analysis when feedback is skipped
                  setIsAnalyzing(false);
                  onAnalyze(propertyData);
                }}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingFeedback || !feedback.trim()}
                className="flex-1"
              >
                {isSubmittingFeedback ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}