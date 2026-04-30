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
  const [viewing, setViewing] = useState<LocalClient | null>(null);
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

  const deleteClient = (id: string) => {
    if (!confirm("Deseja excluir este cliente?")) return;
    persist(clients.filter((c) => c.id !== id));
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
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-3xl">Clientes</CardTitle>
          <p className="text-slate-500">Gestão completa da carteira de clientes da Contflix.</p>
        </div>
        <Button onClick={openNew}>+ Novo Cliente</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <Kpi label="Total de Clientes" value={String(kpis.total)} hint="Base cadastrada" />
          <Kpi label="Clientes Ativos" value={String(kpis.ativos)} hint="Carteira ativa" />
          <Kpi label="Receita Mensal" value={brl(kpis.receita)} hint="Honorários recorrentes" />
          <Kpi label="Ticket Médio" value={brl(kpis.ticket)} hint="Receita por cliente ativo" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="rounded-xl border px-3 py-2 md:col-span-2" placeholder="Buscar por nome, CNPJ, responsável..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className="rounded-xl border px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos os status</option>{STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
          <select className="rounded-xl border px-3 py-2" value={segmento} onChange={(e) => setSegmento(e.target.value)}><option value="">Todos os segmentos</option>{SEGMENTOS.map((x) => <option key={x}>{x}</option>)}</select>
          <select className="rounded-xl border px-3 py-2" value={regime} onChange={(e) => setRegime(e.target.value)}><option value="">Todos os regimes</option>{REGIMES.map((x) => <option key={x}>{x}</option>)}</select>
          <Button variant="ghost" onClick={exportCsv}>Exportar CSV</Button>
        </div>

        <div className="rounded-xl border overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>{([
              ["nome", "Cliente"], ["cnpj", "CNPJ/CPF"], ["responsavel", "Responsável"], ["regime", "Regime"], ["segmento", "Segmento"], ["status", "Status"], ["honorario", "Honorário"]
            ] as Array<[SortField, string]>).map(([field, label]) => <th key={field} className="text-left px-3 py-2"><button onClick={() => setSort({ field, dir: sort.field === field && sort.dir === "asc" ? "desc" : "asc" })}>{label}</button></th>)}<th className="px-3 py-2">Ações</th></tr></thead>
            <tbody>{paged.map((c) => <tr key={c.id} className="border-t"><td className="px-3 py-2 font-medium">{c.nome}</td><td className="px-3 py-2">{c.cnpj || "-"}</td><td className="px-3 py-2">{c.responsavel || "-"}</td><td className="px-3 py-2">{c.regime}</td><td className="px-3 py-2">{c.segmento}</td><td className="px-3 py-2">{c.status}</td><td className="px-3 py-2">{brl(c.honorario)}</td><td className="px-3 py-2"><div className="flex gap-1"><Button variant="ghost" onClick={() => setViewing(c)}>Ver</Button><Button variant="ghost" onClick={() => openEdit(c)}>Editar</Button><Button variant="ghost" onClick={() => deleteClient(c.id)}>Excluir</Button></div></td></tr>)}</tbody>
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
      <div className="flex justify-end gap-2 mt-4"><Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button><Button onClick={saveClient}>Salvar Cliente</Button></div>
    </Modal>}

    {viewing && <Modal title="Detalhes do cliente" onClose={() => setViewing(null)}><div className="space-y-2 text-sm"><p><b>Cliente:</b> {viewing.nome}</p><p><b>CNPJ/CPF:</b> {viewing.cnpj || "-"}</p><p><b>Responsável:</b> {viewing.responsavel || "-"}</p><p><b>WhatsApp:</b> {viewing.whatsapp || "-"}</p><p><b>Status:</b> {viewing.status}</p><p><b>Regime:</b> {viewing.regime}</p><p><b>Segmento:</b> {viewing.segmento}</p><p><b>Honorário:</b> {brl(viewing.honorario)}</p></div></Modal>}
  </div>;
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) { return <div className="rounded-xl border p-3"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-semibold">{value}</p><p className="text-xs text-slate-500">{hint}</p></div>; }
function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) { return <div><label className="text-sm">{label}</label><input className="w-full rounded-xl border px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} /></div>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) { return <div><label className="text-sm">{label}</label><select className="w-full rounded-xl border px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((x) => <option key={x}>{x}</option>)}</select></div>; }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { return <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"><div className="bg-white rounded-2xl w-full max-w-3xl p-6"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">{title}</h3><Button variant="ghost" onClick={onClose}>Fechar</Button></div>{children}</div></div>; }
