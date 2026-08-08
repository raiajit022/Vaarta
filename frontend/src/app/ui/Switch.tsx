import { cn } from './cn';

/** A real toggle — the previous UI faked these with non-interactive divs. */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-6 rounded-full shrink-0 transition-colors duration-200',
        'disabled:opacity-45 disabled:cursor-not-allowed',
        checked ? 'bg-iris' : 'bg-surface-inset border border-line',
        className
      )}
    >
      <span
        className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[19px]' : 'translate-x-1'
        )}
      />
    </button>
  );
}
