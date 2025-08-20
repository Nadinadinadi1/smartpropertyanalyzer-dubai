import { useState } from 'react';
import { Calculator, BarChart3, Lightbulb, Settings, Play, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'journey', label: 'Journey', icon: Play },
  { id: 'analyze', label: 'Property Input', icon: Calculator },
  { id: 'analyses', label: 'Analyses', icon: BarChart3 },
  { id: 'insights', label: 'Insights', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'nav-tab min-w-[70px]',
                isActive && 'active'
              )}
            >
              <Icon className={cn(
                'h-6 w-6 transition-colors',
                isActive && 'animate-bounce-gentle'
              )} />
              <span className={cn(
                'text-xs font-medium',
                isActive && 'text-gradient-primary'
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}