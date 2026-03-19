import React, { useState } from 'react';
import {
  LayoutGrid, PieChart, FileText, Settings, Users, LogOut,
  Briefcase, Sparkles, ShieldAlert, FlaskConical, ChevronLeft,
  ChevronRight, HelpingHand, LayoutDashboard
} from 'lucide-react';
import { ViewTab } from '../types';
import { ORG_NAME } from '../constants';

interface SidebarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onLogout: () => void;
  username: string;
  onStartTour?: () => void;
}

const OrgIcon = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="40" width="25" height="40" rx="4" fill="#10b981" />
    <rect x="50" y="20" width="30" height="60" rx="4" fill="#3b82f6" />
    <circle cx="32.5" cy="25" r="8" fill="#f59e0b" />
    <rect x="60" y="35" width="10" height="5" rx="2" fill="white" />
    <rect x="60" y="50" width="10" height="5" rx="2" fill="white" />
    <rect x="60" y="65" width="10" height="5" rx="2" fill="white" />
    <rect x="27.5" y="55" width="10" height="5" rx="2" fill="white" />
    <rect x="27.5" y="65" width="10" height="5" rx="2" fill="white" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, onLogout, username, onStartTour }) => {
  const [collapsed, setCollapsed] = useState(false);

  const coreNav = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'analytics', label: 'Executive View', icon: PieChart },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const aiNav = [
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles },
    { id: 'flightrisk', label: 'Flight Risk', icon: ShieldAlert },
    { id: 'scenarios', label: 'Scenario Planner', icon: FlaskConical },
  ];

  const secondaryNav = [
    { id: 'myview', label: 'My View', icon: LayoutDashboard, active: true },
    { id: 'team', label: 'My Team', icon: Users, active: false },
    { id: 'projects', label: 'Projects', icon: Briefcase, active: false },
  ];

  const NavItem = ({
    id, label, icon: Icon, badge
  }: { id: string; label: string; icon: any; badge?: string }) => {
    const isActive = currentTab === id;
    return (
      <button
        title={collapsed ? label : undefined}
        onClick={() => onTabChange(id as ViewTab)}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
          transition-all duration-150 group relative
          ${isActive
            ? 'bg-[#002f56] text-white shadow-md shadow-[#002f56]/30'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
          }
          ${collapsed ? 'justify-center px-0' : ''}
        `}
      >
        <Icon size={18} className={`shrink-0 ${isActive ? 'text-white' : ''}`} />
        {!collapsed && <span className="truncate">{label}</span>}
        {!collapsed && badge && (
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
            {badge}
          </span>
        )}
        {collapsed && badge && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-500" />
        )}
      </button>
    );
  };

  const SectionLabel = ({ label }: { label: string }) =>
    collapsed ? (
      <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />
    ) : (
      <p className="px-3 mt-5 mb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {label}
      </p>
    );

  return (
    <aside
      className={`
        relative flex flex-col bg-white dark:bg-slate-900
        border-r border-slate-200 dark:border-slate-800
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-16' : 'w-60'}
      `}
      style={{ minHeight: '100vh' }}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-slate-800 ${collapsed ? 'justify-center px-2' : ''}`}>
        <OrgIcon />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-[#002f56] dark:text-white truncate leading-tight">HR Intelligence Hub</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">HSS Health Network</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        <SectionLabel label="Core" />
        {coreNav.map(item => <NavItem key={item.id} {...item} />)}

        <SectionLabel label="AI Intelligence" />
        {/* AI section wrapper with subtle gradient background */}
        <div className={`${collapsed ? '' : 'bg-gradient-to-br from-violet-50/80 to-indigo-50/80 dark:from-violet-900/10 dark:to-indigo-900/10 rounded-xl p-1.5 border border-violet-100/80 dark:border-violet-800/30'}`}>
          {aiNav.map(item => (
            <NavItem key={item.id} {...item} badge="AI" />
          ))}
        </div>

        <SectionLabel label="Workspace" />
        {secondaryNav.map(({ id, label, icon, active }) => active ? (
          <NavItem key={id} id={id} label={label} icon={icon} />
        ) : (
          <button
            key={id}
            title={collapsed ? label : undefined}
            onClick={() => {}}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed transition-all ${collapsed ? 'justify-center px-0' : ''}`}
          >
            {React.createElement(icon, { size: 18, className: 'shrink-0' })}
            {!collapsed && <span className="truncate">{label}</span>}
            {!collapsed && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">Soon</span>}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className={`px-2 pb-4 space-y-1 border-t border-slate-200 dark:border-slate-800 pt-3`}>
        {onStartTour && (
          <button
            title={collapsed ? 'Take a tour' : undefined}
            onClick={onStartTour}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <HelpingHand size={18} className="shrink-0" />
            {!collapsed && <span>Take a Tour</span>}
          </button>
        )}
        <button
          title={collapsed ? 'Settings' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={onLogout}
          title={collapsed ? 'Sign out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {!collapsed && (
          <div className="mt-3 px-1 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#002f56] to-blue-500 flex items-center justify-center text-white text-xs font-extrabold shrink-0">
              {username?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{username}</p>
              <p className="text-[10px] text-slate-400 truncate">{ORG_NAME}</p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all hover:shadow-md z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
};
