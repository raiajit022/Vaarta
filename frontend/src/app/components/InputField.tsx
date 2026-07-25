import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * A reusable, styled input field component with optional label and error state.
 * Supports a toggleable password visibility feature if the type is "password".
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
  const inputType = type === "password" ? (showPw ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between items-baseline">
          <label
            htmlFor={id}
            className="text-[13px] font-medium text-stone-700 dark:text-stone-300"
          >
            {label}
          </label>
          {optional && (
            <span className="text-[12px] text-stone-400 dark:text-stone-500">Optional</span>
          )}
        </div>
      )}
      <div className="relative flex items-center">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full h-10 px-3 rounded-[6px] text-[14px] bg-white dark:bg-[#1E1B16] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 border shadow-sm transition-all outline-none focus:ring-2 focus:ring-emerald-500/20 ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 focus:border-emerald-500 dark:focus:border-emerald-500"
          }`}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 p-1 rounded-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            tabIndex={-1}
          >
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[12px] font-medium text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
}
