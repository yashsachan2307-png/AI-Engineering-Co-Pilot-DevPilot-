import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback?: string;
  alt?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, fallback, alt, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('avatar', className)} {...props}>
        {src ? (
          <img src={src} alt={alt || 'Avatar'} className="avatar-img" />
        ) : (
          <span className="avatar-fallback">{fallback}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
