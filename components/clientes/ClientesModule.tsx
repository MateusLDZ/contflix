"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlocacaoCliente, calcularQuadrante, ClienteComMetricas, createCliente, getClienteById, getClientes, upsertAlocacoesCliente, upsertFinanceiroCliente, updateCliente } from "@/lib/supabase/clientes";

const quadranteColors: Record<string, string> = {
  "Alta Margem · Baixo Esforço": "#10B981",
  "Alta Margem · Alto Esforço": "#3B82F6",
  "Baixa Margem · Baixo Esforço": "#F59E0B",
  "Baixa Margem · Alto Esforço": "#A855F7",
  Prejuízo: "#EF4444"
};

const currency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const percent = (v: number) => `${(v * 100).toFixed(1)}%`;

export function ClientesModule() {
  const [clientes, setClientes] = useState<ClienteComMetricas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [meta, setMeta] = useState({ colaboradores: [] as any[], times: [] as any[] });
  const [filters, setFilters] = useState({ q: "", status: "", segmento: "", regime: "", quadrante: "" });
  const [form, setForm] = useState<any>({ status: "ativo", alocacoes: [{ colaborador_id: "", time_id: "", mes_referencia: "", horas_alocadas: 0 }] });

  async function load() {
    setLoading(true);
    setClientes(await getClientes());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => clientes.filter((c) => {
    const q = filters.q.toLowerCase();
    const hit = !q || [c.nome, c.apelido || "", c.documento || ""].join(" ").toLowerCase().includes(q);
    return hit && (!filters.status || c.status === filters.status) && (!filters.segmento || c.segmento === filters.segmento) && (!filters.regime || c.regime_tributario === filters.regime) && (!filters.quadrante || c.quadrante === filters.quadrante);
  }), [clientes, filters]);

  async function openModal(id?: string) {
    setStep(1);
    if (!id) {
      setEditingId(null);
      setForm({ status: "ativo", alocacoes: [{ colaborador_id: "", time_id: "", mes_referencia: "", horas_alocadas: 0 }] });
    } else {
      setEditingId(id);
      const detail = await getClienteById(id);
      setMeta({ colaboradores: detail.colaboradores, times: detail.times });
      setForm({ ...detail.cliente, ...detail.financeiro, alocacoes: detail.alocacoes.length ? detail.alocacoes : [{ colaborador_id: "", time_id: "", mes_referencia: "", horas_alocadas: 0 }] });
    }
    if (!id) {
      const detail = await getClienteById(clientes[0]?.id || "00000000-0000-0000-0000-000000000000").catch(() => null);
      setMeta({ colaboradores: detail?.colaboradores ?? [], times: detail?.times ?? [] });
    }
    setShowModal(true);
  }

  async function save() {
    const base = {
      nome: form.nome, apelido: form.apelido || null, documento: form.documento || null, regime_tributario: form.regime_tributario || null, segmento: form.segmento || null,
      cidade: form.cidade || null, uf: form.uf || null, status: form.status || "ativo", data_entrada: form.data_entrada || null, data_saida: form.data_saida || null
    };
    const cliente = editingId ? await updateCliente(editingId, base) : await createCliente(base);
    if (form.mes_referencia) {
      await upsertFinanceiroCliente({ cliente_id: cliente.id, mes_referencia: form.mes_referencia, receita: Number(form.receita || 0), custo: Number(form.custo || 0) });
    }
    const validAloc = (form.alocacoes as AlocacaoCliente[]).filter((a) => a.colaborador_id && a.mes_referencia);
    await upsertAlocacoesCliente(cliente.id, validAloc);
    setShowModal(false);
    await load();
  }

  return <div className="space-y-4">
    <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Clientes</CardTitle><Button onClick={() => openModal()}>Novo Cliente</Button></CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
        <input className="border rounded px-3 py-2" placeholder="Buscar nome, apelido ou documento" onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        {(["status", "segmento", "regime", "quadrante"] as const).map((k) => <input key={k} className="border rounded px-3 py-2" placeholder={k} onChange={(e) => setFilters({ ...filters, [k]: e.target.value })} />)}
      </div>
      {loading ? <p>Carregando...</p> : !filtered.length ? <div className="rounded-xl border border-dashed p-10 text-center text-contflix-muted">Nenhum cliente cadastrado.</div> :
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th>Cliente</th><th>Documento</th><th>Regime tributário</th><th>Segmento</th><th>Status</th><th>Receita mensal</th><th>Custo mensal</th><th>Lucro</th><th>Margem</th><th>Horas alocadas</th><th>Quadrante</th><th>Ações</th></tr></thead><tbody>{filtered.map((c) => <tr key={c.id} className="border-b"><td>{c.nome}</td><td>{c.documento || "-"}</td><td>{c.regime_tributario || "-"}</td><td>{c.segmento || "-"}</td><td>{c.status}</td><td>{currency(c.receita)}</td><td>{currency(c.custo)}</td><td>{currency(c.lucro)}</td><td>{percent(c.margem)}</td><td>{c.horas_alocadas.toFixed(1)}</td><td><span className="px-2 py-1 rounded text-white" style={{ backgroundColor: quadranteColors[c.quadrante] || "#64748B" }}>{c.quadrante}</span></td><td><Button variant="ghost" onClick={() => openModal(c.id)}>Editar</Button></td></tr>)}</tbody></table></div>}
    </CardContent></Card>

    {showModal && <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4"><div className="bg-white rounded-2xl w-full max-w-4xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-lg">{editingId ? "Editar" : "Novo"} Cliente · Etapa {step}/4</h3><Button variant="ghost" onClick={() => setShowModal(false)}>Fechar</Button></div>
      {step === 1 && <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{["nome","apelido","documento","regime_tributario","segmento","cidade","uf","status","data_entrada","data_saida"].map((f)=><input key={f} type={f.includes("data")?"date":"text"} className="border rounded px-3 py-2" placeholder={f} value={form[f]||""} onChange={(e)=>setForm({...form,[f]:e.target.value})} />)}</div>}
      {step === 2 && <div className="grid grid-cols-1 md:grid-cols-3 gap-2"><input type="month" className="border rounded px-3 py-2" value={form.mes_referencia||""} onChange={(e)=>setForm({...form,mes_referencia:e.target.value})} /><input type="number" className="border rounded px-3 py-2" placeholder="receita" value={form.receita||""} onChange={(e)=>setForm({...form,receita:e.target.value})} /><input type="number" className="border rounded px-3 py-2" placeholder="custo" value={form.custo||""} onChange={(e)=>setForm({...form,custo:e.target.value})} /></div>}
      {step === 3 && <div className="space-y-2">{(form.alocacoes||[]).map((a:any, i:number)=><div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2"><select className="border rounded px-3 py-2" value={a.colaborador_id||""} onChange={(e)=>{const al=[...form.alocacoes];al[i].colaborador_id=e.target.value;setForm({...form,alocacoes:al});}}><option value="">colaborador</option>{meta.colaboradores.map((c:any)=><option key={c.id} value={c.id}>{c.nome}</option>)}</select><select className="border rounded px-3 py-2" value={a.time_id||""} onChange={(e)=>{const al=[...form.alocacoes];al[i].time_id=e.target.value;setForm({...form,alocacoes:al});}}><option value="">time</option>{meta.times.map((t:any)=><option key={t.id} value={t.id}>{t.nome}</option>)}</select><input type="month" className="border rounded px-3 py-2" value={a.mes_referencia||""} onChange={(e)=>{const al=[...form.alocacoes];al[i].mes_referencia=e.target.value;setForm({...form,alocacoes:al});}} /><input type="number" className="border rounded px-3 py-2" placeholder="horas" value={a.horas_alocadas||0} onChange={(e)=>{const al=[...form.alocacoes];al[i].horas_alocadas=Number(e.target.value);setForm({...form,alocacoes:al});}} /></div>)}<Button variant="ghost" onClick={()=>setForm({...form,alocacoes:[...form.alocacoes,{colaborador_id:"",time_id:"",mes_referencia:form.mes_referencia||"",horas_alocadas:0}]})}>+ Alocação</Button></div>}
      {step === 4 && <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{(()=>{const receita=Number(form.receita||0),custo=Number(form.custo||0),lucro=receita-custo,margem=receita>0?lucro/receita:0,horas=(form.alocacoes||[]).reduce((s:number,a:any)=>s+Number(a.horas_alocadas||0),0),q=calcularQuadrante(lucro,margem,horas);return <>
      <div>Receita: <b>{currency(receita)}</b></div><div>Custo: <b>{currency(custo)}</b></div><div>Lucro: <b>{currency(lucro)}</b></div><div>Margem: <b>{percent(margem)}</b></div><div>Total horas: <b>{horas.toFixed(1)}</b></div><div>Quadrante: <span style={{color:quadranteColors[q]}}>{q}</span></div></>;})()}</div>}
      <div className="flex justify-between"><Button variant="ghost" onClick={()=>setStep(Math.max(1,step-1))}>Voltar</Button><div className="flex gap-2">{step<4?<Button onClick={()=>setStep(step+1)}>Próxima</Button>:<Button onClick={save}>Salvar Cliente</Button>}</div></div>
    </div></div>}
  </div>;
}
