import React, { useState } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Legend
} from 'recharts';
import { ArrowLeft, Download, TrendingUp, TrendingDown, Sparkles, AlertCircle, ArrowUpRight, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { DashboardItem } from '../types';
import { ORG_NAME } from '../constants';

interface Props { item: DashboardItem; onBack: () => void; isDarkMode?: boolean; }

const CONFIGS: Record<string, any> = {
  overtime: {
    title: 'Overtime Analytics',
    kpis: [
      { label: 'Total OT Cost', value: '$12.4M', trend: '+8.2%', negative: true },
      { label: 'Avg OT/Employee', value: '6.2 hrs/wk', trend: '-2.1%', negative: false },
      { label: 'High-Risk Units', value: '14', trend: '+3', negative: true },
      { label: 'Budget Variance', value: '-$1.8M', trend: 'Over Budget', negative: true },
    ],
    trendData: [
      { month: 'Jul 25', value: 9.2, target: 8.0 }, { month: 'Aug 25', value: 9.8, target: 8.0 },
      { month: 'Sep 25', value: 10.1, target: 8.0 }, { month: 'Oct 25', value: 10.8, target: 8.0 },
      { month: 'Nov 25', value: 11.2, target: 8.0 }, { month: 'Dec 25', value: 11.8, target: 8.0 },
      { month: 'Jan 26', value: 12.1, target: 8.0 }, { month: 'Feb 26', value: 12.4, target: 8.0 },
    ],
    radar: [
      { subject: 'Emergency', A: 90 }, { subject: 'ICU', A: 82 }, { subject: 'Surgery', A: 70 },
      { subject: 'General', A: 55 }, { subject: 'Admin', A: 30 }, { subject: 'Outpatient', A: 45 },
    ],
    insight: { type: 'Critical', title: 'Burnout Risk Alert', desc: 'Emergency Dept has 23% of staff exceeding 60hr/week for 4+ consecutive weeks.', rec: 'Implement mandatory rest periods and supplemental staffing.' },
    color: '#f97316',
  },
  attrition: {
    title: 'Attrition Analytics',
    kpis: [
      { label: 'Overall Attrition', value: '8.7%', trend: '-0.4%', negative: false },
      { label: 'Voluntary Turnover', value: '6.1%', trend: '+0.8%', negative: true },
      { label: 'Critical Role Loss', value: '12 FTE', trend: '+4', negative: true },
      { label: 'Retention Rate', value: '91.3%', trend: '+0.4%', negative: false },
    ],
    trendData: [
      { month: 'Jul 25', value: 9.1, target: 8.5 }, { month: 'Aug 25', value: 8.9, target: 8.5 },
      { month: 'Sep 25', value: 9.2, target: 8.5 }, { month: 'Oct 25', value: 8.8, target: 8.5 },
      { month: 'Nov 25', value: 8.5, target: 8.5 }, { month: 'Dec 25', value: 8.6, target: 8.5 },
      { month: 'Jan 26', value: 8.4, target: 8.5 }, { month: 'Feb 26', value: 8.7, target: 8.5 },
    ],
    radar: [
      { subject: 'Clinical Ops', A: 78 }, { subject: 'Nursing', A: 65 }, { subject: 'Support', A: 45 },
      { subject: 'Admin', A: 35 }, { subject: 'Mgmt', A: 72 }, { subject: 'Allied', A: 55 },
    ],
    insight: { type: 'Warning', title: 'Leadership Attrition', desc: 'Clinical leadership voluntary turnover is at 15.2%, double the org average.', rec: 'Targeted retention interviews and compensation benchmarking for clinical leads.' },
    color: '#10b981',
  },
};

const CustomTooltip = ({ active, payload, label, color }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl min-w-[160px]">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">{p.name === 'value' ? 'Actual' : 'Target'}</span>
          <span className="text-sm font-extrabold" style={{ color: p.name === 'value' ? color : '#94a3b8' }}>{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export const AdvancedAnalyticsView: React.FC<Props> = ({ item, onBack, isDarkMode }) => {
  const cfg = CONFIGS[item.id] ?? {
    title: `${item.title} Analytics`,
    kpis: [
      { label: 'Current Value', value: '94.2%', trend: '+2.1%', negative: false },
      { label: 'YTD Change', value: '+4.8%', trend: 'vs Target', negative: false },
      { label: 'Risk Level', value: 'Low', trend: 'Stable', negative: false },
      { label: 'Forecast', value: '96.0%', trend: 'Q4 Target', negative: false },
    ],
    trendData: [
      { month: 'Jul 25', value: 88, target: 90 }, { month: 'Aug 25', value: 90, target: 90 },
      { month: 'Sep 25', value: 89, target: 90 }, { month: 'Oct 25', value: 92, target: 90 },
      { month: 'Nov 25', value: 93, target: 90 }, { month: 'Dec 25', value: 91, target: 90 },
      { month: 'Jan 26', value: 95, target: 90 }, { month: 'Feb 26', value: 94, target: 90 },
    ],
    radar: [
      { subject: 'Zone A', A: 72 }, { subject: 'Zone B', A: 88 }, { subject: 'Zone C', A: 65 },
      { subject: 'Zone D', A: 79 }, { subject: 'Zone E', A: 55 }, { subject: 'Zone F', A: 91 },
    ],
    insight: { type: 'Good', title: 'On Track', desc: 'Metric is performing within acceptable thresholds.', rec: 'Continue current trajectory and monitor monthly.' },
    color: item.theme === 'orange' ? '#f97316' : item.theme === 'green' ? '#10b981' : '#8b5cf6',
  };

  const gridColor = isDarkMode ? '#334155' : '#f1f5f9';
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{cfg.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{ORG_NAME} · FY 2026 Executive View</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#002f56] text-white rounded-xl text-sm font-bold hover:bg-[#003f73] transition-all shadow-sm">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* KPI row with large numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
          {cfg.kpis.map((kpi: any, i: number) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
              <div className={`flex items-center gap-1.5 text-xs font-bold mb-3 ${kpi.negative ? 'text-rose-500' : 'text-emerald-500'}`}>
                {kpi.negative ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                {kpi.trend}
              </div>
              <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{kpi.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Trend chart */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-6">8-Month Trend vs Target</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cfg.trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
                <RechartTooltip content={<CustomTooltip color={cfg.color} />} />
                <Area type="monotone" dataKey="value" fill={cfg.color} fillOpacity={0.08} stroke="none" />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="target" />
                <Line type="monotone" dataKey="value" stroke={cfg.color} strokeWidth={3} dot={{ fill: cfg.color, r: 4, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} name="value" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar + Insight */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-6">Risk Distribution by Area</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={cfg.radar}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 11 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar dataKey="A" stroke={cfg.color} fill={cfg.color} fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-violet-500" />
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">AI Insight</h3>
            </div>
            <div className={`p-4 rounded-2xl border ${cfg.insight.type === 'Critical' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' : cfg.insight.type === 'Warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'}`}>
              <div className="flex items-center gap-2 mb-2">
                {cfg.insight.type === 'Critical' ? <XCircle size={14} className="text-rose-500" /> : cfg.insight.type === 'Warning' ? <AlertTriangle size={14} className="text-amber-500" /> : <CheckCircle size={14} className="text-emerald-500" />}
                <span className={`text-xs font-extrabold uppercase tracking-wider ${cfg.insight.type === 'Critical' ? 'text-rose-600 dark:text-rose-400' : cfg.insight.type === 'Warning' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{cfg.insight.type}</span>
              </div>
              <h4 className="font-extrabold text-slate-800 dark:text-white text-sm mb-1">{cfg.insight.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{cfg.insight.desc}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Recommendation</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">{cfg.insight.rec}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
