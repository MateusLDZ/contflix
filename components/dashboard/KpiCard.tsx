import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Kpi } from "@/data/mock-dashboard";

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const tone = kpi.tone === "alert" ? "bg-contflix-red" : kpi.tone === "accent" ? "bg-contflix-cyan" : "bg-contflix-primary";
  return <Card className="p-4 relative overflow-hidden"><span className={cn("absolute left-0 top-0 h-full w-1", tone)} /><p className="text-[11px] tracking-wider uppercase text-contflix-muted mb-2">{kpi.label}</p><p className="text-xl font-bold text-contflix-text mb-1">{kpi.value}</p><p className="text-xs text-contflix-muted">{kpi.hint}</p></Card>;
}
