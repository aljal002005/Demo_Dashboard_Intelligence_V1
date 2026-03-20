import React, { useState } from 'react';
import { Sun, Moon, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { ORG_NAME } from '../constants';

interface LoginPageProps {
  onLogin: (username: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const DEMO_ACCOUNTS = [
  { label: 'CHRO', email: 'chro@hss.com', password: 'demo', role: 'Chief HR Officer' },
  { label: 'Analyst', email: 'analyst@hss.com', password: 'demo', role: 'People Analyst' },
  { label: 'Manager', email: 'manager@hss.com', password: 'demo', role: 'HR Manager' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isDarkMode, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (account) {
      onLogin(account.role);
    } else {
      setError('Invalid credentials. Use a demo account below.');
    }
  };

  const fillDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#001e38] via-[#002f56] to-[#003f73] text-white relative overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      {/* top bar */}
      <div className="relative flex justify-between items-center px-8 py-5">
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
            <rect x="20" y="40" width="25" height="40" rx="4" fill="#10b981" />
            <rect x="50" y="20" width="30" height="60" rx="4" fill="#60a5fa" />
            <circle cx="32.5" cy="25" r="8" fill="#f59e0b" />
          </svg>
          <div>
            <p className="text-sm font-extrabold tracking-tight">Vantage HR Intelligence</p>
            <p className="text-[10px] text-blue-300">Strategic Decision Support</p>
          </div>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-xl text-blue-300 hover:text-white hover:bg-white/10 transition-all">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl space-y-5">
            {error && (
              <div className="text-sm text-red-300 bg-red-500/20 border border-red-500/30 rounded-xl p-3 animate-fade-in">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-blue-300 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/60 text-sm outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-300 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/60 text-sm outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white text-[#002f56] font-extrabold text-sm hover:bg-blue-50 active:scale-[0.98] transition-all shadow-lg shadow-black/20"
            >
              Sign In
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6">
            <p className="text-center text-xs text-blue-400 mb-3 font-semibold uppercase tracking-wider">Demo Accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.label}
                  onClick={() => fillDemo(acc)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all group text-center"
                >
                  <span className="text-xs font-extrabold text-white group-hover:text-blue-200">{acc.label}</span>
                  <span className="text-[10px] text-blue-400 leading-tight">{acc.role}</span>
                  <ChevronRight size={12} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-blue-500 mt-2">Click any account to auto-fill credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
};
