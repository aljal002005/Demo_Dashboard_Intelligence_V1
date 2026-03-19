import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Download, TrendingUp, AlertTriangle, CheckCircle,
  XCircle, Printer, ChevronRight, Filter, Calendar, MapPin,
  Building2, Home, Info
} from 'lucide-react';
import {
  ComposedChart, Bar, BarChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell
} from 'recharts';
import { DashboardItem } from '../types';
import { REPORT_DATA } from '../data/mockData';
import { ORG_NAME } from '../constants';

interface MetricDetailViewProps {
  item: DashboardItem;
  onBack: () => void;
  isDarkMode?: boolean;
  dateRange?: string;
}

type Tab = 'overview' | 'analysis' | 'trends' | 'report';

const ZONE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const STATUS_STYLES = {
  critical: {
    badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    text: 'text-rose-600 dark:text-rose-400',
    icon: <XCircle size={14} className="text-rose-500 shrink-0" />,
  },
  warning: {
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-400',
    icon: <AlertTriangle size={14} className="text-amber-500 shrink-0" />,
  },
  good: {
    badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: <CheckCircle size={14} className="text-emerald-500 shrink-0" />,
  },
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl min-w-[160px]">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">{label ?? payload[0]?.name}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 mt-1">
          <span className="text-xs text-slate-500">
            {p.dataKey === 'value' ? 'Current' : p.dataKey === 'previous' ? 'Prior Year' : p.dataKey === 'target' ? 'Target' : p.name}
          </span>
          <span className="text-sm font-extrabold" style={{ color: p.color || p.fill }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const BreakdownBar = ({ label, value, total, color, subtext }: { label: string; value: number; total: number; color: string; subtext?: string }) => (
  <div className="group">
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      <div className="text-right">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{((value / total) * 100).toFixed(1)}%</span>
      </div>
    </div>
    <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 group-hover:opacity-80"
        style={{ width: `${(value / total) * 100}%`, backgroundColor: color }}
      />
    </div>
    <p className="text-[10px] text-slate-400 mt-0.5">{subtext ?? value.toLocaleString()}</p>
  </div>
);

const generateZoneData = (itemId: string, zone: string | null, year: string) => {
  const seed = itemId.charCodeAt(0) + (year === 'FY 2026' ? 0 : -500);
  const base = 95000 + seed * 100;
  const total = zone ? Math.floor(base * 0.22) : base;
  const target = Math.floor(total * 0.95);

  const zones = [
    { name: 'Calgary', value: Math.floor(total * 0.38), color: ZONE_COLORS[0] },
    { name: 'Edmonton', value: Math.floor(total * 0.35), color: ZONE_COLORS[1] },
    { name: 'Central', value: Math.floor(total * 0.12), color: ZONE_COLORS[2] },
    { name: 'North', value: Math.floor(total * 0.09), color: ZONE_COLORS[3] },
    { name: 'South', value: Math.floor(total * 0.06), color: ZONE_COLORS[4] },
  ].filter(z => !zone || z.name === zone);

  const unions = [
    { name: 'UNA', label: 'United Nurses of Alberta', value: Math.floor(total * 0.32) },
    { name: 'AUPE GSS', label: 'Gen. Support Services', value: Math.floor(total * 0.28) },
    { name: 'HSAA', label: 'Health Sciences Assoc.', value: Math.floor(total * 0.18) },
    { name: 'AUPE AUX', label: 'Auxiliary Nursing Care', value: Math.floor(total * 0.15) },
    { name: 'NUEE', label: 'Utility Employees', value: Math.floor(total * 0.05) },
    { name: 'PARA', label: 'Paramedics', value: Math.floor(total * 0.02) },
  ];

  const classification = [
    { name: 'RFT', label: 'Regular Full-Time', value: Math.floor(total * 0.45) },
    { name: 'RPT', label: 'Regular Part-Time', value: Math.floor(total * 0.35) },
    { name: 'CAS', label: 'Casual', value: Math.floor(total * 0.10) },
    { name: 'TFT', label: 'Temporary Full-Time', value: Math.floor(total * 0.05) },
    { name: 'TPT', label: 'Temporary Part-Time', value: Math.floor(total * 0.05) },
  ];

  return { total, target, zones, unions, classification };
};

export const MetricDetailView: React.FC<MetricDetailViewProps> = ({ item, onBack, isDarkMode, dateRange = 'ytd' }) => {
  const report = REPORT_DATA[item.id] ?? REPORT_DATA['executive-summary'];
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [activeYear, setActiveYear] = useState('FY 2026');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const themeColor  = item.theme === 'orange' ? '#f97316' : item.theme === 'green' ? '#10b981' : '#8b5cf6';
  const gridStroke  = isDarkMode ? '#1e293b' : '#f1f5f9';
  const tickFill    = isDarkMode ? '#94a3b8' : '#64748b';

  const geo = useMemo(
    () => {
      const g = generateZoneData(item.id, selectedZone, activeYear);
      const variation = dateRange === 'ytd' ? 1 : dateRange === 'q4' ? 0.25 : dateRange === 'q3' ? 0.2 : 0.08;
      return {
         ...g,
         total: Math.round(g.total * variation),
         target: Math.round(g.target * variation),
         zones: g.zones.map(z => ({...z, value: Math.round(z.value * variation)})),
         unions: g.unions.map(u => ({...u, value: Math.round(u.value * variation)})),
         classification: g.classification.map(c => ({...c, value: Math.round(c.value * variation)}))
      };
    },
    [item.id, selectedZone, activeYear, dateRange]
  );

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'analysis', label: 'Data Analysis' },
    { id: 'trends', label: 'Trends' },
    { id: 'report', label: 'Full Report' },
  ];

  const handleExport = () => {
    const lines = [
      `${ORG_NAME} — ${item.title}`,
      `Generated: ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      '',
      '=== EXECUTIVE SUMMARY ===',
      report.summary,
      '',
      '=== KEY FACTORS ===',
      ...report.keyFactors.map(f => `• ${f}`),
      '',
      '=== RECOMMENDATION ===',
      report.recommendation,
      '',
      ...(report.kpis ? ['=== KEY PERFORMANCE INDICATORS ===', ...report.kpis.map(k => `${k.label}: ${k.value} (${k.change})`), ''] : []),
      ...(report.tableData ? ['=== BREAKDOWN DATA ===', ...report.tableData.map(r => `${r.label}: ${r.current} vs ${r.previous} (${r.change})`)] : []),
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

      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          {/* Breadcrumb + title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-0.5">
                <Home size={11} />
                <button className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors" onClick={onBack}>Dashboard</button>
                <ChevronRight size={11} />
                <span className="text-slate-700 dark:text-slate-200 truncate">{item.title}</span>
              </div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">{item.title}</h1>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setFilterOpen(o => !o)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                filterOpen
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Filter size={13} /> Filters
            </button>
            <button
              onClick={handleExport}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-slate-300 transition-all"
            >
              <Download size={13} /> Export
            </button>
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#002f56] text-white text-xs font-bold hover:bg-[#003f73] transition-all shadow-sm"
            >
              <Printer size={13} /> Print
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 lg:px-8 flex gap-0 border-t border-slate-100 dark:border-slate-800">
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

      <div className="flex">
        {/* Main content */}
        <div className={`flex-1 min-w-0 px-6 lg:px-8 py-8 transition-all duration-300 ${filterOpen ? 'lg:mr-72' : ''}`}>

          {/* KPI cards — always shown */}
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
                {/* Hero metric */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-end justify-between gap-6">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Total YTD Volume</p>
                    <p className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">{geo.total.toLocaleString()}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg">+4.2% vs Last Year</span>
                      <span className="text-xs text-slate-500">Target: <span className="font-mono font-bold">{geo.target.toLocaleString()}</span></span>
                    </div>
                  </div>
                  <div className="h-16 w-32 hidden md:block">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={geo.zones} barSize={10}>
                        <Bar dataKey="value" fill={themeColor} radius={[3, 3, 0, 0]} fillOpacity={0.8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Executive Summary</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{report.summary}</p>
                </div>

                {/* Key factors */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Key Factors</h3>
                  <ul className="space-y-3">
                    {report.keyFactors.map((f, i) => {
                      const isRisk = f.toLowerCase().startsWith('risk');
                      return (
                        <li
                          key={i}
                          className={`flex items-start gap-3 p-3.5 rounded-xl text-sm leading-relaxed border ${
                            isRisk
                              ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900'
                              : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900'
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

                {/* Recommendation */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded-full bg-blue-500" />
                    <h4 className="text-xs font-extrabold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Strategic Recommendation</h4>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">{report.recommendation}</p>
                </div>
              </div>
            )}

            {/* ── Data Analysis ── */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                {/* Geographic distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Geographic Distribution</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{activeYear} · by AHS Zone</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600"><Info size={16} /></button>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={geo.zones} barSize={56}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickFill, fontSize: 12, fontWeight: 500 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: tickFill, fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }} />
                        <ReferenceLine y={geo.total / 5} stroke="#94a3b8" strokeDasharray="4 3" label={{ value: 'Avg', fill: '#94a3b8', fontSize: 10, position: 'right' }} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {geo.zones.map((z, i) => (
                            <Cell key={z.name} fill={z.color} fillOpacity={selectedZone === z.name ? 1 : 0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Union + Classification breakdowns */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-5">Union Breakdown</h3>
                    <div className="space-y-4">
                      {geo.unions.map((u, i) => (
                        <BreakdownBar
                          key={u.name}
                          label={u.name}
                          value={u.value}
                          total={geo.total}
                          color={themeColor}
                          subtext={`${u.label} · ${u.value.toLocaleString()}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-5">Employee Classification</h3>
                    <div className="space-y-4">
                      {geo.classification.map((c, i) => (
                        <BreakdownBar
                          key={c.name}
                          label={c.name}
                          value={c.value}
                          total={geo.total}
                          color={ZONE_COLORS[i % ZONE_COLORS.length]}
                          subtext={`${c.label} · ${c.value.toLocaleString()}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comparison table */}
                {report.tableData && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Year-over-Year Comparison</h3>
                      <p className="text-xs text-slate-400 mt-0.5">FY 2026 YTD vs FY 2025 YTD by segment</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/50">
                            <th className="text-left px-6 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Segment</th>
                            <th className="text-right px-4 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">FY 2026</th>
                            <th className="text-right px-4 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">FY 2025</th>
                            <th className="text-right px-6 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Change</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {report.tableData.map((row, i) => {
                            const s = STATUS_STYLES[row.status ?? 'good'];
                            return (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300">{row.label}</td>
                                <td className="px-4 py-3.5 text-right text-sm font-extrabold text-slate-900 dark:text-white font-mono">{row.current}</td>
                                <td className="px-4 py-3.5 text-right text-sm text-slate-500 dark:text-slate-400 font-mono">{row.previous}</td>
                                <td className="px-6 py-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {s.icon}
                                    <span className={`text-xs font-extrabold font-mono ${s.text}`}>{row.change}</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center gap-5">
                      {Object.entries(STATUS_STYLES).map(([status, style]) => (
                        <div key={status} className="flex items-center gap-1.5">
                          {style.icon}
                          <span className="text-[10px] font-bold text-slate-400 capitalize">{status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Trends ── */}
            {activeTab === 'trends' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{item.title} — Historical Trend</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{ORG_NAME} · Actuals vs target vs prior year</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ background: themeColor }} />Current
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-slate-300 dark:bg-slate-600" />Prior Yr
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 border-t-2 border-dashed border-slate-400" />Target
                      </div>
                    </div>
                  </div>

                  {report.chartData ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={report.chartData} barCategoryGap="40%">
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: tickFill, fontSize: 11 }} dy={6} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: tickFill, fontSize: 11 }} />
                          <Tooltip content={<ChartTooltip />} cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }} />
                          {report.chartData[0]?.previous !== undefined && (
                            <Bar dataKey="previous" fill="#94a3b8" fillOpacity={0.35} radius={[4, 4, 0, 0]} />
                          )}
                          <Bar dataKey="value" fill={themeColor} radius={[5, 5, 0, 0]} />
                          {report.chartData[0]?.target !== undefined && (
                            <Line
                              type="monotone"
                              dataKey="target"
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
                    <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
                      No trend data available for this metric.
                    </div>
                  )}
                </div>

                {/* Narrative below chart */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">Trend Insight</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{report.summary}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                    <h4 className="text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3">Recommendation</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{report.recommendation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Full Report ── */}
            {activeTab === 'report' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {/* Print header */}
                <div className="bg-gradient-to-r from-[#001e38] to-[#002f56] px-8 py-6 text-white">
                  <p className="text-[10px] font-extrabold tracking-widest text-blue-300 uppercase mb-1">{ORG_NAME}</p>
                  <h2 className="text-xl font-extrabold tracking-tight">{item.title}</h2>
                  <p className="text-blue-200 text-xs mt-1">
                    Reporting Period: {activeYear} YTD &nbsp;·&nbsp; Generated: {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="px-8 py-7 space-y-8">
                  {/* KPI snapshot */}
                  {report.kpis && (
                    <section>
                      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pb-2 mb-4 border-b border-slate-100 dark:border-slate-700">Key Performance Indicators</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {report.kpis.map((kpi, i) => (
                          <div key={i} className={`rounded-xl p-3.5 border ${STATUS_STYLES[kpi.status].badge}`}>
                            <p className="text-2xl font-extrabold">{kpi.value}</p>
                            <p className="text-[10px] font-semibold mt-0.5 opacity-80 leading-tight">{kpi.label}</p>
                            <p className="text-[10px] font-extrabold mt-1.5">{kpi.change}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Executive summary */}
                  <section>
                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pb-2 mb-4 border-b border-slate-100 dark:border-slate-700">Executive Summary</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{report.summary}</p>
                  </section>

                  {/* Key factors */}
                  <section>
                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pb-2 mb-4 border-b border-slate-100 dark:border-slate-700">Analysis & Key Factors</h3>
                    <ul className="space-y-2.5">
                      {report.keyFactors.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          <span className="text-slate-400 mt-0.5 shrink-0">—</span> {f}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Breakdown table */}
                  {report.tableData && (
                    <section>
                      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pb-2 mb-4 border-b border-slate-100 dark:border-slate-700">Comparative Breakdown</h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50">
                              <th className="text-left px-4 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Segment</th>
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
                                <td className={`px-4 py-2.5 text-right font-extrabold font-mono ${STATUS_STYLES[row.status ?? 'good'].text}`}>{row.change}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {/* Recommendation */}
                  <section className="bg-[#001e38] dark:bg-blue-900/30 rounded-xl p-5 text-white">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300 mb-2">Strategic Recommendation</h3>
                    <p className="text-sm leading-relaxed text-blue-100">{report.recommendation}</p>
                  </section>

                  <p className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100 dark:border-slate-700">
                    Confidential — {ORG_NAME} People Analytics · Data as of {new Date().toLocaleDateString('en-CA')} · Generated by HR Intelligence Hub
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Filter sidebar */}
        <div className={`fixed right-0 top-0 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-30 w-72 overflow-y-auto transition-transform duration-300 pt-32 ${filterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="px-6 pb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-extrabold text-slate-800 dark:text-white">Filters</h2>
              <button onClick={() => setFilterOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                  <Calendar size={11} /> Fiscal Year
                </label>
                <select
                  value={activeYear}
                  onChange={e => setActiveYear(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
                >
                  <option>FY 2026</option>
                  <option>FY 2025</option>
                  <option>FY 2024</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                  <MapPin size={11} /> AHS Zone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['North', 'Edmonton', 'Central', 'Calgary', 'South'].map(z => (
                    <button
                      key={z}
                      onClick={() => setSelectedZone(selectedZone === z ? null : z)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                        selectedZone === z
                          ? 'bg-[#002f56] border-[#002f56] text-white'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'
                      }`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                  <Building2 size={11} /> Functional Area
                </label>
                <input
                  type="text"
                  placeholder="Search department..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-sm rounded-xl p-2.5 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
                />
              </div>

              {(selectedZone || searchTerm) && (
                <button
                  onClick={() => { setSelectedZone(null); setSearchTerm(''); }}
                  className="w-full py-2 text-xs font-bold text-rose-500 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
