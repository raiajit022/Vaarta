import React from "react";
import { cn } from "../../utils/cn";

type Variant = "default" | "secondary" | "outline" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  default:
    "bg-gradient-to-r from-[#34d399] to-[#059669] text-white hover:opacity-90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]",
  secondary:
    "bg-stone-100 text-stone-900 hover:bg-stone-200 border border-stone-200",
  outline:
    "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50",
  ghost: "bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900",
};

export function Button({
  variant = "default",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[6px] text-[14px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
