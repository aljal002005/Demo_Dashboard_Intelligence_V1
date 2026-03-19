import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, Bot, User, TrendingUp, TrendingDown, AlertTriangle,
  ChevronRight, BarChart3, Clock, Users, Loader2, Copy, ThumbsUp, ThumbsDown, Lightbulb
} from 'lucide-react';
import { SectionGuide } from './SectionGuide';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chart?: { type: 'bar' | 'line'; data: any[]; dataKey: string; nameKey: string; title: string; color?: string };
  kpis?: { label: string; value: string; change: string; positive: boolean }[];
  suggestions?: string[];
  timestamp: Date;
}

const RESPONSES: Record<string, Omit<Message, 'id' | 'role' | 'timestamp'>> = {
  overtime: {
    content: `**Overtime Analysis — Q4 2025 vs Q3 2025**\n\nOvertime hours spiked **+12.4%** quarter-over-quarter, primarily driven by the **North Zone Emergency** department. Critical Care and Emergency departments account for **65%** of total overtime spend.\n\n**Root Causes:**\n• Nursing vacancy backfill — 142 open FTE positions\n• Flu season surge in Emergency (+25%)\n• Mandatory overtime in ICU units\n\n**Recommendation:** Immediate supplemental staffing in North Zone Emergency and ICU. Consider locum contracts for the next 8 weeks.`,
    kpis: [
      { label: 'Total OT Hours', value: '2.08M', change: '+12.4%', positive: false },
      { label: 'OT Cost YTD', value: '$12.4M', change: '+8.2%', positive: false },
      { label: 'High-Risk Units', value: '14', change: '+3', positive: false },
      { label: 'Budget Used', value: '114%', change: 'Over', positive: false },
    ],
    chart: { type: 'bar', data: [{ zone: 'North', value: 520 }, { zone: 'Edmonton', value: 380 }, { zone: 'Calgary', value: 340 }, { zone: 'Central', value: 210 }, { zone: 'South', value: 130 }], dataKey: 'value', nameKey: 'zone', title: 'OT Hours by Zone (000s)', color: '#f97316' },
    suggestions: ['What are the staffing gaps by unit?', "Compare to last year's overtime", 'Forecast overtime for next quarter'],
  },
  attrition: {
    content: `**Attrition Analysis — FY 2026 YTD**\n\nOverall attrition is tracking at **8.7%**, a slight improvement from 9.1% last year. However, **voluntary attrition in clinical leadership** roles is a growing concern at 15.2%.\n\n**Key Drivers:**\n• Compensation gaps vs market in clinical lead roles (-12%)\n• Limited career progression pathways\n• Burnout from sustained overtime demands\n\n**Immediate Action Required:** Retention interviews for all clinical leads with >3 years tenure.`,
    kpis: [
      { label: 'Overall Attrition', value: '8.7%', change: '-0.4%', positive: true },
      { label: 'Clinical Lead OT', value: '15.2%', change: '+2.1%', positive: false },
      { label: 'Retention Rate', value: '91.3%', change: '+0.4%', positive: true },
      { label: 'Open Roles', value: '142 FTE', change: '+18', positive: false },
    ],
    suggestions: ['Which departments have highest turnover?', 'What is the cost of attrition?', 'Show retention trends by zone'],
  },
  headcount: {
    content: `**Headcount Snapshot — FY 2026**\n\nTotal headcount stands at **112,500 FTE**, up 2.1% YoY. Growth is concentrated in Clinical Operations (+3.2%) while Administrative functions show a slight reduction (-0.8%).\n\n**Distribution:**\n• Clinical: 87,750 FTE (78%)\n• Allied Health: 13,500 FTE (12%)\n• Administrative: 11,250 FTE (10%)`,
    kpis: [
      { label: 'Total Headcount', value: '112,500', change: '+2.1%', positive: true },
      { label: 'Clinical FTE', value: '87,750', change: '+3.2%', positive: true },
      { label: 'Vacancy Rate', value: '5.2%', change: '+1.1%', positive: false },
      { label: 'New Hires YTD', value: '3,240', change: '+15%', positive: true },
    ],
    chart: { type: 'bar', data: [{ dept: 'Clinical', value: 87750 }, { dept: 'Allied', value: 13500 }, { dept: 'Admin', value: 11250 }], dataKey: 'value', nameKey: 'dept', title: 'Headcount by Division', color: '#10b981' },
    suggestions: ['Show headcount by zone', 'Compare headcount growth YoY', 'What is our vacancy rate by department?'],
  },
};

const matchIntent = (msg: string): string | null => {
  const m = msg.toLowerCase();
  if (m.includes('overtime') || m.includes(' ot ') || m.includes('hours')) return 'overtime';
  if (m.includes('attrition') || m.includes('turnover') || m.includes('retention')) return 'attrition';
  if (m.includes('headcount') || m.includes('staff') || m.includes('employee')) return 'headcount';
  return null;
};

const STARTERS = ['Show me overtime trends', 'What is our attrition rate?', 'Summarize current headcount', 'Which department has highest risk?'];

export const AICopilotView: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const intent = matchIntent(text) || 'unknown';
      const defaultResp: Omit<Message, 'id' | 'role' | 'timestamp'> = {
        content: `**I don't have that information right now.**\n\nI am currently optimized to answer questions about **overtime**, **attrition**, and **headcount** metrics. Please ask me about these topics, or use one of the suggestions below.`,
        suggestions: ['Show me overtime trends', 'What is our attrition rate?']
      };
      const resp = RESPONSES[intent] || defaultResp;
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', timestamp: new Date(), ...resp };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 1200);
  };

  const renderContent = (content: string) => content
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-extrabold text-slate-800 dark:text-white mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
      if (line.startsWith('• ')) return <li key={i} className="ml-4 text-slate-600 dark:text-slate-400 text-sm">{line.slice(2)}</li>;
      if (!line) return <div key={i} className="h-1" />;
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return <p key={i} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-slate-800 dark:text-white">{part}</strong> : part)}</p>;
    });

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      <SectionGuide isAI title="AI Workforce Copilot" description="Ask natural language questions about your workforce data. The copilot uses your HR data to provide instant analysis, trend summaries, and strategic recommendations." tips={['Try: "Show me overtime trends", "What is our attrition risk?"']} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30">
              <Sparkles size={40} className="text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">How can I help you today?</h3>
            <p className="text-sm text-slate-500 text-center max-w-xs">Ask anything about your workforce data — attrition, overtime, headcount, or hiring trends.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {STARTERS.map(s => (
                <button key={s} onClick={() => send(s)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-300 transition-all shadow-sm">
                  <ChevronRight size={12} className="text-violet-400" /> {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-1">
                <Bot size={16} />
              </div>
            )}
            <div className={`max-w-2xl ${msg.role === 'user' ? 'bg-[#002f56] text-white rounded-2xl rounded-tr-sm px-4 py-3' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4 shadow-sm'}`}>
              {msg.role === 'user' ? (
                <p className="text-sm">{msg.content}</p>
              ) : (
                <>
                  <div className="space-y-1">{renderContent(msg.content)}</div>
                  {msg.kpis && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 stagger">
                      {msg.kpis.map((kpi, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center animate-fade-in">
                          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{kpi.value}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{kpi.label}</p>
                          <span className={`text-[10px] font-bold ${kpi.positive ? 'text-emerald-500' : 'text-rose-500'}`}>{kpi.change}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.chart && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{msg.chart.title}</p>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          {msg.chart.type === 'bar' ? (
                            <BarChart data={msg.chart.data}>
                              <XAxis dataKey={msg.chart.nameKey} tick={{ fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                              <YAxis tick={false} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ background: isDarkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} />
                              <Bar dataKey={msg.chart.dataKey} fill={msg.chart.color ?? '#8b5cf6'} radius={[6, 6, 0, 0]} />
                            </BarChart>
                          ) : (
                            <LineChart data={msg.chart.data}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                              <XAxis dataKey={msg.chart.nameKey} tick={{ fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                              <Tooltip />
                              <Line type="monotone" dataKey={msg.chart.dataKey} stroke={msg.chart.color ?? '#8b5cf6'} strokeWidth={2} dot={false} />
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  {msg.suggestions && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {msg.suggestions.map(s => (
                        <button key={s} onClick={() => send(s)} className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-all">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <ThumbsUp size={11} /> Helpful
                    </button>
                    <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <ThumbsDown size={11} /> Not helpful
                    </button>
                    <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-auto">
                      <Copy size={11} /> Copy
                    </button>
                  </div>
                </>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 mt-1">
                <User size={14} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">Analyzing your data...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
          placeholder="Ask about overtime, attrition, headcount..."
          className="flex-1 text-sm bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400 px-2"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-[#002f56] text-white hover:bg-[#003f73] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
