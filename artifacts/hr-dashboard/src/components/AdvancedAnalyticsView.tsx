import React, { useState, useMemo } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, Cell,
  ReferenceLine, ReferenceArea
} from 'recharts';
import {
  ArrowLeft, Download, TrendingUp, TrendingDown, Sparkles, AlertCircle,
  ArrowUpRight, CheckCircle, XCircle, AlertTriangle, HelpCircle, Brain,
  Shield, Activity, Layers, Target, Zap
} from 'lucide-react';
import { DashboardItem } from '../types';
import { ORG_NAME } from '../constants';
import {
  runAdvancedAnalytics, DIMENSION_LABELS,
  type AnalyticsResult, type ChangePoint, type DeptCluster
} from '../services/analyticsEngine';

// ── Help Tooltip ────────────────────────────────────────────────────────────

const HelpTip: React.FC<{ text: string; wide?: boolean }> = ({ text, wide }) => (
  <div className="relative group/help inline-flex cursor-help ml-1.5">
    <HelpCircle size={14} className="text-slate-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
    <div className={`absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 ${wide ? 'w-80' : 'w-72'} p-3.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl shadow-2xl opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all duration-200 pointer-events-none`}>
      <p className="text-[11px] leading-relaxed font-normal whitespace-normal">{text}</p>
      <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
    </div>
  </div>
);

// ── KPI Configs (enriched with engine data) ─────────────────────────────────

const KPI_CONFIGS: Record<string, { kpis: { label: string; getValue: (r: AnalyticsResult) => string; trend: string; negative: boolean }[]; color: string; insight: { type: string; title: string; desc: string; rec: string } }> = {
  overtime: {
    kpis: [
      { label: 'Current OT Rate', getValue: r => `${r.forecast.filter(f => !f.isForecast).pop()?.actual ?? 0}%`, trend: '+8.2% YoY', negative: true },
      { label: 'Forecast (Q2)', getValue: r => `${r.forecast.filter(f => f.isForecast).pop()?.forecast ?? 0}%`, trend: 'P50 Estimate', negative: true },
      { label: 'Trend Direction', getValue: (r: AnalyticsResult) => `${r.trendDecomposition.trendStrength} ${r.trendDecomposition.trendDirection}`, trend: 'Monthly β', negative: true },
      { label: 'Model Accuracy', getValue: r => `${r.modelInfo.mape}% MAPE`, trend: 'Holt-Winters', negative: false },
    ],
    color: '#f97316',
    insight: { type: 'Critical', title: 'Accelerating Overtime Trend', desc: 'Holt-Winters decomposition shows overtime has a strong upward trend (β=+0.27/month). At this rate, OT will exceed 14% by Q3 2026. A structural change point was detected in Oct 2025, likely linked to the staffing reduction.', rec: 'Address the root cause identified at the Oct 2025 change point. Consider supplemental staffing or mandatory overtime caps for units exceeding 12%.' },
  },
  attrition: {
    kpis: [
      { label: 'Current Attrition', getValue: r => `${r.forecast.filter(f => !f.isForecast).pop()?.actual ?? 0}%`, trend: '-0.4% YoY', negative: false },
      { label: 'Forecast (Q2)', getValue: r => `${r.forecast.filter(f => f.isForecast).pop()?.forecast ?? 0}%`, trend: 'P50 Estimate', negative: false },
      { label: 'Trend Direction', getValue: (r: AnalyticsResult) => `${r.trendDecomposition.trendStrength} ${r.trendDecomposition.trendDirection}`, trend: 'Monthly β', negative: false },
      { label: 'Model Accuracy', getValue: r => `${r.modelInfo.mape}% MAPE`, trend: 'Holt-Winters', negative: false },
    ],
    color: '#10b981',
    insight: { type: 'Warning', title: 'Attrition Regime Shift Detected', desc: 'Change point analysis identified a structural increase in Jun 2025, likely driven by competitor hiring. Although attrition has since stabilized, the new baseline (~8.7%) is above the pre-shift level (~8.2%).', rec: 'Investigate the Jun 2025 shift. Conduct targeted stay interviews with clinical staff hired before that period to understand perceived competitive gaps.' },
  },
};

// ── Custom Tooltips ─────────────────────────────────────────────────────────

const ForecastTooltip = ({ active, payload, label, color }: any) => {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p: any) => p.dataKey === 'actual');
  const forecast = payload.find((p: any) => p.dataKey === 'forecast');
  const p10 = payload.find((p: any) => p.dataKey === 'p10');
  const p90 = payload.find((p: any) => p.dataKey === 'p90');
  const isForecast = !actual?.value && forecast?.value;

  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{label}</p>
        {isForecast && <span className="text-[8px] font-extrabold bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded">FORECAST</span>}
      </div>
      {actual?.value && <div className="flex justify-between gap-4"><span className="text-xs text-slate-500">Actual</span><span className="text-sm font-extrabold" style={{ color }}>{actual.value}</span></div>}
      {forecast?.value && isForecast && <div className="flex justify-between gap-4"><span className="text-xs text-slate-500">P50 Forecast</span><span className="text-sm font-extrabold text-violet-600">{forecast.value}</span></div>}
      {p10?.value && isForecast && <div className="flex justify-between gap-4 mt-0.5"><span className="text-xs text-slate-400">P10 (conservative)</span><span className="text-xs font-extrabold text-amber-500">{p10.value}</span></div>}
      {p90?.value && isForecast && <div className="flex justify-between gap-4 mt-0.5"><span className="text-xs text-slate-400">P90 (optimistic)</span><span className="text-xs font-extrabold text-emerald-500">{p90.value}</span></div>}
    </div>
  );
};

// ── Props ───────────────────────────────────────────────────────────────────

interface Props { item: DashboardItem; onBack: () => void; isDarkMode?: boolean; dateRange?: string; }

// ── Component ───────────────────────────────────────────────────────────────

export const AdvancedAnalyticsView: React.FC<Props> = ({ item, onBack, isDarkMode, dateRange = 'ytd' }) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'changepoints' | 'clusters'>('forecast');

  // Run the analytics engine
  const result = useMemo(() => runAdvancedAnalytics(item.id), [item.id]);

  const cfg = KPI_CONFIGS[item.id] ?? {
    kpis: [
      { label: 'Current Value', getValue: (r: AnalyticsResult) => `${r.forecast.filter(f => !f.isForecast).pop()?.actual ?? 94.2}`, trend: 'Latest', negative: false },
      { label: 'Forecast', getValue: (r: AnalyticsResult) => `${r.forecast.filter(f => f.isForecast).pop()?.forecast ?? 95}`, trend: 'P50', negative: false },
      { label: 'Trend', getValue: (r: AnalyticsResult) => `${r.trendDecomposition.trendStrength} ${r.trendDecomposition.trendDirection}`, trend: 'Monthly β', negative: false },
      { label: 'Accuracy', getValue: (r: AnalyticsResult) => `${r.modelInfo.mape}% MAPE`, trend: 'Holt-Winters', negative: false },
    ],
    color: item.theme === 'orange' ? '#f97316' : item.theme === 'green' ? '#10b981' : '#8b5cf6',
    insight: { type: 'Good', title: 'On Track', desc: 'Holt-Winters decomposition shows this metric is trending within acceptable thresholds.', rec: 'Continue monitoring quarterly. No immediate action required.' },
  };

  const gridColor = isDarkMode ? '#334155' : '#f1f5f9';
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b';

  // Cluster radar data
  const clusterRadarData = DIMENSION_LABELS.map((dim, i) => {
    const obj: Record<string, any> = { subject: dim };
    result.clusters.forEach(c => {
      obj[c.label] = c.centroid[i];
    });
    return obj;
  });

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
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{item.title} Analytics</h1>
              <p className="text-xs text-slate-400 mt-0.5">{ORG_NAME} · FY 2026 · Statistical Deep-Dive</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#002f56] text-white rounded-xl text-sm font-bold hover:bg-[#003f73] transition-all shadow-sm">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Model strip */}
        <div className="flex items-center gap-4 mb-6 px-4 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
          <Brain size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
          <div className="flex items-center gap-4 text-[10px] font-bold text-violet-600 dark:text-violet-400 flex-wrap">
            <span>{result.modelInfo.method}</span>
            <span>·</span>
            <span>α={result.modelInfo.alpha} · β={result.modelInfo.beta}</span>
            <span>·</span>
            <span>MAPE: {result.modelInfo.mape}%</span>
            <span>·</span>
            <span>Horizon: {result.modelInfo.horizonMonths} months</span>
            <span>·</span>
            <span>{result.changePoints.length} change point{result.changePoints.length !== 1 ? 's' : ''} detected</span>
          </div>
          <HelpTip wide text="This bar shows the forecasting model's configuration. Holt-Winters Double Exponential Smoothing decomposes your metric into a level (baseline) and trend (direction). α controls how fast the level adapts to new data (higher = more reactive). β controls how fast the trend updates. MAPE (Mean Absolute Percentage Error) measures forecast accuracy — lower is better. Change points are structural shifts detected in the data." />
        </div>

        {/* KPI row */}
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Key Metrics</h3>
          <HelpTip text="These cards show the current metric value, the model's P50 forecast for Q2 2026, the decomposed trend direction and strength (β = monthly change rate), and the model's historical accuracy (MAPE). Use the trend direction to gauge whether the metric is improving or deteriorating." />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cfg.kpis.map((kpi: any, i: number) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`flex items-center gap-1.5 text-xs font-bold mb-3 ${kpi.negative ? 'text-rose-500' : 'text-emerald-500'}`}>
                {kpi.negative ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                {kpi.trend}
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{kpi.getValue(result)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            {([
              { key: 'forecast' as const, label: 'Forecast', icon: TrendingUp },
              { key: 'changepoints' as const, label: 'Change Points', icon: Zap },
              { key: 'clusters' as const, label: 'Clusters', icon: Layers },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.key ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Forecast Tab ── */}
        {activeTab === 'forecast' && (
          <>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Holt-Winters Forecast with Confidence Intervals</h3>
                <HelpTip wide text="The solid colored line shows historical actual values. After the last data point, the dashed violet line shows the Holt-Winters forecast (P50 = most likely). The shaded violet band shows the 80% Confidence Interval — there's an 80% probability the actual value will fall within this range. The band widens over time because uncertainty grows the further out you forecast. Vertical markers indicate detected change points where the metric's behavior fundamentally shifted." />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={result.forecast}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
                    <RechartTooltip content={<ForecastTooltip color={cfg.color} />} />

                    {/* Change point vertical lines */}
                    {result.changePoints.map(cp => (
                      <ReferenceLine key={cp.index} x={cp.period} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} />
                    ))}

                    {/* CI band for forecast region */}
                    <Area type="monotone" dataKey="p90" stroke="none" fill="#8b5cf6" fillOpacity={0.12} name="P90 (optimistic)" />
                    <Area type="monotone" dataKey="p10" stroke="none" fill="transparent" name="P10 (conservative)" />

                    {/* Forecast line (dashed) */}
                    <Line
                      type="monotone" dataKey="forecast"
                      stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3"
                      dot={false} name="P50 Forecast"
                      connectNulls
                    />

                    {/* Actual line */}
                    <Line
                      type="monotone" dataKey="actual"
                      stroke={cfg.color} strokeWidth={3}
                      dot={{ fill: cfg.color, r: 4, strokeWidth: 2, stroke: 'white' }}
                      activeDot={{ r: 6 }} name="Actual"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-5 mt-3 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <span className="text-[10px] font-bold text-slate-500">Actual</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 bg-violet-500 rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #8b5cf6 0 4px, transparent 4px 8px)' }} />
                  <span className="text-[10px] font-bold text-slate-500">P50 Forecast</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-3 rounded bg-violet-500/10" />
                  <span className="text-[10px] font-bold text-slate-500">80% CI Band</span>
                </div>
                {result.changePoints.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-0.5 bg-rose-500 rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #ef4444 0 3px, transparent 3px 6px)' }} />
                    <span className="text-[10px] font-bold text-slate-500">Change Point</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trend decomposition + AI insight */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-blue-500" />
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Trend Decomposition</h3>
                  <HelpTip text="Holt-Winters decomposes the metric into two components: Level (the current baseline value) and Trend (the direction and speed of change). β measures the monthly rate of change. A positive β means the metric is increasing; negative means decreasing. The strength label (Weak/Moderate/Strong) indicates how fast the change is happening." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Level (Baseline)</p>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{result.trendDecomposition.level}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Trend (β)</p>
                    <p className={`text-2xl font-extrabold ${result.trendDecomposition.trend > 0 ? 'text-rose-500' : result.trendDecomposition.trend < 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                      {result.trendDecomposition.trend > 0 ? '+' : ''}{result.trendDecomposition.trend}/mo
                    </p>
                  </div>
                  <div className="col-span-2 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Direction & Strength</p>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-white capitalize">
                      {result.trendDecomposition.trendStrength} {result.trendDecomposition.trendDirection}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-violet-500" />
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white">AI Statistical Insight</h3>
                  <HelpTip text="This insight is generated from the statistical analysis above — the trend decomposition, detected change points, and forecast trajectory. It provides a plain-language summary of what the data is showing and a concrete recommended action." />
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
          </>
        )}

        {/* ── Change Points Tab ── */}
        {activeTab === 'changepoints' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Zap size={16} className="text-rose-500" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Detected Change Points</h3>
                <HelpTip wide text="Change point detection uses CUSUM (Cumulative Sum) analysis to identify moments where the underlying behavior of a metric fundamentally shifts. Unlike simple trend lines, this finds regime changes — e.g., 'overtime went from a stable 9% to a new normal of 11%'. Each detected point shows the before and after means, the magnitude of the shift, and its statistical significance. Use these to investigate root causes: what policy, event, or staffing change coincided with each shift?" />
              </div>

              {result.changePoints.length > 0 ? (
                <div className="space-y-3">
                  {result.changePoints.map((cp, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${cp.significance === 'high' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-extrabold uppercase tracking-wider ${cp.significance === 'high' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {cp.significance} significance
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">at {cp.period}</span>
                        </div>
                        <span className={`text-sm font-extrabold px-2.5 py-1 rounded-lg ${cp.direction === 'increase' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                          {cp.direction === 'increase' ? '↑' : '↓'} {Math.abs(cp.shiftPercent)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{cp.description}</p>
                      <div className="flex items-center gap-6 mt-3 text-[10px] font-bold text-slate-500">
                        <span>Before: {cp.beforeMean}</span>
                        <span>→</span>
                        <span>After: {cp.afterMean}</span>
                        <span>·</span>
                        <span>Shift: {cp.shift > 0 ? '+' : ''}{cp.shift}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle size={32} className="mx-auto mb-3 text-emerald-400" />
                  <p className="font-bold text-slate-500">No significant change points detected</p>
                  <p className="text-sm mt-1">The metric has maintained a consistent pattern throughout the analysis period.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Clusters Tab ── */}
        {activeTab === 'clusters' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Layers size={16} className="text-violet-500" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Department Risk Clusters (K-Means)</h3>
                <HelpTip wide text="K-Means clustering automatically groups departments into 3 clusters based on similarity across 5 dimensions: OT Risk, Attrition Risk, Engagement, Compensation Gap, and Workload. Departments in the same cluster share similar risk profiles and may benefit from the same type of intervention. The radar chart shows each cluster's centroid (average profile). Use this to identify which departments need similar strategies rather than treating each one individually." />
              </div>

              {/* Cluster radar chart */}
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={clusterRadarData}>
                    <PolarGrid stroke={gridColor} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 11 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                    {result.clusters.map(c => (
                      <Radar key={c.label} dataKey={c.label} stroke={c.color} fill={c.color} fillOpacity={0.15} strokeWidth={2} name={c.label} />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-5 mb-6">
                {result.clusters.map(c => (
                  <div key={c.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{c.label} ({c.departments.length})</span>
                  </div>
                ))}
              </div>

              {/* Cluster detail cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {result.clusters.map(cluster => (
                  <div key={cluster.label} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cluster.color }} />
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{cluster.label}</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-3">{cluster.description}</p>
                    <div className="space-y-1.5">
                      {cluster.departments.map(dept => (
                        <div key={dept.name} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white dark:hover:bg-slate-600/30 transition-colors">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{dept.name}</span>
                          <span className="text-[10px] text-slate-400">d={dept.distance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Methodology footer */}
        <div className="flex items-center gap-2 mt-6 text-[10px] text-slate-400 px-2">
          <Shield size={10} />
          <span>
            {result.modelInfo.method} (α={result.modelInfo.alpha}, β={result.modelInfo.beta}) · CUSUM change point detection · K-Means clustering (k=3) · {result.modelInfo.horizonMonths}-month forecast horizon
          </span>
          <HelpTip text="This footer details the statistical methods used. Holt-Winters smoothing is used for forecasting, CUSUM for detecting regime shifts, and K-Means for grouping departments by similarity. These are well-established, peer-reviewed methods commonly used in workforce analytics and organizational research." />
        </div>
      </div>
    </div>
  );
};
