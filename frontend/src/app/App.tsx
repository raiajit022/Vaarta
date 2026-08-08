import { useState, useEffect, lazy, Suspense } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./hooks/useTheme";
import { BrandPanel } from "./components/BrandPanel";
import { LoginScreen } from "./components/auth/LoginScreen";
import { RegisterScreen } from "./components/auth/RegisterScreen";
import { ForgotScreen } from "./components/auth/ForgotScreen";
import { CheckEmailScreen } from "./components/auth/CheckEmailScreen";
import { ResetScreen } from "./components/auth/ResetScreen";
import { VerifyEmailScreen } from "./components/auth/VerifyEmailScreen";

import { useAuthStore } from "./store/useAuthStore";
import { authClient } from "./apiClient";
import { Toaster } from "sonner";
import { Button } from "./ui/Button";
import { Logo } from "./ui/Logo";
import { ConfirmHost } from "./ui/confirm";
import { RouteFallback } from "./ui/RouteFallback";

// Landing, the signed-in app and the guest flow are mutually exclusive
// top-level branches, so each ships as its own chunk.
const LandingPage = lazy(() =>
  import("./components/landing/LandingPage").then((m) => ({ default: m.LandingPage }))
);
const CoreApp = lazy(() =>
  import("./components/coreapp/App").then((m) => ({ default: m.CoreApp }))
);
const GuestMeetingFlow = lazy(() =>
  import("./components/guest/GuestMeetingFlow").then((m) => ({ default: m.GuestMeetingFlow }))
);

type AuthMode = 'landing' | 'login' | 'register' | 'forgot' | 'check-email' | 'reset' | 'verify-email' | 'guest-join';

/**
 * App-wide overlay hosts: toasts and the promise-based confirm dialog.
 * Rendered alongside every top-level branch so they are always available.
 */
function Overlays({ isDark }: { isDark: boolean }) {
  return (
    <>
      <Toaster
        position="top-center"
        theme={isDark ? 'dark' : 'light'}
        toastOptions={{
          style: {
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            color: 'var(--ink)',
            borderRadius: '12px',
          },
        }}
      />
      <ConfirmHost />
    </>
  );
}

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
        <Overlays isDark={isDark} />
        <Suspense fallback={<RouteFallback />}>
          <CoreApp
            onSignOut={() => {
              logout();
              authClient.post('/api/auth/logout').catch(() => { }); // fire and forget (optional if backend adds logout)
              switchMode('login');
            }}
          />
        </Suspense>
      </>
    );
  }

  if (authMode === 'guest-join' && joinCode) {
    return (
      <>
        <Overlays isDark={isDark} />
        <Suspense fallback={<RouteFallback />}>
          <GuestMeetingFlow
            joinCode={joinCode}
            onBack={() => {
              setAuthMode('landing');
              window.history.replaceState({}, '', '/');
            }}
          />
        </Suspense>
      </>
    );
  }

  if (authMode === 'landing') {
    return (
      <>
        <Overlays isDark={isDark} />
        <Suspense fallback={<RouteFallback />}>
          <LandingPage
            isDark={isDark}
            setIsDark={setIsDark}
            onSignIn={() => switchMode('login')}
            onGetStarted={() => switchMode('register')}
          />
        </Suspense>
      </>
    );
  }

  return (
    <>
      <Overlays isDark={isDark} />
      <div className="min-h-screen grid lg:grid-cols-2 font-sans bg-canvas text-ink">
        <BrandPanel />

        {/* Auth side */}
        <div className="relative flex flex-col min-h-screen">
          {/* Atmosphere, visible only when the brand panel is hidden */}
          <div className="absolute inset-0 pointer-events-none lg:hidden" aria-hidden="true">
            <div className="aurora aurora-iris w-[520px] h-[520px] -top-40 -right-32 opacity-[0.18]" />
          </div>

          <header className="relative flex items-center justify-between p-6 md:px-8">
            <button
              onClick={() => switchMode('landing')}
              className="lg:hidden"
              aria-label="Back to home"
            >
              <Logo size="sm" />
            </button>
            <button
              onClick={() => switchMode('landing')}
              className="hidden lg:block t-small font-medium text-ink-3 hover:text-ink transition-colors"
            >
              ← Back to website
            </button>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => setIsDark(!isDark)}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </Button>
          </header>

          <main className="relative flex-1 flex items-center justify-center p-6 py-10">
            <div className="w-full max-w-[420px]">
              <div className="bg-surface border border-line rounded-2xl elev-3 overflow-hidden">
                <div className="p-8">
                  {errors.general && (
                    <div className="mb-6 px-3.5 py-3 rounded-lg bg-danger-soft border border-danger-line text-danger-ink t-small">
                      {errors.general}
                    </div>
                  )}
                  {errors.success && (
                    <div className="mb-6 px-3.5 py-3 rounded-lg bg-live-soft border border-live-line text-live-ink t-small">
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
                      <div className="mb-7">
                        <h1 className="t-h2 text-ink mb-2">
                          {submitted
                            ? 'Check your email'
                            : authMode === 'register'
                              ? 'Create your account'
                              : authMode === 'forgot'
                                ? 'Forgot password?'
                                : authMode === 'reset'
                                  ? 'Set a new password'
                                  : 'Welcome back'}
                        </h1>
                        <p className="t-small text-ink-2 leading-relaxed">
                          {submitted
                            ? 'We sent a confirmation link to your inbox. You can safely close this window.'
                            : authMode === 'register'
                              ? 'Start hosting meetings in about a minute.'
                              : authMode === 'forgot'
                                ? "Enter your email and we'll send reset instructions."
                                : authMode === 'reset'
                                  ? 'Choose something you have not used before.'
                                  : 'Log in to get back to your meetings.'}
                        </p>
                      </div>

                      {submitted ? (
                        <div className="flex flex-col gap-6">
                          <button
                            onClick={() => {
                              setSubmitted(false);
                              setEmail('');
                              setPassword('');
                              if (authMode === 'register') {
                                setName('');
                                setMobile('');
                                setConfirmPassword('');
                                setTerms(false);
                              }
                            }}
                            className="t-small font-medium text-iris hover:underline underline-offset-2 w-fit"
                          >
                            Return to {authMode === 'register' ? 'registration' : 'login'}
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
                  <div className="bg-canvas-raised border-t border-line px-8 py-5 flex justify-center">
                    {authMode === 'forgot' || authMode === 'reset' ? (
                      <button
                        onClick={() => switchMode('login')}
                        className="t-small font-medium text-ink-3 hover:text-ink transition-colors"
                      >
                        ← Back to log in
                      </button>
                    ) : (
                      <p className="t-small text-ink-3">
                        {authMode === 'register'
                          ? 'Already have an account?'
                          : "Don't have an account?"}{' '}
                        <button
                          onClick={() => switchMode(authMode === 'register' ? 'login' : 'register')}
                          className="font-medium text-iris hover:underline underline-offset-2"
                        >
                          {authMode === 'register' ? 'Log in' : 'Create one'}
                        </button>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>

          <footer className="relative p-6 text-center">
            <p className="t-caption text-ink-3">
              Encrypted in transit · Guests join without an account
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
