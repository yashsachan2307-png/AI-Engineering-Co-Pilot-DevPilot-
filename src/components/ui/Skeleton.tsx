import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('skeleton', className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';
