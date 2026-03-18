import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';

interface Props { title?: string; onBack: () => void; }

export const UnderConstructionView: React.FC<Props> = ({ title = 'This Page', onBack }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 animate-fade-in">
    <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-6">
      <Construction size={48} className="text-amber-500" />
    </div>
    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">{title} is Coming Soon</h2>
    <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-sm mb-8">
      This feature is currently under development. Check back in a future release.
    </p>
    <button
      onClick={onBack}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#002f56] text-white rounded-xl font-bold text-sm hover:bg-[#003f73] transition-all shadow-md shadow-blue-900/20"
    >
      <ArrowLeft size={16} /> Back to Dashboard
    </button>
  </div>
);
