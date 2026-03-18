import React, { useState } from 'react';
import {
  ArrowLeft, Download, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, XCircle, Printer, ChevronRight
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { DashboardItem } from '../types';
import { REPORT_DATA } from '../data/mockData';
import { ORG_NAME } from '../constants';

interface MetricDetailViewProps {
  item: DashboardItem;
  onBack: () => void;
  isDarkMode?: boolean;
}

type Tab = 'overview' | 'trends' | 'data' | 'report';

const STATUS_STYLES = {
  critical: {
    badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    row: 'text-rose-600 dark:text-rose-400',
    icon: <XCircle size={14} className="text-rose-500 shrink-0" />,
  },
  warning: {
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    row: 'text-amber-600 dark:text-amber-400',
    icon: <AlertTriangle size={14} className="text-amber-500 shrink-0" />,
  },
  good: {
    badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    row: 'text-emerald-600 dark:text-emerald-400',
    icon: <CheckCircle size={14} className="text-emerald-500 shrink-0" />,
  },
};

const CustomTooltip = ({ active, payload, label, themeColor }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl min-w-[160px]">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 mt-1">
          <span className="text-xs text-slate-500">{p.name === 'value' ? 'Current' : p.name === 'previous' ? 'Prior Year' : 'Target'}</span>
          <span className="text-sm font-extrabold" style={{ color: p.color }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export const MetricDetailView: React.FC<MetricDetailViewProps> = ({ item, onBack, isDarkMode }) => {
  const report = REPORT_DATA[item.id] ?? REPORT_DATA['executive-summary'];
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const themeColor   = item.theme === 'orange' ? '#f97316' : item.theme === 'green' ? '#10b981' : '#8b5cf6';
  const prevColor    = '#94a3b8';
  const targetColor  = isDarkMode ? '#334155' : '#e2e8f0';
  const gridStroke   = isDarkMode ? '#1e293b' : '#f1f5f9';
  const tickFill     = isDarkMode ? '#94a3b8' : '#64748b';

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'trends', label: 'Trends' },
    ...(report.tableData ? [{ id: 'data' as Tab, label: 'Breakdown' }] : []),
    { id: 'report', label: 'Full Report' },
  ];

  const handleExport = () => {
    const lines = [
      `${ORG_NAME}`,
      `${item.title} — Detailed Report`,
      `Generated: ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      '',
      '═══ EXECUTIVE SUMMARY ═══',
      report.summary,
      '',
      '═══ KEY FACTORS ═══',
      ...report.keyFactors.map(f => `• ${f}`),
      '',
      '═══ RECOMMENDATION ═══',
      report.recommendation,
      '',
      ...(report.kpis ? ['═══ KEY PERFORMANCE INDICATORS ═══', ...report.kpis.map(k => `${k.label}: ${k.value} (${k.change})`), ''] : []),
      ...(report.tableData ? ['═══ BREAKDOWN DATA ═══', ...report.tableData.map(r => `${r.label}: ${r.current} (prev: ${r.previous}, change: ${r.change})`)] : []),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.id}-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors animate-fade-in">

      {/* Header bar */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-0.5">
                <span className="cursor-pointer hover:text-slate-600" onClick={onBack}>Dashboard</span>
                <ChevronRight size={12} />
                <span className="text-slate-600 dark:text-slate-300 truncate">{item.title}</span>
              </div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">{item.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExport}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-white transition-all"
            >
              <Download size={13} /> Export
            </button>
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#002f56] text-white text-xs font-bold hover:bg-[#003f73] transition-all shadow-sm"
            >
              <Printer size={13} /> Print Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-6 pb-0 flex gap-0 border-t border-slate-100 dark:border-slate-800">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#002f56] text-[#002f56] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* KPI cards — always visible */}
        {report.kpis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {report.kpis.map((kpi, i) => {
              const s = STATUS_STYLES[kpi.status];
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    {s.icon}
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${s.badge}`}>{kpi.change}</span>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{kpi.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-semibold leading-tight">{kpi.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab panels */}
        <div className="animate-fade-in" key={activeTab}>

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Executive Summary</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{report.summary}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Key Factors</h3>
                <ul className="space-y-3">
                  {report.keyFactors.map((f, i) => {
                    const isRisk = f.toLowerCase().startsWith('risk');
                    return (
                      <li
                        key={i}
                        className={`flex items-start gap-3 p-3.5 rounded-xl text-sm leading-relaxed ${
                          isRisk
                            ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900'
                            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900'
                        }`}
                      >
                        {isRisk
                          ? <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-500" />
                          : <TrendingUp size={15} className="shrink-0 mt-0.5 text-emerald-500" />
                        }
                        {f}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-full bg-blue-500" />
                  <h4 className="text-sm font-extrabold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Strategic Recommendation</h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">{report.recommendation}</p>
              </div>
            </div>
          )}

          {/* ── Trends ── */}
          {activeTab === 'trends' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{item.title} — Historical Trend</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{ORG_NAME} · FY 2025–2026 actuals vs target vs prior year</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: themeColor }} />Current</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded bg-slate-400 opacity-60" />Prior Year</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 border-t-2 border-dashed border-slate-400" />Target</div>
                </div>
              </div>

              {report.chartData ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={report.chartData} barCategoryGap="35%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: tickFill, fontSize: 11 }} dy={6} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: tickFill, fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip themeColor={themeColor} />} cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }} />
                      {report.chartData[0]?.previous !== undefined && (
                        <Bar dataKey="previous" name="previous" fill={prevColor} fillOpacity={0.35} radius={[4, 4, 0, 0]} />
                      )}
                      <Bar dataKey="value" name="value" fill={themeColor} radius={[5, 5, 0, 0]} />
                      {report.chartData[0]?.target !== undefined && (
                        <Line
                          type="monotone"
                          dataKey="target"
                          name="target"
                          stroke="#94a3b8"
                          strokeWidth={2}
                          strokeDasharray="6 4"
                          dot={false}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-slate-400">
                  <p>No trend data available for this metric.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Breakdown / Data Table ── */}
          {activeTab === 'data' && report.tableData && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{item.title} — Comparative Breakdown</h3>
                  <p className="text-xs text-slate-400 mt-0.5">FY 2026 YTD vs FY 2025 YTD</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                      <th className="text-left px-6 py-3 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-1/3">Category</th>
                      <th className="text-right px-4 py-3 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">FY 2026 YTD</th>
                      <th className="text-right px-4 py-3 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">FY 2025 YTD</th>
                      <th className="text-right px-6 py-3 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {report.tableData.map((row, i) => {
                      const s = STATUS_STYLES[row.status ?? 'good'];
                      const isPositive = row.change.startsWith('-') ? (row.status === 'good') : (row.status !== 'critical');
                      return (
                        <tr
                          key={i}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors animate-fade-in"
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <td className="px-6 py-3.5">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{row.label}</span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{row.current}</span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">{row.previous}</span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {row.status && s.icon}
                              <span className={`text-xs font-extrabold font-mono ${s.row}`}>{row.change}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center gap-4">
                {Object.entries(STATUS_STYLES).map(([status, style]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    {style.icon}
                    <span className="text-[10px] font-bold text-slate-400 capitalize">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Full Report ── */}
          {activeTab === 'report' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Print-style header */}
              <div className="bg-gradient-to-r from-[#001e38] to-[#002f56] px-8 py-6 text-white">
                <p className="text-[10px] font-extrabold tracking-widest text-blue-300 uppercase mb-1">{ORG_NAME}</p>
                <h2 className="text-xl font-extrabold tracking-tight">{item.title}</h2>
                <p className="text-blue-200 text-xs mt-1">
                  Reporting Period: FY 2026 YTD &nbsp;·&nbsp; Generated: {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="px-8 py-6 space-y-7">
                {/* KPI summary in report */}
                {report.kpis && (
                  <div>
                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Key Performance Indicators</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {report.kpis.map((kpi, i) => (
                        <div key={i} className={`rounded-xl p-3 border ${STATUS_STYLES[kpi.status].badge}`}>
                          <p className="text-xl font-extrabold">{kpi.value}</p>
                          <p className="text-[10px] font-semibold mt-0.5 opacity-80">{kpi.label}</p>
                          <p className="text-[10px] font-extrabold mt-1">{kpi.change}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div>
                  <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Executive Summary</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{report.summary}</p>
                </div>

                {/* Key factors */}
                <div>
                  <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Analysis & Key Factors</h3>
                  <ul className="space-y-2">
                    {report.keyFactors.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="text-slate-400 mt-0.5 shrink-0">—</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Breakdown table */}
                {report.tableData && (
                  <div>
                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Comparative Breakdown</h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/50">
                            <th className="text-left px-4 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Category</th>
                            <th className="text-right px-4 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">FY 2026</th>
                            <th className="text-right px-4 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">FY 2025</th>
                            <th className="text-right px-4 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Change</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {report.tableData.map((row, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium">{row.label}</td>
                              <td className="px-4 py-2.5 text-right font-extrabold text-slate-900 dark:text-white font-mono">{row.current}</td>
                              <td className="px-4 py-2.5 text-right text-slate-500 font-mono">{row.previous}</td>
                              <td className={`px-4 py-2.5 text-right font-extrabold font-mono ${STATUS_STYLES[row.status ?? 'good'].row}`}>{row.change}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div className="bg-[#001e38] dark:bg-blue-900/30 rounded-xl p-5 text-white">
                  <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300 mb-2">Strategic Recommendation</h3>
                  <p className="text-sm leading-relaxed text-blue-100">{report.recommendation}</p>
                </div>

                <p className="text-[10px] text-slate-400 text-center pt-4 border-t border-slate-100 dark:border-slate-700">
                  Confidential — {ORG_NAME} People Analytics Platform · Data as of {new Date().toLocaleDateString('en-CA')}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
