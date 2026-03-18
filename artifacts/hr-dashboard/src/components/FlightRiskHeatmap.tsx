import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, Info, Users, TrendingDown, Filter, Download, ArrowLeft } from 'lucide-react';
import { SectionGuide } from './SectionGuide';
import { ORG_NAME } from '../constants';

interface FlightRiskHeatmapProps { isDarkMode?: boolean; onBack?: () => void; }

const DEPARTMENTS = ['Emergency', 'ICU', 'Surgery', 'Geriatrics', 'Oncology', 'Orthopedics', 'Mental Health', 'Admin', 'Allied Health', 'Radiology'];
const FACTORS    = ['Compensation', 'Work-Life', 'Engagement', 'Career Dev', 'Workload', 'Management'];

const RISK_LEVELS: Record<string, { level: number; label: string }> = {
  'Emergency-Compensation': { level: 4, label: 'Critical' }, 'Emergency-Workload': { level: 5, label: 'Critical' },
  'Emergency-Work-Life': { level: 4, label: 'Critical' }, 'Emergency-Management': { level: 3, label: 'High' },
  'ICU-Compensation': { level: 4, label: 'Critical' }, 'ICU-Workload': { level: 4, label: 'Critical' },
  'ICU-Work-Life': { level: 3, label: 'High' }, 'ICU-Career Dev': { level: 2, label: 'Medium' },
  'Surgery-Compensation': { level: 3, label: 'High' }, 'Surgery-Workload': { level: 3, label: 'High' },
  'Geriatrics-Engagement': { level: 3, label: 'High' }, 'Geriatrics-Compensation': { level: 2, label: 'Medium' },
  'Oncology-Work-Life': { level: 3, label: 'High' }, 'Oncology-Engagement': { level: 3, label: 'High' },
  'Mental Health-Workload': { level: 4, label: 'Critical' }, 'Mental Health-Engagement': { level: 3, label: 'High' },
};

const LEVEL_COLORS = ['', 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700', 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700', 'bg-amber-100 dark:bg-amber-900/30 text-amber-700', 'bg-orange-200 dark:bg-orange-900/40 text-orange-800', 'bg-rose-200 dark:bg-rose-900/50 text-rose-800'];
const LEVEL_LABELS = ['', 'Low', 'Medium', 'High', 'Critical', 'Critical'];

const EMPLOYEES = [
  { id: 1, name: 'J. Martinez, RN', dept: 'Emergency', risk: 92, reason: 'Comp gap +OT overload', tenure: '5.2 yrs', action: 'Immediate retention discussion' },
  { id: 2, name: 'T. Chen, RN', dept: 'ICU', risk: 88, reason: 'Career ceiling, burnout', tenure: '3.8 yrs', action: 'Career pathway review' },
  { id: 3, name: 'A. Smith, RN', dept: 'Mental Health', risk: 85, reason: 'Workload & schedule', tenure: '2.1 yrs', action: 'Schedule adjustment' },
  { id: 4, name: 'D. Nguyen, LPN', dept: 'Emergency', risk: 81, reason: 'Compensation gap', tenure: '4.6 yrs', action: 'Comp review required' },
  { id: 5, name: 'K. Okonkwo, RT', dept: 'ICU', risk: 78, reason: 'Management conflict', tenure: '1.9 yrs', action: 'Mediation recommended' },
];

export const FlightRiskHeatmap: React.FC<FlightRiskHeatmapProps> = ({ isDarkMode, onBack }) => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ dept: string; factor: string } | null>(null);
  const [view, setView] = useState<'heatmap' | 'employees'>('heatmap');

  const cellKey = (d: string, f: string) => `${d}-${f}`;
  const risk = (d: string, f: string) => RISK_LEVELS[cellKey(d, f)] ?? { level: Math.floor(Math.random() * 2) + 1, label: 'Low' };

  const depts = selectedDept ? DEPARTMENTS.filter(d => d === selectedDept) : DEPARTMENTS;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white mb-4 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
      )}
      <SectionGuide isAI title="Flight Risk Intelligence" description="ML-powered risk heatmap predicting which departments and individuals have elevated attrition probability over the next 90 days. Hover cells for details." tips={['Red cells = critical risk — schedule immediate retention conversations', 'Filter by department to drill into individual employee risk profiles']} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Flight Risk Heatmap</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ORG_NAME} · Predictive model updated {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {(['heatmap', 'employees'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${view === v ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}>{v}</button>
            ))}
          </div>
          <button onClick={() => setSelectedDept(null)} className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${selectedDept ? 'bg-[#002f56] border-[#002f56] text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
            <Filter size={12} className="inline mr-1" /> {selectedDept ?? 'All Depts'}
          </button>
        </div>
      </div>

      {view === 'heatmap' ? (
        <>
          {/* Legend */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs text-slate-400 font-semibold">Risk Level:</span>
            {[1, 2, 3, 4, 5].map(l => (
              <span key={l} className={`text-[10px] font-extrabold px-2 py-1 rounded-lg ${LEVEL_COLORS[l]}`}>{LEVEL_LABELS[l]}</span>
            ))}
          </div>

          {/* Heatmap */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-widest w-36 border-b border-slate-100 dark:border-slate-700">Dept</th>
                  {FACTORS.map(f => (
                    <th key={f} className="text-center px-2 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">{f}</th>
                  ))}
                  <th className="text-center px-2 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">Overall</th>
                </tr>
              </thead>
              <tbody>
                {depts.map((dept, di) => {
                  const avgLevel = Math.round(FACTORS.reduce((acc, f) => acc + risk(dept, f).level, 0) / FACTORS.length);
                  return (
                    <tr key={dept} className={`${di % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-700/20'}`}>
                      <td className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/50">
                        <button onClick={() => setSelectedDept(selectedDept === dept ? null : dept)} className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-[#002f56] dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                          {dept} <ChevronRight size={12} className="opacity-40" />
                        </button>
                      </td>
                      {FACTORS.map(f => {
                        const r = risk(dept, f);
                        return (
                          <td key={f} className="text-center px-2 py-2.5 border-b border-slate-100 dark:border-slate-700/50">
                            <div
                              onMouseEnter={() => setHoveredCell({ dept, factor: f })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`inline-flex items-center justify-center w-10 h-8 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all hover:scale-110 hover:shadow-md ${LEVEL_COLORS[r.level]}`}
                            >
                              {r.label === 'Critical' ? <AlertTriangle size={12} /> : r.level}
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-center px-2 py-2.5 border-b border-slate-100 dark:border-slate-700/50">
                        <div className={`inline-flex items-center justify-center w-10 h-8 rounded-lg text-[10px] font-extrabold ${LEVEL_COLORS[avgLevel]}`}>
                          {avgLevel >= 4 ? <AlertTriangle size={12} /> : avgLevel}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">High-Risk Employees — Top 5</h3>
            <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl">
              <Download size={12} /> Export
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {EMPLOYEES.map(emp => (
              <div key={emp.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-extrabold ${emp.risk >= 90 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700' : emp.risk >= 80 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700'}`}>
                  {emp.risk}%
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-extrabold text-slate-800 dark:text-white text-sm truncate">{emp.name}</p>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full font-bold shrink-0">{emp.dept}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{emp.reason} · Tenure {emp.tenure}</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Action</p>
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
