import React, { useState } from 'react';
import { DashboardTile } from './DashboardTile';
import { DashboardItem } from '../types';
import { MorningBriefing } from './MorningBriefing';
import { DASHBOARD_ITEMS } from '../constants';
import { OPERATIONAL_ALERTS } from '../data/mockData';
import {
  AlertTriangle, Clock, Activity, UserMinus, TrendingDown, Bell,
  ChevronDown, ChevronUp, XCircle, AlertCircle, CheckCircle
} from 'lucide-react';

interface DashboardGridProps {
  onItemClick: (item: DashboardItem) => void;
  title?: string;
  description?: string;
  isDarkMode?: boolean;
  showOrgBanner?: boolean;
  showAIBriefing?: boolean;
  searchTerm?: string;
  username?: string;
}

const STATUS_ICON: Record<string, React.ComponentType<any>> = {
  critical: XCircle,
  warning: AlertCircle,
  good: CheckCircle,
};
const STATUS_COLOR: Record<string, string> = {
  critical: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
  warning: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  good: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
};

const CATEGORY_META = {
  orange: {
    label: 'Compliance & Operations',
    description: 'Overtime, leave, safety and scheduling compliance metrics',
    color: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800/60',
    bg: 'bg-orange-50/60 dark:bg-orange-900/10',
    dot: 'bg-orange-400',
  },
  green: {
    label: 'Workforce Health',
    description: 'Headcount, attrition, vacancies and engagement',
    color: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    bg: 'bg-emerald-50/60 dark:bg-emerald-900/10',
    dot: 'bg-emerald-400',
  },
  purple: {
    label: 'Talent & Recruitment',
    description: 'Hiring velocity, credentialing, succession and learning',
    color: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800/60',
    bg: 'bg-violet-50/60 dark:bg-violet-900/10',
    dot: 'bg-violet-400',
  },
};

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  onItemClick,
  title = 'Overview',
  description = 'Access key performance indicators and workforce trends across HSS Health Network.',
  isDarkMode,
  showAIBriefing = false,
  searchTerm = '',
  username = 'Admin',
}) => {
  const [alertsCollapsed, setAlertsCollapsed] = useState(false);

  const compItems   = DASHBOARD_ITEMS.filter(i => i.theme === 'orange');
  const workItems   = DASHBOARD_ITEMS.filter(i => i.theme === 'green');
  const talentItems = DASHBOARD_ITEMS.filter(i => i.theme === 'purple');

  const filterItems = (items: DashboardItem[]) =>
    searchTerm ? items.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase())) : items;

  const CategorySection = ({
    theme, items
  }: { theme: 'orange' | 'green' | 'purple'; items: DashboardItem[] }) => {
    const filtered = filterItems(items);
    if (!filtered.length) return null;
    const meta = CATEGORY_META[theme];
    return (
      <section className="animate-fade-in">
        {/* Section header */}
        <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${meta.border}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${meta.dot} shrink-0`} />
          <div>
            <h2 className={`text-sm font-extrabold ${meta.color} uppercase tracking-wider`}>{meta.label}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">{meta.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {filtered.map(item => (
            <DashboardTile key={item.id} item={item} onClick={onItemClick} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Morning briefing — shown only on overview */}
      {showAIBriefing && !searchTerm && (
        <MorningBriefing username={username} />
      )}

      {/* Operational alerts strip */}
      {!searchTerm && (
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setAlertsCollapsed(c => !c)}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-slate-400" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Active Alerts
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                {OPERATIONAL_ALERTS.filter(a => a.metric.status === 'critical').length} critical
              </span>
            </div>
            {alertsCollapsed
              ? <ChevronDown size={14} className="text-slate-400" />
              : <ChevronUp size={14} className="text-slate-400" />
            }
          </button>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 overflow-hidden transition-all duration-300 ${alertsCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
            {OPERATIONAL_ALERTS.map(alert => {
              const StatusIcon = STATUS_ICON[alert.metric.status] ?? AlertTriangle;
              const colorClass = STATUS_COLOR[alert.metric.status] ?? '';
              return (
                <div key={alert.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm ${colorClass}`}>
                  <StatusIcon size={16} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs leading-tight truncate">{alert.title}</p>
                    <p className="text-[10px] opacity-70 truncate">{alert.metric.subtitle}</p>
                  </div>
                  <span className="ml-auto font-extrabold text-xs shrink-0">{alert.metric.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Title */}
      {!showAIBriefing && (
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
      )}

      {/* Category sections */}
      <div className="space-y-10">
        <CategorySection theme="orange" items={compItems} />
        <CategorySection theme="green" items={workItems} />
        <CategorySection theme="purple" items={talentItems} />
      </div>

      {searchTerm && !DASHBOARD_ITEMS.some(i => i.title.toLowerCase().includes(searchTerm.toLowerCase())) && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 animate-fade-in">
          <AlertTriangle size={48} className="mb-4 opacity-30" />
          <p className="font-bold text-lg">No metrics found for "{searchTerm}"</p>
          <p className="text-sm mt-1">Try searching for "overtime", "attrition", or "headcount"</p>
        </div>
      )}
    </div>
  );
};
