import React from 'react';
import { cn } from './cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dangerGhost';
type Size = 'sm' | 'md' | 'lg' | 'iconSm' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Rendered before the label; hidden and replaced by the spinner while loading. */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-iris text-on-iris hover:bg-iris-hover active:bg-iris-active shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.16)] hover:shadow-[0_6px_20px_-6px_var(--iris-glow),inset_0_1px_0_rgba(255,255,255,0.16)]',
  secondary:
    'bg-surface-inset text-ink border border-line hover:bg-surface-hover hover:border-line-hover',
  outline: 'bg-transparent text-ink border border-line hover:bg-surface-hover hover:border-line-hover',
  ghost: 'bg-transparent text-ink-2 hover:bg-surface-hover hover:text-ink',
  danger:
    'bg-danger text-white hover:bg-danger-hover shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.16)]',
  dangerGhost: 'bg-transparent text-danger-ink hover:bg-danger-soft',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-md gap-1.5',
  md: 'h-10 px-4 text-[14px] rounded-md gap-2',
  lg: 'h-12 px-6 text-[15px] rounded-lg gap-2',
  iconSm: 'h-8 w-8 rounded-md',
  icon: 'h-10 w-10 rounded-md',
};

/**
 * The single button primitive for the whole app.
 *
 * Colours resolve through theme tokens, so a button is correct in both themes
 * without any `dark:` variants at the call site.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, leading, trailing, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium whitespace-nowrap select-none',
        'transition-[background-color,border-color,box-shadow,transform,color] duration-150',
        'active:translate-y-px disabled:opacity-45 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner size={size === 'lg' ? 18 : 15} /> : leading}
      {children}
      {!loading && trailing}
    </button>
  );
});
