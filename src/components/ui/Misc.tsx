// Simple placeholder exports to meet the requirement without over-engineering
import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export function Dropdown({ children, className }: { children: ReactNode, className?: string }) {
  return <div className={cn("relative inline-block text-left", className)}>{children}</div>;
}

export function Tooltip({ children, content }: { children: ReactNode, content: ReactNode }) {
  // A real tooltip would use a portal and positioning library like floating-ui. 
  // For Phase 1, we use a title attribute as the simplest accessible fallback.
  return <span title={typeof content === 'string' ? content : 'Tooltip'} className="inline-block">{children}</span>;
}

export function Toast({ message, type = 'info' }: { message: string, type?: 'info'|'success'|'error' }) {
  return (
    <div className={cn("fixed bottom-4 right-4 p-4 rounded-md shadow-lg border", 
      type === 'error' ? 'bg-red-900 border-red-500 text-white' : 
      type === 'success' ? 'bg-emerald-900 border-emerald-500 text-white' : 
      'bg-zinc-800 border-zinc-700 text-white'
    )}>
      {message}
    </div>
  );
}
