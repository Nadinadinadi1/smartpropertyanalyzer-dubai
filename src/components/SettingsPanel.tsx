import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  DollarSign, 
  Calculator, 
  Sun,
  Moon,
  Bell,
  Globe
} from 'lucide-react';


interface SettingsData {
  currency: string;
  appreciationRate: number;
  darkMode: boolean;
  notifications: boolean;
  language: string;
  defaultLoanTerm: number;
  defaultInterestRate: number;
  defaultVacancyRate: number;
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsData>({
    currency: 'AED',
    appreciationRate: 5,
    darkMode: false,
    notifications: true,
    language: 'en',
    defaultLoanTerm: 25,
    defaultInterestRate: 4.5,
    defaultVacancyRate: 10,
  });

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const currencies = [
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
  ];

  return (
    <>
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
          <div className="flex items-center justify-center mb-2">
            <Settings className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-gradient-primary">Settings</h1>
          </div>
          <p className="text-muted-foreground">Customize your investment calculator</p>
        </div>

      {/* Currency & Display */}
      <Card className="card-premium p-6">
        <div className="flex items-center mb-4">
          <DollarSign className="h-5 w-5 text-accent mr-2" />
          <h3 className="font-semibold">Currency & Display</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currency">Default Currency</Label>
            <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center">
                      <span className="mr-2">{currency.symbol}</span>
                      <span>{currency.name} ({currency.code})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Switch to dark theme</p>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting('darkMode', checked)}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </Card>

      {/* Calculation Defaults */}
      <Card className="card-premium p-6">
        <div className="flex items-center mb-4">
          <Calculator className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold">Calculation Assumptions</h3>
        </div>
        <div className="space-y-6">
          <div>
            <Label>Annual Property Appreciation Rate</Label>
            <div className="mt-2 space-y-3">
              <Slider
                value={[settings.appreciationRate]}
                onValueChange={(value) => updateSetting('appreciationRate', value[0])}
                max={15}
                min={1}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span>Conservative (1%)</span>
                <span className="font-semibold text-primary">{settings.appreciationRate}%</span>
                <span>Aggressive (15%)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultLoanTerm">Default Loan Term</Label>
              <div className="mt-2 space-y-2">
                <Slider
                  value={[settings.defaultLoanTerm]}
                  onValueChange={(value) => updateSetting('defaultLoanTerm', value[0])}
                  max={30}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="text-center text-sm font-medium">
                  {settings.defaultLoanTerm} years
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="defaultInterestRate">Default Interest Rate</Label>
              <Input
                type="number"
                value={settings.defaultInterestRate}
                onChange={(e) => updateSetting('defaultInterestRate', parseFloat(e.target.value) || 0)}
                className="mt-2"
                min="1"
                max="15"
                step="0.1"
              />
            </div>
          </div>

          <div>
            <Label>Default Vacancy Rate</Label>
            <div className="mt-2 space-y-3">
              <Slider
                value={[settings.defaultVacancyRate]}
                onValueChange={(value) => updateSetting('defaultVacancyRate', value[0])}
                max={20}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span>0% (Always occupied)</span>
                <span className="font-semibold text-primary">{settings.defaultVacancyRate}%</span>
                <span>20% (High vacancy)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="card-premium p-6">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-secondary mr-2" />
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Market Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified about market changes</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="card-premium p-6">
        <div className="flex items-center mb-4">
          <Globe className="h-5 w-5 text-success mr-2" />
          <h3 className="font-semibold">Data Management</h3>
        </div>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Manage your investment data and preferences
            </p>
            <Button variant="outline" className="w-full">
              <Globe className="h-4 w-4 mr-2" />
              Sync Settings to Cloud
            </Button>
          </div>
        </div>
      </Card>

      {/* App Info */}
      <Card className="card-premium p-6 text-center">
        <h3 className="font-semibold mb-2">Dubai Property Analyzer</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Professional investment calculator for Dubai real estate
        </p>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Version 1.0.0</p>
          <p>© 2024 Property Investment Tools</p>
        </div>
      </Card>
      </div>
    </>
  );
}