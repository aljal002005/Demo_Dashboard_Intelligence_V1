import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine
} from 'recharts';
import {
  ArrowLeft, Filter, ChevronRight, Download, Info,
  Calendar, MapPin, Building2, Home
} from 'lucide-react';
import { DashboardItem } from '../types';
import { ORG_NAME } from '../constants';

interface DetailViewProps {
  item: DashboardItem;
  onBack: () => void;
  isDarkMode?: boolean;
  dateRange?: string;
}

const generateData = (itemId: string, filters: { year: string; zone: string | null; search: string }) => {
  let scale = 1000, base = 95, variance = 25;
  if (filters.zone) scale *= 0.25;
  if (filters.search) scale *= 0.1;
  const total = Math.floor(Math.random() * variance * scale) + base * scale;
  const target = Math.floor(total * 0.95);

  const zones = ['Calgary', 'Edmonton', 'Central', 'North', 'South'].map(name => ({
    name,
    value: filters.zone && filters.zone !== name ? 0 : Math.floor(total * (filters.zone ? 1 : [0.38, 0.35, 0.12, 0.09, 0.06][['Calgary', 'Edmonton', 'Central', 'North', 'South'].indexOf(name)])),
  }));

  const unions = [
    { name: 'UNA', value: Math.floor(total * 0.32) },
    { name: 'AUPE GSS', value: Math.floor(total * 0.28) },
    { name: 'HSAA', value: Math.floor(total * 0.18) },
    { name: 'AUPE AUX', value: Math.floor(total * 0.15) },
    { name: 'NUEE', value: Math.floor(total * 0.05) },
    { name: 'PARA', value: Math.floor(total * 0.02) },
  ];

  const classification = [
    { name: 'RFT', value: Math.floor(total * 0.45) },
    { name: 'RPT', value: Math.floor(total * 0.35) },
    { name: 'CAS', value: Math.floor(total * 0.10) },
    { name: 'TFT', value: Math.floor(total * 0.05) },
    { name: 'TPT', value: Math.floor(total * 0.05) },
  ];

  return { total, target, zones, unions, classification };
};

const CustomTooltip = ({ active, payload, label, color }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl min-w-[150px]">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">{label ?? payload[0].name}</p>
      <p className="text-lg font-extrabold" style={{ color }}>{payload[0].value?.toLocaleString()}</p>
    </div>
  );
};

const BreakdownBar = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => (
  <div className="group">
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{((value / total) * 100).toFixed(1)}%</span>
    </div>
    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500 group-hover:opacity-80" style={{ width: `${(value / total) * 100}%`, backgroundColor: color }} />
    </div>
    <p className="text-[10px] text-slate-400 mt-0.5">{value.toLocaleString()}</p>
  </div>
);

export const DetailView: React.FC<DetailViewProps> = ({ item, onBack, isDarkMode, dateRange = 'ytd' }) => {
  const [activeYear, setActiveYear] = useState('FY 2026');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const data = useMemo(() => {
    const d = generateData(item.id, { year: activeYear, zone: selectedZone, search: searchTerm });
    const variation = dateRange === 'ytd' ? 1 : dateRange === 'q4' ? 0.25 : dateRange === 'q3' ? 0.2 : 0.08;
    return {
      ...d,
      total: Math.round(d.total * variation),
      target: Math.round(d.target * variation),
      zones: d.zones.map(z => ({...z, value: Math.round(z.value * variation)})),
      unions: d.unions.map(u => ({...u, value: Math.round(u.value * variation)})),
      classification: d.classification.map(c => ({...c, value: Math.round(c.value * variation)}))
    };
  }, [item.id, activeYear, selectedZone, searchTerm, dateRange]);

  const themeColor = item.theme === 'orange' ? '#f97316' : item.theme === 'green' ? '#10b981' : '#8b5cf6';
  const gridStroke = isDarkMode ? '#334155' : '#f1f5f9';
  const textFill = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors animate-fade-in">
      <div className={`flex-grow p-6 lg:p-8 transition-all duration-300 ${sidebarOpen ? 'lg:mr-72' : ''}`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <button className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" onClick={onBack}>
            <Home size={12} /> Dashboard
          </button>
          <ChevronRight size={12} />
          <span className="text-slate-800 dark:text-slate-200">{item.title}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm group">
              <ArrowLeft size={18} className="text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{item.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ORG_NAME} · {activeYear}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSidebarOpen(s => !s)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${sidebarOpen ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              <Filter size={14} /> Filters
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-[#002f56] text-white rounded-xl text-xs font-bold hover:bg-[#003f73] transition-all shadow-sm">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Hero metric */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">Total YTD Volume</p>
              <p className="text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">{data.total.toLocaleString()}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg">+4.2% vs Last Year</span>
                <span className="text-xs text-slate-500">Target: <span className="font-mono font-bold">{data.target.toLocaleString()}</span></span>
              </div>
            </div>
            <div className="h-20 w-40 hidden md:block">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.zones} barSize={12}>
                  <Bar dataKey="value" fill={themeColor} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Geographic chart */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Geographic Distribution</h3>
            <button className="text-slate-400 hover:text-slate-600"><Info size={16} /></button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.zones} barSize={52}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: textFill, fontSize: 12, fontWeight: 500 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: textFill, fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip color={themeColor} />} cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }} />
                <ReferenceLine y={data.total / 5} stroke="#94a3b8" strokeDasharray="3 3" />
                <Bar dataKey="value" fill={themeColor} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdowns */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-5">Union Breakdown</h3>
            <div className="space-y-3">
              {data.unions.map(u => <BreakdownBar key={u.name} label={u.name} value={u.value} total={data.total} color={themeColor} />)}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-5">Employee Classification</h3>
            <div className="space-y-3">
              {data.classification.map(c => <BreakdownBar key={c.name} label={c.name} value={c.value} total={data.total} color={themeColor} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className={`fixed right-0 top-16 h-[calc(100vh-64px)] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-30 w-72 p-6 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-extrabold text-slate-800 dark:text-white">Filters</h2>
          <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
              <Calendar size={12} /> Fiscal Year
            </label>
            <select value={activeYear} onChange={e => setActiveYear(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all">
              <option>FY 2026</option><option>FY 2025</option><option>FY 2024</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
              <MapPin size={12} /> Zone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['North', 'Edmonton', 'Central', 'Calgary', 'South'].map(z => (
                <button key={z} onClick={() => setSelectedZone(selectedZone === z ? null : z)}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${selectedZone === z ? 'bg-[#002f56] border-[#002f56] text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'}`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
              <Building2 size={12} /> Search
            </label>
            <input type="text" placeholder="Functional center..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-sm rounded-xl p-2.5 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
            />
          </div>
          {(selectedZone || searchTerm) && (
            <button onClick={() => { setSelectedZone(null); setSearchTerm(''); }}
              className="w-full py-2 text-xs font-bold text-red-500 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
