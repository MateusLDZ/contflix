import { getSupabaseClient } from "@/lib/supabase/client";

export const STATUS_OPTIONS = ["ativo", "inativo", "especial"];
export const SEGMENTO_OPTIONS = ["Serviços", "Comércio", "Associação/ONG", "Holding", "Indústria", "Doméstica/PF", "Carnê-Leão"];
export const REGIME_OPTIONS = ["Simples Nacional", "Lucro Presumido", "Lucro Real", "MEI", "Imune/Isento"];

export const QUADRANTE_COLORS: Record<string, string> = {
  "Alta Margem · Baixo Esforço": "#10B981",
  "Alta Margem · Alto Esforço": "#3B82F6",
  "Baixa Margem · Baixo Esforço": "#F59E0B",
  "Baixa Margem · Alto Esforço": "#A855F7",
  "Prejuízo": "#EF4444"
};

type Cliente = Record<string, any>;
export type AlocacaoClienteInput = { colaborador_id: string; time_id: string; mes_referencia: string; horas_alocadas: number };
export type ClienteFormPayload = {
  nome: string; apelido: string; documento: string; regime_tributario: string; segmento: string; cidade: string; uf: string; status: string; data_entrada: string; data_saida: string;
  mes_referencia: string; receita: number; custo: number; alocacoes: AlocacaoClienteInput[];
};

export type ClienteComMetricas = {
  id: string; nome: string; apelido: string | null; documento: string | null; regime_tributario: string | null; segmento: string | null; cidade: string | null; uf: string | null; status: string;
  data_entrada: string | null; data_saida: string | null; receita: number; custo: number; lucro: number; margem: number; horas_alocadas: number; quadrante: string; mes_referencia: string | null; alocacoes: AlocacaoClienteInput[];
};

export function calcularQuadrante(lucro: number, margem: number, horas: number) {
  if (lucro < 0) return "Prejuízo";
  if (margem >= 0.4 && horas <= 10) return "Alta Margem · Baixo Esforço";
  if (margem >= 0.4 && horas > 10) return "Alta Margem · Alto Esforço";
  if (margem < 0.4 && horas <= 10) return "Baixa Margem · Baixo Esforço";
  return "Baixa Margem · Alto Esforço";
}

export function calculateResumo(receita: number, custo: number, alocacoes: AlocacaoClienteInput[]) {
  const lucro = Number(receita || 0) - Number(custo || 0);
  const margem = receita > 0 ? lucro / receita : 0;
  const horas = alocacoes.reduce((s, a) => s + Number(a.horas_alocadas || 0), 0);
  return { receita, custo, lucro, margem, horas, quadrante: calcularQuadrante(lucro, margem, horas) };
}

export async function getClientesMeta() {
  const supabase = getSupabaseClient();
  const [{ data: colaboradores }, { data: times }] = await Promise.all([
    supabase.from("colaboradores").select("id,nome").order("nome"),
    supabase.from("times").select("id,nome").order("nome")
  ]);
  return { colaboradores: colaboradores ?? [], times: times ?? [] };
}

export async function getClientesTable(): Promise<ClienteComMetricas[]> {
  const supabase = getSupabaseClient();
  const { data: clientes, error } = await supabase.from("clientes").select("*").order("nome");
  if (error) throw error;

  return Promise.all((clientes ?? []).map(async (cliente: Cliente): Promise<ClienteComMetricas> => {
    const [{ data: financeiro }, { data: alocacoes }] = await Promise.all([
      supabase.from("financeiro_clientes").select("mes_referencia,receita,custo,lucro,margem,quadrante").eq("cliente_id", cliente.id).order("mes_referencia", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("alocacoes_clientes").select("colaborador_id,time_id,mes_referencia,horas_alocadas").eq("cliente_id", cliente.id)
    ]);
    const horas = (alocacoes ?? []).reduce((sum, item) => sum + Number(item.horas_alocadas ?? 0), 0);
    const lucro = Number(financeiro?.lucro ?? 0);
    const margem = Number(financeiro?.margem ?? 0);
    return { id: String(cliente.id), nome: String(cliente.nome), apelido: cliente.apelido ?? null, documento: cliente.documento ?? null, regime_tributario: cliente.regime_tributario ?? null, segmento: cliente.segmento ?? null, cidade: cliente.cidade ?? null, uf: cliente.uf ?? null, status: String(cliente.status ?? "ativo"), data_entrada: cliente.data_entrada ?? null, data_saida: cliente.data_saida ?? null, receita: Number(financeiro?.receita ?? 0), custo: Number(financeiro?.custo ?? 0), lucro, margem, horas_alocadas: horas, mes_referencia: financeiro?.mes_referencia ?? null, quadrante: financeiro?.quadrante ?? calcularQuadrante(lucro, margem, horas), alocacoes: (alocacoes ?? []).map((a) => ({ colaborador_id: a.colaborador_id, time_id: a.time_id, mes_referencia: a.mes_referencia, horas_alocadas: Number(a.horas_alocadas ?? 0) })) };
  }));
}

export async function saveClienteCompleto(editingId: string | null, form: ClienteFormPayload) {
  const supabase = getSupabaseClient();
  const clientePayload = { nome: form.nome, apelido: form.apelido || null, documento: form.documento || null, regime_tributario: form.regime_tributario || null, segmento: form.segmento || null, cidade: form.cidade || null, uf: form.uf || null, status: form.status, ativo: form.status !== "inativo", data_entrada: form.data_entrada || null, data_saida: form.data_saida || null };

  const clienteResp = editingId
    ? await supabase.from("clientes").update(clientePayload).eq("id", editingId).select("id").single()
    : await supabase.from("clientes").insert(clientePayload).select("id").single();
  if (clienteResp.error) { console.error(clienteResp.error); throw clienteResp.error; }

  const clienteId = clienteResp.data.id;
  const cleanMonth = form.mes_referencia.length === 7 ? `${form.mes_referencia}-01` : form.mes_referencia;
  const resumo = calculateResumo(form.receita, form.custo, form.alocacoes.filter((a) => a.mes_referencia === form.mes_referencia || a.mes_referencia === cleanMonth));

  const financeiroResp = await supabase.from("financeiro_clientes").upsert({ cliente_id: clienteId, mes_referencia: cleanMonth, receita: Number(form.receita), custo: Number(form.custo), quadrante: resumo.quadrante }, { onConflict: "cliente_id,mes_referencia" });
  if (financeiroResp.error) { console.error(financeiroResp.error); throw financeiroResp.error; }

  await supabase.from("alocacoes_clientes").delete().eq("cliente_id", clienteId);
  const payloadAloc = form.alocacoes.filter((a) => a.colaborador_id && a.mes_referencia).map((a) => ({ ...a, cliente_id: clienteId, mes_referencia: a.mes_referencia.length === 7 ? `${a.mes_referencia}-01` : a.mes_referencia }));
  if (payloadAloc.length) {
    const alocResp = await supabase.from("alocacoes_clientes").insert(payloadAloc);
    if (alocResp.error) { console.error(alocResp.error); throw alocResp.error; }
  }
}

export async function toggleClienteStatus(clienteId: string, currentStatus: string) {
  const supabase = getSupabaseClient();
  const nextStatus = currentStatus === "inativo" ? "ativo" : "inativo";
  const { error } = await supabase.from("clientes").update({ status: nextStatus, ativo: nextStatus !== "inativo", data_saida: nextStatus === "inativo" ? new Date().toISOString().slice(0, 10) : null }).eq("id", clienteId);
  if (error) {
    console.error(error);
    throw error;
  }
}

export function exportClientesCsv(clientes: ClienteComMetricas[]) {
  const lines = ["cliente,documento,regime,segmento,status,receita,custo,lucro,margem,horas,quadrante", ...clientes.map((c) => [c.nome, c.documento || "", c.regime_tributario || "", c.segmento || "", c.status, c.receita, c.custo, c.lucro, c.margem, c.horas_alocadas, c.quadrante].map((v) => `\"${String(v).replaceAll('"', '""')}\"`).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "clientes.csv";
  link.click();
}
