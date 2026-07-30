import { Loader2, ArrowRight } from "lucide-react";
import { InputField } from "../InputField";
import { PasswordStrength } from "../PasswordStrength";

interface ResetScreenProps {
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export function ResetScreen({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  setErrors,
  loading,
  handleSubmit,
}: ResetScreenProps) {
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <InputField
          id="reset-password"
          label="New password"
          type="password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (errors.password) setErrors((e) => ({ ...e, password: "" }));
          }}
          placeholder="Create a new password"
          autoComplete="new-password"
          error={errors.password}
        />
        <PasswordStrength password={password} />
      </div>
      <InputField
        id="reset-confirm"
        label="Confirm new password"
        type="password"
        value={confirmPassword}
        onChange={(v) => {
          setConfirmPassword(v);
          if (errors.confirmPassword)
            setErrors((e) => ({ ...e, confirmPassword: "" }));
        }}
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword}
      />

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full h-10 mt-2 flex items-center justify-center gap-2 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[14px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-[#1A1712] shadow-[inset_0px_1px_0px_rgba(255,255,255,0.2),0_1px_2px_rgba(6,95,70,0.15)] disabled:opacity-70 disabled:pointer-events-none"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            Reset password
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
