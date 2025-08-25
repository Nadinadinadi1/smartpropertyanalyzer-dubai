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
  Bell,
  Globe,
  Shield,
  FileText,
  Info,
  LifeBuoy
} from 'lucide-react';
import { MessageCircle, Megaphone } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


interface SettingsData {
  currency: string;
  appreciationRate: number;
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
        {/* Old logo and top-right theme toggle removed; handled globally */}

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Settings className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-gradient-primary">Settings</h1>
          </div>
          <p className="text-muted-foreground">App information and legal</p>
        </div>

        {/* Legal & Support */}
        <Card className="card-premium p-6">
          <div className="flex items-center mb-4">
            <Info className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-semibold">Legal & Support</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Privacy Policy */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <Shield className="h-4 w-4 mr-2" /> Privacy Policy
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Privacy Policy</DialogTitle>
                  <DialogDescription>Your data, your control.</DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-2">
                  <p>We store inputs locally in your browser for a better experience. If you opt-in to cloud sync, data is encrypted in transit and at rest.</p>
                  <p>We do not sell personal data. Aggregated, anonymized usage may be used to improve the product.</p>
                  <p>Contact support for data deletion or export.</p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Terms of Use */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <FileText className="h-4 w-4 mr-2" /> Terms of Use
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Terms of Use</DialogTitle>
                  <DialogDescription>Read before using.</DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-2">
                  <p>This tool provides estimations for educational purposes only and is not financial advice.</p>
                  <p>You are responsible for decisions made based on the outputs. Always validate with professional counsel and market data.</p>
                  <p>We may update features and assumptions without prior notice.</p>
                </div>
              </DialogContent>
            </Dialog>

            {/* About Us */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <Info className="h-4 w-4 mr-2" /> About Us
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>About Dubai Property Analyzer</DialogTitle>
                  <DialogDescription>Focused on clear, actionable property insights.</DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-2">
                  <p>We build practical tools for investors to evaluate ROI, cash flow, and risk for Dubai real estate.</p>
                  <p>Our mission is transparency: simple inputs, clear outputs, and defensible assumptions.</p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Support */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <LifeBuoy className="h-4 w-4 mr-2" /> Support
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Support</DialogTitle>
                  <DialogDescription>We’re here to help.</DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-2">
                  <p>Questions or feedback? Email us at support@dpa.example or use in-app feedback.</p>
                  <p>Include scenario details (price, rent, loan) to help us reproduce issues faster.</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Feedback & Updates */}
        <Card className="card-premium p-6">
          <div className="flex items-center mb-4">
            <Megaphone className="h-5 w-5 text-accent mr-2" />
            <h3 className="font-semibold">Feedback & Updates</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Feedback */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" /> Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Send feedback</DialogTitle>
                  <DialogDescription>Help us improve the analyzer.</DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-3">
                  <div>
                    <Label htmlFor="fb-email">Your email (optional)</Label>
                    <Input id="fb-email" type="email" placeholder="you@example.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="fb-text">Feedback</Label>
                    <textarea id="fb-text" rows={5} placeholder="Tell us what worked well or what could be better" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Or email support@dpa.example</span>
                    <Button disabled>Send</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* What's new */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <Megaphone className="h-4 w-4 mr-2" /> What’s new
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Changelog</DialogTitle>
                  <DialogDescription>Recent improvements and fixes.</DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-2">
                  <div className="p-2 rounded border bg-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">v1.0.0</span>
                      <span className="text-xs text-muted-foreground">2024-12-01</span>
                    </div>
                    <ul className="list-disc ml-5 mt-1 space-y-1">
                      <li>Added Investment Score with detailed breakdown</li>
                      <li>Risk badge (DSCR, yield spread, LTV, expenses, rent-gap)</li>
                      <li>Rental Price Recommendation with action items</li>
                      <li>New Settings: Legal, Support, Privacy, Terms</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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