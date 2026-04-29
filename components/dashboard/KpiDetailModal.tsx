"use client";

import { X, Search, FileText, FileSpreadsheet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ClienteAtivo, KpiDetailConfig } from "@/types/kpi-details";
import { exportClientesAtivosCsv, filterClientesAtivos } from "@/utils/kpi-details";
import { Button } from "@/components/ui/button";

type Props = { config: KpiDetailConfig<ClienteAtivo>; onClose: () => void };

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function KpiDetailModal({ config, onClose }: Props) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const filteredRows = useMemo(() => filterClientesAtivos(config.rows, search), [config.rows, search]);

  return <div className="fixed inset-0 z-50 bg-[#020617]/60 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
    <div className="mx-auto w-full max-w-7xl h-[85vh] rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col" onClick={(e) => e.stopPropagation()}>
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-contflix-text">{config.title}</h2><p className="text-sm text-contflix-muted">{config.subtitle}</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar modal"><X className="h-5 w-5"/></Button></div>
        <div className="mt-3 flex flex-wrap gap-2">{config.badges.map((badge) => <span key={badge} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{badge}</span>)}</div>
      </div>
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Filtrar..." className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm"/></div>
        <div className="flex items-center gap-2"><span className="text-sm text-contflix-muted">{filteredRows.length} registro(s)</span><Button variant="ghost" className="border border-slate-200"><FileText className="h-4 w-4 mr-1"/>PDF</Button>{filteredRows.length > 0 && <Button variant="ghost" className="border border-slate-200" onClick={() => exportClientesAtivosCsv(filteredRows, config.csvFileName)}><FileSpreadsheet className="h-4 w-4 mr-1"/>CSV</Button>}</div>
      </div>
      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="min-w-[1050px]">
          <table className="w-full text-sm"><thead className="bg-slate-100 text-slate-700 sticky top-0"><tr>{["Cliente","CNPJ/CPF","Regime","Segmento","Cidade","Honorário","Margem","Quadrante"].map((col)=><th key={col} className="text-left px-3 py-2 font-semibold">{col}</th>)}</tr></thead><tbody>{filteredRows.map((row)=><tr key={row.id} className="border-b border-slate-100 bg-white"><td className="px-3 py-2 font-semibold text-contflix-navy">{row.cliente}</td><td className="px-3 py-2">{row.cnpjCpf}</td><td className="px-3 py-2"><span className="rounded-full bg-blue-100 text-blue-700 px-2 py-1 text-xs">{row.regime}</span></td><td className="px-3 py-2">{row.segmento}</td><td className="px-3 py-2">{row.cidade}</td><td className="px-3 py-2">{brl(row.honorario)}</td><td className={`px-3 py-2 font-medium ${row.margem == null ? "text-slate-500" : row.margem >= 0 ? "text-emerald-600" : "text-red-600"}`}>{row.margem == null ? "-" : `${(row.margem * 100).toFixed(1).replace('.', ',')}%`}</td><td className="px-3 py-2">{row.quadrante ? <span className={`rounded-full px-2 py-1 text-xs ${row.quadrante.includes("Alta Margem") ? "bg-amber-100 text-amber-700" : row.quadrante.includes("PREJUÍZO") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{row.quadrante}</span> : <span className="rounded-full bg-slate-100 text-slate-500 px-2 py-1 text-xs">-</span>}</td></tr>)}</tbody></table>
        </div>
      </div>
      <div className="border-t border-slate-200 px-6 py-3 flex items-center justify-between"><p className="text-xs text-contflix-muted">{config.sourceLabel}</p><Button onClick={onClose}>Fechar</Button></div>
    </div>
  </div>;
}
