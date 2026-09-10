import type { ReactNode } from "react";

type AlertVariant = "success" | "warning" | "error" | "info";

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: ReactNode;
}

const styles: Record<AlertVariant, { bg: string; border: string; icon: string }> = {
  success: { bg: "bg-success-50", border: "border-success-600", icon: "✓" },
  warning: { bg: "bg-warning-50", border: "border-warning-600", icon: "!" },
  error: { bg: "bg-error-50", border: "border-error-600", icon: "✕" },
  info: { bg: "bg-brand-50", border: "border-brand-600", icon: "i" },
};

const iconColor: Record<AlertVariant, string> = {
  success: "text-success-600",
  warning: "text-warning-600",
  error: "text-error-600",
  info: "text-brand-600",
};

export function Alert({ variant, title, children }: AlertProps) {
  const s = styles[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`flex gap-3 rounded-lg border-l-4 ${s.border} ${s.bg} p-4`}
    >
      <span className={`mt-0.5 font-bold ${iconColor[variant]}`} aria-hidden="true">
        {s.icon}
      </span>
      <div className="text-sm text-neutral-900">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="text-neutral-600">{children}</div>
      </div>
    </div>
  );
}
