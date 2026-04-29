import { Card } from "@/components/ui/card";
import { Kpi } from "@/data/mock-dashboard";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  kpi: Kpi;
  isClickable?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
};

export function KpiCard({ kpi, isClickable = false, onClick, ariaLabel }: KpiCardProps) {
  const toneClass =
    kpi.tone === "alert"
      ? "bg-contflix-red"
      : kpi.tone === "accent"
        ? "bg-contflix-cyan"
        : "bg-contflix-primary";

  return (
    <Card
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel ?? kpi.label}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!isClickable) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "relative overflow-hidden p-4 transition",
        isClickable && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <span className={cn("absolute left-0 top-0 h-full w-1", toneClass)} />
      <p className="mb-2 text-[11px] uppercase tracking-wider text-contflix-muted">{kpi.label}</p>
      <p className="mb-1 text-xl font-bold text-contflix-text">{kpi.value}</p>
      <p className="text-xs text-contflix-muted">{kpi.hint}</p>
    </Card>
  );
import { cn } from "@/lib/utils";
import { Kpi } from "@/data/mock-dashboard";

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const tone = kpi.tone === "alert" ? "bg-contflix-red" : kpi.tone === "accent" ? "bg-contflix-cyan" : "bg-contflix-primary";
  return <Card className="p-4 relative overflow-hidden"><span className={cn("absolute left-0 top-0 h-full w-1", tone)} /><p className="text-[11px] tracking-wider uppercase text-contflix-muted mb-2">{kpi.label}</p><p className="text-xl font-bold text-contflix-text mb-1">{kpi.value}</p><p className="text-xs text-contflix-muted">{kpi.hint}</p></Card>;
}
