import { Mail } from 'lucide-react';

interface CheckEmailScreenProps {
  email: string;
  timer: number;
  setTimer: (val: number) => void;
  loading: boolean;
  setLoading: (val: boolean) => void;
  setAuthMode: (mode: 'login' | 'register' | 'forgot' | 'check-email' | 'reset') => void;
  switchMode: (mode: 'login' | 'register' | 'forgot') => void;
}

/**
 * Shown after a password-reset email is dispatched.
 *
 * The former "Skip to Reset (Demo)" button was removed: it jumped to the reset
 * form without a token, so the submit always failed against the real backend.
 */
export function CheckEmailScreen({ email, timer, setTimer, switchMode }: CheckEmailScreenProps) {
  return (
    <div className="text-center">
      <div className="mx-auto w-12 h-12 rounded-xl bg-iris-soft border border-iris-line flex items-center justify-center mb-5">
        <Mail size={21} className="text-iris" />
      </div>

      <h1 className="t-h2 text-ink mb-2">Check your inbox</h1>
      <p className="t-small text-ink-2 leading-relaxed mb-8">
        We sent a reset link to{' '}
        <span className="font-medium text-ink">{email || 'your email'}</span>. The link expires in
        30 minutes.
      </p>

      <div className="flex flex-col items-center gap-4">
        <p className="t-small text-ink-3">
          Didn't receive it?{' '}
          <button
            type="button"
            disabled={timer > 0}
            onClick={() => setTimer(30)}
            className="font-medium text-iris hover:underline underline-offset-4 disabled:opacity-50 disabled:no-underline"
          >
            Resend {timer > 0 ? `(${timer}s)` : ''}
          </button>
        </p>
        <button
          type="button"
          onClick={() => switchMode('login')}
          className="t-small font-medium text-ink-3 hover:text-ink transition-colors"
        >
          ← Back to log in
        </button>
      </div>
    </div>
  );
}
