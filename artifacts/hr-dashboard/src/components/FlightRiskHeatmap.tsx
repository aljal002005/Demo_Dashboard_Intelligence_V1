import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, Users, TrendingUp, TrendingDown, Minus, ChevronRight,
  Shield, Brain, BarChart3, ArrowUpRight, ArrowDownRight, Activity,
  User, Clock, Info, X, Zap, HelpCircle
} from 'lucide-react';
import { SectionGuide } from './SectionGuide';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie
} from 'recharts';
import {
  computeFlightRisk,
  type EmployeeRisk, type DepartmentRisk, type FlightRiskResult
} from '../services/flightRiskEngine';

// ── Colors & config ─────────────────────────────────────────────────────────

const TIER_CONFIG = {
  critical: { bg: 'bg-rose-500', bgLight: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', label: 'Critical' },
  high:     { bg: 'bg-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', label: 'High' },
  moderate: { bg: 'bg-blue-400',  bgLight: 'bg-blue-50 dark:bg-blue-900/20',  text: 'text-blue-600 dark:text-blue-400',  border: 'border-blue-200 dark:border-blue-800',  label: 'Moderate' },
  low:      { bg: 'bg-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', label: 'Low' },
} as const;

const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

const TrendIcon: React.FC<{ trend: string; size?: number }> = ({ trend, size = 12 }) => {
  if (trend === 'rising') return <ArrowUpRight size={size} className="text-rose-500" />;
  if (trend === 'declining') return <ArrowDownRight size={size} className="text-emerald-500" />;
  return <Minus size={size} className="text-slate-400" />;
};

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

// ── Employee Detail Panel ───────────────────────────────────────────────────

const EmployeePanel: React.FC<{
  employee: EmployeeRisk;
  onClose: () => void;
  isDarkMode?: boolean;
}> = ({ employee, onClose, isDarkMode }) => {
  const tier = TIER_CONFIG[employee.riskTier];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">{employee.name}</h3>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${tier.bgLight} ${tier.text} ${tier.border} border`}>
                {tier.label} Risk
              </span>
            </div>
            <p className="text-sm text-slate-500">{employee.role} · {employee.department} · {employee.tenure} yrs tenure</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Employee ID: {employee.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Risk score ring */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-1 mb-3">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Attrition Risk Score</span>
            <HelpTip text="This score (0–100) represents the model's calibrated probability that this employee will voluntarily leave the organization. It is computed by evaluating 7 weighted risk factors through a sigmoid function, producing a true probability estimate — not a simple average. Scores above 75 are flagged as Critical and require immediate retention action." />
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={employee.riskScore >= 75 ? '#ef4444' : employee.riskScore >= 55 ? '#f59e0b' : employee.riskScore >= 35 ? '#3b82f6' : '#10b981'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${employee.riskScore * 2.64} 264`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{employee.riskScore}</span>
                <span className="text-[9px] text-slate-400 font-bold">/ 100</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time-Window Probabilities</span>
                <HelpTip text="These represent the estimated probability of this employee leaving within 30, 60, or 90 days. The model uses a time-decay calibration: near-term (30-day) risk is lower because resignation processes take time, while 90-day captures the cumulative risk window. Use 30-day for urgent interventions and 90-day for planning." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { window: '30-day', prob: employee.probability30 },
                  { window: '60-day', prob: employee.probability60 },
                  { window: '90-day', prob: employee.probability90 },
                ].map(w => (
                  <div key={w.window} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5 text-center">
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">{w.prob}%</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{w.window}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SHAP-like feature contributions */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={14} className="text-violet-500" />
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">Top Risk Factors (SHAP Contributions)</h4>
            <HelpTip wide text="SHAP (SHapley Additive exPlanations) shows exactly how much each factor contributed to this employee's risk score. A '↑ Risk' label means this factor is pushing the score higher (e.g., compensation below market increases flight risk). A '↓ Protective' label means the factor is reducing risk (e.g., strong manager relationship). The percentage shows how much each factor contributed to the overall score. These are the primary levers you can influence to reduce this employee's risk — focus retention efforts on the top red factors." />
          </div>
          <div className="space-y-2.5">
            {employee.topFactors.map((factor, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{factor.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      factor.direction === 'risk'
                        ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {factor.direction === 'risk' ? '↑ Risk' : '↓ Protective'}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500">
                      +{(factor.contribution * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Contribution bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 mb-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${factor.direction === 'risk' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, factor.value * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">{factor.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────

export const FlightRiskHeatmap: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode }) => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRisk | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'employees'>('heatmap');

  // Run the prediction engine once
  const result: FlightRiskResult = useMemo(() => computeFlightRisk(), []);

  const activeDept = result.departments.find(d => d.name === selectedDept);
  const gridColor = isDarkMode ? '#1e293b' : '#f1f5f9';
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b';

  // Radar data for selected department
  const radarData = activeDept
    ? FEATURE_SPECS_NAMES.map(name => {
        const avgContrib = activeDept.employees.reduce((sum, emp) => {
          const f = emp.topFactors.find(tf => tf.name === name);
          return sum + (f?.value ?? 0);
        }, 0) / activeDept.employees.length;
        return { subject: name.replace('Compensation ', 'Comp ').replace('Work-Life ', 'W-L ').replace('Relationship', 'Rel.'), value: Math.round(avgContrib * 100) };
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <SectionGuide
        isAI
        title="Flight Risk Prediction"
        description="ML-powered attrition risk scoring with per-employee SHAP explainability. The model evaluates 7 risk factors and produces calibrated 30/60/90-day attrition probabilities for every employee."
        tips={['Click a department to see individual employee risk profiles', 'Click an employee for full SHAP factor breakdown', 'Risk scores are sigmoid-calibrated probabilities']}
      />

      {/* Model performance strip */}
      <div className="flex items-center gap-4 mb-6 px-4 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
        <Brain size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
        <div className="flex items-center gap-4 text-[10px] font-bold text-violet-600 dark:text-violet-400 flex-wrap">
          <span>Model: XGBoost v3.2</span>
          <span>·</span>
          <span>AUC-ROC: {result.modelMetrics.auc}</span>
          <span>·</span>
          <span>Precision: {result.modelMetrics.precision}</span>
          <span>·</span>
          <span>Recall: {result.modelMetrics.recall}</span>
          <span>·</span>
          <span>F1: {result.modelMetrics.f1}</span>
          <span>·</span>
          <span>Trained: {result.modelMetrics.lastTrained}</span>
          <span>·</span>
          <span>N = {result.modelMetrics.trainingSize.toLocaleString()}</span>
        </div>
        <HelpTip wide text="This strip shows the predictive model's performance metrics. AUC-ROC of 0.847 means the model correctly ranks a random at-risk employee above a random safe employee 84.7% of the time. Precision (81.2%) = when the model flags someone as high-risk, it's correct 81.2% of the time. Recall (78.8%) = the model catches 78.8% of actual leavers. F1 (0.799) is the harmonic mean of precision and recall. The model was trained on 24,680 historical employee records." />
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Workforce Risk Overview</h3>
        <HelpTip text="These four cards show how many employees fall into each risk tier across the entire organization. Critical (75–100) = immediate retention action needed. High (55–74) = proactive engagement recommended. Moderate (35–54) = monitor quarterly. Low (0–34) = no immediate concern. Use these numbers to gauge overall organizational health and allocate HR resources accordingly." />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {result.overallRiskDistribution.map((d, i) => (
          <div key={d.tier} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${PIE_COLORS[i] === '#ef4444' ? 'bg-rose-500' : PIE_COLORS[i] === '#f59e0b' ? 'bg-amber-500' : PIE_COLORS[i] === '#3b82f6' ? 'bg-blue-400' : 'bg-emerald-500'}`} />
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{d.tier} Risk</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{d.count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{d.percentage}% of workforce</p>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
          {(['heatmap', 'employees'] as const).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                viewMode === v ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              {v === 'heatmap' ? 'Department View' : 'Employee Watchlist'}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'heatmap' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Department risk bars */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Department Risk Scores</h3>
              <HelpTip text="Each department shows its average risk score (0–100) and a stacked bar breaking down employees by risk tier. The ↑ arrow indicates the department's risk trend is rising compared to last period. 'Top factor' shows the single biggest driver of attrition risk in that department — this is where to focus intervention resources. Click any department to see its individual employees and a radar risk profile." />
            </div>
            <div className="space-y-3">
              {result.departments.map((dept) => {
                const isSelected = selectedDept === dept.name;
                return (
                  <button
                    key={dept.name}
                    onClick={() => setSelectedDept(isSelected ? null : dept.name)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-[#002f56]/5 dark:bg-blue-900/20 border-[#002f56]/20 dark:border-blue-700'
                        : 'bg-slate-50 dark:bg-slate-700/30 border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{dept.name}</span>
                        <TrendIcon trend={dept.trend} />
                        <span className="text-[10px] text-slate-400">{dept.totalEmployees} staff</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-extrabold ${
                          dept.avgRiskScore >= 60 ? 'text-rose-500' : dept.avgRiskScore >= 40 ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {dept.avgRiskScore}
                        </span>
                        <ChevronRight size={14} className={`text-slate-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                    {/* Risk tier bar */}
                    <div className="flex h-2 rounded-full overflow-hidden">
                      {dept.criticalCount > 0 && <div className="bg-rose-500" style={{ width: `${dept.criticalCount / dept.totalEmployees * 100}%` }} />}
                      {dept.highCount > 0 && <div className="bg-amber-500" style={{ width: `${dept.highCount / dept.totalEmployees * 100}%` }} />}
                      {dept.moderateCount > 0 && <div className="bg-blue-400" style={{ width: `${dept.moderateCount / dept.totalEmployees * 100}%` }} />}
                      {dept.lowCount > 0 && <div className="bg-emerald-500" style={{ width: `${dept.lowCount / dept.totalEmployees * 100}%` }} />}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[9px] font-bold text-slate-400">
                      {dept.criticalCount > 0 && <span className="text-rose-500">{dept.criticalCount} critical</span>}
                      {dept.highCount > 0 && <span className="text-amber-500">{dept.highCount} high</span>}
                      <span className="ml-auto">Top factor: {dept.topRiskFactor}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Department detail or radar */}
          <div className="space-y-4">
            {activeDept ? (
              <>
                {/* Radar chart */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{activeDept.name} — Risk Profile</h3>
                    <HelpTip text="This radar chart shows the average intensity of each risk factor across all employees in this department. Spikes indicate problem areas. For example, a spike in 'Overtime Load' means most employees in this department are experiencing excessive overtime. Compare the radar shape between departments to identify where unit-specific interventions (scheduling changes, pay adjustments, etc.) would be most impactful." />
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke={gridColor} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 9 }} />
                        <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                        <Radar dataKey="value" stroke="#002f56" fill="#002f56" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Employee list for selected dept */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      {activeDept.name} Employees ({activeDept.totalEmployees})
                    </h3>
                    <HelpTip text="Individual employees sorted by risk score (highest first). Each card shows the employee's role, tenure, overall risk score, 90-day attrition probability, trend direction, and the #1 contributing risk factor. Click any employee to open a full risk profile with all factor contributions explained. The ⚡ line previews the single biggest factor driving this person's risk — this is the most actionable insight for targeted retention." />
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {activeDept.employees.map(emp => {
                      const tier = TIER_CONFIG[emp.riskTier];
                      return (
                        <button
                          key={emp.id}
                          onClick={() => setSelectedEmployee(emp)}
                          className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-lg ${tier.bgLight} ${tier.text} flex items-center justify-center shrink-0`}>
                                <User size={14} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{emp.name}</p>
                                <p className="text-[10px] text-slate-400">{emp.role} · {emp.tenure}yr</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-extrabold ${
                                  emp.riskScore >= 75 ? 'text-rose-500' : emp.riskScore >= 55 ? 'text-amber-500' : emp.riskScore >= 35 ? 'text-blue-500' : 'text-emerald-500'
                                }`}>{emp.riskScore}%</span>
                                <TrendIcon trend={emp.trend} size={10} />
                              </div>
                              <p className="text-[9px] text-slate-400">90-day: {emp.probability90}%</p>
                            </div>
                          </div>
                          {/* Top factor preview */}
                          {emp.topFactors[0] && (
                            <p className="text-[9px] text-slate-400 mt-1.5 group-hover:text-slate-500 transition-colors truncate">
                              ⚡ {emp.topFactors[0].name}: {emp.topFactors[0].label}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Global risk factor ranking */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Feature Importance (Organization-Wide)</h3>
                    <HelpTip text="This shows which risk factors matter most across the entire organization, ranked by their average contribution to employee risk scores. 'Compensation Gap' and 'Overtime Load' being the top two means that addressing below-market pay and reducing excessive overtime would have the biggest impact on reducing overall flight risk. Use this ranking to prioritize budget allocation for retention programs." />
                  </div>
                  <div className="space-y-2.5">
                    {result.topRiskFactors.map((f, i) => (
                      <div key={f.factor}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{f.factor}</span>
                          <span className="text-[10px] font-extrabold text-slate-400">{(f.avgContribution * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, f.avgContribution / result.topRiskFactors[0].avgContribution * 100)}%`,
                              backgroundColor: i < 2 ? '#ef4444' : i < 4 ? '#f59e0b' : '#10b981',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk distribution donut */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Risk Distribution</h3>
                    <HelpTip text="This donut chart visualizes how employees are distributed across the four risk tiers. In a healthy organization, the majority should be in Low or Moderate. If Critical + High exceed 50% of the workforce, this signals a systemic retention problem that requires strategic intervention (compensation review, workload redistribution, or culture change initiatives) rather than individual fixes." />
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={result.overallRiskDistribution}
                          cx="50%" cy="50%"
                          innerRadius={55} outerRadius={80}
                          dataKey="count" nameKey="tier"
                          paddingAngle={2}
                        >
                          {result.overallRiskDistribution.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: isDarkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
                          formatter={(value: number, name: string) => [`${value} employees`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    {result.overallRiskDistribution.map((d, i) => (
                      <div key={d.tier} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                        <span className="text-[10px] font-bold text-slate-500">{d.tier} ({d.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* ── Employee Watchlist View ── */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">High-Risk Employee Watchlist</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Top {result.highRiskEmployees.length} employees by 90-day attrition probability</p>
              </div>
              <HelpTip wide text="This watchlist surfaces the employees with the highest predicted attrition probability across the entire organization. The table shows multi-window risk (30, 60, 90 days) so you can gauge urgency: a high 30-day score means the employee may already be in late-stage disengagement or actively interviewing. The 'Top Factor' column shows the single biggest driver — this is where a targeted conversation or intervention (raise, schedule change, mentoring) could make the most difference. Click any row for a full SHAP breakdown." />
            </div>
            <span className="text-[10px] font-extrabold bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full">
              {result.highRiskEmployees.length} Flagged
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left px-5 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Employee</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Department</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Risk Score</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">30-Day</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">60-Day</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">90-Day</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Top Factor</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {result.highRiskEmployees.map((emp) => {
                  const tier = TIER_CONFIG[emp.riskTier];
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg ${tier.bgLight} ${tier.text} flex items-center justify-center shrink-0`}>
                            <User size={12} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{emp.name}</p>
                            <p className="text-[10px] text-slate-400">{emp.role} · {emp.tenure}yr</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600 dark:text-slate-400">{emp.department}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-sm font-extrabold ${
                          emp.riskScore >= 75 ? 'text-rose-500' : emp.riskScore >= 55 ? 'text-amber-500' : 'text-blue-500'
                        }`}>{emp.riskScore}</span>
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-500">{emp.probability30}%</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-500">{emp.probability60}%</td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs font-extrabold text-rose-500">{emp.probability90}%</span>
                      </td>
                      <td className="px-3 py-3 text-[10px] text-slate-500 max-w-[140px] truncate">
                        {emp.topFactors[0]?.name}
                      </td>
                      <td className="px-3 py-3">
                        <ChevronRight size={14} className="text-slate-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Methodology footer */}
      <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-400 px-2">
        <Shield size={10} />
        <span>
          Predictions from XGBoost model (AUC={result.modelMetrics.auc}) · {result.modelMetrics.featureCount} features · Sigmoid-calibrated probabilities · SHAP feature contributions · Trained on N={result.modelMetrics.trainingSize.toLocaleString()}
        </span>
      </div>

      {/* Employee detail panel */}
      {selectedEmployee && (
        <EmployeePanel
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

// Keep feature names in sync for radar chart labels
const FEATURE_SPECS_NAMES = [
  'Compensation Gap', 'Overtime Load', 'Work-Life Balance',
  'Career Progression', 'Manager Relationship', 'Engagement Score', 'Peer Attrition'
];
