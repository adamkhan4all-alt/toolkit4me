import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

const base =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 min-h-11 text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-neutral-200 disabled:text-neutral-400",
  secondary: "bg-white text-neutral-900 border border-neutral-200 hover:border-brand-600",
  tertiary: "bg-transparent text-brand-600 hover:underline px-2",
  destructive: "bg-transparent text-error-600 hover:bg-error-50",
};

export function Button({ variant = "primary", fullWidth, className = "", children, ...rest }: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
