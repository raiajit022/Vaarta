import { Loader2, ArrowRight } from "lucide-react";
import { InputField } from "../InputField";

/**
 * Props for the LoginScreen component.
 */
interface LoginScreenProps {
  /** The current email input value. */
  email: string;
  /** Callback to update the email input value. */
  setEmail: (val: string) => void;
  /** The current password input value. */
  password: string;
  /** Callback to update the password input value. */
  setPassword: (val: string) => void;
  /** Validation or API errors keyed by field name. */
  errors: { [key: string]: string };
  /** Callback to update the errors object. */
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  /** Indicates if an authentication request is currently in progress. */
  loading: boolean;
  /** Callback invoked when the user submits the login form. */
  handleSubmit: (e: React.FormEvent) => void;
  /** Callback to navigate between different authentication views. */
  switchMode: (mode: 'login' | 'register' | 'forgot') => void;
}

/**
 * Renders the login form for existing users.
 * Captures email and password, and provides a link to the password reset flow.
 */

export function LoginScreen({
  email,
  setEmail,
  password,
  setPassword,
  errors,
  setErrors,
  loading,
  handleSubmit,
  switchMode,
}: LoginScreenProps) {
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <InputField
        id="email"
        label="Email address"
        type="email"
        value={email}
        onChange={(v) => {
          setEmail(v);
          if (errors.email) setErrors((e) => ({ ...e, email: "" }));
        }}
        placeholder="name@company.com"
        autoComplete="email"
        error={errors.email}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-[13px] font-medium text-stone-700 dark:text-stone-300"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => switchMode('forgot')}
            className="text-[13px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
          >
            Forgot?
          </button>
        </div>
        <InputField
          id="password"
          label=""
          type="password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (errors.password) setErrors((e) => ({ ...e, password: "" }));
          }}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full h-10 mt-2 flex items-center justify-center gap-2 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[14px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-[#1A1712] shadow-[inset_0px_1px_0px_rgba(255,255,255,0.2),0_1px_2px_rgba(6,95,70,0.15)] disabled:opacity-70 disabled:pointer-events-none"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            Continue
            <ArrowRight
              size={14}
              className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
            />
          </>
        )}
      </button>
    </form>
  );
}
