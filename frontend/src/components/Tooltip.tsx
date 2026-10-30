import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  term?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, term }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center cursor-help group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children ? (
        children
      ) : (
        <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium underline decoration-dotted underline-offset-2">
          {term}
          <HelpCircle className="w-3.5 h-3.5 opacity-70" />
        </span>
      )}

      {isVisible && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 text-xs font-normal text-white bg-slate-900 dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 pointer-events-none transition-opacity duration-150 animate-in fade-in">
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
        </span>
      )}
    </span>
  );
};
