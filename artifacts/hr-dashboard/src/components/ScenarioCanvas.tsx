import React, { useState, useCallback, useMemo } from 'react';
import {
  Play, RotateCcw, Download, TrendingUp, TrendingDown,
  DollarSign, Users, Sparkles, Trash2, Save, CheckCircle2, HelpCircle,
  BarChart3, Activity, Shield, Zap
} from 'lucide-react';
import { SectionGuide } from './SectionGuide';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar, Cell, ReferenceLine
} from 'recharts';
import { ORG_NAME } from '../constants';
import {
  runMonteCarloSimulation, BASE_LEVERS, MC_ITERATIONS,
  type SimulationLever, type SimulationResult, type SensitivityItem
} from '../services/monteCarloEngine';

const SCENARIO_COLORS = ['#002f56', '#10b981', '#f97316', '#8b5cf6', '#ef4444'];

// ── Help Tooltip Component ──────────────────────────────────────────────────

const HelpTip: React.FC<{ text: string; wide?: boolean }> = ({ text, wide }) => (
  <div className="relative group/help inline-flex cursor-help ml-1.5">
    <HelpCircle size={14} className="text-slate-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
    <div className={`absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 ${wide ? 'w-80' : 'w-72'} p-3.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl shadow-2xl opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all duration-200 pointer-events-none`}>
      <p className="text-[11px] leading-relaxed font-normal whitespace-normal">{text}</p>
      <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
    </div>
  </div>
);

// ── Tooltips ────────────────────────────────────────────────────────────────

const FanChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const p10 = payload.find((p: any) => p.dataKey?.includes('p10'));
  const p50 = payload.find((p: any) => p.dataKey?.includes('p50'));
  const p90 = payload.find((p: any) => p.dataKey?.includes('p90'));
  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl min-w-[180px]">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      {p90 && <div className="flex justify-between gap-4"><span className="text-xs text-slate-400">P90 (optimistic)</span><span className="text-xs font-extrabold text-emerald-500">{typeof p90.value === 'number' && p90.value > 1000 ? p90.value.toLocaleString() : `${p90.value}%`}</span></div>}
      {p50 && <div className="flex justify-between gap-4 mt-0.5"><span className="text-xs text-slate-500 font-bold">P50 (most likely)</span><span className="text-sm font-extrabold text-slate-800 dark:text-white">{typeof p50.value === 'number' && p50.value > 1000 ? p50.value.toLocaleString() : `${p50.value}%`}</span></div>}
      {p10 && <div className="flex justify-between gap-4 mt-0.5"><span className="text-xs text-slate-400">P10 (conservative)</span><span className="text-xs font-extrabold text-amber-500">{typeof p10.value === 'number' && p10.value > 1000 ? p10.value.toLocaleString() : `${p10.value}%`}</span></div>}
    </div>
  );
};

// ── Component ───────────────────────────────────────────────────────────────

export const ScenarioCanvas: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode }) => {
  const [levers, setLevers] = useState<SimulationLever[]>(JSON.parse(JSON.stringify(BASE_LEVERS)));
  const [scenarios, setScenarios] = useState<{
    name: string; color: string; result: SimulationResult; levers: SimulationLever[];
  }[]>([]);
  const [running, setRunning] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [activeMetric, setActiveMetric] = useState<'headcount' | 'attrition'>('headcount');
  const [activeView, setActiveView] = useState<'forecast' | 'sensitivity'>('forecast');
  const [tempResult, setTempResult] = useState<{ name: string; result: SimulationResult } | null>(null);

  // Live preview (deterministic for instant feedback)
  const liveProjection = useMemo(() => {
    let hcDelta = 0;
    let attrDelta = 0;
    let costDelta = 0;
    for (const lever of levers) {
      const base = BASE_LEVERS.find(b => b.id === lever.id)!;
      const delta = lever.current - base.current;
      hcDelta += delta * lever.impact.headcountPerUnit;
      attrDelta += delta * lever.impact.attritionPerUnit;
      costDelta += Math.abs(delta) * lever.impact.costPerUnit;
    }
    return {
      headcount: Math.round(hcDelta),
      attrition: Math.round(attrDelta * 10) / 10,
      cost: Math.round(costDelta / 100000) / 10,
    };
  }, [levers]);

  const updateLever = useCallback((id: string, val: number) => {
    setLevers(prev => prev.map(l => l.id === id ? { ...l, current: val } : l));
  }, []);

  const resetLevers = () => setLevers(JSON.parse(JSON.stringify(BASE_LEVERS)));

  const runSimulation = () => {
    setRunning(true);
    // Use requestAnimationFrame to allow UI to show spinner before heavy computation
    requestAnimationFrame(() => {
      setTimeout(() => {
        const name = scenarioName.trim() || 'Unsaved Run';
        const result = runMonteCarloSimulation(levers);
        setTempResult({ name, result });
        setRunning(false);
      }, 50);
    });
  };

  const saveScenario = () => {
    const name = scenarioName.trim() || `Scenario ${scenarios.length + 1}`;
    const color = SCENARIO_COLORS[scenarios.length % SCENARIO_COLORS.length];
    const result = tempResult?.result ?? runMonteCarloSimulation(levers);
    setScenarios(prev => [...prev, { name, color, result, levers: JSON.parse(JSON.stringify(levers)) }]);
    setScenarioName('');
    setSavedFeedback(true);
    setTempResult(null);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  // Active result to display
  const displayResult = tempResult?.result ?? (scenarios.length > 0 ? scenarios[scenarios.length - 1].result : null);

  // Build fan chart data
  const fanChartData = displayResult
    ? displayResult[activeMetric === 'headcount' ? 'headcount' : 'attrition'].yearlyForecast.map(yf => ({
        year: yf.year,
        p10: yf.p10,
        p50: yf.p50,
        p90: yf.p90,
      }))
    : [];

  // Sensitivity tornado data
  const tornadoData = displayResult?.sensitivity ?? [];

  const gridColor = isDarkMode ? '#1e293b' : '#f1f5f9';
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <SectionGuide
        isAI
        title="Monte Carlo Scenario Planner"
        description={`Model workforce impact with stochastic simulation. Each scenario runs ${MC_ITERATIONS.toLocaleString()} Monte Carlo iterations to produce probabilistic forecasts with confidence intervals.`}
        tips={['Adjust sliders, then click Run to execute simulation', 'Fan charts show P10/P50/P90 confidence bands', 'Save scenarios to compare side-by-side']}
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Deterministic Preview</p>
                </div>
                <HelpTip text="This panel gives you an instant, rough estimate of how your lever adjustments will affect headcount, attrition, and cost. It uses a simple linear calculation for speed. To get a scientifically rigorous forecast with uncertainty ranges and confidence intervals, click 'Run Simulation' — this will execute 5,000 Monte Carlo iterations using triangular probability distributions for each lever." />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-100 dark:border-slate-700 mb-4 divide-x divide-slate-200 dark:divide-slate-700">
              <div className="flex-1 text-center px-1">
                <p className={`text-lg font-extrabold ${liveProjection.headcount > 0 ? 'text-emerald-500' : liveProjection.headcount < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {liveProjection.headcount > 0 ? '+' : ''}{liveProjection.headcount.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-widest">Headcount</p>
              </div>
              <div className="flex-1 text-center px-1">
                <p className={`text-lg font-extrabold ${liveProjection.attrition < 0 ? 'text-emerald-500' : liveProjection.attrition > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {liveProjection.attrition > 0 ? '+' : ''}{liveProjection.attrition}%
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-widest">Attrition</p>
              </div>
              <div className="flex-1 text-center px-1">
                <p className="text-lg font-extrabold text-amber-500">+${liveProjection.cost.toFixed(1)}M</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-widest">Added Cost</p>
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Strategic Levers</h3>
                <HelpTip wide text="These are the workforce planning variables you can adjust to model different strategic scenarios. Each lever has a built-in uncertainty range (shown as ±% below the slider) which the Monte Carlo engine uses to create a triangular probability distribution — the simulation randomly samples from this range across 5,000 iterations. This captures real-world unpredictability: e.g., if you set hiring rate to 12%, the actual outcome could vary between 10–14% depending on market conditions." />
              </div>
              <button onClick={resetLevers} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
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
                        {changed && <p className="text-[10px] text-slate-400 line-through">{base.current}{base.unit}</p>}
                      </div>
                    </div>
                    <input
                      type="range"
                      min={lever.min} max={lever.max} step={lever.step}
                      value={lever.current}
                      onChange={e => updateLever(lever.id, Number(e.target.value))}
                      className="w-full accent-[#002f56] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>{lever.min}{lever.unit}</span>
                      <span className="text-[9px] text-slate-300 dark:text-slate-600">±{Math.round(lever.volatility * 100)}% uncertainty</span>
                      <span>{lever.max}{lever.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Name + run/save */}
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
                  onClick={runSimulation}
                  disabled={running}
                  className="w-1/2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-sm font-extrabold hover:bg-blue-200 dark:hover:bg-blue-900/60 disabled:opacity-60 transition-all shadow-sm"
                >
                  {running ? (
                    <><Sparkles size={14} className="animate-spin" /> Simulating...</>
                  ) : (
                    <><Play size={14} /> Run ({(MC_ITERATIONS / 1000).toFixed(0)}K iter)</>
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

          {/* Saved scenarios */}
          {scenarios.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
              <div className="flex items-center gap-1 mb-3">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Saved Scenarios</h3>
                <HelpTip text="Each saved scenario captures a complete snapshot of your lever settings and the resulting Monte Carlo simulation output. Save multiple scenarios (e.g., 'Aggressive Hiring', 'Cost Reduction', 'Status Quo') to compare them side-by-side in the comparison table below. This enables evidence-based decision-making by showing how different strategies lead to different probabilistic outcomes." />
              </div>
              <div className="space-y-2">
                {scenarios.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block truncate">{s.name}</span>
                      <span className="text-[10px] text-slate-400">
                        HC P50: {s.result.headcount.p50.toLocaleString()} · Attr: {s.result.attrition.p50}%
                      </span>
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

        {/* ── Results panel ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                    {activeView === 'forecast' ? 'Probabilistic Forecast' : 'Sensitivity Analysis'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeView === 'forecast'
                      ? '5-year projection · P10/P50/P90 confidence bands'
                      : 'Impact of ±1 step change per lever'
                    }
                  </p>
                </div>
                {activeView === 'forecast' ? (
                  <HelpTip wide text="This fan chart shows 5-year workforce projections from the Monte Carlo simulation. The solid blue line (P50) is the most probable outcome — the median across 5,000 simulated scenarios. The green dashed line (P90) is the optimistic boundary — 90% of simulations fell below this. The amber dashed line (P10) is the conservative boundary — only 10% of simulations fell below this. The shaded region between P10 and P90 is the 80% Confidence Interval — there's an 80% chance the actual outcome falls within this band. The wider the band, the more uncertainty exists." />
                ) : (
                  <HelpTip wide text="This tornado chart shows how much each individual lever impacts the projected headcount when changed by ±1 step from its current setting. Bars are ordered by impact magnitude — the top bars are the levers that matter most. Use this to prioritize which workforce strategies to invest in: if 'Hiring Rate' shows the largest bar, then hiring decisions will have the biggest influence on your workforce projections. This is a one-at-a-time sensitivity analysis — each lever is tested independently." />
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                  {(['forecast', 'sensitivity'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setActiveView(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        activeView === v ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      {v === 'forecast' ? 'Fan Chart' : 'Tornado'}
                    </button>
                  ))}
                </div>
                {activeView === 'forecast' && (
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
                )}
              </div>
            </div>

            {!displayResult ? (
              <div className="h-80 flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                  <Play size={24} className="text-slate-400 ml-1" />
                </div>
                <p className="font-bold text-slate-500 dark:text-slate-400">Run a simulation to see probabilistic forecast</p>
                <p className="text-sm mt-1 text-slate-400">Adjust levers and click Run ({(MC_ITERATIONS / 1000).toFixed(0)}K iterations)</p>
              </div>
            ) : activeView === 'forecast' ? (
              /* ── Fan Chart ── */
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fanChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
                    <YAxis
                      axisLine={false} tickLine={false}
                      tick={{ fill: tickColor, fontSize: 11 }}
                      tickFormatter={v => activeMetric === 'headcount' ? `${(v / 1000).toFixed(0)}k` : `${v}%`}
                    />
                    <Tooltip content={<FanChartTooltip />} />
                    {/* P10-P90 band */}
                    <defs>
                      <linearGradient id="fanGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#002f56" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#002f56" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone" dataKey="p90" stackId="1"
                      stroke="none" fill="url(#fanGradient)"
                      name="P90 (optimistic)"
                    />
                    <Area
                      type="monotone" dataKey="p10" stackId="2"
                      stroke="none" fill="transparent"
                      name="P10 (conservative)"
                    />
                    {/* P10 line */}
                    <Area
                      type="monotone" dataKey="p10"
                      stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4"
                      fill="none" dot={false} name="P10 (conservative)"
                    />
                    {/* P50 median line */}
                    <Area
                      type="monotone" dataKey="p50"
                      stroke="#002f56" strokeWidth={3}
                      fill="none"
                      dot={{ fill: '#002f56', r: 5, strokeWidth: 2, stroke: 'white' }}
                      activeDot={{ r: 7 }}
                      name="P50 (most likely)"
                    />
                    {/* P90 line */}
                    <Area
                      type="monotone" dataKey="p90"
                      stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4"
                      fill="none" dot={false} name="P90 (optimistic)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              /* ── Tornado / Sensitivity Chart ── */
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tornadoData} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 10 }} />
                    <YAxis
                      type="category" dataKey="lever"
                      axisLine={false} tickLine={false}
                      tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
                      width={140}
                    />
                    <Tooltip
                      contentStyle={{ background: isDarkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="impactOnHeadcount" name="Headcount impact (FTE)" radius={[0, 6, 6, 0]}>
                      {tornadoData.map((item, i) => (
                        <Cell key={i} fill={i < 2 ? '#ef4444' : i < 4 ? '#f97316' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Legend for fan chart */}
            {displayResult && activeView === 'forecast' && (
              <div className="flex items-center gap-5 mt-3 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 bg-[#002f56] rounded-full" />
                  <span className="text-[10px] font-bold text-slate-500">P50 Median</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 bg-[#10b981] rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #10b981 0 4px, transparent 4px 8px)' }} />
                  <span className="text-[10px] font-bold text-slate-500">P90 Optimistic</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 bg-[#f59e0b] rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0 4px, transparent 4px 8px)' }} />
                  <span className="text-[10px] font-bold text-slate-500">P10 Conservative</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-3 rounded bg-[#002f56]/10" />
                  <span className="text-[10px] font-bold text-slate-500">80% CI Band</span>
                </div>
              </div>
            )}
          </div>

          {/* Monte Carlo result summary cards */}
          {displayResult && (
            <div className="grid grid-cols-3 gap-4">
              {/* Summary cards header */}
              <div className="col-span-3 flex items-center gap-1 -mb-2">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Simulation Results</span>
                <HelpTip wide text="These cards summarize the simulation output. P50 is the median (most likely) outcome. The 80% CI range shows the band within which the actual result has an 80% probability of falling. For budgeting, use P50 as your planning target. For risk management, use P10 (conservative) as your downside scenario and P90 (optimistic) as your upside. If the CI range is wide, it means there's significant uncertainty — consider running scenarios with narrower lever settings to reduce forecast spread." />
              </div>
              {[
                {
                  label: 'Headcount (P50)',
                  value: displayResult.headcount.p50.toLocaleString(),
                  range: `${displayResult.headcount.p10.toLocaleString()} – ${displayResult.headcount.p90.toLocaleString()}`,
                  ci: '80% CI',
                  icon: Users,
                  color: 'text-blue-500',
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                },
                {
                  label: 'Attrition (P50)',
                  value: `${displayResult.attrition.p50}%`,
                  range: `${displayResult.attrition.p10}% – ${displayResult.attrition.p90}%`,
                  ci: '80% CI',
                  icon: Activity,
                  color: displayResult.attrition.p50 < 8.7 ? 'text-emerald-500' : 'text-rose-500',
                  bg: displayResult.attrition.p50 < 8.7 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20',
                },
                {
                  label: 'Added Cost (P50)',
                  value: `$${displayResult.cost.p50}M`,
                  range: `$${displayResult.cost.p10}M – $${displayResult.cost.p90}M`,
                  ci: '80% CI',
                  icon: DollarSign,
                  color: 'text-amber-500',
                  bg: 'bg-amber-50 dark:bg-amber-900/20',
                },
              ].map((c, i) => (
                <div key={i} className={`${c.bg} rounded-2xl p-4 border border-slate-200 dark:border-slate-700 animate-fade-in`} style={{ animationDelay: `${i * 60}ms` }}>
                  <c.icon size={18} className={`${c.color} mb-2`} />
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{c.value}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-tight">{c.label}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-[9px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md">{c.ci}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{c.range}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Simulation metadata */}
          {displayResult && (
            <div className="flex items-center gap-2 text-[10px] text-slate-400 px-2">
              <Shield size={10} />
              <span>Monte Carlo simulation · {MC_ITERATIONS.toLocaleString()} iterations · Triangular distributions · Correlated hiring-attrition dynamics</span>
              <HelpTip text="This footer describes the simulation methodology. Monte Carlo runs 5,000 random scenarios. Triangular distributions model each lever's uncertainty (min/mode/max). Correlated dynamics means hiring increases can trigger higher attrition (realistic talent market behavior). These methods are industry-standard for workforce planning under uncertainty." />
            </div>
          )}

          {/* Scenario comparison table */}
          {scenarios.length > 1 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Scenario Comparison</h3>
                <HelpTip wide text="This table lets you compare all saved scenarios side-by-side. HC P10/P50/P90 show the headcount range for each scenario. Compare P50 values across scenarios to see which strategy produces the best expected outcome, and compare CI widths (P10 vs P90 spread) to see which strategy carries the most risk. A scenario with a high P50 but very wide CI may be attractive on average but carries significant downside risk." />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                      <th className="text-left px-5 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Scenario</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">HC P10</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">HC P50</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">HC P90</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Attrition</th>
                      <th className="text-right px-5 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Cost P50</th>
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
                        <td className="px-3 py-3 text-right font-mono text-slate-500">{s.result.headcount.p10.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right font-extrabold font-mono text-slate-900 dark:text-white">{s.result.headcount.p50.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right font-mono text-slate-500">{s.result.headcount.p90.toLocaleString()}</td>
                        <td className={`px-3 py-3 text-right font-extrabold font-mono ${s.result.attrition.p50 < 8.7 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {s.result.attrition.p50}%
                        </td>
                        <td className="px-5 py-3 text-right font-extrabold text-amber-600 font-mono">${s.result.cost.p50}M</td>
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
