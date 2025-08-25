import { BrandLogo } from '@/components/branding';
import FeedbackButton from './FeedbackButton';
import { Badge } from '@/components/ui/badge';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export const AppHeader = ({ title, subtitle }: AppHeaderProps) => {
  const handleHome = () => {
    try {
      window.location.hash = '#analyze';
      const evt = new CustomEvent('navigateToAnalyze', {
        detail: { targetTab: 'analyze', scrollToId: 'hero-top' },
      });
      window.dispatchEvent(evt);
    } catch {}
    const hero = document.getElementById('hero-top');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleHome}
            title="Home - Start New Analysis"
            className="inline-flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Go to home"
          >
            <BrandLogo label="Smart Property Analyzer" iconSize={32} showText={false} animate={true} />
          </button>
          <span className="text-sm text-muted-foreground font-medium select-none">
            Smart Property Analyzer - Dubai
          </span>
          {(title || subtitle) && (
            <div className="flex-1">
              {title && (
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-600/15 text-blue-700 border-blue-300">Beta</Badge>
          <FeedbackButton variant="compact" />
        </div>
      </div>
    </div>
  );
};


