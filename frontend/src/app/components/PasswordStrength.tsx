const LEVELS = [
  { label: 'Enter password', bar: 'bg-line', text: 'text-ink-3' },
  { label: 'Weak', bar: 'bg-danger', text: 'text-danger-ink' },
  { label: 'Fair', bar: 'bg-saffron', text: 'text-saffron-ink' },
  { label: 'Good', bar: 'bg-iris', text: 'text-iris' },
  { label: 'Strong', bar: 'bg-live', text: 'text-live-ink' },
] as const;

function calculateStrength(pw: string) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 4);
}

/**
 * Four-segment strength meter. Colour walks danger → saffron → iris → live so
 * the progression reads without needing the label.
 */
export function PasswordStrength({ password }: { password: string }) {
  const strength = calculateStrength(password);
  const level = LEVELS[strength];

  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="flex gap-1 flex-1 h-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors duration-300 ${
              i < strength ? level.bar : 'bg-line'
            }`}
          />
        ))}
      </div>
      <span className={`t-caption font-medium w-[70px] text-right ${level.text}`}>
        {level.label}
      </span>
    </div>
  );
}
