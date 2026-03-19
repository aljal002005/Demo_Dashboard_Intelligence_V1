import React from 'react';
import { ArrowLeft, Clock, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardItem } from '../types';
import { ORG_NAME } from '../constants';

interface OvertimeViewProps { item: DashboardItem; onBack: () => void; isDarkMode?: boolean; dateRange?: string; }

const TREND = [
  { month: 'Apr 25', val: 2.4, trend: 'flat' }, { month: 'May 25', val: 2.7, trend: 'up' },
  { month: 'Jun 25', val: 2.8, trend: 'up' }, { month: 'Jul 25', val: 3.2, trend: 'up' },
  { month: 'Aug 25', val: 3.2, trend: 'flat' }, { month: 'Sep 25', val: 2.9, trend: 'down' },
  { month: 'Oct 25', val: 2.8, trend: 'down' }, { month: 'Nov 25', val: 2.8, trend: 'flat' },
  { month: 'Dec 25', val: 3.1, trend: 'up' },
];

const UNION_DATA = [
  { name: 'UNA', ot: 1250375, rate: 5.5 }, { name: 'AUPE AUX', ot: 474549, rate: 4.5 },
  { name: 'AUPE GSS', ot: 181637, rate: 0.9 }, { name: 'HSAA', ot: 137173, rate: 1.1 },
  { name: 'NUEE', ot: 22381, rate: 0.5 },
];

const ZONES = [
  { name: 'Calgary', value: 780000, pct: 37.5, color: '#002f56' },
  { name: 'Edmonton', value: 720000, pct: 34.6, color: '#3b82f6' },
  { name: 'Central', value: 260000, pct: 12.5, color: '#10b981' },
  { name: 'North', value: 190000, pct: 9.1, color: '#f59e0b' },
  { name: 'South', value: 130000, pct: 6.3, color: '#8b5cf6' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">{p.name}</span>
          <span className="text-sm font-extrabold" style={{ color: p.color }}>{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export const OvertimeView: React.FC<OvertimeViewProps> = ({ item, onBack, isDarkMode, dateRange = 'ytd' }) => {
  const gridColor = isDarkMode ? '#334155' : '#f1f5f9';
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b';

  const variation = dateRange === 'ytd' ? 1 : dateRange === 'q4' ? 0.25 : dateRange === 'q3' ? 0.25 : 0.08;
  const filteredTrend = dateRange === 'ytd' ? TREND : Array.from({length: 9}, (_, i) => {
    const prefix = dateRange === 'q4' ? 'Q4 W' : dateRange === 'q3' ? 'Q3 W' : 'W';
    const val = 2.5 + Math.random() * 1.5;
    return {
      month: `${prefix}${i + 1}`,
      val: parseFloat(val.toFixed(1)),
      trend: val > 3.2 ? 'down' : val < 2.8 ? 'up' : 'flat'
    };
  });
  const filteredUnion = UNION_DATA.map(u => ({ ...u, ot: u.ot * variation }));
  const filteredZones = ZONES.map(z => ({ ...z, value: z.value * variation }));
  const multiplierText = (2.08 * variation).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Overtime (OT) Hours</h1>
              <p className="text-xs text-slate-400 mt-0.5">{ORG_NAME} · FY 2026 {dateRange === 'ytd' ? 'YTD' : dateRange.toUpperCase()}</p>
            </div>
          </div>
          <div className="hidden lg:block text-xs text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 max-w-sm text-right">
            <span className="font-bold text-amber-700 dark:text-amber-400">Note:</span> Acute care, Assisted Living, and Primary Care data have been filtered per reporting policy.
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* KPI + Trend strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#002f56] flex items-center justify-center text-white shadow-lg shadow-[#002f56]/20">
              <Clock size={28} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">FY 2026 YTD</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#002f56] dark:text-white">{multiplierText}M</span>
                <span className="text-sm text-slate-500">hrs</span>
              </div>
              <p className="text-lg font-extrabold text-[#78be20] mt-0.5">2.9% OT</p>
            </div>
          </div>
          <div className="md:col-span-3 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 px-2">Monthly OT% Trend</p>
            <div className="flex items-center min-w-[500px]">
              {filteredTrend.map((t: any, i) => (
                <div key={i} className="flex flex-col items-center flex-1 px-2 border-r border-slate-100 dark:border-slate-700 last:border-0 group cursor-default">
                  <span className="text-[9px] font-bold text-slate-400 mb-2 uppercase">{t.month}</span>
                  <div className="mb-1.5 group-hover:scale-110 transition-transform">
                    {t.trend === 'up' && <ArrowUp size={18} className="text-rose-500" strokeWidth={3} />}
                    {t.trend === 'down' && <ArrowDown size={18} className="text-emerald-500" strokeWidth={3} />}
                    {t.trend === 'flat' && <ArrowRight size={18} className="text-amber-500" strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{t.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Union chart + Zone pie */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-6">OT Hours by Union</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredUnion} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11, fontWeight: 600 }} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="ot" fill="#002f56" radius={[0, 6, 6, 0]} />
                  <Line dataKey="rate" stroke="#78be20" strokeWidth={2} dot={{ fill: '#78be20', r: 4 }} yAxisId={0} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-6">Zone Distribution</h3>
            <div className="flex items-center gap-6">
              <div className="h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={filteredZones} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                      {filteredZones.map((z, i) => <Cell key={i} fill={z.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}k hrs`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {filteredZones.map(z => (
                  <div key={z.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1">{z.name}</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{z.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
