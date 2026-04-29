"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClienteAtivoRow } from "@/data/mock-dashboard";

type KpiDetailModalProps = {
  title: string;
  rows: ClienteAtivoRow[];
  onClose: () => void;
};

const columns = ["Cliente", "CNPJ/CPF", "Regime", "Segmento", "Cidade", "Honorário", "Margem", "Quadrante"];

export function KpiDetailModal({ title, rows, onClose }: KpiDetailModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const filteredRows = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return rows;
    return rows.filter((row) =>
      [row.cliente, row.cnpjCpf, row.regime, row.segmento, row.cidade, row.quadrante ?? ""]
        .some((field) => field.toLowerCase().includes(search))
    );
  }, [rows, query]);

  return (
    <div className="fixed inset-0 z-50 bg-[#020617]/60 p-4 backdrop-blur-sm md:p-8" onClick={onClose}>
      <div className="mx-auto flex h-[85vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-contflix-text">{title}</h2>
            <p className="text-sm text-contflix-muted">{filteredRows.length} registro(s)</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar modal">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="border-b border-slate-100 px-6 py-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filtrar..."
              className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-4">
          <div className="min-w-[980px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-100 text-slate-700">
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="px-3 py-2 text-left font-semibold">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 bg-white">
                    <td className="px-3 py-2 font-semibold text-contflix-navy">{row.cliente}</td>
                    <td className="px-3 py-2">{row.cnpjCpf}</td>
                    <td className="px-3 py-2">{row.regime}</td>
                    <td className="px-3 py-2">{row.segmento}</td>
                    <td className="px-3 py-2">{row.cidade}</td>
                    <td className="px-3 py-2">{row.honorario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className="px-3 py-2">{row.margem == null ? "-" : `${(row.margem * 100).toFixed(1).replace(".", ",")}%`}</td>
                    <td className="px-3 py-2">{row.quadrante ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-3">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}
