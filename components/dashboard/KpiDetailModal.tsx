"use client";

import { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, FileText, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiDetailConfig, ClienteAtivo } from "@/types/kpi-details";
import { exportClientesAtivosCsv, filterClientesAtivos } from "@/utils/kpi-details";

type KpiDetailModalProps = {
  config: KpiDetailConfig<ClienteAtivo>;
  onClose: () => void;
};

function formatBrl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function marginClass(margem: number | null) {
  if (margem == null) return "text-slate-500";
  return margem >= 0 ? "text-emerald-600" : "text-red-600";
}

function quadranteClass(quadrante: string | null) {
  if (!quadrante) return "bg-slate-100 text-slate-500";
  if (quadrante.includes("Alta Margem")) return "bg-amber-100 text-amber-700";
  if (quadrante.includes("PREJUÍZO")) return "bg-red-100 text-red-700";
  return "bg-blue-100 text-blue-700";
}

export function KpiDetailModal({ config, onClose }: KpiDetailModalProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const filteredRows = useMemo(
    () => filterClientesAtivos(config.rows, search),
    [config.rows, search]
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-[#020617]/60 p-4 backdrop-blur-sm md:p-8"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-[85vh] w-full max-w-7xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 rounded-t-2xl border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-contflix-text">{config.title}</h2>
              <p className="text-sm text-contflix-muted">{config.subtitle}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar modal">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {config.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filtrar..."
              className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-contflix-muted">
              {filteredRows.length} registro(s)
            </span>
            <Button variant="ghost" className="border border-slate-200">
              <FileText className="mr-1 h-4 w-4" />
              PDF
            </Button>
            {filteredRows.length > 0 && (
              <Button
                variant="ghost"
                className="border border-slate-200"
                onClick={() =>
                  exportClientesAtivosCsv(filteredRows, config.csvFileName)
                }
              >
                <FileSpreadsheet className="mr-1 h-4 w-4" />
                CSV
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-4">
          <div className="min-w-[1050px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-100 text-slate-700">
                <tr>
                  {["Cliente", "CNPJ/CPF", "Regime", "Segmento", "Cidade", "Honorário", "Margem", "Quadrante"].map((column) => (
                    <th key={column} className="px-3 py-2 text-left font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 bg-white">
                    <td className="px-3 py-2 font-semibold text-contflix-navy">
                      {row.cliente}
                    </td>
                    <td className="px-3 py-2">{row.cnpjCpf}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                        {row.regime}
                      </span>
                    </td>
                    <td className="px-3 py-2">{row.segmento}</td>
                    <td className="px-3 py-2">{row.cidade}</td>
                    <td className="px-3 py-2">{formatBrl(row.honorario)}</td>
                    <td className={`px-3 py-2 font-medium ${marginClass(row.margem)}`}>
                      {row.margem == null ? "-" : `${(row.margem * 100).toFixed(1).replace(".", ",")}%`}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-1 text-xs ${quadranteClass(row.quadrante)}`}>
                        {row.quadrante ?? "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3">
          <p className="text-xs text-contflix-muted">{config.sourceLabel}</p>
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}
