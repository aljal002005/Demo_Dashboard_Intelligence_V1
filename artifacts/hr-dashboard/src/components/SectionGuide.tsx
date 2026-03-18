import React, { useState } from 'react';
import { HelpCircle, X, Sparkles } from 'lucide-react';

interface SectionGuideProps {
  title: string;
  description: string;
  tips?: string[];
  isAI?: boolean;
}

export const SectionGuide: React.FC<SectionGuideProps> = ({ title, description, tips = [], isAI = false }) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-4 animate-fade-in ${
      isAI
        ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800'
        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }`}>
      <div className={`p-2 rounded-xl shrink-0 ${isAI ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'}`}>
        {isAI ? <Sparkles size={16} /> : <HelpCircle size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-bold mb-1 ${isAI ? 'text-violet-700 dark:text-violet-300' : 'text-blue-700 dark:text-blue-300'}`}>{title}</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
        {tips.length > 0 && (
          <ul className="mt-2 space-y-1">
            {tips.map((t, i) => (
              <li key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <span className={`mt-0.5 shrink-0 ${isAI ? 'text-violet-400' : 'text-blue-400'}`}>•</span>
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
        <X size={14} />
      </button>
    </div>
  );
};
