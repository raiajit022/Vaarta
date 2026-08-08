import { ArrowRight } from 'lucide-react';
import { InputField } from '../InputField';
import { Button } from '../../ui/Button';

interface LoginScreenProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  switchMode: (mode: 'login' | 'register' | 'forgot') => void;
}

/** Login form for existing users. */
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
          if (errors.email) setErrors((e) => ({ ...e, email: '' }));
        }}
        placeholder="name@company.com"
        autoComplete="email"
        error={errors.email}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="t-small font-medium text-ink-2">
            Password
          </label>
          <button
            type="button"
            onClick={() => switchMode('forgot')}
            className="t-small font-medium text-ink-3 hover:text-iris transition-colors"
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
            if (errors.password) setErrors((e) => ({ ...e, password: '' }));
          }}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password}
        />
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full mt-2 group"
        trailing={
          <ArrowRight size={15} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
        }
      >
        Continue
      </Button>
    </form>
  );
}
