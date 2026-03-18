import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, LayoutGrid, PieChart, Sparkles, FileText } from 'lucide-react';

interface OnboardingTourProps {
  onClose: () => void;
}

const STEPS = [
  {
    icon: LayoutGrid,
    title: 'Overview Dashboard',
    description: 'Your central hub for all HR metrics. Tiles are grouped by Compliance, Workforce Health, and Talent. Click any tile to drill into detailed analytics.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: PieChart,
    title: 'Executive View',
    description: 'Deep-dive analytics with trend charts, KPI benchmarks, risk assessments, and written reports suitable for board presentations.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: FileText,
    title: 'Report Generator',
    description: 'Generate and export polished PDF/CSV reports for any metric or time period. Includes executive summaries and AI-generated insights.',
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: Sparkles,
    title: 'AI Intelligence Suite',
    description: 'Three powerful AI tools: the Copilot for natural language queries, Flight Risk Heatmap to predict attrition, and the Scenario Planner for workforce modelling.',
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-[#002f56]' : 'w-1.5 bg-slate-200 dark:bg-slate-600'}`} />
            ))}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 animate-fade-in" key={step}>
          <div className={`w-16 h-16 rounded-2xl ${current.bg} flex items-center justify-center mb-5`}>
            <Icon size={28} className={current.color} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">{current.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{current.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 pb-6">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 disabled:opacity-30 hover:border-slate-300 hover:text-slate-700 dark:hover:text-white transition-all"
          >
            <ChevronLeft size={15} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#002f56] text-white text-sm font-bold hover:bg-[#003f73] transition-all shadow-md shadow-blue-900/20"
            >
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all shadow-md"
            >
              Get Started <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
