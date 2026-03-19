import React, { useState, useMemo } from 'react';
import {
  Clock, Activity, CalendarCheck, ShieldAlert, Users, UserPlus, TrendingDown,
  Heart, Timer, BadgeCheck, GitFork, BookOpen, ChevronRight, TrendingUp
} from 'lucide-react';
import { DashboardItem } from '../types';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Clock, Activity, CalendarCheck, ShieldAlert, Users, UserPlus, TrendingDown,
  Heart, Timer, BadgeCheck, GitFork, BookOpen, TrendingUp
};

const MOCK_METRICS: Record<string, { value: string; trend: string; positive: boolean }> = {
  overtime:     { value: '2.08M hrs', trend: '+12.4%', positive: false },
  'sick-leave': { value: '8.5%',      trend: '+2.1%',  positive: false },
  scheduling:   { value: '94.2%',     trend: '+1.8%',  positive: true  },
  safety:       { value: '3 events',  trend: '-40%',   positive: true  },
  headcount:    { value: '112,500',   trend: '+2.1%',  positive: true  },
  vacancies:    { value: '142 FTE',   trend: '+18',    positive: false },
  attrition:    { value: '8.7%',      trend: '-0.4%',  positive: true  },
  engagement:   { value: '72/100',    trend: '+5pts',  positive: true  },
  'time-to-fill': { value: '42 days', trend: '-3 days', positive: true },
  credentialing:  { value: '89.3%',   trend: '+2.1%',  positive: true  },
  succession:     { value: '67%',     trend: '+4%',    positive: true  },
  learning:       { value: '84.1%',   trend: '+6.3%',  positive: true  },
};

const SPARKLINE_HEIGHTS: Record<string, number[]> = {
  overtime:     [30, 40, 45, 55, 60, 58, 65, 70, 68, 80],
  'sick-leave': [20, 25, 30, 28, 32, 38, 42, 40, 45, 50],
  scheduling:   [75, 78, 80, 82, 79, 83, 85, 84, 87, 90],
  safety:       [80, 70, 65, 60, 55, 50, 45, 40, 35, 30],
  headcount:    [60, 62, 63, 65, 66, 68, 70, 72, 74, 76],
  vacancies:    [30, 35, 40, 42, 45, 50, 55, 58, 60, 65],
  attrition:    [70, 68, 65, 63, 60, 58, 55, 52, 50, 48],
  engagement:   [50, 55, 58, 60, 62, 65, 63, 66, 68, 72],
  'time-to-fill': [80, 75, 72, 70, 68, 65, 62, 60, 58, 55],
  credentialing:  [60, 63, 66, 68, 70, 72, 74, 76, 78, 80],
  succession:     [40, 45, 48, 50, 53, 55, 58, 60, 63, 67],
  learning:       [55, 58, 62, 65, 68, 70, 73, 76, 80, 84],
};

const THEME_STYLES = {
  orange: {
    accent: 'text-orange-500 dark:text-orange-400',
    badge: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800',
    line: '#f97316',
    glow: 'hover:shadow-orange-100 dark:hover:shadow-orange-900/20',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-500 group-hover:text-white',
  },
  green: {
    accent: 'text-emerald-500 dark:text-emerald-400',
    badge: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
    line: '#10b981',
    glow: 'hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-500 group-hover:text-white',
  },
  purple: {
    accent: 'text-violet-500 dark:text-violet-400',
    badge: 'bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800',
    line: '#8b5cf6',
    glow: 'hover:shadow-violet-100 dark:hover:shadow-violet-900/20',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30 group-hover:bg-violet-500 group-hover:text-white',
  },
};

interface DashboardTileProps {
  item: DashboardItem;
  onClick: (item: DashboardItem) => void;
  dateRange?: string;
}

export const DashboardTile: React.FC<DashboardTileProps> = ({ item, onClick, dateRange = 'ytd' }) => {
  const [pressing, setPressing] = useState(false);
  const Icon = ICON_MAP[item.iconName] ?? Clock;
  const style = THEME_STYLES[item.theme];
  const metric = MOCK_METRICS[item.id];
  
  const variation = dateRange === 'ytd' ? 1 : dateRange === 'q4' ? 0.95 : dateRange === 'q3' ? 0.91 : 0.98;
  const isCumulative = item.id === 'overtime' || item.id === 'sick-leave' || item.id === 'vacancies' || item.id === 'safety';
  const multiplier = isCumulative ? (dateRange === 'ytd' ? 1 : dateRange === 'q4' ? 0.25 : dateRange === 'q3' ? 0.23 : 0.08) : variation;
  
  const rawSparkline = SPARKLINE_HEIGHTS[item.id] ?? [40, 50, 45, 60, 55, 65, 70, 68, 75, 80];
  const sparkline = useMemo(() => {
    if (dateRange === 'ytd') return rawSparkline.map(h => h * multiplier);
    return Array.from({length: 10}, (_, i) => {
      const avg = rawSparkline.reduce((a,b)=>a+b,0)/10;
      return avg * multiplier * (0.85 + Math.sin(i * 1.5) * 0.15 + Math.random() * 0.1);
    });
  }, [dateRange, item.id, multiplier]);

  const modifyStringVal = (str: string, mult: number) => {
    const match = str.match(/^([\d.,]+)(.*)$/);
    if (!match) return str;
    let num = parseFloat(match[1].replace(/,/g, ''));
    if (isNaN(num)) return str;
    num = num * mult;
    let formatted = num.toString();
    if (str.includes(',')) formatted = Math.round(num).toLocaleString();
    else if (match[1].includes('.') || num < 10) formatted = num.toFixed(1);
    else formatted = Math.round(num).toString();
    return formatted + match[2];
  };

  const displayMetric = metric ? {
    ...metric,
    value: modifyStringVal(metric.value, multiplier),
  } : undefined;

  const handleClick = () => {
    setPressing(true);
    setTimeout(() => { setPressing(false); onClick(item); }, 150);
  };

  const maxH = Math.max(...sparkline);
  const minH = Math.min(...sparkline);

  return (
    <button
      onClick={handleClick}
      className={`
        group w-full text-left bg-white dark:bg-slate-800/80 rounded-2xl p-5
        border border-slate-200/80 dark:border-slate-700/80
        shadow-sm hover:shadow-xl ${style.glow}
        transition-all duration-200 cursor-pointer
        ${pressing ? 'scale-[0.97] shadow-sm' : 'scale-100 hover:-translate-y-0.5'}
        animate-fade-in
      `}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl transition-all duration-200 ${style.iconBg} ${style.accent}`}>
          <Icon size={18} />
        </div>
        {displayMetric && (
          <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border ${style.badge} ${displayMetric.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {displayMetric.trend}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight mb-3">
        {item.title}
      </h3>

      {/* Main metric */}
      {displayMetric && (
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          {displayMetric.value}
        </p>
      )}

      {/* Mini sparkline */}
      <div className="h-8 flex items-end gap-0.5">
        {sparkline.map((h, i) => {
          const normalized = ((h - minH) / (maxH - minH || 1)) * 100;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all duration-300 group-hover:opacity-100 opacity-60"
              style={{
                height: `${20 + normalized * 0.8}%`,
                backgroundColor: style.line,
              }}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dateRange === 'ytd' ? 'FY 2026 YTD' : dateRange.toUpperCase()}</span>
        <ChevronRight size={14} className={`${style.accent} opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`} />
      </div>
    </button>
  );
};
