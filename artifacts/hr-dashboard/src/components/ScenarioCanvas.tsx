import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Play, RotateCcw, Download, Info, TrendingUp, TrendingDown, DollarSign, Users, Sparkles } from 'lucide-react';
import { SectionGuide } from './SectionGuide';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { ORG_NAME } from '../constants';

interface Lever {
  id: string;
  name: string;
  current: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  impact: { headcount: number; cost: number; attrition: number };
}

const BASE_LEVERS: Lever[] = [
  { id: 'hiring-rate', name: 'Annual Hiring Rate', current: 8, unit: '%', min: 0, max: 20, step: 0.5, impact: { headcount: 120, cost: 180000, attrition: -0.1 } },
  { id: 'salary-increase', name: 'Merit Increase Budget', current: 3.5, unit: '%', min: 0, max: 10, step: 0.5, impact: { headcount: 0, cost: 500000, attrition: -0.8 } },
  { id: 'retention-prog', name: 'Retention Program Investment', current: 0, unit: '$M', min: 0, max: 5, step: 0.25, impact: { headcount: 0, cost: 1000000, attrition: -1.5 } },
  { id: 'overtime-cap', name: 'OT Cap Enforcement', current: 40, unit: 'hrs/wk', min: 35, max: 60, step: 1, impact: { headcount: 30, cost: 50000, attrition: -0.3 } },
];

const FORECAST_YEARS = ['2026', '2027', '2028', '2029', '2030'];

const computeScenario = (levers: Lever[], name: string, color: string) => {
  let headcount = 112500;
  let attritionRate = 8.7;
  let cost = 0;

  levers.forEach(l => {
    const delta = l.current - BASE_LEVERS.find(b => b.id === l.id)!.current;
    headcount += delta * l.impact.headcount;
    attritionRate += delta * l.impact.attrition;
    cost += Math.abs(delta) * l.impact.cost;
  });

  return FORECAST_YEARS.map((year, i) => ({
    year,
    [name]: Math.round(headcount + i * headcount * (BASE_LEVERS[0].current / 100)),
    [`${name}_attrition`]: Math.max(3, attritionRate - i * 0.2),
  }));
};

export const ScenarioCanvas: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode }) => {
  const [levers, setLevers] = useState<Lever[]>(JSON.parse(JSON.stringify(BASE_LEVERS)));
  const [scenarios, setScenarios] = useState<{ name: string; color: string; data: any[]; levers: Lever[] }[]>([]);
  const [running, setRunning] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'headcount' | 'attrition'>('headcount');

  const COLORS = ['#002f56', '#10b981', '#f97316', '#8b5cf6', '#ef4444'];

  const updateLever = useCallback((id: string, val: number) => {
    setLevers(prev => prev.map(l => l.id === id ? { ...l, current: val } : l));
  }, []);

  const runScenario = () => {
    setRunning(true);
    setTimeout(() => {
      const name = `Scenario ${scenarios.length + 1}`;
      const color = COLORS[scenarios.length % COLORS.length];
      const data = computeScenario(levers, name, color);
      setScenarios(prev => [...prev, { name, color, data, levers: JSON.parse(JSON.stringify(levers)) }]);
      setRunning(false);
    }, 800);
  };

  const resetLevers = () => setLevers(JSON.parse(JSON.stringify(BASE_LEVERS)));

  const mergedData = FORECAST_YEARS.map((year, i) => {
    const pt: any = { year };
    scenarios.forEach(s => { pt[s.name] = s.data[i]?.[s.name]; });
    return pt;
  });

  const gridColor = isDarkMode ? '#334155' : '#f1f5f9';
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <SectionGuide isAI title="Scenario Planner" description={`Model the workforce impact of strategic HR decisions across ${ORG_NAME}. Adjust levers, run scenarios side-by-side, and export projections.`} tips={['Run multiple scenarios to compare outcomes', 'Each scenario preserves the lever settings used']} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Levers panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Strategic Levers</h3>
              <button onClick={resetLevers} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <RotateCcw size={12} /> Reset
              </button>
            </div>
            <div className="space-y-6">
              {levers.map(lever => (
                <div key={lever.id}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">{lever.name}</label>
                    <span className="text-sm font-extrabold text-[#002f56] dark:text-blue-400">{lever.current}{lever.unit}</span>
                  </div>
                  <input
                    type="range"
                    min={lever.min}
                    max={lever.max}
                    step={lever.step}
                    value={lever.current}
                    onChange={e => updateLever(lever.id, Number(e.target.value))}
                    className="w-full accent-[#002f56]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>{lever.min}{lever.unit}</span>
                    <span>{lever.max}{lever.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={runScenario} disabled={running}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#002f56] text-white text-sm font-extrabold hover:bg-[#003f73] disabled:opacity-60 transition-all shadow-md shadow-blue-900/20"
              >
                {running ? <><Sparkles size={14} className="animate-spin" /> Running...</> : <><Play size={14} /> Run Scenario</>}
              </button>
            </div>
          </div>

          {/* Scenario list */}
          {scenarios.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3">Saved Scenarios</h3>
              <div className="space-y-2">
                {scenarios.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex-1">{s.name}</span>
                    <button onClick={() => setScenarios(prev => prev.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chart panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Workforce Projection</h3>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                  {(['headcount', 'attrition'] as const).map(m => (
                    <button key={m} onClick={() => setActiveMetric(m)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${activeMetric === m ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}>{m}</button>
                  ))}
                </div>
                <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl transition-all">
                  <Download size={12} /> Export
                </button>
              </div>
            </div>
            {scenarios.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <Sparkles size={40} className="mb-3 opacity-30" />
                <p className="font-bold">Adjust levers and run a scenario</p>
                <p className="text-sm mt-1">Projections will appear here</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mergedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} tickFormatter={v => activeMetric === 'headcount' ? `${(v / 1000).toFixed(0)}k` : `${v.toFixed(1)}%`} />
                    <Tooltip contentStyle={{ background: isDarkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                    {scenarios.map((s, i) => (
                      <Line key={i} type="monotone" dataKey={s.name} stroke={s.color} strokeWidth={2.5} dot={{ fill: s.color, r: 4, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Summary cards */}
          {scenarios.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Best Case HC', value: `${Math.max(...scenarios.map(s => s.data[4]?.[s.name] ?? 0)).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500' },
                { label: 'Avg Cost Delta', value: '$2.4M', icon: DollarSign, color: 'text-amber-500' },
                { label: 'Risk Reduction', value: '-1.8%', icon: TrendingDown, color: 'text-blue-500' },
              ].map((c, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm text-center animate-fade-in">
                  <c.icon size={18} className={`${c.color} mx-auto mb-2`} />
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">{c.value}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
