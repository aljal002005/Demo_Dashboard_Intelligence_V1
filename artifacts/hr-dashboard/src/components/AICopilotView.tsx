import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, Bot, User, TrendingUp, TrendingDown, AlertTriangle,
  ChevronRight, BarChart3, Clock, Users, Loader2, Copy, ThumbsUp, ThumbsDown,
  Lightbulb, Settings, X, Key, Wifi, WifiOff
} from 'lucide-react';
import { SectionGuide } from './SectionGuide';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import {
  askGemini, getApiKey, setApiKey, clearApiKey,
  type GeminiResponse, type GeminiKpi, type GeminiChart
} from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chart?: GeminiChart;
  kpis?: GeminiKpi[];
  suggestions?: string[];
  timestamp: Date;
  isLive?: boolean; // true = from Gemini API, false = fallback
}

const STARTERS = [
  'Show me overtime trends by zone',
  'What is our attrition risk?',
  'Summarize current headcount',
  'Which departments have the highest flight risk?',
  'What actions should we take for retention?',
  'Compare overtime cost to budget',
];

// ── API Key Modal ───────────────────────────────────────────────────────────

const ApiKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [keyInput, setKeyInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30">
              <Key size={16} className="text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Connect Gemini AI</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Enter your Google Gemini API key to enable live AI-powered analytics. The key is stored locally in your browser.
        </p>
        <div className="space-y-3">
          <input
            type="password"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-700 transition-all"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { onSave(keyInput); setKeyInput(''); }}
              disabled={!keyInput.trim()}
              className="flex-1 py-2.5 rounded-xl bg-[#002f56] text-white text-sm font-extrabold hover:bg-[#003f73] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Connect
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white transition-all"
            >
              Skip (Offline Mode)
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-3">
          Get your API key at <span className="text-violet-500 font-bold">aistudio.google.com</span>
        </p>
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────

export const AICopilotView: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Check for API key on mount
  useEffect(() => {
    const key = getApiKey();
    if (key) {
      setIsConnected(true);
    } else {
      setShowKeyModal(true);
    }
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    setIsConnected(true);
    setShowKeyModal(false);
  };

  const handleDisconnect = () => {
    clearApiKey();
    setIsConnected(false);
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await askGemini(text);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        timestamp: new Date(),
        content: response.content,
        kpis: response.kpis,
        chart: response.chart,
        suggestions: response.suggestions,
        isLive: isConnected,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        timestamp: new Date(),
        content: '**Something went wrong.**\n\nI couldn\'t process your request. Please try again, or check your API key in settings.',
        suggestions: ['Show me overtime trends', 'What is our attrition rate?'],
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
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
      <SectionGuide
        isAI
        title="AI Workforce Copilot"
        description="Ask natural language questions about your workforce data. The copilot analyzes your HR data using Google Gemini AI to provide instant analysis, trend summaries, and strategic recommendations."
        tips={['Try: "Show me overtime trends by zone", "What actions should we take for retention?"']}
      />

      {/* Connection status bar */}
      <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi size={12} className="text-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Gemini AI Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={12} className="text-amber-500" />
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Offline Mode — using cached analytics</span>
            </>
          )}
        </div>
        <button
          onClick={() => isConnected ? handleDisconnect() : setShowKeyModal(true)}
          className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          <Settings size={11} />
          {isConnected ? 'Disconnect' : 'Connect API'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30">
              <Sparkles size={40} className="text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">How can I help you today?</h3>
            <p className="text-sm text-slate-500 text-center max-w-sm">
              {isConnected
                ? 'Ask anything about your workforce data — powered by Google Gemini AI.'
                : 'Ask about overtime, attrition, headcount, or hiring trends. Connect a Gemini API key for enhanced AI analysis.'
              }
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-lg">
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
                    {msg.isLive !== undefined && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ml-auto ${
                        msg.isLive
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {msg.isLive ? '⚡ Live AI' : '📦 Cached'}
                      </span>
                    )}
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
                <span className="text-sm">{isConnected ? 'Analyzing with Gemini AI...' : 'Analyzing your data...'}</span>
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
          placeholder={isConnected ? 'Ask Gemini about your workforce data...' : 'Ask about overtime, attrition, headcount...'}
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

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSave={handleSaveKey}
      />
    </div>
  );
};
