"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: string;
  sublabel?: string;
  variant?: "default" | "success" | "warning" | "danger";
  icon?: React.ReactNode;
  accent?: "primary" | "secondary" | "tertiary";
}

export function SummaryCard({
  label,
  value,
  sublabel,
  variant = "default",
  icon,
  accent,
}: SummaryCardProps) {
  const accentStyles = {
    primary: "metric-card-primary",
    secondary: "metric-card-secondary",
    tertiary: "metric-card-tertiary",
  };

  const variantStyles = {
    default: "",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass-effect rounded-xl p-6 relative overflow-hidden group",
        accent && accentStyles[accent]
      )}
    >
      {/* Glow effect */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />

      {/* Label */}
      <p className="label-caps text-on-surface-variant uppercase mb-2">
        {label}
      </p>

      {/* Value */}
      <h3 className={cn(
        "font-data text-2xl font-bold tracking-tighter mb-1",
        variantStyles[variant] || "text-on-surface"
      )}>
        {value}
      </h3>

      {/* Sublabel */}
      {sublabel && (
        <div className="flex items-center gap-2 text-on-surface-variant">
          {icon && <span className="text-sm">{icon}</span>}
          <span className="font-data text-xs">{sublabel}</span>
        </div>
      )}
    </motion.div>
  );
}

interface SummaryGridProps {
  children: React.ReactNode;
}

export function SummaryGrid({ children }: SummaryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {children}
    </div>
  );
}
