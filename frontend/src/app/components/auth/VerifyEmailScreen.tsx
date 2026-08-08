import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { authClient } from '../../apiClient';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';

interface VerifyEmailScreenProps {
  token: string | null;
  switchMode: (mode: 'login' | 'register') => void;
}

export function VerifyEmailScreen({ token, switchMode }: VerifyEmailScreenProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    authClient
      .get(`/api/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err.response?.data?.message ||
            'Verification failed. The link may be expired or already used.'
        );
      });
  }, [token]);

  const tone = {
    loading: 'bg-surface-inset border-line text-ink-3',
    success: 'bg-live-soft border-live-line text-live-ink',
    error: 'bg-danger-soft border-danger-line text-danger-ink',
  }[status];

  return (
    <div className="text-center">
      <div className={`mx-auto w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${tone}`}>
        {status === 'loading' && <Spinner size={21} />}
        {status === 'success' && <CheckCircle2 size={21} />}
        {status === 'error' && <XCircle size={21} />}
      </div>

      <h1 className="t-h2 text-ink mb-2">
        {status === 'loading' && 'Verifying email'}
        {status === 'success' && 'Email verified'}
        {status === 'error' && 'Verification failed'}
      </h1>

      <p className="t-small text-ink-2 leading-relaxed mb-8">{message}</p>

      {status !== 'loading' && (
        <Button
          className="w-full"
          onClick={() => switchMode(status === 'success' ? 'login' : 'register')}
        >
          {status === 'success' ? 'Continue to log in' : 'Back to registration'}
        </Button>
      )}
    </div>
  );
}
