import { ArrowRight } from 'lucide-react';
import { InputField } from '../InputField';
import { Button } from '../../ui/Button';

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
          if (errors.email) setErrors((e) => ({ ...e, email: '' }));
        }}
        placeholder="name@company.com"
        autoComplete="email"
        error={errors.email}
      />

      <Button
        type="submit"
        loading={loading}
        className="w-full mt-2 group"
        trailing={
          <ArrowRight size={15} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
        }
      >
        Send instructions
      </Button>
    </form>
  );
}
