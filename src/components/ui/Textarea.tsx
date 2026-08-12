import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="form-control">
        {label && <label className="form-label">{label}</label>}
        <textarea
          ref={ref}
          className={cn('form-input', className)}
          {...props}
        />
        {error && <span className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
