import { Loader2, ArrowRight } from "lucide-react";
import { InputField } from "../InputField";

interface ForgotScreenProps {
  email: string;
  setEmail: (val: string) => void;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export function ForgotScreen({
  email,
  setEmail,
  errors,
  setErrors,
  loading,
  handleSubmit,
}: ForgotScreenProps) {
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <InputField
        id="forgot-email"
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

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full h-10 mt-2 flex items-center justify-center gap-2 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[14px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-[#1A1712] shadow-[inset_0px_1px_0px_rgba(255,255,255,0.2),0_1px_2px_rgba(6,95,70,0.15)] disabled:opacity-70 disabled:pointer-events-none"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            Send instructions
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
