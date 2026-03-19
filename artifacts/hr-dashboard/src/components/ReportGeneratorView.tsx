import React, { useState } from 'react';
import {
  FileText, Download, Sparkles, CheckCircle, AlertTriangle,
  Loader2, BarChart3, Clock, TrendingUp, Users, Briefcase, Brain, HelpCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { REPORT_DATA } from '../data/mockData';
import { ORG_NAME } from '../constants';

interface ReportGeneratorViewProps { isDarkMode?: boolean; }

const TIME_PERIODS = [
  { id: 'last-month', label: 'Last Month' },
  { id: 'q2-2025', label: 'Q2 2025' },
  { id: 'ytd', label: 'YTD' },
];

const TEMPLATES = [
  { id: 'monthly-ops', label: 'Monthly Ops', modules: '5 modules', reportId: 'overtime', accent: false },
  { id: 'quarterly-review', label: 'Quarterly Review', modules: '6 modules', reportId: 'attrition', accent: false },
  { id: 'recruitment', label: 'Recruitment', modules: '5 modules', reportId: 'time-to-fill', accent: false },
  { id: 'full-brief', label: 'Full Brief', modules: 'All modules', reportId: 'executive-summary', accent: true },
];

const SECTIONS = [
  { id: 'overtime', label: 'Overtime', icon: Clock },
  { id: 'attrition', label: 'Attrition', icon: TrendingUp },
  { id: 'headcount', label: 'Headcount', icon: Users },
  { id: 'vacancies', label: 'Vacancies', icon: Briefcase },
  { id: 'engagement', label: 'Engagement', icon: Brain },
  { id: 'executive-summary', label: 'Executive Summary', icon: BarChart3 },
];

export const ReportGeneratorView: React.FC<ReportGeneratorViewProps> = ({ isDarkMode }) => {
  const [timePeriod, setTimePeriod] = useState('ytd');
  const [preparedFor, setPreparedFor] = useState('Executive Leadership Team');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>(['executive-summary', 'overtime', 'attrition']);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [includeAI, setIncludeAI] = useState(true);
  const [activeReportId, setActiveReportId] = useState('executive-summary');

  const report = REPORT_DATA[activeReportId] ?? REPORT_DATA['executive-summary'];

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setSelectedTemplate(t.id);
    setActiveReportId(t.reportId);
    setGenerated(false);
  };

  const toggleSection = (id: string) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
    setGenerated(false);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1600);
  };

  const handleExport = () => {
    const content = [
      `${ORG_NAME} — ${preparedFor}`,
      `Period: ${TIME_PERIODS.find(t => t.id === timePeriod)?.label}`,
      `Generated: ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      '',
      '=== EXECUTIVE SUMMARY ===',
      report.summary,
      '',
      '=== KEY FACTORS ===',
      ...report.keyFactors.map(f => `• ${f}`),
      '',
      '=== RECOMMENDATION ===',
      report.recommendation,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `briefing-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const periodLabel = TIME_PERIODS.find(t => t.id === timePeriod)?.label ?? 'YTD';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
        <div className="mb-7">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Report Builder</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5">Configure your executive briefing below.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* ── Left config panel ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Report Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Report Settings</p>

              <div className="mb-5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Time Period</label>
                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900">
                  {TIME_PERIODS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setTimePeriod(t.id); setGenerated(false); }}
                      className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                        timePeriod === t.id
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Prepared For</label>
                <input
                  type="text"
                  value={preparedFor}
                  onChange={e => { setPreparedFor(e.target.value); setGenerated(false); }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
                />
              </div>
            </div>

            {/* Quick Templates */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Quick Templates</p>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      selectedTemplate === t.id
                        ? t.accent
                          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                    }`}
                  >
                    <p className={`text-sm font-extrabold ${
                      selectedTemplate === t.id && t.accent ? 'text-emerald-700 dark:text-emerald-400'
                      : selectedTemplate === t.id ? 'text-blue-700 dark:text-blue-400'
                      : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {t.label}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t.modules}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Include Sections</p>
              <div className="space-y-1.5">
                {SECTIONS.map(s => {
                  const active = selectedSections.includes(s.id);
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSection(s.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        active
                          ? 'bg-[#002f56]/5 dark:bg-blue-900/20 text-[#002f56] dark:text-blue-400'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${active ? 'bg-[#002f56] dark:bg-blue-500 border-[#002f56] dark:border-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {active && <CheckCircle size={10} className="text-white" />}
                      </div>
                      <Icon size={13} className="shrink-0" />
                      <span className="text-xs font-semibold">{s.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${includeAI ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    onClick={() => setIncludeAI(a => !a)}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${includeAI ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Include AI Insights</p>
                      <p className="text-[10px] text-slate-400">AI-powered narrative</p>
                    </div>
                    <div className="relative group cursor-help ml-2">
                      <HelpCircle size={14} className="text-slate-400 hover:text-violet-500 transition-colors" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-[10px] space-y-1.5 pointer-events-none">
                        <p><span className="font-bold text-violet-300">AI Analysis:</span> Adds a synthesized strategic recommendation by cross-referencing all selected modules.</p>
                        <p><span className="font-bold text-violet-300">Tone:</span> Automatically adjusted for executive leadership review.</p>
                        <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || selectedSections.length === 0}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#002f56] text-white text-sm font-extrabold hover:bg-[#003f73] disabled:opacity-60 transition-all shadow-md shadow-blue-900/20 flex items-center justify-center gap-2"
              >
                {generating
                  ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                  : <><Sparkles size={14} /> Generate Report</>
                }
              </button>
            </div>
          </div>

          {/* ── Right: output panel ── */}
          <div className="lg:col-span-3">
            {!generated && !generating && (
              <div className="h-full min-h-96 flex flex-col items-center justify-center py-24 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                <FileText size={48} className="mb-4 opacity-25" />
                <p className="font-bold text-slate-500 dark:text-slate-400">Configure settings and click Generate</p>
                <p className="text-sm mt-1 text-slate-400">Your report preview will appear here</p>
              </div>
            )}

            {generating && (
              <div className="h-full min-h-96 flex flex-col items-center justify-center py-24 animate-fade-in">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-blue-900" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-[#002f56] border-t-transparent animate-spin" />
                </div>
                <p className="font-bold text-slate-700 dark:text-slate-300">Generating your report...</p>
                <p className="text-sm text-slate-400 mt-1">Analysing data · Applying AI insights</p>
              </div>
            )}

            {generated && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-fade-in">
                {/* Report header */}
                <div className="bg-gradient-to-r from-[#001e38] to-[#002f56] px-6 py-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-0.5">{ORG_NAME}</p>
                      <h2 className="text-lg font-extrabold">Executive Briefing</h2>
                      <p className="text-xs text-blue-200 mt-1">
                        {periodLabel} · Prepared for: {preparedFor} · {new Date().toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-3 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold transition-all border border-white/20 shrink-0"
                    >
                      <Download size={13} /> Export
                    </button>
                  </div>
                </div>

                {/* KPIs */}
                {report.kpis && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 border-b border-slate-100 dark:border-slate-700">
                    {report.kpis.map((kpi, i) => (
                      <div key={i} className="text-center">
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpi.value}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold leading-tight">{kpi.label}</p>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg mt-1 inline-block ${
                          kpi.status === 'critical' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                          : kpi.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        }`}>{kpi.change}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Body */}
                <div className="p-6 space-y-5">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Executive Summary</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{report.summary}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">Key Factors</h4>
                    <ul className="space-y-2">
                      {report.keyFactors.map((f, i) => {
                        const isRisk = f.toLowerCase().startsWith('risk');
                        return (
                          <li key={i} className={`flex items-start gap-2 text-sm p-3 rounded-xl border ${
                            isRisk
                              ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900'
                              : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900'
                          }`}>
                            {isRisk
                              ? <AlertTriangle size={13} className="shrink-0 mt-0.5 text-rose-500" />
                              : <CheckCircle size={13} className="shrink-0 mt-0.5 text-emerald-500" />
                            }
                            {f}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {includeAI && (
                    <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={13} className="text-violet-600 dark:text-violet-400" />
                        <span className="text-[10px] font-extrabold text-violet-700 dark:text-violet-300 uppercase tracking-wider">AI Strategic Recommendation</span>
                      </div>
                      <p className="text-sm text-violet-800 dark:text-violet-300 leading-relaxed">{report.recommendation}</p>
                    </div>
                  )}

                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 mb-5">
                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-4">Historical Trend Analysis</h4>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { month: 'Jan', value: 65, target: 60 }, { month: 'Feb', value: 59, target: 60 },
                          { month: 'Mar', value: 80, target: 60 }, { month: 'Apr', value: 81, target: 62 },
                          { month: 'May', value: 56, target: 65 }, { month: 'Jun', value: 55, target: 65 },
                          { month: 'Jul', value: 40, target: 65 }, { month: 'Aug', value: 90, target: 68 },
                          { month: 'Sep', value: 78, target: 70 }, { month: 'Oct', value: 65, target: 72 },
                        ]}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            labelStyle={{ color: '#64748b', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" name="Target" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fill="none" />
                          <Area type="monotone" name="Actual Performance" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {report.tableData && (
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">Data Breakdown</h4>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50">
                              <th className="text-left px-4 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Segment</th>
                              <th className="text-right px-4 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Current</th>
                              <th className="text-right px-4 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Prior</th>
                              <th className="text-right px-4 py-2.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Change</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {report.tableData.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium">{row.label}</td>
                                <td className="px-4 py-2.5 text-right font-extrabold text-slate-900 dark:text-white font-mono">{row.current}</td>
                                <td className="px-4 py-2.5 text-right text-slate-500 font-mono">{row.previous}</td>
                                <td className={`px-4 py-2.5 text-right font-extrabold font-mono ${
                                  row.status === 'critical' ? 'text-rose-500' : row.status === 'warning' ? 'text-amber-500' : 'text-emerald-500'
                                }`}>{row.change}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100 dark:border-slate-700">
                    Confidential — {ORG_NAME} HR Intelligence Hub · {new Date().toLocaleDateString('en-CA')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
