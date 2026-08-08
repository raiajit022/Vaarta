import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, Field } from '../ui/Input';

/**
 * Labelled input with built-in password reveal.
 *
 * Now a thin wrapper over the shared `Field` + `Input` primitives so auth
 * inherits the same control styling as the rest of the product. The prop
 * contract is unchanged.
 */
export function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  id,
  error,
  autoComplete,
  optional,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  id: string;
  error?: string;
  autoComplete?: string;
  optional?: boolean;
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPw ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between items-baseline">
          <label htmlFor={id} className="t-small font-medium text-ink-2">
            {label}
          </label>
          {optional && <span className="t-caption text-ink-3">Optional</span>}
        </div>
      )}
      <Field error={error}>
        <Input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          error={!!error}
          affix={
            isPassword ? (
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="p-1.5 rounded-md hover:text-ink hover:bg-surface-hover transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            ) : undefined
          }
        />
      </Field>
    </div>
  );
}
