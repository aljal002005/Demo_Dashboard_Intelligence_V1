import React, { useState } from 'react';
import {
  AlertTriangle, ChevronRight, Download,
  ArrowLeft, Activity, TrendingDown, Users, Zap
} from 'lucide-react';
import { SectionGuide } from './SectionGuide';
import { ORG_NAME } from '../constants';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell, Legend
} from 'recharts';

interface FlightRiskHeatmapProps { isDarkMode?: boolean; onBack?: () => void; }

const DEPARTMENTS = [
  'Emergency', 'ICU', 'Surgery', 'Geriatrics', 'Oncology',
  'Mental Health', 'Orthopedics', 'Allied Health', 'Radiology', 'Admin'
];
const FACTORS = ['Compensation', 'Work-Life', 'Engagement', 'Career Dev', 'Workload', 'Management'];

const RISK_MATRIX: Record<string, Record<string, number>> = {
  Emergency:    { Compensation: 82, 'Work-Life': 78, Engagement: 55, 'Career Dev': 48, Workload: 91, Management: 62 },
  ICU:          { Compensation: 79, 'Work-Life': 70, Engagement: 60, 'Career Dev': 55, Workload: 88, Management: 58 },
  Surgery:      { Compensation: 65, 'Work-Life': 58, Engagement: 52, 'Career Dev': 60, Workload: 72, Management: 45 },
  Geriatrics:   { Compensation: 55, 'Work-Life': 50, Engagement: 70, 'Career Dev': 42, Workload: 52, Management: 40 },
  Oncology:     { Compensation: 58, 'Work-Life': 72, Engagement: 68, 'Career Dev': 48, Workload: 62, Management: 44 },
  'Mental Health': { Compensation: 60, 'Work-Life': 65, Engagement: 55, 'Career Dev': 50, Workload: 85, Management: 55 },
  Orthopedics:  { Compensation: 48, 'Work-Life': 42, Engagement: 45, 'Career Dev': 38, Workload: 55, Management: 35 },
  'Allied Health': { Compensation: 52, 'Work-Life': 48, Engagement: 58, 'Career Dev': 60, Workload: 50, Management: 40 },
  Radiology:    { Compensation: 45, 'Work-Life': 42, Engagement: 40, 'Career Dev': 45, Workload: 48, Management: 32 },
  Admin:        { Compensation: 38, 'Work-Life': 35, Engagement: 42, 'Career Dev': 35, Workload: 38, Management: 30 },
};

const deptOverall = (dept: string) =>
  Math.round(Object.values(RISK_MATRIX[dept] ?? {}).reduce((a, b) => a + b, 0) / FACTORS.length);

const DEPT_SCORES = DEPARTMENTS.map(d => ({
  dept: d, score: deptOverall(d),
})).sort((a, b) => b.score - a.score);

const riskColor = (score: number) => {
  if (score >= 80) return '#ef4444';
  if (score >= 65) return '#f97316';
  if (score >= 50) return '#f59e0b';
  if (score >= 35) return '#84cc16';
  return '#22c55e';
};

const riskLabel = (score: number) => {
  if (score >= 80) return 'Critical';
  if (score >= 65) return 'High';
  if (score >= 50) return 'Medium';
  if (score >= 35) return 'Low';
  return 'Minimal';
};

const cellBg = (score: number) => {
  if (score >= 80) return 'bg-rose-500/90 text-white';
  if (score >= 65) return 'bg-orange-400/90 text-white';
  if (score >= 50) return 'bg-amber-300/90 text-amber-900';
  if (score >= 35) return 'bg-lime-200 text-lime-900 dark:bg-lime-900/40 dark:text-lime-300';
  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
};

const EMPLOYEES = [
  { id: 1, name: 'J. Martinez, RN',  dept: 'Emergency',    risk: 92, reason: 'Compensation gap + OT overload',  tenure: '5.2 yrs', action: 'Immediate retention discussion' },
  { id: 2, name: 'T. Chen, RN',      dept: 'ICU',          risk: 88, reason: 'Career ceiling & burnout',         tenure: '3.8 yrs', action: 'Career pathway review' },
  { id: 3, name: 'A. Smith, RN',     dept: 'Mental Health', risk: 85, reason: 'Workload & schedule conflict',     tenure: '2.1 yrs', action: 'Schedule adjustment' },
  { id: 4, name: 'D. Nguyen, LPN',   dept: 'Emergency',    risk: 81, reason: 'Below-market compensation',        tenure: '4.6 yrs', action: 'Comp review required' },
  { id: 5, name: 'K. Okonkwo, RT',   dept: 'ICU',          risk: 78, reason: 'Management relationship issues',   tenure: '1.9 yrs', action: 'Mediation recommended' },
];

type View = 'overview' | 'heatmap' | 'employees';

const RadarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl text-xs">
      <p className="font-extrabold text-slate-700 dark:text-slate-200">{payload[0]?.payload?.factor}</p>
      <p className="text-rose-500 font-bold mt-0.5">Risk score: {payload[0]?.value}</p>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const score = payload[0]?.value;
  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl text-xs min-w-[130px]">
      <p className="font-extrabold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      <p style={{ color: riskColor(score) }} className="font-bold">Risk: {score} — {riskLabel(score)}</p>
    </div>
  );
};

export const FlightRiskHeatmap: React.FC<FlightRiskHeatmapProps> = ({ isDarkMode, onBack }) => {
  const [selectedDept, setSelectedDept] = useState<string>('Emergency');
  const [view, setView] = useState<View>('overview');
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#1e293b' : '#f1f5f9';

  const radarData = FACTORS.map(f => ({
    factor: f,
    score: RISK_MATRIX[selectedDept]?.[f] ?? 30,
  }));



  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white mb-4 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
      )}
      <SectionGuide
        isAI
        title="Flight Risk Intelligence"
        description="ML-powered predictive model showing which departments and individuals carry the highest attrition risk over the next 90 days."
        tips={['Red bars/cells indicate critical risk — schedule immediate retention actions', 'Click a department name to drill into its risk radar']}
      />

      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Flight Risk Intelligence</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ORG_NAME} · Predictive model · Last updated {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {(['overview', 'heatmap', 'employees'] as View[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                view === v ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview ── */}
      {view === 'overview' && (
        <div className="space-y-6">
          {/* Summary KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Depts at Critical Risk', value: DEPT_SCORES.filter(d => d.score >= 80).length, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { label: 'High-Risk Employees', value: EMPLOYEES.filter(e => e.risk >= 80).length, icon: Users, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
              { label: 'Avg System Risk Score', value: `${Math.round(DEPT_SCORES.reduce((a, d) => a + d.score, 0) / DEPT_SCORES.length)}/100`, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { label: 'Priority Actions', value: 8, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            ].map((c, i) => (
              <div key={i} className={`${c.bg} rounded-2xl p-5 border border-slate-200 dark:border-slate-700`}>
                <c.icon size={18} className={`${c.color} mb-2`} />
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{c.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-tight">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Bar chart + Radar side by side */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Department risk bar chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Departments by Risk Score</h3>
                <p className="text-xs text-slate-400 mt-0.5">Overall composite risk (0–100) · Click a bar to explore</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEPT_SCORES} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                    <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 10 }} />
                    <YAxis
                      type="category"
                      dataKey="dept"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: tickColor, fontSize: 11, fontWeight: 600 }}
                      width={90}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} onClick={d => { setSelectedDept(d.dept); }}>
                      {DEPT_SCORES.map((d, i) => (
                        <Cell key={i} fill={riskColor(d.score)} fillOpacity={selectedDept === d.dept ? 1 : 0.75} cursor="pointer" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Risk legend */}
              <div className="flex flex-wrap gap-3 mt-3">
                {[
                  { label: 'Critical ≥80', color: '#ef4444' },
                  { label: 'High ≥65', color: '#f97316' },
                  { label: 'Medium ≥50', color: '#f59e0b' },
                  { label: 'Low <50', color: '#84cc16' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-[10px] font-semibold text-slate-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar chart for selected dept */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Risk Factor Breakdown</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <span className="font-bold" style={{ color: riskColor(deptOverall(selectedDept)) }}>{selectedDept}</span>
                    {' '}· Overall: {deptOverall(selectedDept)}/100 ({riskLabel(deptOverall(selectedDept))})
                  </p>
                </div>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="text-xs font-bold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 outline-none"
                >
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={gridColor} />
                    <PolarAngleAxis
                      dataKey="factor"
                      tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip content={<RadarTooltip />} />
                    <Radar
                      dataKey="score"
                      stroke={riskColor(deptOverall(selectedDept))}
                      fill={riskColor(deptOverall(selectedDept))}
                      fillOpacity={0.25}
                      strokeWidth={2}
                      dot={{ fill: riskColor(deptOverall(selectedDept)), r: 4, strokeWidth: 0 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {/* Factor scores list */}
              <div className="space-y-1.5 mt-2">
                {radarData.sort((a, b) => b.score - a.score).slice(0, 3).map(f => (
                  <div key={f.factor} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">{f.factor}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${f.score}%`, backgroundColor: riskColor(f.score) }} />
                      </div>
                      <span className="font-extrabold w-8 text-right" style={{ color: riskColor(f.score) }}>{f.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top at-risk employees preview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Highest-Risk Individuals</h3>
                <p className="text-xs text-slate-400 mt-0.5">Top 5 · Immediate action recommended</p>
              </div>
              <button
                onClick={() => setView('employees')}
                className="text-xs font-bold text-[#002f56] dark:text-blue-400 hover:underline"
              >
                View all →
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {EMPLOYEES.map(emp => (
                <div key={emp.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  {/* Risk gauge */}
                  <div className="relative w-12 h-12 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke={isDarkMode ? '#334155' : '#f1f5f9'} strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15" fill="none"
                        stroke={riskColor(emp.risk)}
                        strokeWidth="3"
                        strokeDasharray={`${emp.risk * 0.942} 94.2`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold" style={{ color: riskColor(emp.risk) }}>
                      {emp.risk}%
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-slate-800 dark:text-white text-sm truncate">{emp.name}</p>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full font-bold shrink-0">{emp.dept}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{emp.reason} · Tenure: {emp.tenure}</p>
                  </div>
                  <div className="text-right hidden md:block shrink-0">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Action</p>
                    <p className="text-xs font-bold text-[#002f56] dark:text-blue-400">{emp.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Heatmap ── */}
      {view === 'heatmap' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-400 font-semibold">Risk Level:</span>
            {[
              { label: 'Critical ≥80', color: 'bg-rose-500 text-white' },
              { label: 'High ≥65', color: 'bg-orange-400 text-white' },
              { label: 'Medium ≥50', color: 'bg-amber-300 text-amber-900' },
              { label: 'Low <50', color: 'bg-lime-200 text-lime-900' },
            ].map(l => (
              <span key={l.label} className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${l.color}`}>{l.label}</span>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-widest w-40 border-b border-slate-100 dark:border-slate-700">Department</th>
                  {FACTORS.map(f => (
                    <th key={f} className="text-center px-3 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">{f}</th>
                  ))}
                  <th className="text-center px-3 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">Overall</th>
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.map((dept, di) => {
                  const overall = deptOverall(dept);
                  return (
                    <tr key={dept} className={di % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-700/10' : ''}>
                      <td className="px-5 py-3 border-b border-slate-100 dark:border-slate-700/50">
                        <button
                          onClick={() => { setSelectedDept(dept); setView('overview'); }}
                          className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-[#002f56] dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                        >
                          {dept} <ChevronRight size={12} className="opacity-40" />
                        </button>
                      </td>
                      {FACTORS.map(f => {
                        const score = RISK_MATRIX[dept]?.[f] ?? 30;
                        return (
                          <td key={f} className="text-center px-2 py-2.5 border-b border-slate-100 dark:border-slate-700/50">
                            <div className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all hover:scale-110 hover:shadow-md ${cellBg(score)}`}>
                              {score >= 80 ? <AlertTriangle size={12} /> : score}
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-center px-2 py-2.5 border-b border-slate-100 dark:border-slate-700/50">
                        <div className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-[10px] font-extrabold ${cellBg(overall)}`}>
                          {overall >= 80 ? <AlertTriangle size={12} /> : overall}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Employees ── */}
      {view === 'employees' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">High-Risk Employees</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ranked by 90-day attrition probability · Immediate action required</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl">
              <Download size={12} /> Export
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {EMPLOYEES.map(emp => (
              <div key={emp.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke={isDarkMode ? '#334155' : '#f1f5f9'} strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15" fill="none"
                      stroke={riskColor(emp.risk)}
                      strokeWidth="3"
                      strokeDasharray={`${emp.risk * 0.942} 94.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold" style={{ color: riskColor(emp.risk) }}>
                    {emp.risk}%
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-extrabold text-slate-800 dark:text-white truncate">{emp.name}</p>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full font-bold shrink-0">{emp.dept}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${emp.risk >= 90 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' : emp.risk >= 80 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                      {riskLabel(emp.risk)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{emp.reason} · Tenure: {emp.tenure}</p>
                  <div className="mt-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${emp.risk}%`, backgroundColor: riskColor(emp.risk) }} />
                  </div>
                </div>
                <div className="text-right hidden md:block shrink-0 ml-2">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Recommended Action</p>
                  <p className="text-xs font-bold text-[#002f56] dark:text-blue-400">{emp.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
