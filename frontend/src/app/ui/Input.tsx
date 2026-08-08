import React from 'react';
import { cn } from './cn';

const control =
  'w-full bg-surface-inset border border-line rounded-md text-ink t-small ' +
  'transition-[border-color,box-shadow,background-color] duration-150 ' +
  'hover:border-line-hover ' +
  'focus:outline-none focus:border-iris focus:ring-[3px] focus:ring-iris-soft ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const invalid = 'border-danger-line focus:border-danger focus:ring-danger-soft';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  /** Rendered inside the field on the right — e.g. a password reveal toggle. */
  affix?: React.ReactNode;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, icon, affix, error, ...props },
  ref
) {
  return (
    <div className="relative w-full">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none flex">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        aria-invalid={error || undefined}
        className={cn(
          control,
          'h-10',
          icon ? 'pl-9' : 'pl-3',
          affix ? 'pr-10' : 'pr-3',
          error && invalid,
          className
        )}
        {...props}
      />
      {affix && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 flex text-ink-3">{affix}</span>
      )}
    </div>
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(function Textarea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(control, 'px-3 py-2.5 min-h-24 resize-y', error && invalid, className)}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(control, 'h-10 pl-3 pr-9 appearance-none cursor-pointer', className)}
        {...props}
      >
        {children}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
});

/** Label + control + error message, with the label correctly bound to the field. */
export function Field({
  label,
  error,
  hint,
  htmlFor,
  className,
  children,
}: {
  label?: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="t-small font-medium text-ink-2">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="t-caption text-danger-ink">{error}</p>
      ) : hint ? (
        <p className="t-caption text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}
