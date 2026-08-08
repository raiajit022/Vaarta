import React from 'react';
import { cn } from './cn';

/**
 * Consistent zero-state. Replaces the bare `<p>No upcoming meetings.</p>`
 * strings that made empty screens look broken rather than intentional.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-14 px-6', className)}>
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-surface-inset border border-line flex items-center justify-center text-ink-3 mb-4">
          {icon}
        </div>
      )}
      <h3 className="t-h3 text-ink mb-1.5">{title}</h3>
      {description && <p className="t-small text-ink-3 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
