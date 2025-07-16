import type { HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  as?: 'div' | 'section' | 'article';
  hoverable?: boolean;
}

export function GlassCard({
  children,
  className = '',
  hoverable = false,
  ...rest
}: GlassCardProps): JSX.Element {
  return (
    <div
      {...rest}
      className={[
        'glass p-5',
        hoverable ? 'glass-hover' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
