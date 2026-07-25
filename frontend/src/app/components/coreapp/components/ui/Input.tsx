import React from "react";
import { cn } from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-10 rounded-[6px] border border-stone-200 bg-white text-[14px] text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
            icon ? "pl-9 pr-3" : "px-3",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
