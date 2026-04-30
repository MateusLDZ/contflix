import { createClient } from "@supabase/supabase-js";
import type { Kpi } from "@/data/mock-dashboard";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function fetchTimes() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("times").select("*");

  if (error) {
    throw error;
  }

  return data;
}

type DashboardKpisRow = {
  total_clientes: number;
  clientes_ativos: number;
  receita_mensal_total: number;
  custo_mensal_total: number;
  lucro_mensal_total: number;
  margem_media: number;
  investimento_marketing_mes: number;
  leads_mes: number;
  oportunidades_mes: number;
  vendas_mes: number;
  cac_mes: number;
  roi_mes: number;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const decimalFormatter = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const percentFormatter = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

function applyDashboardKpisToMock(mockKpis: Kpi[], row: DashboardKpisRow): Kpi[] {
  return mockKpis.map((kpi) => {
    switch (kpi.label) {
      case "Clientes Ativos":
        return { ...kpi, value: String(row.clientes_ativos) };
      case "Receita Bruta MRR":
        return { ...kpi, value: currencyFormatter.format(row.receita_mensal_total) };
      case "Lucro Líquido":
        return { ...kpi, value: currencyFormatter.format(row.lucro_mensal_total) };
      case "Ticket Médio": {
        const ticket = row.clientes_ativos > 0 ? row.receita_mensal_total / row.clientes_ativos : 0;
        return { ...kpi, value: currencyFormatter.format(ticket) };
      }
      case "Churn":
        return { ...kpi, value: String(row.total_clientes - row.clientes_ativos) };
      case "CAC":
        return { ...kpi, value: currencyFormatter.format(row.cac_mes) };
      case "ROI":
        return { ...kpi, value: percentFormatter.format(row.roi_mes) };
      case "Ocupação da Equipe":
        return { ...kpi, value: percentFormatter.format(row.margem_media) };
      case "Clientes/Colaborador":
        return { ...kpi, value: decimalFormatter.format(row.oportunidades_mes || 0) };
      default:
        return kpi;
    }
  });
}

export async function fetchDashboardKpis(mockKpis: Kpi[]): Promise<Kpi[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("vw_dashboard_kpis").select("*").maybeSingle<DashboardKpisRow>();

    if (error || !data) {
      return mockKpis;
    }

    return applyDashboardKpisToMock(mockKpis, data);
  } catch {
    return mockKpis;
  }
}
