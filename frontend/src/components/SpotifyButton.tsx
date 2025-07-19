import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
}

export function SpotifyButton({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: Props): JSX.Element {
  return (
    <button
      {...rest}
      className={[
        variant === 'primary' ? 'btn-spotify' : 'btn-ghost',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}
