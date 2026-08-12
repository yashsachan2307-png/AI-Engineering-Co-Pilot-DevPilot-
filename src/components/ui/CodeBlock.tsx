import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Copy } from 'lucide-react';

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
}

export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ className, code, language = 'text', ...props }, ref) => {
    return (
      <div ref={ref} className={cn('code-block', className)} {...props}>
        <div className="code-block-header">
          <span>{language}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(code)}>
            <Copy size={14} />
          </button>
        </div>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    );
  }
);
CodeBlock.displayName = 'CodeBlock';
