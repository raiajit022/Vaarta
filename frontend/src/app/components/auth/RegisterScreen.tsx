import { Loader2, ArrowRight, Check } from "lucide-react";
import { InputField } from "../InputField";
import { PasswordStrength } from "../PasswordStrength";

/**
 * Props for the RegisterScreen component.
 */
interface RegisterScreenProps {
  /** The current full name input value. */
  name: string;
  /** Callback to update the full name input value. */
  setName: (val: string) => void;
  /** The current email input value. */
  email: string;
  /** Callback to update the email input value. */
  setEmail: (val: string) => void;
  /** The current mobile number input value. */
  mobile: string;
  /** Callback to update the mobile number input value. */
  setMobile: (val: string) => void;
  /** The current password input value. */
  password: string;
  /** Callback to update the password input value. */
  setPassword: (val: string) => void;
  /** The current password confirmation input value. */
  confirmPassword: string;
  /** Callback to update the password confirmation input value. */
  setConfirmPassword: (val: string) => void;
  /** Boolean indicating whether the user agreed to the terms. */
  terms: boolean;
  /** Callback to update the terms agreement state. */
  setTerms: (val: boolean) => void;
  /** Validation or API errors keyed by field name. */
  errors: { [key: string]: string };
  /** Callback to update the errors object. */
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  /** Indicates if an authentication request is currently in progress. */
  loading: boolean;
  /** Callback invoked when the user submits the registration form. */
  handleSubmit: (e: React.FormEvent) => void;
}

/**
 * Renders the registration form for new users.
 * Captures user details, password confirmation, and terms agreement.
 */
export function RegisterScreen({
  name,
  setName,
  email,
  setEmail,
  mobile,
  setMobile,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  terms,
  setTerms,
  errors,
  setErrors,
  loading,
  handleSubmit,
}: RegisterScreenProps) {
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <InputField
        id="name"
        label="Full name"
        type="text"
        value={name}
        onChange={(v) => {
          setName(v);
          if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
        }}
        placeholder="Jane Doe"
        autoComplete="name"
        error={errors.name}
      />

      <InputField
        id="email"
        label="Email address"
        type="email"
        value={email}
        onChange={(v) => {
          setEmail(v);
          if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
        }}
        placeholder="name@company.com"
        autoComplete="email"
        error={errors.email}
      />

      <InputField
        id="mobile"
        label="Mobile number"
        type="text"
        value={mobile}
        onChange={(v) => setMobile(v)}
        placeholder="+1 (555) 000-0000"
        autoComplete="tel"
        optional
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-[13px] font-medium text-stone-700 dark:text-stone-300"
        >
          Password
        </label>
        <InputField
          id="password"
          label=""
          type="password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
          }}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password}
        />
        <PasswordStrength password={password} />
      </div>

      <InputField
        id="confirmPassword"
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(v) => {
          setConfirmPassword(v);
          if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: undefined }));
        }}
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword}
      />

      <div className="mt-1 flex items-start gap-2.5 group">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id="terms"
            type="checkbox"
            checked={terms}
            onChange={(e) => {
              setTerms(e.target.checked);
              if (errors.terms) setErrors((err) => ({ ...err, terms: undefined }));
            }}
            className="peer appearance-none w-4 h-4 border border-stone-300 dark:border-stone-700 rounded-[4px] bg-white dark:bg-[#1E1B16] checked:bg-emerald-600 checked:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer"
          />
          <Check
            size={12}
            className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
            strokeWidth={3}
          />
        </div>
        <label
          htmlFor="terms"
          className="text-[13px] leading-snug text-stone-600 dark:text-stone-400 cursor-pointer select-none"
        >
          I agree to Vaarta's{" "}
          <a href="#" className="text-stone-900 dark:text-stone-200 font-medium hover:underline underline-offset-2">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-stone-900 dark:text-stone-200 font-medium hover:underline underline-offset-2">Privacy Policy</a>.
        </label>
      </div>
      {errors.terms && (
        <p className="-mt-3 text-[12px] font-medium text-red-500">{errors.terms}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full h-10 mt-2 flex items-center justify-center gap-2 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[14px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-[#1A1712] shadow-[inset_0px_1px_0px_rgba(255,255,255,0.2),0_1px_2px_rgba(6,95,70,0.15)] disabled:opacity-70 disabled:pointer-events-none"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            Create account
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
