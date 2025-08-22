import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Home, 
  Calculator, 
  TrendingUp, 
  Target, 
  ArrowRight, 
  ArrowLeft,
  Star,
  Zap,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Home as HomeIcon,
  Info,
  Share2,
  TrendingUp as TrendingUpIcon,
  Users,
  Timer
} from 'lucide-react';

interface JourneyData {
  propertyType: string;
  location: string;
  budget: number;
  investmentGoal: string;
  timeline: string;
  experience: string;
}

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  inputType: 'select' | 'slider' | 'text' | 'choice';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  tooltip?: string;
  estimatedTime?: number;
}

const journeySteps: JourneyStep[] = [
  {
    id: 1,
    title: 'Property Type',
    description: 'What type of property are you looking for?',
    icon: Building,
    inputType: 'select',
    options: ['Apartment', 'Villa', 'Townhouse', 'Studio', 'Penthouse'],
    tooltip: 'Choose the property type that best fits your investment strategy. Apartments offer good rental yields, while villas provide more space and potential for appreciation.',
    estimatedTime: 30
  },
  {
    id: 2,
    title: 'Location',
    description: 'Where do you want to invest?',
    icon: MapPin,
    inputType: 'select',
    options: ['Dubai Marina', 'Downtown Dubai', 'Jumeirah Village Circle', 'Business Bay', 'Dubai Hills Estate'],
    tooltip: 'Dubai Marina and Downtown offer premium locations with high rental yields. JVC and Dubai Hills provide good value for money with strong growth potential.',
    estimatedTime: 45
  },
  {
    id: 3,
    title: 'Budget Range',
    description: 'What\'s your investment budget?',
    icon: DollarSign,
    inputType: 'slider',
    min: 500000,
    max: 5000000,
    step: 100000,
    tooltip: 'Consider your total investment capacity including down payment, closing costs, and emergency funds. Higher budgets often provide better ROI opportunities.',
    estimatedTime: 60
  },
  {
    id: 4,
    title: 'Investment Goal',
    description: 'What\'s your primary investment objective?',
    icon: Target,
    inputType: 'select',
    options: ['Rental Income', 'Capital Appreciation', 'Both', 'Portfolio Diversification'],
    tooltip: 'Rental income provides monthly cash flow, while capital appreciation builds long-term wealth. Both strategies can be combined for optimal results.',
    estimatedTime: 30
  },
  {
    id: 5,
    title: 'Investment Timeline',
    description: 'How long do you plan to hold this investment?',
    icon: Clock,
    inputType: 'select',
    options: ['1-3 years', '3-5 years', '5-10 years', '10+ years'],
    tooltip: 'Short-term (1-3 years) focuses on quick gains, while long-term (5+ years) allows for market cycles and compound growth.',
    estimatedTime: 30
  },
  {
    id: 6,
    title: 'Experience Level',
    description: 'How experienced are you with property investment?',
    icon: Star,
    inputType: 'select',
    options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    tooltip: 'Beginners should focus on established areas and professional management. Experienced investors can explore emerging markets and value-add opportunities.',
    estimatedTime: 30
  }
];

// Quick start presets for popular investment strategies
const quickStartPresets = [
  {
    name: 'First-Time Investor',
    description: 'Conservative approach for beginners',
    data: {
      propertyType: 'Apartment',
      location: 'Jumeirah Village Circle',
      budget: 1500000,
      investmentGoal: 'Rental Income',
      timeline: '5-10 years',
      experience: 'Beginner'
    }
  },
  {
    name: 'Premium Investor',
    description: 'High-end properties in prime locations',
    data: {
      propertyType: 'Penthouse',
      location: 'Dubai Marina',
      budget: 4000000,
      investmentGoal: 'Both',
      timeline: '10+ years',
      experience: 'Advanced'
    }
  },
  {
    name: 'Balanced Portfolio',
    description: 'Mix of income and growth',
    data: {
      propertyType: 'Villa',
      location: 'Dubai Hills Estate',
      budget: 2500000,
      investmentGoal: 'Both',
      timeline: '5-10 years',
      experience: 'Intermediate'
    }
  }
];

interface JourneySimulatorProps {
  onComplete: (data: JourneyData) => void;
  onStartFullAnalysis: () => void;
}

export default function JourneySimulator({ onComplete, onStartFullAnalysis }: JourneySimulatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [journeyData, setJourneyData] = useState<JourneyData>({
    propertyType: '',
    location: '',
    budget: 1000000,
    investmentGoal: '',
    timeline: '',
    experience: ''
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [analysisScore, setAnalysisScore] = useState(0);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [quickStartApplied, setQuickStartApplied] = useState<string | null>(null);

  const currentStepData = journeySteps.find(step => step.id === currentStep);

  // Calculate remaining time
  useEffect(() => {
    const completedSteps = currentStep - 1;
    const remainingSteps = journeySteps.length - currentStep;
    const estimatedTimePerStep = 45; // average time per step
    setRemainingTime(remainingSteps * estimatedTimePerStep);
  }, [currentStep]);

  const updateJourneyData = (field: keyof JourneyData, value: any) => {
    setJourneyData(prev => ({ ...prev, [field]: value }));
  };

  const applyQuickStart = (preset: typeof quickStartPresets[0]) => {
    console.log('Applying Quick Start preset:', preset.name, preset.data); // Debug log
    setJourneyData(preset.data);
    setCurrentStep(1); // Start from beginning to review all data
    setQuickStartApplied(preset.name); // Show success message
    
    // Only scroll to top when applying a preset to show the success message
    // This is a one-time action, not continuous navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setQuickStartApplied(null);
    }, 3000);
  };

  const nextStep = () => {
    if (currentStep < journeySteps.length) {
      setCurrentStep(currentStep + 1);
      // Remove automatic scroll to top - let user stay where they are
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Remove automatic scroll to top - let user stay where they are
    }
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          setShowResults(true);
          calculateAnalysisScore();
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const calculateAnalysisScore = () => {
    let score = 0;
    
    // Property Type scoring
    if (journeyData.propertyType === 'Apartment' || journeyData.propertyType === 'Villa') score += 20;
    else if (journeyData.propertyType === 'Penthouse') score += 25;
    else score += 15;
    
    // Location scoring
    if (journeyData.location === 'Dubai Marina' || journeyData.location === 'Downtown Dubai') score += 25;
    else if (journeyData.location === 'Business Bay') score += 20;
    else score += 15;
    
    // Budget scoring
    if (journeyData.budget >= 2000000) score += 20;
    else if (journeyData.budget >= 1000000) score += 15;
    else score += 10;
    
    // Investment Goal scoring
    if (journeyData.investmentGoal === 'Both') score += 15;
    else if (journeyData.investmentGoal === 'Capital Appreciation') score += 12;
    else score += 10;
    
    // Timeline scoring
    if (journeyData.timeline === '5-10 years' || journeyData.timeline === '10+ years') score += 15;
    else if (journeyData.timeline === '3-5 years') score += 12;
    else score += 8;
    
    // Experience scoring
    if (journeyData.experience === 'Expert' || journeyData.experience === 'Advanced') score += 15;
    else if (journeyData.experience === 'Intermediate') score += 12;
    else score += 10;
    
    setAnalysisScore(Math.min(100, score));
  };

  const renderInput = (step: JourneyStep) => {
    const fieldMap: Record<number, keyof JourneyData> = {
      1: 'propertyType',
      2: 'location',
      3: 'budget',
      4: 'investmentGoal',
      5: 'timeline',
      6: 'experience'
    };

    const field = fieldMap[step.id];
    const value = journeyData[field];

    switch (step.inputType) {
      case 'select':
        return (
          <div className="space-y-3">
            <Select value={value as string} onValueChange={(val) => updateJourneyData(field, val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${step.title.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {step.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {step.tooltip && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-400">{step.tooltip}</p>
              </div>
            )}
          </div>
        );
      
      case 'slider':
        return (
          <div className="space-y-4">
            <Slider
              value={[value as number]}
              onValueChange={(val) => updateJourneyData(field, val[0])}
              min={step.min}
              max={step.max}
              step={step.step}
              className="w-full"
            />
            <div className="text-center">
              <span className="text-2xl font-bold text-gradient-primary">
                {new Intl.NumberFormat('en-AE', {
                  style: 'currency',
                  currency: 'AED',
                  minimumFractionDigits: 0,
                }).format(value as number)}
              </span>
            </div>
            {step.tooltip && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-400">{step.tooltip}</p>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const canProceed = () => {
    const fieldMap: Record<number, keyof JourneyData> = {
      1: 'propertyType',
      2: 'location',
      3: 'budget',
      4: 'investmentGoal',
      5: 'timeline',
      6: 'experience'
    };
    
    const field = fieldMap[currentStep];
    const value = journeyData[field];
    return value && value !== '';
  };

  const getProgressPercentage = () => {
    return (currentStep / journeySteps.length) * 100;
  };

  const shareResults = async () => {
    const shareText = `My Dubai Property Investment Score: ${analysisScore}/100! Check out this amazing tool: [URL]`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Investment Journey Results',
          text: shareText,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      // You could add a toast notification here
    }
  };

  if (isSimulating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 w-20 h-20 border-2 border-primary/30 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 w-16 h-16 border-2 border-accent/40 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
          </div>
          
          <h3 className="text-xl font-bold text-gradient-primary mb-2">Analyzing Your Journey</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Processing your investment preferences...
          </p>
          
          <div className="w-full space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Analyzing...</span>
              <span>{simulationProgress}%</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden border border-muted/50">
              <div
                className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-300 ease-out shadow-lg"
                style={{ width: `${simulationProgress}%` }}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gradient-primary mb-2">Your Investment Journey Analysis</h1>
            <p className="text-muted-foreground">Based on your preferences, here's what we discovered:</p>
          </div>

          {/* Analysis Score moved to bottom */}

          {/* Journey Summary */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Your Investment Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-primary" />
                  <span className="font-medium">Property Type:</span>
                  <span className="text-muted-foreground">{journeyData.propertyType}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="font-medium">Location:</span>
                  <span className="text-muted-foreground">{journeyData.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-medium">Budget:</span>
                  <span className="text-muted-foreground">
                    {new Intl.NumberFormat('en-AE', {
                      style: 'currency',
                      currency: 'AED',
                      minimumFractionDigits: 0,
                    }).format(journeyData.budget)}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-medium">Goal:</span>
                  <span className="text-muted-foreground">{journeyData.investmentGoal}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">Timeline:</span>
                  <span className="text-muted-foreground">{journeyData.timeline}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="font-medium">Experience:</span>
                  <span className="text-muted-foreground">{journeyData.experience}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Key Insights & Recommendations</h3>
            <div className="space-y-4">
              {analysisScore >= 80 && (
                <div className="flex items-start gap-3 p-4 bg-success/10 rounded-lg border border-success/20">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-success">Strong Investment Potential</h4>
                    <p className="text-sm text-success/80">Your preferences align well with current market opportunities in Dubai.</p>
                  </div>
                </div>
              )}
              
              {journeyData.location === 'Dubai Marina' && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300">Premium Location Choice</h4>
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Dubai Marina offers excellent rental yields and strong appreciation potential.</p>
                  </div>
                </div>
              )}
              
              {journeyData.investmentGoal === 'Both' && (
                <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300">Balanced Strategy</h4>
                    <p className="text-sm text-purple-600/80 dark:text-purple-400/80">Your dual focus on income and appreciation is ideal for long-term wealth building.</p>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <TrendingUpIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300">Recommended Next Steps</h4>
                  <ul className="text-sm text-green-600/80 dark:text-green-400/80 space-y-1 mt-2">
                    <li>• Research specific properties in {journeyData.location}</li>
                    <li>• Contact a local real estate agent</li>
                    <li>• Get pre-approval for financing</li>
                    <li>• Review legal requirements for foreign investors</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <Card className="p-8 text-center bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <h3 className="text-2xl font-bold text-gradient-primary mb-4">Ready for Detailed Property Input?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get a comprehensive property analysis with detailed financial projections, 
              market insights, and personalized recommendations based on your profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button
                onClick={() => {
                  onStartFullAnalysis();
                  // Scroll on the landing page to the property input anchor
                  setTimeout(() => {
                    const el = document.getElementById('input-details');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-3 text-lg"
              >
                <Calculator className="h-5 w-5 mr-2" />
                Start Property Input
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResults(false);
                  setCurrentStep(1);
                  setJourneyData({
                    propertyType: '',
                    location: '',
                    budget: 1000000,
                    investmentGoal: '',
                    timeline: '',
                    experience: ''
                  });
                }}
                className="px-8 py-3 text-lg"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Change Journey Input
              </Button>
            </div>
            
            {/* Share Results removed per request */}
          </Card>

          {/* Analysis Score (now at the end) */}
          <Card className="p-6 text-center bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="text-6xl font-bold text-gradient-primary mb-2">{analysisScore}/100</div>
            <div className="text-lg text-muted-foreground mb-4">Investment Compatibility Score</div>
            <div className="flex justify-center mb-4">
              <Badge className={`text-lg px-4 py-2 ${
                analysisScore >= 80 ? 'bg-success text-white' :
                analysisScore >= 60 ? 'bg-warning text-white' :
                'bg-danger text-white'
              }`}>
                {analysisScore >= 80 ? 'Excellent Match' :
                 analysisScore >= 60 ? 'Good Potential' :
                 'Needs Optimization'}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">85%</div>
                <div className="text-sm text-muted-foreground">Market Average</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-success">92%</div>
                <div className="text-sm text-muted-foreground">Top Performers</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">78%</div>
                <div className="text-sm text-muted-foreground">Similar Profile</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gradient-primary mb-4">Investment Journey Simulator</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Experience your property investment journey in just a few steps. 
              Get instant insights and recommendations tailored to your preferences.
            </p>
          </div>

          {/* Skip Journey Button */}
          <Button
            variant="outline"
            onClick={() => {
              onStartFullAnalysis();
              setTimeout(() => {
                const el = document.getElementById('input-details');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
            }}
            className="flex items-center gap-2 mx-auto bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border-2 border-blue-300/40 dark:border-blue-600/40 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:scale-105 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
          >
            <SkipForward className="h-4 w-4" />
            Skip Journey - Go Direct to Property Input
          </Button>
        </div>

        {/* Quick Start Presets */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50/80 to-indigo-100/80 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/60 dark:border-blue-800/40 shadow-lg">
          {/* Success Message */}
          {quickStartApplied && (
            <div className="mb-4 p-3 bg-green-100/80 dark:bg-green-900/40 rounded-lg border border-green-300/60 dark:border-green-600/40">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium">
                  ✅ "{quickStartApplied}" preset toegepast!
                </span>
              </div>
            </div>
          )}
          
          <h3 className="text-lg font-semibold text-center mb-4 text-blue-800 dark:text-blue-200">
            🚀 Quick Start
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center mb-4">
            Kies een vooraf ingestelde profiel om snel te beginnen
          </p>
          
          <div className="flex items-center gap-3 max-w-sm mx-auto">
            <Select onValueChange={(value) => {
              const preset = quickStartPresets.find(p => p.name === value);
              if (preset) {
                applyQuickStart(preset);
              }
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecteer profiel..." />
              </SelectTrigger>
              <SelectContent>
                {quickStartPresets.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Info about Quick Start */}
          <div className="mt-4 p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg border border-blue-200/40 dark:border-blue-700/40">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Info className="h-3 w-3" />
              <span className="text-xs">
                Na selectie kun je alle velden nog aanpassen
              </span>
            </div>
          </div>
        </Card>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {journeySteps.length}</span>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>{Math.round(remainingTime / 60)}m {remainingTime % 60}s remaining</span>
            </div>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden border border-muted/50">
            <div
              className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <Card className="p-8 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
              {currentStepData && <currentStepData.icon className="h-8 w-8 text-white" />}
            </div>
            <h2 className="text-2xl font-bold text-gradient-primary mb-2">
              {currentStepData?.title}
            </h2>
            <p className="text-muted-foreground">
              {currentStepData?.description}
            </p>
            {currentStepData?.estimatedTime && (
              <div className="text-sm text-muted-foreground mt-2">
                Estimated time: {currentStepData.estimatedTime} seconds
              </div>
            )}
          </div>

          <div className="mb-6">
            {currentStepData && renderInput(currentStepData)}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep(1);
                  setJourneyData({
                    propertyType: '',
                    location: '',
                    budget: 1000000,
                    investmentGoal: '',
                    timeline: '',
                    experience: ''
                  });
                  // Scroll to top when starting over - user wants to see the beginning
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2"
              >
                <HomeIcon className="h-4 w-4" />
                Start Over
              </Button>
              
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
            </div>

            {currentStep === journeySteps.length ? (
              <Button
                onClick={startSimulation}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Analysis
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Quick Preview */}
        <Card className="p-4 bg-gradient-to-r from-green-50/80 to-emerald-100/80 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/60 dark:border-green-800/40 shadow-lg">
          <h3 className="text-base font-semibold mb-3 text-center text-green-800 dark:text-green-200">
            📊 Overzicht
          </h3>
          
          {/* Highlight when Quick Start was applied */}
          {quickStartApplied && (
            <div className="mb-3 p-2 bg-blue-100/60 dark:bg-blue-900/30 rounded-lg border border-blue-300/40 dark:border-blue-600/40">
              <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 text-xs">
                <Info className="h-3 w-3" />
                <span>Preset "<strong>{quickStartApplied}</strong>" actief</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2 border border-green-200/40 dark:border-green-700/40">
              <div className="text-lg font-bold text-green-700 dark:text-green-300 mb-1">
                {journeyData.propertyType || '—'}
              </div>
              <div className="text-xs text-green-600/70 dark:text-green-400/70">Type</div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2 border border-green-200/40 dark:border-green-700/40">
              <div className="text-lg font-bold text-green-700 dark:text-green-300 mb-1">
                {journeyData.location || '—'}
              </div>
              <div className="text-xs text-green-600/70 dark:text-green-400/70">Locatie</div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2 border border-green-200/40 dark:border-green-700/40">
              <div className="text-lg font-bold text-green-700 dark:text-green-300 mb-1">
                {journeyData.budget ? 
                  new Intl.NumberFormat('en-AE', {
                    style: 'currency',
                    currency: 'AED',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(journeyData.budget) : '—'
                }
              </div>
              <div className="text-xs text-green-600/70 dark:text-green-400/70">Budget</div>
            </div>
          </div>
          
          {/* Show completion status */}
          {journeyData.propertyType && journeyData.location && journeyData.investmentGoal && journeyData.timeline && journeyData.experience ? (
            <div className="p-2 bg-green-100/60 dark:bg-green-900/40 rounded-lg border border-green-300/40 dark:border-green-600/40">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300 text-xs">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium">Alle velden ingevuld! Klaar voor analyse.</span>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-amber-100/60 dark:bg-amber-900/40 rounded-lg border border-amber-300/40 dark:border-amber-600/40">
              <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300 text-xs">
                <Clock className="h-3 w-3" />
                <span>Vul de overige velden in</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
