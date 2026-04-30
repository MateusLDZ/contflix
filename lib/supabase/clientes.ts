import { getSupabaseClient } from "@/lib/supabase/client";

export type Cliente = {
  id: string;
  nome: string;
  apelido: string | null;
  documento: string | null;
  regime_tributario: string | null;
  segmento: string | null;
  cidade: string | null;
  uf: string | null;
  status: string;
  data_entrada: string | null;
  data_saida: string | null;
};

export type FinanceiroCliente = {
  id: string;
  cliente_id: string;
  mes_referencia: string;
  receita: number;
  custo: number;
  lucro: number;
  margem: number;
  quadrante: string | null;
};

export type AlocacaoCliente = {
  id?: string;
  cliente_id?: string;
  colaborador_id: string;
  time_id: string | null;
  mes_referencia: string;
  horas_alocadas: number;
};

export type ClienteComMetricas = Cliente & {
  receita: number;
  custo: number;
  lucro: number;
  margem: number;
  horas_alocadas: number;
  quadrante: string;
};

export function calcularQuadrante(lucro: number, margem: number, horas: number) {
  if (lucro < 0) return "Prejuízo";
  if (margem >= 0.4 && horas <= 10) return "Alta Margem · Baixo Esforço";
  if (margem >= 0.4 && horas > 10) return "Alta Margem · Alto Esforço";
  if (margem < 0.4 && horas <= 10) return "Baixa Margem · Baixo Esforço";
  return "Baixa Margem · Alto Esforço";
}

export async function getClientes(): Promise<ClienteComMetricas[]> {
  const supabase = getSupabaseClient();
  const { data: clientes, error } = await supabase.from("clientes").select("*").order("nome");
  if (error) throw error;

  const list = (clientes ?? []) as Cliente[];
  const result = await Promise.all(list.map(async (cliente) => {
    const [{ data: financeiro }, { data: alocacoes }] = await Promise.all([
      supabase.from("financeiro_clientes").select("receita,custo,lucro,margem").eq("cliente_id", cliente.id).order("mes_referencia", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("alocacoes_clientes").select("horas_alocadas").eq("cliente_id", cliente.id)
    ]);

    const horas = (alocacoes ?? []).reduce((sum, item) => sum + Number(item.horas_alocadas ?? 0), 0);
    const lucro = Number(financeiro?.lucro ?? 0);
    const margem = Number(financeiro?.margem ?? 0);

    return {
      ...cliente,
      receita: Number(financeiro?.receita ?? 0),
      custo: Number(financeiro?.custo ?? 0),
      lucro,
      margem,
      horas_alocadas: horas,
      quadrante: calcularQuadrante(lucro, margem, horas)
    };
  }));

  return result;
}

export async function getClienteById(id: string) {
  const supabase = getSupabaseClient();
  const [{ data: cliente, error }, { data: financeiro }, { data: alocacoes }, { data: colaboradores }, { data: times }] = await Promise.all([
    supabase.from("clientes").select("*").eq("id", id).single<Cliente>(),
    supabase.from("financeiro_clientes").select("*").eq("cliente_id", id).order("mes_referencia", { ascending: false }).limit(1).maybeSingle<FinanceiroCliente>(),
    supabase.from("alocacoes_clientes").select("*").eq("cliente_id", id).returns<AlocacaoCliente[]>(),
    supabase.from("colaboradores").select("id,nome,time_id").order("nome"),
    supabase.from("times").select("id,nome").order("nome")
  ]);

  if (error) throw error;
  return { cliente, financeiro, alocacoes: alocacoes ?? [], colaboradores: colaboradores ?? [], times: times ?? [] };
}

export async function createCliente(payload: Omit<Cliente, "id">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("clientes").insert(payload).select("*").single<Cliente>();
  if (error) throw error;
  return data;
}

export async function updateCliente(id: string, payload: Partial<Omit<Cliente, "id">>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("clientes").update(payload).eq("id", id).select("*").single<Cliente>();
  if (error) throw error;
  return data;
}

export async function upsertFinanceiroCliente(payload: { cliente_id: string; mes_referencia: string; receita: number; custo: number }) {
  const supabase = getSupabaseClient();
  const cleanMonth = payload.mes_referencia.length === 7 ? `${payload.mes_referencia}-01` : payload.mes_referencia;
  const base = { ...payload, mes_referencia: cleanMonth };
  const { data, error } = await supabase.from("financeiro_clientes").upsert(base, { onConflict: "cliente_id,mes_referencia" }).select("*").single<FinanceiroCliente>();
  if (error) throw error;

  const horasRes = await supabase.from("alocacoes_clientes").select("horas_alocadas").eq("cliente_id", payload.cliente_id).eq("mes_referencia", cleanMonth);
  const horas = (horasRes.data ?? []).reduce((s, x) => s + Number(x.horas_alocadas ?? 0), 0);
  const quadrante = calcularQuadrante(Number(data.lucro ?? 0), Number(data.margem ?? 0), horas);
  await supabase.from("financeiro_clientes").update({ quadrante }).eq("id", data.id);

  return { ...data, quadrante };
}

export async function upsertAlocacoesCliente(cliente_id: string, alocacoes: AlocacaoCliente[]) {
  const supabase = getSupabaseClient();
  if (!alocacoes.length) return [];
  const payload = alocacoes.map((item) => ({ ...item, cliente_id, mes_referencia: item.mes_referencia.length === 7 ? `${item.mes_referencia}-01` : item.mes_referencia }));
  const { data, error } = await supabase.from("alocacoes_clientes").insert(payload).select("*");
  if (error) throw error;
  return data;
}
