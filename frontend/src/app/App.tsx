import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./hooks/useTheme";
import { VaartaLogo } from "./components/VaartaLogo";
import { BrandPanel } from "./components/BrandPanel";
import { LoginScreen } from "./components/auth/LoginScreen";
import { RegisterScreen } from "./components/auth/RegisterScreen";
import { ForgotScreen } from "./components/auth/ForgotScreen";
import { CheckEmailScreen } from "./components/auth/CheckEmailScreen";
import { ResetScreen } from "./components/auth/ResetScreen";
import { VerifyEmailScreen } from "./components/auth/VerifyEmailScreen";

import { LandingPage } from "./components/landing/LandingPage";
import { CoreApp } from "./components/coreapp/App";

import { useAuthStore } from "./store/useAuthStore";
import { authClient } from "./apiClient";
import { Toaster } from "sonner";
import { GuestMeetingFlow } from "./components/guest/GuestMeetingFlow";

type AuthMode = 'landing' | 'login' | 'register' | 'forgot' | 'check-email' | 'reset' | 'verify-email' | 'guest-join';

export default function App() {
  const { isDark, setIsDark } = useTheme();

  const { isAuthenticated, setAuth, logout } = useAuthStore();

  const [authMode, setAuthMode] = useState<AuthMode>('landing');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);

  // URL Parameters for verify and reset flows
  const [urlToken, setUrlToken] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(null);

  // Simple routing based on URL path and query string (since we're not using React Router yet)
  useEffect(() => {
    // Handle email click tracking wrappers (e.g. Resend/AWS SES) by inspecting the full decoded URL
    const fullUrl = window.location.href;
    const decodedUrl = decodeURIComponent(fullUrl);

    // Extract token using regex to bypass any nested routing wrappers
    const verifyMatch = decodedUrl.match(/\/verify-email\?token=([^&/#]+)/);
    const resetMatch = decodedUrl.match(/\/reset-password\?token=([^&/#]+)/);
    const joinMatch = decodedUrl.match(/\/join\/([A-Z0-9-]+)/i);
    const meetingMatch = decodedUrl.match(/\/meeting\/([A-Z0-9-]+)/i);

    if (verifyMatch) {
      setUrlToken(verifyMatch[1]);
      setAuthMode('verify-email');
      window.history.replaceState({}, document.title, "/");
    } else if (resetMatch) {
      setUrlToken(resetMatch[1]);
      setAuthMode('reset');
      window.history.replaceState({}, document.title, "/");
    } else if (!isAuthenticated && (joinMatch || meetingMatch)) {
      const code = (joinMatch ? joinMatch[1] : meetingMatch ? meetingMatch[1] : null);
      setJoinCode(code);
      setAuthMode('guest-join');
    } else if (isAuthenticated) {
      // If already authenticated and not on a special link, jump straight in
      // but only if we are currently trying to show landing or login
      if (authMode === 'landing' || authMode === 'login' || authMode === 'register') {
        // No need to set authMode, `if (isAuthenticated)` handles the render
      }
    }
  }, [isAuthenticated, authMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authMode === 'check-email' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, timer]);

  function validateLogin() {
    const e: { [key: string]: string } = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    return e;
  }

  function validateRegister() {
    const e: { [key: string]: string } = {};
    if (!name) e.name = "Name is required";
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!terms) e.terms = "You must agree to the Terms of Service";
    return e;
  }

  function validateForgot() {
    const e: { [key: string]: string } = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address";
    return e;
  }

  function validateReset() {
    const e: { [key: string]: string } = {};
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  }

  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    let e = {};
    if (authMode === 'register') e = validateRegister();
    else if (authMode === 'forgot') e = validateForgot();
    else if (authMode === 'reset') e = validateReset();
    else if (authMode === 'login') e = validateLogin();

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      if (authMode === 'register') {
        await authClient.post('/api/auth/register', {
          email,
          password,
          fullName: name
        });
        setSubmitted(true);
      } else if (authMode === 'login') {
        const res = await authClient.post('/api/auth/login', {
          email,
          password
        });
        setAuth(res.data.accessToken, res.data.refreshToken, res.data.user);
      } else if (authMode === 'forgot') {
        await authClient.post('/api/auth/forgot-password', { email });
        setAuthMode('check-email');
        setTimer(30);
      } else if (authMode === 'reset') {
        await authClient.post('/api/auth/reset-password', {
          token: urlToken,
          newPassword: password
        });
        switchMode('login');
        setErrors({ success: "Password reset successfully. Please log in." });
      }
    } catch (err: any) {
      if (err.response?.data?.fields) {
        setErrors(err.response.data.fields);
      } else {
        setErrors({
          general: err.response?.data?.message || "An unexpected error occurred. Please try again."
        });
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode(mode: AuthMode) {
    setAuthMode(mode);
    setErrors({});
    setSubmitted(false);
    setConfirmPassword("");
    if (mode === 'login') {
      // Clear password but keep email if already typed
      setPassword("");
    } else {
      setPassword("");
    }
  }

  if (isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <CoreApp
          onSignOut={() => {
            logout();
            authClient.post('/api/auth/logout').catch(() => { }); // fire and forget (optional if backend adds logout)
            switchMode('login');
          }}
        />
      </>
    );
  }

  if (authMode === 'guest-join' && joinCode) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <GuestMeetingFlow 
          joinCode={joinCode} 
          onBack={() => {
            setAuthMode('landing');
            window.history.replaceState({}, '', '/');
          }} 
        />
      </>
    );
  }

  if (authMode === 'landing') {
    return (
      <>
        <Toaster position="top-center" richColors />
        <LandingPage
          isDark={isDark}
          setIsDark={setIsDark}
          onSignIn={() => switchMode('login')}
          onGetStarted={() => switchMode('register')}
        />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen grid lg:grid-cols-2 font-sans bg-[#faf9f7] dark:bg-[#14120F] text-stone-900 dark:text-stone-100 selection:bg-emerald-500/30 transition-colors duration-200">
        <BrandPanel />

        {/* Auth side */}
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center justify-between p-6 md:px-8">
          <div className="lg:hidden cursor-pointer" onClick={() => switchMode('landing')}>
            <VaartaLogo />
          </div>
          <div className="hidden lg:block cursor-pointer" onClick={() => switchMode('landing')}>
            <span className="text-[13px] font-medium text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors">← Back to website</span>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full text-stone-500 hover:bg-stone-200/60 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 py-12">
          <div className="w-full max-w-[420px]">
            <div className="bg-white dark:bg-[#1A1712] border border-stone-200/80 dark:border-stone-800/80 rounded-[16px] shadow-[0_8px_30px_rgb(28,25,23,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden">
              <div className="p-8">

                {errors.general && (
                  <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md text-red-600 dark:text-red-400 text-sm">
                    {errors.general}
                  </div>
                )}
                {errors.success && (
                  <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md text-emerald-600 dark:text-emerald-400 text-sm">
                    {errors.success}
                  </div>
                )}

                {authMode === 'verify-email' ? (
                  <VerifyEmailScreen token={urlToken} switchMode={switchMode} />
                ) : authMode === 'check-email' ? (
                  <CheckEmailScreen
                    email={email}
                    timer={timer}
                    setTimer={setTimer}
                    loading={loading}
                    setLoading={setLoading}
                    setAuthMode={setAuthMode}
                    switchMode={switchMode}
                  />
                ) : (
                  <>
                    <div className="mb-8">
                      <h1 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-white mb-2">
                        {submitted
                          ? "Check your email"
                          : authMode === 'register'
                            ? "Create your account"
                            : authMode === 'forgot'
                              ? "Forgot password?"
                              : authMode === 'reset'
                                ? "Set new password"
                                : "Log in to Vaarta"}
                      </h1>
                      <p className="text-[14px] leading-relaxed text-stone-500 dark:text-stone-400">
                        {submitted
                          ? "We sent a secure link to your workspace. You can safely close this window."
                          : authMode === 'register'
                            ? "Join your team's workspace on Vaarta."
                            : authMode === 'forgot'
                              ? "No worries, we'll send you reset instructions. Please enter your work email."
                              : authMode === 'reset'
                                ? "Your new password must be different from previously used passwords."
                                : "Enter your work email to join your team's workspace."}
                      </p>
                    </div>

                    {submitted ? (
                      <div className="flex flex-col gap-6">
                        <button
                          onClick={() => {
                            setSubmitted(false);
                            setEmail("");
                            setPassword("");
                            if (authMode === 'register') {
                              setName("");
                              setMobile("");
                              setConfirmPassword("");
                              setTerms(false);
                            }
                          }}
                          className="text-[13px] font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 w-fit"
                        >
                          Return to {authMode === 'register' ? "registration" : "login"}
                        </button>
                      </div>
                    ) : authMode === 'forgot' ? (
                      <ForgotScreen
                        email={email}
                        setEmail={setEmail}
                        errors={errors}
                        setErrors={setErrors}
                        loading={loading}
                        handleSubmit={handleSubmit}
                      />
                    ) : authMode === 'reset' ? (
                      <ResetScreen
                        password={password}
                        setPassword={setPassword}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                        errors={errors}
                        setErrors={setErrors}
                        loading={loading}
                        handleSubmit={handleSubmit}
                      />
                    ) : authMode === 'register' ? (
                      <RegisterScreen
                        name={name}
                        setName={setName}
                        email={email}
                        setEmail={setEmail}
                        mobile={mobile}
                        setMobile={setMobile}
                        password={password}
                        setPassword={setPassword}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                        terms={terms}
                        setTerms={setTerms}
                        errors={errors}
                        setErrors={setErrors}
                        loading={loading}
                        handleSubmit={handleSubmit}
                      />
                    ) : (
                      <LoginScreen
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        errors={errors}
                        setErrors={setErrors}
                        loading={loading}
                        handleSubmit={handleSubmit}
                        switchMode={switchMode}
                      />
                    )}
                  </>
                )}
              </div>

              {!submitted && authMode !== 'check-email' && authMode !== 'verify-email' && (
                <div className="bg-stone-50/60 dark:bg-[#211D17]/50 border-t border-stone-100 dark:border-stone-800/80 p-8 pt-6 flex flex-col items-center gap-6">
                  {(authMode === 'forgot' || authMode === 'reset') ? (
                    <button
                      onClick={() => switchMode('login')}
                      className="text-[13.5px] font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors"
                    >
                      ← Back to log in
                    </button>
                  ) : (
                    <>
                      <p className="text-center text-[13.5px] text-stone-500 dark:text-stone-400">
                        {authMode === 'register' ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                          onClick={() => switchMode(authMode === 'register' ? 'login' : 'register')}
                          className="font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors hover:underline underline-offset-2"
                        >
                          {authMode === 'register' ? "Log in" : "Register"}
                        </button>
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="p-6 text-center">
          <p className="text-[13px] font-medium text-stone-400 dark:text-stone-600 flex items-center justify-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1L1.5 3v3c0 2.625 1.95 5.085 4.5 5.625C8.55 11.085 10.5 8.625 10.5 6V3L6 1z"
                fill="currentColor"
              />
            </svg>
            SOC 2 Type II Certified
          </p>
        </footer>
      </div>
    </div>
    </>
  );
}
