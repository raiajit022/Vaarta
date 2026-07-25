import React from "react";
import { cn } from "../../utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-stone-200 rounded-[12px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
