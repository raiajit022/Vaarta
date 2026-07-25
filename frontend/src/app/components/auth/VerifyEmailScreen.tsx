import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { authClient } from "../../apiClient";

interface VerifyEmailScreenProps {
  token: string | null;
  switchMode: (mode: 'login' | 'register') => void;
}

export function VerifyEmailScreen({ token, switchMode }: VerifyEmailScreenProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage("No verification token found in the URL.");
      return;
    }

    authClient.get(`/api/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || "Email verified successfully.");
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || "Verification failed. The link might be expired or invalid.");
      });
  }, [token]);

  return (
    <div className="text-center">
      <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-5 ${
        status === 'loading' ? 'bg-stone-100 dark:bg-stone-800' :
        status === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10' :
        'bg-red-50 dark:bg-red-500/10'
      }`}>
        {status === 'loading' && <Loader2 size={22} className="text-stone-500 animate-spin" />}
        {status === 'success' && <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400" />}
        {status === 'error' && <XCircle size={22} className="text-red-600 dark:text-red-400" />}
      </div>
      
      <h1 className="text-[20px] font-semibold tracking-tight text-stone-900 dark:text-white mb-2">
        {status === 'loading' && "Verifying email"}
        {status === 'success' && "Email verified"}
        {status === 'error' && "Verification failed"}
      </h1>
      
      <p className="text-[14px] leading-relaxed text-stone-500 dark:text-stone-400 mb-8">
        {message}
      </p>

      {status !== 'loading' && (
        <button
          onClick={() => switchMode(status === 'success' ? 'login' : 'register')}
          className="w-full h-10 mb-6 flex items-center justify-center gap-2 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[14px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-[#1A1712] shadow-[inset_0px_1px_0px_rgba(255,255,255,0.2),0_1px_2px_rgba(6,95,70,0.15)]"
        >
          {status === 'success' ? "Proceed to Login" : "Back to Registration"}
        </button>
      )}
    </div>
  );
}
