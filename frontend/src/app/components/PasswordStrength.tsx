/**
 * Evaluates and displays the strength of a given password using a visual meter.
 * 
 * @param props.password The current password string to evaluate.
 */
export function PasswordStrength({ password }: { password: string }) {
  const strength = calculateStrength(password);
  
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

  const bars = [1, 2, 3, 4];
  
  const getBarColor = (index: number) => {
    if (strength === 0) return "bg-stone-200 dark:bg-stone-800";
    if (strength === 1) return index === 0 ? "bg-red-400" : "bg-stone-200 dark:bg-stone-800";
    if (strength === 2) return index < 2 ? "bg-amber-400" : "bg-stone-200 dark:bg-stone-800";
    if (strength === 3) return index < 3 ? "bg-emerald-400" : "bg-stone-200 dark:bg-stone-800";
    return "bg-emerald-500";
  };

  const getLabel = () => {
    if (strength === 0) return "Enter password";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="flex items-center gap-3 mt-1.5">
      <div className="flex gap-1 flex-1 h-1">
        {bars.map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors duration-300 ${getBarColor(i)}`}
          />
        ))}
      </div>
      <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 w-20 text-right">
        {getLabel()}
      </span>
    </div>
  );
}
