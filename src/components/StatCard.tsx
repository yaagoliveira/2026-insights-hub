import { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/data/financeiro2026";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}

const StatCard = ({ title, value, icon: Icon, subtitle, trend }: StatCardProps) => (
  <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{title}</span>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <span className={`text-2xl font-bold ${trend === "up" ? "text-destructive" : trend === "down" ? "text-primary" : "text-foreground"}`}>
      {formatCurrency(value)}
    </span>
    {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
  </div>
);

export default StatCard;
