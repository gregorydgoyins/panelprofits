'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  BookOpen, 
  ShieldCheck
} from 'lucide-react';

export type DetailTab = 'terminal' | 'fundamentals' | 'canon' | 'provenance';

interface DetailTabsProps {
  accentColor: string;
  hasSales?: boolean;
  hasConstellation?: boolean;
  activeTab?: DetailTab;
  onTabChange?: (tab: DetailTab) => void;
  children: {
    terminal: React.ReactNode;
    fundamentals: React.ReactNode;
    canon: React.ReactNode;
    provenance: React.ReactNode;
  };
}

export default function DetailTabs({
  accentColor,
  hasSales = false,
  hasConstellation = false,
  activeTab: controlledTab,
  onTabChange,
  children,
}: DetailTabsProps) {
  const [internalTab, setInternalTab] = useState<DetailTab>('terminal');
  const activeTab = controlledTab ?? internalTab;

  const handleTabClick = (tab: DetailTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const tabs: { id: DetailTab; label: string; badge?: string; icon: React.ReactNode }[] = [
    {
      id: 'terminal',
      label: 'Trading & Valuation',
      badge: hasSales ? 'LIVE' : undefined,
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'fundamentals',
      label: 'Fundamental Intel',
      badge: hasConstellation ? 'EQUILIBRIUM' : undefined,
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'canon',
      label: 'Canon & Narrative',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'provenance',
      label: 'Audit & Provenance',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Sticky Cockpit Navigation Dock */}
      <div className="sticky top-14 z-30 -mx-4 px-4 py-3 bg-[#0a0a0f]/95 backdrop-blur-md border-y border-white/10 sm:rounded-lg sm:mx-0 sm:border">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-sans text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: isActive ? `${accentColor}25` : 'transparent',
                    border: isActive ? `1px solid ${accentColor}80` : '1px solid transparent',
                  }}
                >
                  <span style={{ color: isActive ? accentColor : 'inherit' }}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded tracking-normal"
                      style={{
                        backgroundColor: isActive ? `${accentColor}40` : 'rgba(255,255,255,0.1)',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400 font-mono tracking-tight pl-4 border-l border-white/10">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AUTHENTIC OBSERVATIONS
            </span>
          </div>
        </div>
      </div>

      {/* Tab Workspaces */}
      <div className="tab-viewport">
        {activeTab === 'terminal' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {children.terminal}
          </div>
        )}

        {activeTab === 'fundamentals' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {children.fundamentals}
          </div>
        )}

        {activeTab === 'canon' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {children.canon}
          </div>
        )}

        {activeTab === 'provenance' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {children.provenance}
          </div>
        )}
      </div>
    </div>
  );
}
