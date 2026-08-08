import React from 'react';
import { cn } from './cn';

type Tone = 'neutral' | 'iris' | 'live' | 'saffron' | 'danger';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-inset text-ink-2 border-line',
  iris: 'bg-iris-soft text-iris border-iris-line',
  live: 'bg-live-soft text-live-ink border-live-line',
  saffron: 'bg-saffron-soft text-saffron-ink border-saffron-line',
  danger: 'bg-danger-soft text-danger-ink border-danger-line',
};

/**
 * Compact status pill. `pulse` adds a breathing dot — reserve it for genuinely
 * live state so the animation keeps meaning something.
 */
export function Badge({
  tone = 'neutral',
  pulse,
  className,
  children,
}: {
  tone?: Tone;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border t-caption font-medium',
        tones[tone],
        className
      )}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-breathe" />}
      {children}
    </span>
  );
}
