import React, { useState, useCallback, useMemo } from 'react';
import {
  Play, RotateCcw, Download, TrendingUp, TrendingDown,
  DollarSign, Users, Sparkles, Trash2, Save, CheckCircle2, HelpCircle
} from 'lucide-react';
import { SectionGuide } from './SectionGuide';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Area, AreaChart
} from 'recharts';
import { ORG_NAME } from '../constants';

interface Lever {
  id: string;
  name: string;
  description: string;
  current: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  impact: { headcount: number; costPerUnit: number; attritionPerUnit: number };
}

const BASE_LEVERS: Lever[] = [
  {
    id: 'hiring-rate',
    name: 'Annual Hiring Rate',
    description: 'New hires as % of total workforce',
    current: 8, unit: '%', min: 0, max: 20, step: 0.5,
    impact: { headcount: 120, costPerUnit: 180000, attritionPerUnit: -0.1 },
  },
  {
    id: 'salary-increase',
    name: 'Merit Increase Budget',
    description: 'Annual salary increase across all bands',
    current: 3.5, unit: '%', min: 0, max: 10, step: 0.5,
    impact: { headcount: 0, costPerUnit: 500000, attritionPerUnit: -0.8 },
  },
  {
    id: 'retention-prog',
    name: 'Retention Program Investment',
    description: 'Dedicated retention incentive spend',
    current: 0, unit: '$M', min: 0, max: 5, step: 0.25,
    impact: { headcount: 0, costPerUnit: 1000000, attritionPerUnit: -1.5 },
  },
  {
    id: 'overtime-cap',
    name: 'OT Cap (hrs/wk)',
    description: 'Maximum weekly overtime threshold',
    current: 40, unit: 'h', min: 35, max: 60, step: 1,
    impact: { headcount: 30, costPerUnit: 50000, attritionPerUnit: -0.3 },
  },
  {
    id: 'agency-use',
    name: 'Agency/Locum Usage',
    description: 'Agency staff as % of clinical workforce',
    current: 5, unit: '%', min: 0, max: 20, step: 0.5,
    impact: { headcount: -15, costPerUnit: 220000, attritionPerUnit: 0.05 },
  },
];

const SCENARIO_COLORS = ['#002f56', '#10b981', '#f97316', '#8b5cf6', '#ef4444'];
const FORECAST_YEARS = ['2026', '2027', '2028', '2029', '2030'];

const computeProjection = (levers: Lever[]) => {
  let headcount = 112500;
  let attritionRate = 8.7;
  let additionalCost = 0;

  levers.forEach(l => {
    const base = BASE_LEVERS.find(b => b.id === l.id)!;
    const delta = l.current - base.current;
    headcount    += delta * l.impact.headcount;
    attritionRate += delta * l.impact.attritionPerUnit;
    additionalCost += Math.abs(delta) * l.impact.costPerUnit;
  });

  return {
    headcount: Math.max(100000, Math.round(headcount)),
    attritionRate: Math.max(3, Math.round(attritionRate * 10) / 10),
    additionalCost: Math.round(additionalCost / 100000) / 10,
  };
};

const buildForecastData = (levers: Lever[], scenarioName: string) => {
  const { headcount, attritionRate } = computeProjection(levers);
  return FORECAST_YEARS.map((year, i) => ({
    year,
    [scenarioName]: Math.round(headcount * (1 + i * (levers.find(l => l.id === 'hiring-rate')!.current - attritionRate) / 200)),
    [`${scenarioName}_attrition`]: Math.max(3, attritionRate - i * 0.15),
  }));
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl min-w-[160px]">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 mt-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.stroke }} />
            <span className="text-xs text-slate-500">{p.name}</span>
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-white">
            {typeof p.value === 'number' && p.value > 10000 ? p.value.toLocaleString() : `${p.value?.toFixed(1)}%`}
          </span>
        </div>
      ))}
    </div>
  );
};

export const ScenarioCanvas: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode }) => {
  const [levers, setLevers] = useState<Lever[]>(JSON.parse(JSON.stringify(BASE_LEVERS)));
  const [scenarios, setScenarios] = useState<{
    name: string; color: string; data: any[]; levers: Lever[];
    projection: ReturnType<typeof computeProjection>;
  }[]>([]);
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [activeMetric, setActiveMetric] = useState<'headcount' | 'attrition'>('headcount');

  const updateLever = useCallback((id: string, val: number) => {
    setLevers(prev => prev.map(l => l.id === id ? { ...l, current: val } : l));
  }, []);

  const resetLevers = () => {
    setLevers(JSON.parse(JSON.stringify(BASE_LEVERS)));
  };

  // Live projection from current lever state
  const liveProjection = useMemo(() => computeProjection(levers), [levers]);
  const baseProjection = useMemo(() => computeProjection(BASE_LEVERS), []);

  const [tempScenario, setTempScenario] = useState<{name: string; color: string; data: any[]; projection: any} | null>(null);

  const runScenario = () => {
    setRunning(true);
    setTimeout(() => {
      const name = scenarioName.trim() || 'Unsaved Run';
      const color = '#0284c7'; // distinctive blue for unsaved
      const data = buildForecastData(levers, name);
      const projection = computeProjection(levers);
      setTempScenario({ name, color, data, projection });
      setRunning(false);
    }, 700);
  };

  const saveScenario = () => {
    const name = scenarioName.trim() || `Scenario ${scenarios.length + 1}`;
    const color = SCENARIO_COLORS[scenarios.length % SCENARIO_COLORS.length];
    const data = buildForecastData(levers, name);
    const projection = computeProjection(levers);
    setScenarios(prev => [...prev, { name, color, data, levers: JSON.parse(JSON.stringify(levers)), projection }]);
    setScenarioName('');
    setSavedFeedback(true);
    setTempScenario(null); // Clear temp run once saved
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const mergedData = FORECAST_YEARS.map((year, i) => {
    const pt: any = { year };
    scenarios.forEach(s => {
      if (activeMetric === 'headcount') {
        pt[s.name] = s.data[i]?.[s.name];
      } else {
        pt[s.name] = s.data[i]?.[`${s.name}_attrition`];
      }
    });
    if (tempScenario) {
      if (activeMetric === 'headcount') {
        pt[tempScenario.name] = tempScenario.data[i]?.[tempScenario.name];
      } else {
        pt[tempScenario.name] = tempScenario.data[i]?.[`${tempScenario.name}_attrition`];
      }
    }
    return pt;
  });

  const gridColor = isDarkMode ? '#1e293b' : '#f1f5f9';
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b';

  const headcountDelta = liveProjection.headcount - baseProjection.headcount;
  const attritionDelta = liveProjection.attritionRate - baseProjection.attritionRate;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <SectionGuide
        isAI
        title="Scenario Planner"
        description={`Model the workforce impact of strategic HR decisions across ${ORG_NAME}. Adjust levers, run named scenarios, and compare projections side-by-side.`}
        tips={['Adjust sliders to see live impact estimates', 'Name and save each scenario for side-by-side comparison']}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Levers panel ── */}
        <div className="space-y-4">
          {/* Live impact preview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Live Impact Estimate</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Real-time Projection</p>
                </div>
                <div className="relative group cursor-help ml-2 mt-1">
                  <HelpCircle size={16} className="text-slate-400 hover:text-blue-500 transition-colors" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-[10px] space-y-2 pointer-events-none">
                    <p><span className="font-bold text-blue-300">Headcount:</span> Current Base + (Hiring Rate Change × 120 roles/pct) - (Turnover Impact × Base).</p>
                    <p><span className="font-bold text-blue-300">Attrition Δ:</span> Estimated turnover reduction from comp/engagement programs.</p>
                    <p><span className="font-bold text-blue-300">Added Cost:</span> Includes direct salary changes + avg recruiting/onboarding costs per hire.</p>
                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-100 dark:border-slate-700 mb-4 divide-x divide-slate-200 dark:divide-slate-700">
              <div className="flex-1 text-center px-1">
                <p className={`text-lg font-extrabold ${liveProjection.headcount > baseProjection.headcount ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {liveProjection.headcount > baseProjection.headcount ? '+' : ''}{Math.round(liveProjection.headcount - baseProjection.headcount).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-widest">Headcount</p>
              </div>

              <div className="flex-1 text-center px-1">
                <p className={`text-lg font-extrabold ${liveProjection.attritionRate < baseProjection.attritionRate ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {liveProjection.attritionRate > baseProjection.attritionRate ? '+' : ''}{(liveProjection.attritionRate - baseProjection.attritionRate).toFixed(1)}%
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-widest">Attrition</p>
              </div>

              <div className="flex-1 text-center px-1">
                <p className="text-lg font-extrabold text-amber-500">
                  +${(liveProjection.additionalCost).toFixed(1)}M
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-widest">Added Cost</p>
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Strategic Levers</h3>
              <button
                onClick={resetLevers}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <div className="space-y-5">
              {levers.map(lever => {
                const base = BASE_LEVERS.find(b => b.id === lever.id)!;
                const changed = lever.current !== base.current;
                return (
                  <div key={lever.id}>
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="min-w-0">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block leading-tight">{lever.name}</label>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{lever.description}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className={`text-sm font-extrabold ${changed ? 'text-[#002f56] dark:text-blue-400' : 'text-slate-500'}`}>
                          {lever.current}{lever.unit}
                        </span>
                        {changed && (
                          <p className="text-[10px] text-slate-400 line-through">{base.current}{base.unit}</p>
                        )}
                      </div>
                    </div>
                    <input
                      type="range"
                      min={lever.min}
                      max={lever.max}
                      step={lever.step}
                      value={lever.current}
                      onChange={e => updateLever(lever.id, Number(e.target.value))}
                      className="w-full accent-[#002f56] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>{lever.min}{lever.unit}</span>
                      <span>{lever.max}{lever.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Name + save */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
              <input
                type="text"
                placeholder="Name this scenario (optional)"
                value={scenarioName}
                onChange={e => setScenarioName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={runScenario}
                  disabled={running}
                  className="w-1/2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-sm font-extrabold hover:bg-blue-200 dark:hover:bg-blue-900/60 disabled:opacity-60 transition-all shadow-sm"
                >
                  {running ? (
                    <><Sparkles size={14} className="animate-spin" /> Running...</>
                  ) : (
                    <><Play size={14} /> Run</>
                  )}
                </button>
                <button
                  onClick={saveScenario}
                  disabled={running}
                  className="w-1/2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#002f56] text-white text-sm font-extrabold hover:bg-[#003f73] disabled:opacity-60 transition-all shadow-md shadow-blue-900/20"
                >
                  {savedFeedback ? (
                    <><CheckCircle2 size={14} /> Saved!</>
                  ) : (
                    <><Save size={14} /> Save</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Saved scenarios list */}
          {scenarios.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">Saved Scenarios</h3>
              <div className="space-y-2">
                {scenarios.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block truncate">{s.name}</span>
                      <span className="text-[10px] text-slate-400">HC: {s.projection.headcount.toLocaleString()} · Attrition: {s.projection.attritionRate}%</span>
                    </div>
                    <button
                      onClick={() => setScenarios(prev => prev.filter((_, j) => j !== i))}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Chart panel ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Workforce Projection</h3>
                <p className="text-xs text-slate-400 mt-0.5">5-year forecast by scenario</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                  {(['headcount', 'attrition'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setActiveMetric(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        activeMetric === m ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {scenarios.length > 0 && (
                  <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl transition-all">
                    <Download size={12} /> Export
                  </button>
                )}
              </div>
            </div>

            {scenarios.length === 0 && !tempScenario ? (
              <div className="h-72 flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                  <Play size={24} className="text-slate-400 ml-1" />
                </div>
                <p className="font-bold text-slate-500 dark:text-slate-400">Run or save a scenario to view your projection</p>
                <p className="text-sm mt-1 text-slate-400">Projections will appear here for comparison</p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mergedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: tickColor, fontSize: 11 }}
                      tickFormatter={v => activeMetric === 'headcount' ? `${(v / 1000).toFixed(0)}k` : `${v?.toFixed(1)}%`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 8 }} />
                    {scenarios.map((s, i) => (
                      <Line
                        key={i}
                        type="monotone"
                        dataKey={s.name}
                        stroke={s.color}
                        strokeWidth={2.5}
                        dot={{ fill: s.color, r: 5, strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 7 }}
                      />
                    ))}
                    {tempScenario && (
                      <Line
                        type="monotone"
                        dataKey={tempScenario.name}
                        stroke={tempScenario.color}
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={{ fill: tempScenario.color, r: 5, strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 7 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Summary comparison cards */}
          {scenarios.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: 'Best-Case Headcount',
                  value: Math.max(...scenarios.map(s => s.projection.headcount)).toLocaleString(),
                  icon: Users,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                },
                {
                  label: 'Lowest Attrition',
                  value: `${Math.min(...scenarios.map(s => s.projection.attritionRate)).toFixed(1)}%`,
                  icon: TrendingDown,
                  color: 'text-blue-500',
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                },
                {
                  label: 'Max Added Cost',
                  value: `$${Math.max(...scenarios.map(s => s.projection.additionalCost)).toFixed(1)}M`,
                  icon: DollarSign,
                  color: 'text-amber-500',
                  bg: 'bg-amber-50 dark:bg-amber-900/20',
                },
              ].map((c, i) => (
                <div key={i} className={`${c.bg} rounded-2xl p-4 border border-slate-200 dark:border-slate-700 animate-fade-in`} style={{ animationDelay: `${i * 60}ms` }}>
                  <c.icon size={18} className={`${c.color} mb-2`} />
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">{c.value}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-tight">{c.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Scenario detail table */}
          {scenarios.length > 1 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Scenario Comparison</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                      <th className="text-left px-5 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Scenario</th>
                      <th className="text-right px-4 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Headcount</th>
                      <th className="text-right px-4 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Attrition</th>
                      <th className="text-right px-5 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Added Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {scenarios.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                            <span className="font-bold text-slate-700 dark:text-slate-300">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white font-mono">{s.projection.headcount.toLocaleString()}</td>
                        <td className={`px-4 py-3 text-right font-extrabold font-mono ${s.projection.attritionRate < baseProjection.attritionRate ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {s.projection.attritionRate.toFixed(1)}%
                        </td>
                        <td className="px-5 py-3 text-right font-extrabold text-amber-600 font-mono">${s.projection.additionalCost.toFixed(1)}M</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
