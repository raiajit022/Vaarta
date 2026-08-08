import { ArrowRight } from 'lucide-react';
import { InputField } from '../InputField';
import { PasswordStrength } from '../PasswordStrength';
import { Button } from '../../ui/Button';

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
            if (errors.password) setErrors((e) => ({ ...e, password: '' }));
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
          if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: '' }));
        }}
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword}
      />

      <Button
        type="submit"
        loading={loading}
        className="w-full mt-2 group"
        trailing={
          <ArrowRight size={15} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
        }
      >
        Reset password
      </Button>
    </form>
  );
}
