import React from 'react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

const LINKS = ['Privacy Policy', 'Terms of Use', 'Accessibility', 'Help & Support', 'Data Sources', 'Release Notes'];

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => (
  <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 px-6 py-8 bg-white/50 dark:bg-slate-900/50">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-xs text-slate-400 dark:text-slate-500">
        © 2026 People Analytics Platform. Data refreshed monthly.
      </p>
      <div className="flex flex-wrap gap-4">
        {LINKS.map(link => (
          <button
            key={link}
            onClick={() => onNavigate?.(link)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            {link}
          </button>
        ))}
      </div>
    </div>
  </footer>
);
