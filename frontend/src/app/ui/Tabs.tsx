import { cn } from './cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

/**
 * Segmented control. The active pill slides behind the label rather than
 * relying on an underline, which reads better on a dark canvas.
 */
export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-surface-inset border border-line rounded-lg',
        className
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'px-3.5 h-8 rounded-md t-small font-medium transition-all duration-150 flex items-center gap-2',
              active
                ? 'bg-surface text-ink elev-1'
                : 'text-ink-3 hover:text-ink-2 hover:bg-surface-hover'
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  't-caption tabular-nums px-1.5 rounded-full',
                  active ? 'bg-iris-soft text-iris' : 'bg-surface-hover text-ink-3'
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
