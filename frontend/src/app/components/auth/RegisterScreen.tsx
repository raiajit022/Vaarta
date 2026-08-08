import { ArrowRight, Check } from 'lucide-react';
import { InputField } from '../InputField';
import { PasswordStrength } from '../PasswordStrength';
import { Button } from '../../ui/Button';

interface RegisterScreenProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  mobile: string;
  setMobile: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  terms: boolean;
  setTerms: (val: boolean) => void;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

/** Registration form for new users. */
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
          if (errors.name) setErrors((e) => ({ ...e, name: '' }));
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
          if (errors.email) setErrors((e) => ({ ...e, email: '' }));
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
        <label htmlFor="password" className="t-small font-medium text-ink-2">
          Password
        </label>
        <InputField
          id="password"
          label=""
          type="password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (errors.password) setErrors((e) => ({ ...e, password: '' }));
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
          if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: '' }));
        }}
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword}
      />

      <div className="mt-1 flex items-start gap-2.5">
        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
          <input
            id="terms"
            type="checkbox"
            checked={terms}
            onChange={(e) => {
              setTerms(e.target.checked);
              if (errors.terms) setErrors((err) => ({ ...err, terms: '' }));
            }}
            className="peer appearance-none w-4 h-4 rounded border border-line-strong bg-surface-inset checked:bg-iris checked:border-iris transition-colors cursor-pointer"
          />
          <Check
            size={11}
            strokeWidth={3.5}
            className="absolute text-on-iris pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
          />
        </div>
        <label htmlFor="terms" className="t-small leading-snug text-ink-2 cursor-pointer select-none">
          I agree to Vaarta's{' '}
          <a href="#" className="text-ink font-medium hover:text-iris underline underline-offset-2">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-ink font-medium hover:text-iris underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </label>
      </div>
      {errors.terms && <p className="-mt-3 t-caption font-medium text-danger-ink">{errors.terms}</p>}

      <Button
        type="submit"
        loading={loading}
        className="w-full mt-2 group"
        trailing={
          <ArrowRight size={15} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
        }
      >
        Create account
      </Button>
    </form>
  );
}
