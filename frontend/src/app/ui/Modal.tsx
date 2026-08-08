import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from './cn';

const widths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

/**
 * Modal shell used by every dialog in the app.
 *
 * Handles the things the previous hand-rolled overlays did not: Escape to
 * close, background scroll lock, focus moved into the panel on open and
 * restored on close, and correct dialog semantics.
 */
export function Modal({
  open = true,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  className,
}: {
  open?: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: keyof typeof widths;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-surface border border-line rounded-2xl elev-4 outline-none',
          'flex flex-col max-h-[88vh]',
          'animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200',
          widths[size],
          className
        )}
      >
        {title && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-line shrink-0">
            <div>
              <h2 className="t-h3 text-ink">{title}</h2>
              {description && <p className="t-small text-ink-3 mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="text-ink-3 hover:text-ink hover:bg-surface-hover rounded-md p-1.5 -mr-1.5 -mt-1 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="px-6 py-5 overflow-y-auto scrollbar-fine">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-line bg-canvas-raised rounded-b-2xl flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
