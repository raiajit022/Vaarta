import { Loader2, Mail } from "lucide-react";

interface CheckEmailScreenProps {
  email: string;
  timer: number;
  setTimer: (val: number) => void;
  loading: boolean;
  setLoading: (val: boolean) => void;
  setAuthMode: (mode: 'login' | 'register' | 'forgot' | 'check-email' | 'reset') => void;
  switchMode: (mode: 'login' | 'register' | 'forgot') => void;
}

export function CheckEmailScreen({
  email,
  timer,
  setTimer,
  loading,
  setLoading,
  setAuthMode,
  switchMode,
}: CheckEmailScreenProps) {
  return (
    <div className="text-center">
      <div className="mx-auto w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-5">
        <Mail size={22} className="text-emerald-600 dark:text-emerald-400" />
      </div>
      <h1 className="text-[20px] font-semibold tracking-tight text-stone-900 dark:text-white mb-2">
        Check your inbox
      </h1>
      <p className="text-[14px] leading-relaxed text-stone-500 dark:text-stone-400 mb-8">
        We've sent an email to <span className="font-medium text-stone-900 dark:text-white">{email || "your email"}</span> with instructions to reset your password.
      </p>

      <button
        onClick={() => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            setAuthMode('reset');
          }, 800);
        }}
        disabled={loading}
        className="w-full h-10 mb-6 flex items-center justify-center gap-2 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[14px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-[#1A1712] shadow-[inset_0px_1px_0px_rgba(255,255,255,0.2),0_1px_2px_rgba(6,95,70,0.15)] disabled:opacity-70 disabled:pointer-events-none"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Skip to Reset (Demo)"}
      </button>

      <div className="flex flex-col items-center gap-4">
        <p className="text-[13.5px] text-stone-500 dark:text-stone-400">
          Didn't receive the email?{" "}
          <button
            type="button"
            disabled={timer > 0}
            onClick={() => setTimer(30)}
            className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-4 disabled:opacity-50 disabled:no-underline"
          >
            Click to resend {timer > 0 ? `(${timer}s)` : ''}
          </button>
        </p>
        <button
          type="button"
          onClick={() => switchMode('login')}
          className="text-[13.5px] font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors"
        >
          ← Back to log in
        </button>
      </div>
    </div>
  );
}
