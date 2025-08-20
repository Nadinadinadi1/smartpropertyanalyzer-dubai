import { ThemeToggle } from './ThemeToggle';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showThemeToggle?: boolean;
}

export const AppHeader = ({ title, subtitle, showThemeToggle = true }: AppHeaderProps) => {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo - Home Button */}
          <div className="relative">
            <div 
              className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
              onClick={() => window.location.reload()}
              title="Home - Start New Analysis"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            {/* BETA Badge */}
            <div className="absolute -top-0.5 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full shadow-sm border border-white">
              BETA
            </div>
          </div>
          
          <div className="flex-1">
            {title && (
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        {showThemeToggle && (
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        )}
      </div>
    </div>
  );
};


