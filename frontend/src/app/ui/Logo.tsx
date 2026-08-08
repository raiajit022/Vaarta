import { cn } from './cn';

/**
 * The Vaarta mark.
 *
 * Two overlapping presences; the lens where they meet is filled solid.
 * "Vaarta" (वार्ता) means conversation — the mark is the overlap, not the circles.
 */
export function VaartaMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9.5" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="14.5" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path
        d="M12 7.1A5.5 5.5 0 0 1 12 16.9 5.5 5.5 0 0 1 12 7.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Full lockup: mark in a tinted tile plus the wordmark.
 *
 * @param tone `brand` tints the tile with iris; `plain` inherits the current colour.
 */
export function Logo({
  className,
  size = 'md',
  tone = 'brand',
  showWord = true,
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'brand' | 'plain';
  showWord?: boolean;
}) {
  const tile = {
    sm: 'w-7 h-7 rounded-[8px]',
    md: 'w-9 h-9 rounded-[10px]',
    lg: 'w-11 h-11 rounded-[12px]',
  }[size];

  const mark = { sm: 17, md: 21, lg: 26 }[size];
  const word = { sm: 'text-[15px]', md: 'text-[17px]', lg: 'text-[21px]' }[size];

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex items-center justify-center shrink-0',
          tile,
          tone === 'brand'
            ? 'bg-iris text-on-iris shadow-[0_4px_14px_-4px_var(--iris-glow)]'
            : 'bg-transparent text-current'
        )}
      >
        <VaartaMark size={mark} />
      </div>
      {showWord && (
        <span className={cn('font-semibold tracking-[-0.02em] text-ink', word)}>Vaarta</span>
      )}
    </div>
  );
}
