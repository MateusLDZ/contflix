"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlocacaoClienteInput,
  ClienteComMetricas,
  ClienteFormPayload,
  QUADRANTE_COLORS,
  SEGMENTO_OPTIONS,
  STATUS_OPTIONS,
  REGIME_OPTIONS,
  calculateResumo,
  exportClientesCsv,
  getClientesMeta,
  getClientesTable,
  saveClienteCompleto,
  toggleClienteStatus
} from "@/lib/supabase/clientes";

type SortKey = "cliente" | "documento" | "regime" | "segmento" | "status" | "receita" | "margem" | "quadrante";

const QUADRANTE_OPTIONS = Object.keys(QUADRANTE_COLORS);
const PAGE_SIZE = 10;

const brl = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
const pct = (value: number) => `${((Number.isFinite(value) ? value : 0) * 100).toFixed(1)}%`;
const onlyDigits = (value: string) => value.replace(/\D/g, "");

export function ClientesModule() {
  const [clientes, setClientes] = useState<ClienteComMetricas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ colaboradores: Array<{ id: string; nome: string }>; times: Array<{ id: string; nome: string }> }>({ colaboradores: [], times: [] });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "cliente", dir: "asc" });

  const [filters, setFilters] = useState({ q: "", status: "", segmento: "", regime: "", quadrante: "" });
  const [form, setForm] = useState<ClienteFormPayload>({
    nome: "",
    apelido: "",
    documento: "",
    regime_tributario: "",
    segmento: "",
    cidade: "",
    uf: "",
    status: "ativo",
    data_entrada: "",
    data_saida: "",
    mes_referencia: "",
    receita: 0,
    custo: 0,
    alocacoes: [{ colaborador_id: "", time_id: "", mes_referencia: "", horas_alocadas: 0 }]
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [items, lookup] = await Promise.all([getClientesTable(), getClientesMeta()]);
      setClientes(items);
      setMeta(lookup);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      setError("Não foi possível carregar os clientes. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const search = filters.q.toLowerCase().trim();
    const normalizedSearchDoc = onlyDigits(search);
    const records = clientes.filter((c) => {
      const textHit = [c.nome, c.apelido || "", formatCNPJ(c.documento || "")].join(" ").toLowerCase().includes(search);
      const documentHit = normalizedSearchDoc ? onlyDigits(c.documento || "").includes(normalizedSearchDoc) : false;
      const hit = !search || textHit || documentHit;
      return hit && (!filters.status || c.status === filters.status) && (!filters.segmento || c.segmento === filters.segmento) && (!filters.regime || c.regime_tributario === filters.regime) && (!filters.quadrante || c.quadrante === filters.quadrante);
    });
    const sorted = [...records].sort((a, b) => {
      const d = sort.dir === "asc" ? 1 : -1;
      const map = {
        cliente: [a.nome, b.nome],
        documento: [a.documento || "", b.documento || ""],
        regime: [a.regime_tributario || "", b.regime_tributario || ""],
        segmento: [a.segmento || "", b.segmento || ""],
        status: [a.status, b.status],
        receita: [a.receita, b.receita],
        margem: [a.margem, b.margem],
        quadrante: [a.quadrante, b.quadrante]
      } as const;
      const pair = map[sort.key];
      return pair[0] > pair[1] ? d : pair[0] < pair[1] ? -d : 0;
    });
    return sorted;
  }, [clientes, filters, sort]);

  const kpis = useMemo(() => {
    const ativos = clientes.filter((c) => c.status === "ativo").length;
    const prejuizo = clientes.filter((c) => c.lucro < 0).length;
    const ticket = clientes.length ? clientes.reduce((s, c) => s + c.receita, 0) / clientes.length : 0;
    const now = new Date();
    const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const entrants = clientes.filter((c) => c.data_entrada?.startsWith(month)).length;
    const exits = clientes.filter((c) => c.data_saida?.startsWith(month)).length;
    const churn = clientes.length ? exits / clientes.length : 0;
    const uniqueColab = new Set(clientes.flatMap((c) => c.alocacoes.map((a) => a.colaborador_id).filter(Boolean)));
    const perColab = uniqueColab.size ? clientes.length / uniqueColab.size : 0;
    return { ativos, prejuizo, ticket, entrants, churn, perColab };
  }, [clientes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resumoPreview = calculateResumo(form.receita, form.custo, form.alocacoes);

  const openNew = () => {
    setEditingId(null);
    setForm({ nome: "", apelido: "", documento: "", regime_tributario: "", segmento: "", cidade: "", uf: "", status: "ativo", data_entrada: "", data_saida: "", mes_referencia: "", receita: 0, custo: 0, alocacoes: [{ colaborador_id: "", time_id: "", mes_referencia: "", horas_alocadas: 0 }] });
    setShowModal(true);
  };

  const openEdit = (c: ClienteComMetricas) => {
    setEditingId(c.id);
    setForm({ nome: c.nome, apelido: c.apelido || "", documento: c.documento || "", regime_tributario: c.regime_tributario || "", segmento: c.segmento || "", cidade: c.cidade || "", uf: c.uf || "", status: c.status, data_entrada: c.data_entrada || "", data_saida: c.data_saida || "", receita: c.receita, custo: c.custo, mes_referencia: c.mes_referencia?.slice(0, 7) || "", alocacoes: c.alocacoes.length ? c.alocacoes.map((a) => ({ ...a, mes_referencia: a.mes_referencia.slice(0, 7) })) : [{ colaborador_id: "", time_id: "", mes_referencia: "", horas_alocadas: 0 }] });
    setShowModal(true);
  };

  const onSave = async () => {
    if (!form.nome || !form.status || !form.mes_referencia) return setError("Preencha nome, status e mês de referência.");
    if (form.documento && onlyDigits(form.documento).length !== 14) return setError("CNPJ inválido. Informe os 14 dígitos.");
    try {
      setSaving(true);
      setError(null);
      await saveClienteCompleto(editingId, form);
      setShowModal(false);
      await load();
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      setError("Não foi possível salvar o cliente.");
    } finally {
      setSaving(false);
    }
  };
  const onToggleStatusInModal = async () => {
    if (!editingId) return;
    try {
      setSaving(true);
      setError(null);
      await toggleClienteStatus(editingId, form.status);
      setForm((prev) => ({ ...prev, status: prev.status === "inativo" ? "ativo" : "inativo" }));
      await load();
    } catch (err) {
      console.error("Erro ao alterar status do cliente:", err);
      setError("Não foi possível alterar o status do cliente.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="space-y-6">
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><CardTitle className="text-2xl">Clientes</CardTitle><p className="text-sm text-slate-500 mt-1">Gestão completa da carteira de clientes</p></div>
        <div className="flex gap-2"><Button variant="ghost" onClick={() => exportClientesCsv(filtered)}>Exportar CSV</Button><Button variant="ghost" onClick={() => alert("Exportação PDF em preparação.")}>Exportar PDF</Button><Button onClick={openNew}>Novo Cliente</Button></div>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}
        <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">{[
          ["Clientes ativos", String(kpis.ativos)], ["Clientes em prejuízo", String(kpis.prejuizo)], ["Ticket médio", brl(kpis.ticket)], ["Entrantes no mês", String(kpis.entrants)], ["Churn", pct(kpis.churn)], ["Clientes/colaborador", kpis.perColab.toFixed(1)]
        ].map(([label, value]) => <div key={label} className="rounded-xl border bg-white p-3"><p className="text-xs text-slate-500">{label}</p><p className="font-semibold text-lg">{value}</p></div>)}</div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input className="rounded-xl border px-3 py-2" placeholder="Buscar nome, apelido ou documento" value={filters.q} onChange={(e) => { setFilters({ ...filters, q: e.target.value }); setPage(1); }} />
          <select className="rounded-xl border px-3 py-2" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">status</option>{STATUS_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}</select>
          <select className="rounded-xl border px-3 py-2" value={filters.segmento} onChange={(e) => setFilters({ ...filters, segmento: e.target.value })}><option value="">segmento</option>{SEGMENTO_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}</select>
          <select className="rounded-xl border px-3 py-2" value={filters.regime} onChange={(e) => setFilters({ ...filters, regime: e.target.value })}><option value="">regime</option>{REGIME_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}</select>
          <select className="rounded-xl border px-3 py-2" value={filters.quadrante} onChange={(e) => setFilters({ ...filters, quadrante: e.target.value })}><option value="">quadrante</option>{QUADRANTE_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}</select>
        </div>
        <p className="text-sm text-slate-500">{filtered.length} clientes encontrados</p>

        {!loading && !filtered.length ? <div className="rounded-2xl border border-dashed p-10 text-center"><p className="text-lg font-semibold">Nenhum cliente cadastrado ainda</p><p className="text-sm text-slate-500">Cadastre o primeiro cliente para alimentar o dashboard.</p></div> :
          <div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[1200px] text-sm"><thead className="bg-slate-50"><tr>{[["cliente", "Cliente"],["documento", "Documento"],["regime", "Regime"],["segmento", "Segmento"],["status", "Status"],["receita", "Honorário"],["margem", "Margem"],["quadrante", "Quadrante"]].map(([k, label]) => <th key={k} className="text-left px-3 py-2 whitespace-nowrap"><button onClick={() => setSort({ key: k as SortKey, dir: sort.key === k && sort.dir === "asc" ? "desc" : "asc" })}>{label}</button></th>)}<th className="px-3 py-2 whitespace-nowrap">Custo</th><th className="px-3 py-2 whitespace-nowrap">Lucro</th><th className="px-3 py-2 whitespace-nowrap">Horas</th><th className="px-3 py-2 whitespace-nowrap">Ações</th></tr></thead><tbody>{rows.map((c) => <tr key={c.id} className="border-t"><td className="px-3 py-2 whitespace-nowrap"><p className="font-medium whitespace-nowrap">{c.nome}</p></td><td className="px-3 py-2 whitespace-nowrap">{c.documento || "-"}</td><td className="px-3 py-2 whitespace-nowrap">{c.regime_tributario || "-"}</td><td className="px-3 py-2 whitespace-nowrap">{c.segmento || "-"}</td><td className="px-3 py-2 whitespace-nowrap">{formatStatus(c.status)}</td><td className="px-3 py-2 whitespace-nowrap">{brl(c.receita)}</td><td className="px-3 py-2 whitespace-nowrap">{pct(c.margem)}</td><td className="px-3 py-2 whitespace-nowrap"><span className="text-white rounded-full px-3 py-1 text-xs whitespace-nowrap inline-flex items-center" style={{ background: QUADRANTE_COLORS[c.quadrante] }}>{c.quadrante}</span></td><td className="px-3 py-2 whitespace-nowrap">{brl(c.custo)}</td><td className="px-3 py-2 whitespace-nowrap">{brl(c.lucro)}</td><td className="px-3 py-2 whitespace-nowrap">{c.horas_alocadas.toFixed(1)}</td><td className="px-3 py-2 whitespace-nowrap"><div className="flex gap-1"><Button variant="ghost" onClick={() => openEdit(c)}>Editar</Button></div></td></tr>)}</tbody></table></div>}

        <div className="flex items-center justify-between"><Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button><span className="text-sm">Página {page} de {totalPages}</span><Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</Button></div>
      </CardContent>
    </Card>

    {showModal && <div className="fixed inset-0 z-50 bg-black/40 p-4 grid place-items-center"><div className="bg-white max-w-5xl w-full rounded-2xl p-6 space-y-5 max-h-[92vh] overflow-auto"><div className="flex justify-between"><h3 className="font-semibold text-xl">{editingId ? "Editar Cliente" : "Novo Cliente"}</h3><Button variant="ghost" onClick={() => setShowModal(false)}>Fechar</Button></div>
      <section className="space-y-4"><h4 className="text-sm font-semibold text-slate-700">Dados cadastrais</h4><div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Nome / Razão Social</label><input className="rounded-xl border px-3 py-2 w-full" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
        <div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Apelido</label><input className="rounded-xl border px-3 py-2 w-full" value={form.apelido} onChange={(e) => setForm({ ...form, apelido: e.target.value })} /></div>
        <div className="flex flex-col gap-1"><label className="text-xs text-slate-500">CNPJ</label><input className="rounded-xl border px-3 py-2 w-full" value={formatCNPJ(form.documento ?? "")} onChange={(e) => setForm({ ...form, documento: onlyDigits(e.target.value).slice(0, 14) })} /></div>
        <div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Cidade</label><input className="rounded-xl border px-3 py-2 w-full" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></div>
        <div className="flex flex-col gap-1"><label className="text-xs text-slate-500">UF</label><input className="rounded-xl border px-3 py-2 w-full" value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value })} /></div>
        <div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Data de entrada</label><input type="date" className="rounded-xl border px-3 py-2 w-full" value={form.data_entrada} onChange={(e) => setForm({ ...form, data_entrada: e.target.value })} /></div>
        <div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Data de saída</label><input type="date" className="rounded-xl border px-3 py-2 w-full" value={form.data_saida} onChange={(e) => setForm({ ...form, data_saida: e.target.value })} /></div>
        <div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Regime tributário</label><select className="rounded-xl border px-3 py-2 w-full" value={form.regime_tributario} onChange={(e) => setForm({ ...form, regime_tributario: e.target.value })}><option value="">Selecione</option>{REGIME_OPTIONS.map((x) => <option key={x}>{x}</option>)}</select></div>
        <div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Segmento</label><select className="rounded-xl border px-3 py-2 w-full" value={form.segmento} onChange={(e) => setForm({ ...form, segmento: e.target.value })}><option value="">Selecione</option>{SEGMENTO_OPTIONS.map((x) => <option key={x}>{x}</option>)}</select></div>
        <div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Status</label><select className="rounded-xl border px-3 py-2 w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="">Selecione</option>{STATUS_OPTIONS.map((x) => <option key={x}>{x}</option>)}</select></div>
      </div></section>
      <section className="space-y-4"><h4 className="text-sm font-semibold text-slate-700">Financeiro mensal</h4><div className="grid md:grid-cols-3 gap-3"><div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Mês de referência</label><input type="month" className="rounded-xl border px-3 py-2 w-full" value={form.mes_referencia} onChange={(e) => setForm({ ...form, mes_referencia: e.target.value })} /></div><div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Receita</label><input type="number" step="0.01" className="rounded-xl border px-3 py-2 w-full" value={form.receita} onChange={(e) => setForm({ ...form, receita: Number(e.target.value) })} /></div><div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Custo</label><input type="number" step="0.01" className="rounded-xl border px-3 py-2 w-full" value={form.custo} onChange={(e) => setForm({ ...form, custo: Number(e.target.value) })} /></div></div></section>
      <section className="space-y-4"><h4 className="text-sm font-semibold text-slate-700">Operação / esforço</h4>{form.alocacoes.map((a, idx) => <div key={idx} className="grid md:grid-cols-4 gap-3"><div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Colaborador</label><select className="rounded-xl border px-3 py-2 w-full" value={a.colaborador_id} onChange={(e) => updateAloc(setForm, form.alocacoes, idx, { colaborador_id: e.target.value })}><option value="">Selecione</option>{meta.colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div><div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Time</label><select className="rounded-xl border px-3 py-2 w-full" value={a.time_id || ""} onChange={(e) => updateAloc(setForm, form.alocacoes, idx, { time_id: e.target.value })}><option value="">Selecione</option>{meta.times.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}</select></div><div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Mês de referência</label><input type="month" className="rounded-xl border px-3 py-2 w-full" value={a.mes_referencia} onChange={(e) => updateAloc(setForm, form.alocacoes, idx, { mes_referencia: e.target.value })} /></div><div className="flex flex-col gap-1"><label className="text-xs text-slate-500">Horas alocadas</label><input type="number" step="0.1" className="rounded-xl border px-3 py-2 w-full" value={a.horas_alocadas} onChange={(e) => updateAloc(setForm, form.alocacoes, idx, { horas_alocadas: Number(e.target.value) })} /></div></div>)}<Button variant="ghost" onClick={() => setForm({ ...form, alocacoes: [...form.alocacoes, { colaborador_id: "", time_id: "", mes_referencia: form.mes_referencia, horas_alocadas: 0 }] })}>+ Adicionar alocação</Button></section>
      <section className="rounded-xl bg-slate-50 p-4 space-y-4"><h4 className="text-sm font-semibold text-slate-700">Resumo automático</h4><div className="grid md:grid-cols-3 gap-3 text-sm"><div className="rounded-lg bg-white p-3"><p className="text-xs text-slate-500">Receita</p><p className="font-semibold">{brl(resumoPreview.receita)}</p></div><div className="rounded-lg bg-white p-3"><p className="text-xs text-slate-500">Custo</p><p className="font-semibold">{brl(resumoPreview.custo)}</p></div><div className="rounded-lg bg-white p-3"><p className="text-xs text-slate-500">Lucro</p><p className="font-semibold">{brl(resumoPreview.lucro)}</p></div><div className="rounded-lg bg-white p-3"><p className="text-xs text-slate-500">Margem</p><p className="font-semibold">{pct(resumoPreview.margem)}</p></div><div className="rounded-lg bg-white p-3"><p className="text-xs text-slate-500">Horas</p><p className="font-semibold">{resumoPreview.horas.toFixed(1)}</p></div><div className="rounded-lg bg-white p-3"><p className="text-xs text-slate-500">Quadrante</p><p className="font-semibold" style={{ color: QUADRANTE_COLORS[resumoPreview.quadrante] }}>{resumoPreview.quadrante}</p></div></div></section>
      <div className="flex justify-between gap-2"><div>{editingId && <Button variant="ghost" disabled={saving} onClick={onToggleStatusInModal}>{form.status === "inativo" ? "Reativar cliente" : "Inativar cliente"}</Button>}</div><div className="flex gap-2"><Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button><Button disabled={saving} onClick={onSave}>{saving ? "Salvando..." : "Salvar cliente"}</Button></div></div></div></div>}

  </div>;
}

function updateAloc(setForm: any, list: AlocacaoClienteInput[], idx: number, patch: Partial<AlocacaoClienteInput>) {
  const copy = [...list];
  copy[idx] = { ...copy[idx], ...patch };
  setForm((prev: ClienteFormPayload) => ({ ...prev, alocacoes: copy }));
}

function formatStatus(status: string) {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
