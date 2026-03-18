import React, { useState } from 'react';
import { Search, Sun, Moon, X, Calendar, Users, Globe } from 'lucide-react';
import { ViewTab, ViewMode } from '../types';

interface HeaderProps {
  currentTab: ViewTab;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onTabChange: (tab: ViewTab) => void;
  onLogout: () => void;
  username: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
  searchTerm: string;
  onSearch: (term: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}

const DATE_PRESETS = ['YTD', 'Q4', 'Q3', 'Last Month'];

const TAB_LABELS: Record<ViewTab, string> = {
  overview: 'Overview',
  analytics: 'Executive View',
  reports: 'Reports',
  copilot: 'AI Copilot',
  flightrisk: 'Flight Risk',
  scenarios: 'Scenario Planner',
  construction: 'Coming Soon',
};

export const Header: React.FC<HeaderProps> = ({
  currentTab, viewMode, onViewModeChange, isDarkMode, toggleTheme,
  searchTerm, onSearch, dateRange, onDateRangeChange
}) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="absolute inset-0 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5" />
      <div className="relative flex items-center gap-3 px-6 h-16">
        {/* Page title */}
        <h2 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight shrink-0">
          {TAB_LABELS[currentTab]}
        </h2>

        <div className="flex-1" />

        {/* Search */}
        <div className={`flex items-center gap-2 transition-all duration-300 ${searchOpen ? 'w-64' : 'w-auto'}`}>
          {searchOpen ? (
            <div className="relative w-full animate-scale-in">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="search"
                value={searchTerm}
                onChange={e => onSearch(e.target.value)}
                placeholder="Search metrics..."
                className="w-full pl-8 pr-8 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-slate-800 dark:text-white placeholder:text-slate-400"
              />
              <button onClick={() => { setSearchOpen(false); onSearch(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all"
            >
              <Search size={18} />
            </button>
          )}
        </div>

        {/* Date range */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <Calendar size={14} className="ml-2 text-slate-400 shrink-0" />
          {DATE_PRESETS.map(p => (
            <button
              key={p}
              onClick={() => onDateRangeChange(p.toLowerCase())}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRange === p.toLowerCase()
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {(['global', 'team'] as ViewMode[]).map(m => (
            <button
              key={m}
              onClick={() => onViewModeChange(m)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === m
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              {m === 'global' ? <Globe size={13} /> : <Users size={13} />}
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Dark mode */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
