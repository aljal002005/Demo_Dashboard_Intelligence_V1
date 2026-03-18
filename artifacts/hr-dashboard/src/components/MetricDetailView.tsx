import React, { useState } from 'react';
import { ArrowLeft, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { DashboardItem } from '../types';
import { REPORT_DATA } from '../data/mockData';
import { ORG_NAME } from '../constants';

interface MetricDetailViewProps {
  item: DashboardItem;
  onBack: () => void;
  isDarkMode?: boolean;
}

const MONTHLY_TREND = [
  { month: 'Jul', value: 85 }, { month: 'Aug', value: 88 }, { month: 'Sep', value: 87 },
  { month: 'Oct', value: 91 }, { month: 'Nov', value: 90 }, { month: 'Dec', value: 93 },
  { month: 'Jan', value: 95 }, { month: 'Feb', value: 94 }, { month: 'Mar', value: 96 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-extrabold text-[#002f56] dark:text-blue-300">{payload[0].value}</p>
    </div>
  );
};

export const MetricDetailView: React.FC<MetricDetailViewProps> = ({ item, onBack, isDarkMode }) => {
  const report = REPORT_DATA[item.id] ?? REPORT_DATA['executive-summary'];
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'report'>('overview');
  const themeColor = item.theme === 'orange' ? '#f97316' : item.theme === 'green' ? '#10b981' : '#8b5cf6';

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'critical') return <XCircle size={16} className="text-rose-500" />;
    if (status === 'warning') return <AlertTriangle size={16} className="text-amber-500" />;
    return <CheckCircle size={16} className="text-emerald-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{item.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{ORG_NAME} · FY 2026</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#002f56] text-white rounded-xl text-sm font-bold hover:bg-[#003f73] transition-all shadow-sm">
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* KPI cards */}
        {report.kpis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
            {report.kpis.map((kpi, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <StatusIcon status={kpi.status} />
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${
                    kpi.status === 'critical' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
                    kpi.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {kpi.change}
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">{kpi.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{kpi.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6 w-fit">
          {(['overview', 'trends', 'report'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in" key={activeTab}>
          {activeTab === 'overview' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-3">Executive Summary</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{report.summary}</p>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-3">Key Factors</h3>
                <ul className="space-y-2">
                  {report.keyFactors.map((f, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm p-3 rounded-xl ${f.toLowerCase().startsWith('risk') ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'}`}>
                      {f.toLowerCase().startsWith('risk') ? <AlertTriangle size={14} className="shrink-0 mt-0.5" /> : <TrendingUp size={14} className="shrink-0 mt-0.5" />}
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                <h4 className="text-sm font-extrabold text-blue-800 dark:text-blue-300 mb-2">Recommendation</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">{report.recommendation}</p>
              </div>
            </div>
          )}
          {activeTab === 'trends' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-6">9-Month Trend</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_TREND}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={90} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Target', fill: '#94a3b8', fontSize: 10, position: 'right' }} />
                    <Line type="monotone" dataKey="value" stroke={themeColor} strokeWidth={3} dot={{ fill: themeColor, r: 5, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {activeTab === 'report' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-4">{item.title} — Detailed Report</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{report.summary}</p>
                <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-2 mt-6">Analysis & Findings</h4>
                <ul className="space-y-2">
                  {report.keyFactors.map((f, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">• {f}</li>
                  ))}
                </ul>
                <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-2 mt-6">Strategic Recommendations</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{report.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
