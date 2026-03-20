import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun, TrendingUp, TrendingDown, AlertTriangle, ChevronDown, Sunrise, CloudMoon,
  Activity, ArrowUpRight, ArrowDownRight, Shield
} from 'lucide-react';
import { detectAnomalies, type Anomaly } from '../services/anomalyEngine';

interface MorningBriefingProps {
  username?: string;
}

const severityConfig = {
  critical: {
    bg: 'bg-rose-500/20',
    hoverBg: 'group-hover:bg-rose-500',
    text: 'text-rose-300',
    hoverText: 'group-hover:text-white',
    badge: 'bg-rose-500/30 text-rose-300',
    emoji: '🔴',
    label: 'Critical',
  },
  warning: {
    bg: 'bg-amber-500/20',
    hoverBg: 'group-hover:bg-amber-500',
    text: 'text-amber-300',
    hoverText: 'group-hover:text-white',
    badge: 'bg-amber-500/30 text-amber-300',
    emoji: '🟡',
    label: 'Warning',
  },
  positive: {
    bg: 'bg-emerald-500/20',
    hoverBg: 'group-hover:bg-emerald-500',
    text: 'text-emerald-300',
    hoverText: 'group-hover:text-white',
    badge: 'bg-emerald-500/30 text-emerald-300',
    emoji: '🟢',
    label: 'Positive',
  },
} as const;

const AnomalyIcon: React.FC<{ severity: Anomaly['severity']; direction: Anomaly['direction'] }> = ({ severity, direction }) => {
  if (severity === 'critical') return <AlertTriangle size={14} />;
  if (severity === 'positive') return direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
  return <Activity size={14} />;
};

export const MorningBriefing: React.FC<MorningBriefingProps> = ({ username = 'Admin' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [greeting, setGreeting] = useState('Good morning');
  const [GreetingIcon, setGreetingIcon] = useState<any>(() => Sun);

  // Detect anomalies once on mount
  const anomalies = useMemo(() => detectAnomalies(), []);

  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
  const warningCount = anomalies.filter(a => a.severity === 'warning').length;
  const positiveCount = anomalies.filter(a => a.severity === 'positive').length;

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12)      { setGreeting('Good morning');   setGreetingIcon(() => Sunrise); }
    else if (h < 18) { setGreeting('Good afternoon'); setGreetingIcon(() => Sun); }
    else             { setGreeting('Good evening');   setGreetingIcon(() => CloudMoon); }
  }, []);

  const summaryText = criticalCount > 0
    ? `${criticalCount} critical alert${criticalCount > 1 ? 's' : ''} detected`
    : warningCount > 0
    ? `${warningCount} metric${warningCount > 1 ? 's' : ''} to monitor`
    : 'All systems nominal';

  return (
    <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#001e38] via-[#002f56] to-[#003f73] text-white shadow-xl border border-blue-500/10 overflow-hidden animate-slide-up relative">
      {/* Background decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Toggle header */}
      <button
        onClick={() => setIsCollapsed(c => !c)}
        className="relative z-10 w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <GreetingIcon className="text-yellow-300" size={20} />
          <span className="text-base font-bold">{greeting}, {username.split(' ')[0]}</span>
          {isCollapsed && (
            <span className="text-xs font-medium bg-white/10 px-2 py-0.5 rounded-full text-blue-200 ml-2 animate-fade-in">
              {summaryText}
            </span>
          )}
        </div>
        <ChevronDown size={16} className={`text-blue-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>

      {/* Expandable body */}
      <div className={`relative z-10 transition-all duration-500 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100'}`}>
        <div className="px-6 pb-6">
          {/* Status row */}
          <div className="flex items-center gap-3 flex-wrap mb-5">
            <p className="text-blue-200 text-sm">Daily operational briefing — anomalies detected via statistical analysis.</p>
            <div className="flex gap-2 ml-auto">
              {criticalCount > 0 && (
                <span className="text-[10px] font-extrabold bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-full">
                  {criticalCount} Critical
                </span>
              )}
              {warningCount > 0 && (
                <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full">
                  {warningCount} Warning
                </span>
              )}
              {positiveCount > 0 && (
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full">
                  {positiveCount} Win{positiveCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Anomaly cards */}
          <div className="grid md:grid-cols-2 gap-3">
            {anomalies.map((anomaly) => {
              const config = severityConfig[anomaly.severity];
              return (
                <div
                  key={anomaly.id}
                  className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 flex items-start gap-3 cursor-pointer group transition-colors"
                >
                  <div className={`p-2 ${config.bg} rounded-lg ${config.text} ${config.hoverBg} ${config.hoverText} transition-all shrink-0`}>
                    <AnomalyIcon severity={anomaly.severity} direction={anomaly.direction} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">
                        {config.emoji} {anomaly.kpiLabel}
                      </p>
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${config.badge}`}>
                        Z={Math.abs(anomaly.zScore).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                      {anomaly.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-extrabold text-white">
                        {anomaly.currentValue}{anomaly.unit}
                      </span>
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                        anomaly.severity === 'positive' ? 'text-emerald-400' :
                        anomaly.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {anomaly.direction === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {anomaly.changePercent > 0 ? '+' : ''}{anomaly.changePercent}% vs prev week
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Z-score methodology badge */}
          <div className="flex items-center gap-2 mt-4 text-[10px] text-blue-400">
            <Shield size={10} />
            <span>Anomalies detected using Modified Z-Score (MAD-based) on 12-week trailing data. Threshold: |Z| &gt; 1.8</span>
          </div>
        </div>
      </div>
    </div>
  );
};
