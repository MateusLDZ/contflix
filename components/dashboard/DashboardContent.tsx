"use client";

import { useMemo, useState } from "react";
import { GreetingBanner } from "@/components/dashboard/GreetingBanner";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiDetailModal } from "@/components/dashboard/KpiDetailModal";
import { kpis } from "@/data/mock-dashboard";
import { clientesAtivosDetail } from "@/data/kpi-details";
import { KpiKey } from "@/types/kpi-details";

export function DashboardContent() {
  const [selectedKpi, setSelectedKpi] = useState<KpiKey | null>(null);
  const detailConfig = useMemo(() => selectedKpi === "clientes-ativos" ? clientesAtivosDetail : null, [selectedKpi]);

  return <>
    <div className="space-y-6"><GreetingBanner /><section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4">{kpis.map((kpi) => {
      const clickable = kpi.label === "Clientes Ativos";
      return <KpiCard key={kpi.label} kpi={kpi} isClickable={clickable} ariaLabel={clickable ? "Abrir detalhes de Clientes Ativos" : kpi.label} onClick={clickable ? () => setSelectedKpi("clientes-ativos") : undefined} />;
    })}</section></div>
    {detailConfig && <KpiDetailModal config={detailConfig} onClose={() => setSelectedKpi(null)} />}
  </>;
}
