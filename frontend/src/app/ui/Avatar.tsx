import { cn } from './cn';

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-[12px]',
  md: 'w-10 h-10 text-[14px]',
  lg: 'w-14 h-14 text-[18px]',
  xl: 'w-20 h-20 text-[26px]',
};

/** Deterministic tint so the same person keeps the same colour across the app. */
const tints = [
  'bg-iris-soft text-iris',
  'bg-saffron-soft text-saffron-ink',
  'bg-live-soft text-live-ink',
  'bg-danger-soft text-danger-ink',
];

function tintFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return tints[h % tints.length];
}

export function Avatar({
  name,
  email,
  src,
  size = 'md',
  ring,
  className,
}: {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  size?: keyof typeof sizes;
  /** Iris presence ring — use for the active speaker or the signed-in user. */
  ring?: boolean;
  className?: string;
}) {
  const seed = name || email || '?';
  const initial = (name?.trim()?.[0] || email?.trim()?.[0] || '?').toUpperCase();

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold shrink-0 overflow-hidden select-none',
        sizes[size],
        !src && tintFor(seed),
        ring && 'ring-2 ring-iris ring-offset-2 ring-offset-canvas',
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || email || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}
