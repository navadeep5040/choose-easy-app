import { ReactNode } from "react";
import Link from "next/link";

export function DashboardLoading({ message = "LOADING DASHBOARD..." }: { message?: string }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <span className="material-symbols-outlined text-5xl sm:text-6xl text-primary animate-spin">
        progress_activity
      </span>
      <p className="font-mono-label text-outline mt-4 animate-pulse text-xs sm:text-sm">{message}</p>
    </div>
  );
}

export function DashboardEmpty({
  icon = "inbox",
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="text-center py-10 sm:py-14 px-4">
      <span className="material-symbols-outlined text-4xl sm:text-5xl text-outline mb-3 block">{icon}</span>
      <p className="font-h2 text-lg text-on-surface mb-2">{title}</p>
      {description && (
        <p className="font-body-md text-on-surface-variant text-sm max-w-md mx-auto mb-6">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary border border-primary/30 rounded-lg font-mono-label text-xs uppercase hover:bg-primary/20 transition-all"
        >
          {actionLabel}
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Pending"
      ? "bg-error/15 text-error border border-error/25"
      : status === "Confirmed"
        ? "bg-secondary/15 text-secondary border border-secondary/25"
        : status === "Completed"
          ? "bg-primary/15 text-primary border border-primary/25"
          : "bg-outline-variant/20 text-outline border border-outline-variant/35";

  const dotColor =
    status === "Pending"
      ? "bg-error shadow-[0_0_8px_#ffb4ab]"
      : status === "Confirmed"
        ? "bg-secondary shadow-[0_0_8px_#4edea3] animate-pulse"
        : status === "Completed"
          ? "bg-primary shadow-[0_0_8px_#8aebff]"
          : "bg-outline";

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-label uppercase whitespace-nowrap transition-all ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
}

export function StatCard({
  label,
  value,
  accent = "primary",
  icon,
}: {
  label: string;
  value: string | number;
  accent?: "primary" | "secondary" | "error";
  icon?: string;
}) {
  const border =
    accent === "error"
      ? "border-error/20 group-hover:border-error/45 hover:shadow-[0_0_20px_rgba(255,180,171,0.08)]"
      : accent === "secondary"
        ? "border-secondary/20 group-hover:border-secondary/45 hover:shadow-[0_0_20px_rgba(78,222,163,0.08)]"
        : "border-primary/20 group-hover:border-primary/45 hover:shadow-[0_0_20px_rgba(138,235,255,0.08)]";

  const valueColor =
    accent === "error" ? "text-error" : accent === "secondary" ? "text-secondary" : "text-on-background";

  return (
    <div className={`glass-panel p-4 sm:p-5.5 rounded-xl border ${border} min-w-0 transition-all duration-300 hover:-translate-y-0.5 group`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-mono-label text-outline text-[9px] sm:text-[10px] uppercase tracking-wider truncate">{label}</p>
        {icon && (
          <span
            className={`material-symbols-outlined text-[18px] sm:text-[20px] shrink-0 transition-transform duration-300 group-hover:scale-110 ${
              accent === "error" ? "text-error" : accent === "secondary" ? "text-secondary" : "text-primary"
            }`}
          >
            {icon}
          </span>
        )}
      </div>
      <p className={`font-display-xl text-2xl sm:text-3xl font-semibold tracking-tight ${valueColor} truncate`}>{value}</p>
    </div>
  );
}

export function DashboardSection({
  title,
  icon,
  iconClassName = "text-primary",
  count,
  borderClassName = "border-white/5",
  children,
}: {
  title: string;
  icon: string;
  iconClassName?: string;
  count?: number;
  borderClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={`glass-panel p-5 sm:p-8 rounded-2xl border ${borderClassName} mb-6 sm:mb-8`}>
      <h2 className="font-h2 text-xl sm:text-2xl mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className={`material-symbols-outlined ${iconClassName}`}>{icon}</span>
        {title}
        {count !== undefined && (
          <span className="font-mono-label text-xs text-outline ml-auto">({count})</span>
        )}
      </h2>
      {children}
    </section>
  );
}
