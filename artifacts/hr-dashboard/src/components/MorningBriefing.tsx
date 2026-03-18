import React, { useState, useEffect } from 'react';
import { Sun, TrendingUp, AlertTriangle, CheckCircle, ChevronDown, Sunrise, CloudMoon } from 'lucide-react';

interface MorningBriefingProps {
  username?: string;
}

export const MorningBriefing: React.FC<MorningBriefingProps> = ({ username = 'Admin' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [greeting, setGreeting] = useState('Good morning');
  const [GreetingIcon, setGreetingIcon] = useState<any>(() => Sun);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12)      { setGreeting('Good morning');   setGreetingIcon(() => Sunrise); }
    else if (h < 18) { setGreeting('Good afternoon'); setGreetingIcon(() => Sun); }
    else             { setGreeting('Good evening');   setGreetingIcon(() => CloudMoon); }
  }, []);

  return (
    <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#001e38] via-[#002f56] to-[#003f73] text-white shadow-xl border border-blue-500/10 overflow-hidden animate-slide-up">
      {/* Background decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Toggle header */}
      <button
        onClick={() => setIsCollapsed(c => !c)}
        className="relative z-10 w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <GreetingIcon className="text-yellow-300" size={20} />
          <span className="text-base font-bold">{greeting}, {username.split(' ')[0]}</span>
          {isCollapsed && (
            <span className="text-xs font-medium bg-white/10 px-2 py-0.5 rounded-full text-blue-200 ml-2 animate-fade-in">
              2 alerts • System operational
            </span>
          )}
        </div>
        <ChevronDown size={16} className={`text-blue-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>

      {/* Expandable body */}
      <div className={`relative z-10 transition-all duration-500 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
        <div className="px-6 pb-6 grid md:grid-cols-2 gap-6">
          {/* Status badges */}
          <div>
            <p className="text-blue-200 text-sm mb-4">Here is your daily operational briefing.</p>
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                <span className="block text-[10px] text-blue-300 uppercase tracking-wider font-bold">System Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-sm">Operational</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                <span className="block text-[10px] text-blue-300 uppercase tracking-wider font-bold">Data Freshness</span>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span className="font-bold text-sm">Updated 08:30 AM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key insights */}
          <div className="space-y-3">
            <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 flex items-start gap-3 cursor-pointer group transition-colors">
              <div className="p-2 bg-rose-500/20 rounded-lg text-rose-300 group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0">
                <AlertTriangle size={14} />
              </div>
              <div>
                <p className="font-bold text-sm">🔴 Critical: North Zone Overtime</p>
                <p className="text-xs text-blue-200 mt-0.5 leading-relaxed">
                  OT usage in Clinical wards spiked <span className="font-bold text-white">+12%</span> vs last week.
                </p>
              </div>
            </div>
            <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 flex items-start gap-3 cursor-pointer group transition-colors">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                <TrendingUp size={14} />
              </div>
              <div>
                <p className="font-bold text-sm">🟢 Win: Recruitment Velocity</p>
                <p className="text-xs text-blue-200 mt-0.5 leading-relaxed">
                  Time-to-fill dropped to <span className="font-bold text-white">42 days</span> (Target: 45 days).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
