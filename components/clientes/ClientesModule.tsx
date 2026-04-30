"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ClientStatus = "Ativo" | "Inativo" | "Especial";

type LocalClient = {
  id: string;
  nome: string;
  cnpj: string;
  responsavel: string;
  whatsapp: string;
  status: ClientStatus;
  regime: string;
  segmento: string;
  honorario: number;
  createdAt: string;
};

type SortField = "nome" | "cnpj" | "responsavel" | "regime" | "segmento" | "status" | "honorario";

const STORAGE_KEY = "contflix_clientes_v1";
const SEGMENTOS = ["Serviços", "Comércio", "Saúde", "Holding", "Indústria", "Pessoa Física"];
const REGIMES = ["Simples Nacional", "Lucro Presumido", "Lucro Real", "MEI", "Imune/Isento"];
const STATUSES: ClientStatus[] = ["Ativo", "Inativo", "Especial"];
const PAGE_SIZE = 8;

const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

export function ClientesModule() {
  const [clients, setClients] = useState<LocalClient[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [segmento, setSegmento] = useState("");
  const [regime, setRegime] = useState("");
  const [sort, setSort] = useState<{ field: SortField; dir: "asc" | "desc" }>({ field: "nome", dir: "asc" });
  const [page, setPage] = useState(1);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<LocalClient, "id" | "createdAt">>({
    nome: "", cnpj: "", responsavel: "", whatsapp: "", status: "Ativo", regime: REGIMES[0], segmento: SEGMENTOS[0], honorario: 0
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as LocalClient[]) : [];
      setClients(parsed);
    } catch (error) {
      console.error("Erro ao ler localStorage de clientes:", error);
      setClients([]);
    }
  }, []);

  const persist = (next: LocalClient[]) => {
    setClients(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return clients
      .filter((c) => {
        const hit = !q || [c.nome, c.cnpj, c.responsavel].join(" ").toLowerCase().includes(q);
        return hit && (!status || c.status === status) && (!segmento || c.segmento === segmento) && (!regime || c.regime === regime);
      })
      .sort((a, b) => {
        const d = sort.dir === "asc" ? 1 : -1;
        const av = a[sort.field];
        const bv = b[sort.field];
        return av > bv ? d : av < bv ? -d : 0;
      });
  }, [clients, search, status, segmento, regime, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const kpis = useMemo(() => {
    const total = clients.length;
    const ativos = clients.filter((c) => c.status === "Ativo").length;
    const receita = clients.reduce((s, c) => s + Number(c.honorario || 0), 0);
    const ticket = ativos ? receita / ativos : 0;
    return { total, ativos, receita, ticket };
  }, [clients]);

  const openNew = () => {
    setEditingId(null);
    setForm({ nome: "", cnpj: "", responsavel: "", whatsapp: "", status: "Ativo", regime: REGIMES[0], segmento: SEGMENTOS[0], honorario: 0 });
    setIsOpen(true);
  };

  const openEdit = (c: LocalClient) => {
    setEditingId(c.id);
    setForm({ nome: c.nome, cnpj: c.cnpj, responsavel: c.responsavel, whatsapp: c.whatsapp, status: c.status, regime: c.regime, segmento: c.segmento, honorario: c.honorario });
    setIsOpen(true);
  };

  const saveClient = () => {
    if (!form.nome.trim()) return alert("Informe o nome do cliente.");
    const next = editingId
      ? clients.map((c) => (c.id === editingId ? { ...c, ...form } : c))
      : [{ ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...clients];
    persist(next);
    setIsOpen(false);
  };

  const toggleClientStatus = () => {
    if (!editingId) return;
    const current = clients.find((c) => c.id === editingId);
    if (!current) return;
    const nextStatus: ClientStatus = current.status === "Inativo" ? "Ativo" : "Inativo";
    const next = clients.map((c) => (c.id === editingId ? { ...c, status: nextStatus } : c));
    persist(next);
    setForm((prev) => ({ ...prev, status: nextStatus }));
  };

  const exportCsv = () => {
    const header = "nome,cnpj,responsavel,regime,segmento,status,honorario";
    const lines = filtered.map((c) => [c.nome, c.cnpj, c.responsavel, c.regime, c.segmento, c.status, c.honorario].map((x) => `\"${String(x).replaceAll('"', '""')}\"`).join(","));
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "clientes.csv";
    a.click();
  };

  return <div className="space-y-6">
    <Card className="border-slate-200 shadow-sm bg-white/90 rounded-3xl">
      <CardHeader className="flex flex-col gap-4">
        <div>
          <CardTitle className="text-5xl font-bold tracking-tight text-[#0B2A5B]">Clientes</CardTitle>
          <p className="text-slate-500 text-2xl mt-1">Gestão completa da carteira de clientes, filtros, cadastro e exportação.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <Kpi label="Total de Clientes" value={String(kpis.total)} hint="Base cadastrada" />
          <Kpi label="Clientes Ativos" value={String(kpis.ativos)} hint="Carteira ativa" />
          <Kpi label="Receita Mensal" value={brl(kpis.receita)} hint="Honorários recorrentes" />
          <Kpi label="Ticket Médio" value={brl(kpis.ticket)} hint="Receita por cliente ativo" />
        </div>

        <div className="rounded-2xl border border-slate-200 p-3 md:p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <input className="rounded-2xl border border-[#2453A7] ring-2 ring-[#2453A7]/10 px-4 py-3 md:col-span-2 text-lg" placeholder="Buscar por nome, CNPJ, apelido..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <select className="rounded-2xl border px-4 py-3 text-lg" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos os Status</option>{STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
            <select className="rounded-2xl border px-4 py-3 text-lg" value={segmento} onChange={(e) => setSegmento(e.target.value)}><option value="">Todos os Segmentos</option>{SEGMENTOS.map((x) => <option key={x}>{x}</option>)}</select>
            <select className="rounded-2xl border px-4 py-3 text-lg" value={regime} onChange={(e) => setRegime(e.target.value)}><option value="">Todos os Regimes</option>{REGIMES.map((x) => <option key={x}>{x}</option>)}</select>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={exportCsv}>CSV</Button>
              <Button variant="ghost" onClick={() => alert("Exportação PDF em breve")}>PDF</Button>
              <Button onClick={openNew}>+ Novo Cliente</Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border overflow-x-auto">
          <table className="w-full text-sm min-w-[1200px]">
            <thead className="bg-slate-100"><tr>{([
              ["nome", "Cliente"], ["cnpj", "CNPJ/CPF"], ["responsavel", "Responsável"], ["regime", "Regime"], ["segmento", "Segmento"], ["status", "Status"], ["honorario", "Honorário"]
            ] as Array<[SortField, string]>).map(([field, label]) => <th key={field} className="text-left px-5 py-4 uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap"><button onClick={() => setSort({ field, dir: sort.field === field && sort.dir === "asc" ? "desc" : "asc" })}>{label}</button></th>)}<th className="px-5 py-4 uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">Ações</th></tr></thead>
            <tbody>{paged.map((c) => <tr key={c.id} className="border-t"><td className="px-5 py-4 font-semibold text-[#0B2A5B] whitespace-nowrap">{c.nome}</td><td className="px-5 py-4 whitespace-nowrap">{c.cnpj || "-"}</td><td className="px-5 py-4 whitespace-nowrap">{c.responsavel || "-"}</td><td className="px-5 py-4 whitespace-nowrap">{c.regime}</td><td className="px-5 py-4 whitespace-nowrap">{c.segmento}</td><td className="px-5 py-4 whitespace-nowrap"><span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${c.status === "Ativo" ? "bg-emerald-100 text-emerald-700" : c.status === "Especial" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"}`}>{(c.status || "").charAt(0).toUpperCase() + (c.status || "").slice(1).toLowerCase()}</span></td><td className="px-5 py-4 font-semibold whitespace-nowrap">{brl(c.honorario)}</td><td className="px-5 py-4 whitespace-nowrap"><div className="flex gap-2"><Button variant="ghost" onClick={() => openEdit(c)}>Editar</Button></div></td></tr>)}</tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500"><span>{filtered.length} clientes encontrados</span><div className="flex items-center gap-2"><Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button><span>Página {page} de {totalPages}</span><Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</Button></div></div>
      </CardContent>
    </Card>

    {isOpen && <Modal title={editingId ? "Editar Cliente" : "Novo Cliente"} onClose={() => setIsOpen(false)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input label="Nome / Apelido do Cliente" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
        <Input label="CNPJ / CPF" value={form.cnpj} onChange={(v) => setForm({ ...form, cnpj: v })} />
        <Input label="Responsável" value={form.responsavel} onChange={(v) => setForm({ ...form, responsavel: v })} />
        <Input label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
        <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v as ClientStatus })} options={STATUSES} />
        <Select label="Regime Tributário" value={form.regime} onChange={(v) => setForm({ ...form, regime: v })} options={REGIMES} />
        <Select label="Segmento" value={form.segmento} onChange={(v) => setForm({ ...form, segmento: v })} options={SEGMENTOS} />
        <div><label className="text-sm">Honorário Mensal</label><input type="number" className="w-full rounded-xl border px-3 py-2" value={form.honorario} onChange={(e) => setForm({ ...form, honorario: Number(e.target.value) })} /></div>
      </div>
      <div className="flex justify-between gap-2 mt-4">
        {editingId ? <Button variant="ghost" onClick={toggleClientStatus}>{form.status === "Inativo" ? "Reativar cliente" : "Inativar cliente"}</Button> : <span />}
        <div className="flex gap-2"><Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button><Button onClick={saveClient}>Salvar Cliente</Button></div>
      </div>
    </Modal>}

  </div>;
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) { return <div className="rounded-xl border p-3"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-semibold">{value}</p><p className="text-xs text-slate-500">{hint}</p></div>; }
function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) { return <div><label className="text-sm">{label}</label><input className="w-full rounded-xl border px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} /></div>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) { return <div><label className="text-sm">{label}</label><select className="w-full rounded-xl border px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((x) => <option key={x}>{x}</option>)}</select></div>; }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { return <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"><div className="bg-white rounded-2xl w-full max-w-3xl p-6"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">{title}</h3><Button variant="ghost" onClick={onClose}>Fechar</Button></div>{children}</div></div>; }
