"use client";

import { useState } from "react";
import { GreetingBanner } from "@/components/dashboard/GreetingBanner";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiDetailModal } from "@/components/dashboard/KpiDetailModal";
import { clientesAtivosRows, kpis } from "@/data/mock-dashboard";

export function DashboardContent() {
  const [isClientesAtivosOpen, setIsClientesAtivosOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <GreetingBanner />
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {kpis.map((kpi) => {
            const isClientesAtivos = kpi.label === "Clientes Ativos";
            return (
              <KpiCard
                key={kpi.label}
                kpi={kpi}
                isClickable={isClientesAtivos}
                ariaLabel={isClientesAtivos ? "Abrir modal de Clientes Ativos" : kpi.label}
                onClick={isClientesAtivos ? () => setIsClientesAtivosOpen(true) : undefined}
              />
            );
          })}
        </section>
      </div>

      {isClientesAtivosOpen && (
        <KpiDetailModal
          title="👥 Clientes Ativos"
          rows={clientesAtivosRows}
          onClose={() => setIsClientesAtivosOpen(false)}
        />
      )}
    </>
  );
}
