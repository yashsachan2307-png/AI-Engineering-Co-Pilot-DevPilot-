import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="form-control">
        {label && <label className="form-label">{label}</label>}
        <input
          ref={ref}
          className={cn('form-input', className)}
          {...props}
        />
        {error && <span className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
