import React, { useState } from 'react';
import { FileText, Download, Sparkles, CheckCircle, Clock, Users, TrendingUp, AlertTriangle, BarChart3, Loader2 } from 'lucide-react';
import { REPORT_DATA } from '../data/mockData';
import { ORG_NAME } from '../constants';
import { SectionGuide } from './SectionGuide';

interface ReportGeneratorViewProps { isDarkMode?: boolean; }

const REPORT_TYPES = [
  { id: 'executive-summary', label: 'Executive Summary', icon: BarChart3, desc: 'High-level workforce overview for board presentations' },
  { id: 'overtime', label: 'Overtime Deep-Dive', icon: Clock, desc: 'Detailed OT cost, distribution and risk analysis' },
  { id: 'attrition', label: 'Attrition Report', icon: TrendingUp, desc: 'Turnover trends, risk factors and retention insights' },
  { id: 'workforce', label: 'Workforce Snapshot', icon: Users, desc: 'Headcount, vacancies, classification breakdown' },
];

export const ReportGeneratorView: React.FC<ReportGeneratorViewProps> = ({ isDarkMode }) => {
  const [selectedType, setSelectedType] = useState('executive-summary');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [dateRange, setDateRange] = useState('ytd');
  const [includeAI, setIncludeAI] = useState(true);

  const report = REPORT_DATA[selectedType] ?? REPORT_DATA['executive-summary'];

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1800);
  };

  const handleExport = () => {
    const content = [
      `${ORG_NAME} — ${REPORT_TYPES.find(r => r.id === selectedType)?.label}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      'EXECUTIVE SUMMARY',
      report.summary,
      '',
      'KEY FACTORS',
      ...report.keyFactors.map(f => `• ${f}`),
      '',
      'RECOMMENDATION',
      report.recommendation,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType}-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
      <SectionGuide
        title="Report Generator"
        description="Select a report type, configure your parameters, and generate a formatted report with AI-enhanced insights. Reports can be exported as PDF or CSV."
        tips={['Choose Executive Summary for board-ready one-pagers', 'Enable AI Insights for Gemini-powered narrative analysis']}
      />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Config panel */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">Report Type</h3>
            <div className="space-y-2">
              {REPORT_TYPES.map(rt => {
                const Icon = rt.icon;
                const active = selectedType === rt.id;
                return (
                  <button key={rt.id} onClick={() => { setSelectedType(rt.id); setGenerated(false); }}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${active ? 'bg-[#002f56] border-[#002f56] text-white' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300'}`}
                  >
                    <Icon size={16} className={`shrink-0 mt-0.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <div>
                      <p className={`text-xs font-extrabold ${active ? 'text-white' : ''}`}>{rt.label}</p>
                      <p className={`text-[10px] mt-0.5 leading-tight ${active ? 'text-blue-200' : 'text-slate-400'}`}>{rt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Parameters</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5">Date Range</label>
              <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm rounded-xl p-2.5 outline-none text-slate-700 dark:text-slate-200">
                <option value="ytd">Year to Date</option>
                <option value="q4">Q4 2025</option>
                <option value="q3">Q3 2025</option>
                <option value="fy">Full Year FY 2025</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-5 rounded-full transition-all ${includeAI ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'} relative`} onClick={() => setIncludeAI(a => !a)}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${includeAI ? 'left-5' : 'left-0.5'}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Include AI Insights</p>
                <p className="text-[10px] text-slate-400">Gemini-powered narrative</p>
              </div>
            </label>
            <button onClick={handleGenerate} disabled={generating}
              className="w-full py-2.5 rounded-xl bg-[#002f56] text-white text-sm font-extrabold hover:bg-[#003f73] disabled:opacity-60 transition-all shadow-md shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate Report</>}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="md:col-span-2">
          {!generated && !generating && (
            <div className="h-full flex flex-col items-center justify-center py-24 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
              <FileText size={48} className="mb-4 opacity-30" />
              <p className="font-bold">Select a report type and click Generate</p>
              <p className="text-sm mt-1">Your report preview will appear here</p>
            </div>
          )}
          {generating && (
            <div className="h-full flex flex-col items-center justify-center py-24 animate-fade-in">
              <Loader2 size={40} className="animate-spin text-[#002f56] dark:text-blue-400 mb-4" />
              <p className="font-bold text-slate-600 dark:text-slate-300">Generating your report...</p>
              <p className="text-sm text-slate-400 mt-1">Analyzing data and applying AI insights</p>
            </div>
          )}
          {generated && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-scale-in">
              {/* Report header */}
              <div className="bg-gradient-to-r from-[#001e38] to-[#002f56] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1">{ORG_NAME}</p>
                    <h2 className="text-lg font-extrabold">{REPORT_TYPES.find(r => r.id === selectedType)?.label}</h2>
                    <p className="text-xs text-blue-200 mt-1">Generated {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all border border-white/20">
                    <Download size={14} /> Export
                  </button>
                </div>
              </div>

              {/* KPIs */}
              {report.kpis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-slate-100 dark:border-slate-700">
                  {report.kpis.map((kpi, i) => (
                    <div key={i} className="text-center">
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpi.value}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">{kpi.label}</p>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg mt-1 inline-block ${kpi.status === 'critical' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : kpi.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                        {kpi.change}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Body */}
              <div className="p-6 space-y-5">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-white mb-2">Executive Summary</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{report.summary}</p>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-white mb-2">Key Factors</h4>
                  <ul className="space-y-2">
                    {report.keyFactors.map((f, i) => (
                      <li key={i} className={`flex items-start gap-2 text-sm p-3 rounded-xl ${f.toLowerCase().startsWith('risk') ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'}`}>
                        {f.toLowerCase().startsWith('risk') ? <AlertTriangle size={13} className="shrink-0 mt-0.5" /> : <CheckCircle size={13} className="shrink-0 mt-0.5" />}
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                {includeAI && (
                  <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
                      <span className="text-xs font-extrabold text-violet-700 dark:text-violet-300 uppercase tracking-wider">AI Strategic Recommendation</span>
                    </div>
                    <p className="text-sm text-violet-800 dark:text-violet-300 leading-relaxed">{report.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
