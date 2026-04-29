import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Kpi } from "@/data/mock-dashboard";

type Props = { kpi: Kpi; onClick?: () => void; isClickable?: boolean; ariaLabel?: string };

export function KpiCard({ kpi, onClick, isClickable, ariaLabel }: Props) {
  const tone = kpi.tone === "alert" ? "bg-contflix-red" : kpi.tone === "accent" ? "bg-contflix-cyan" : "bg-contflix-primary";
  return <Card role={isClickable ? "button" : undefined} tabIndex={isClickable ? 0 : undefined} aria-label={ariaLabel ?? kpi.label} onClick={onClick} onKeyDown={(e) => { if (isClickable && (e.key === "Enter" || e.key === " ")) onClick?.(); }} className={cn("p-4 relative overflow-hidden transition", isClickable && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contflix-cyan/50")}> <span className={cn("absolute left-0 top-0 h-full w-1", tone)} /><p className="text-[11px] tracking-wider uppercase text-contflix-muted mb-2">{kpi.label}</p><p className="text-xl font-bold text-contflix-text mb-1">{kpi.value}</p><p className="text-xs text-contflix-muted">{kpi.hint}</p></Card>;
}
