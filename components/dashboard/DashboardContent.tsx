"use client";

import { useMemo, useState } from "react";
import { GreetingBanner } from "@/components/dashboard/GreetingBanner";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiDetailModal } from "@/components/dashboard/KpiDetailModal";
import { clientesAtivosDetail } from "@/data/kpi-details";
import { kpis } from "@/data/mock-dashboard";
import { KpiKey } from "@/types/kpi-details";

const KPI_CARD_TO_DETAIL_KEY: Record<string, KpiKey> = {
  "Clientes Ativos": "clientes-ativos",
};

export function DashboardContent() {
  const [selectedKpi, setSelectedKpi] = useState<KpiKey | null>(null);

  const detailConfig = useMemo(() => {
    if (selectedKpi === "clientes-ativos") return clientesAtivosDetail;
    return null;
  }, [selectedKpi]);

  return (
    <>
      <div className="space-y-6">
        <GreetingBanner />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {kpis.map((kpi) => {
            const detailKey = KPI_CARD_TO_DETAIL_KEY[kpi.label];
            const isClickable = Boolean(detailKey);

            return (
              <KpiCard
                key={kpi.label}
                kpi={kpi}
                isClickable={isClickable}
                ariaLabel={
                  isClickable ? `Abrir detalhes de ${kpi.label}` : kpi.label
                }
                onClick={
                  detailKey ? () => setSelectedKpi(detailKey) : undefined
                }
              />
            );
          })}
        </section>
      </div>

      {detailConfig && (
        <KpiDetailModal
          config={detailConfig}
          onClose={() => setSelectedKpi(null)}
        />
      )}
    </>
  );
}
