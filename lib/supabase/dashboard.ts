import { dashboardInsights, kpis, type Kpi } from "@/data/mock-dashboard";
import { getSupabaseClient } from "@/lib/supabase/client";

type DashboardKpisRow = {
  total_clientes: number | null;
  clientes_ativos: number | null;
  receita_mensal_total: number | null;
  custo_mensal_total: number | null;
  lucro_mensal_total: number | null;
  margem_media: number | null;
  investimento_marketing_mes: number | null;
  leads_mes: number | null;
  oportunidades_mes: number | null;
  vendas_mes: number | null;
  cac_mes: number | null;
  roi_mes: number | null;
};

type TopClienteRentavel = { cliente_id: number; nome: string; lucro: number | null; margem: number | null };
type TopClienteAlerta = { cliente_id: number; nome: string; lucro: number | null };
type ClienteQuadrante = { quadrante: string; total_clientes: number | null };
type ClienteSegmento = { segmento: string; total_clientes: number | null };

export type DashboardInsightsData = {
  topProfitable: Array<{ id: number; name: string; profit: string; margin: string }>;
  topAlerts: Array<{ id: number; name: string; loss: string; tag: string }>;
  quadrantChart: Array<{ name: string; value: number; color: string }>;
  segmentChart: Array<{ name: string; value: number; color: string }>;
};

export type DashboardData = { kpis: Kpi[]; insights: DashboardInsightsData };

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percentFormatter = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

const quadrantColors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#A855F7"];
const segmentColors = ["#4B4F70", "#10B981", "#C13B56", "#F59E0B", "#A855F7"];

const quadranteNomeMap: Record<string, string> = {
  alta_margem_baixo_esforco: "Alta Margem · Baixo Esforço",
  prejuizo: "Prejuízo",
  baixa_margem_baixo_esforco: "Baixa Margem · Baixo Esforço",
  alta_margem_alto_esforco: "Alta Margem · Alto Esforço",
  baixa_margem_alto_esforco: "Baixa Margem · Alto Esforço",
  sem_quadrante: "Sem quadrante"
};

const segmentoNomeMap: Record<string, string> = { comercio: "Comércio", servicos: "Serviços", industria: "Indústria", sem_segmento: "Sem segmento" };

function n(value: number | null | undefined) { return value ?? 0; }

function buildZeroKpis(mockKpis: Kpi[]): Kpi[] {
  return mockKpis.map((kpi) => {
    const zeroMap: Record<string, string> = {
      "Clientes Ativos": "0",
      "Receita Bruta MRR": currencyFormatter.format(0),
      "Lucro Líquido": currencyFormatter.format(0),
      "Em Prejuízo": "0",
      "Ticket Médio": currencyFormatter.format(0),
      Churn: "0",
      Entrantes: "0",
      "LTV Médio Projetado": currencyFormatter.format(0),
      "Ocupação da Equipe": percentFormatter.format(0),
      "MO Ociosa": currencyFormatter.format(0),
      "Tempo Médio de Casa": "0 meses",
      "Clientes/Colaborador": "0",
      CAC: currencyFormatter.format(0),
      ROI: percentFormatter.format(0)
    };
    return { ...kpi, value: zeroMap[kpi.label] ?? kpi.value };
  });
}

function buildKpisFromRow(mockKpis: Kpi[], row: DashboardKpisRow): Kpi[] {
  const totalClientes = n(row.total_clientes);
  const clientesAtivos = n(row.clientes_ativos);
  const receita = n(row.receita_mensal_total);
  const lucro = n(row.lucro_mensal_total);
  const churn = Math.max(totalClientes - clientesAtivos, 0);
  const ticket = clientesAtivos > 0 ? receita / clientesAtivos : 0;

  return mockKpis.map((kpi) => {
    switch (kpi.label) {
      case "Clientes Ativos": return { ...kpi, value: String(clientesAtivos) };
      case "Receita Bruta MRR": return { ...kpi, value: currencyFormatter.format(receita) };
      case "Lucro Líquido": return { ...kpi, value: currencyFormatter.format(lucro) };
      case "Em Prejuízo": return { ...kpi, value: "0" };
      case "Ticket Médio": return { ...kpi, value: currencyFormatter.format(ticket) };
      case "Churn": return { ...kpi, value: String(churn) };
      case "Entrantes": return { ...kpi, value: String(n(row.vendas_mes)) };
      case "LTV Médio Projetado": return { ...kpi, value: currencyFormatter.format(0) };
      case "Ocupação da Equipe": return { ...kpi, value: percentFormatter.format(n(row.margem_media)) };
      case "MO Ociosa": return { ...kpi, value: currencyFormatter.format(0) };
      case "Tempo Médio de Casa": return { ...kpi, value: "0 meses" };
      case "Clientes/Colaborador": return { ...kpi, value: String(n(row.oportunidades_mes)) };
      case "CAC": return { ...kpi, value: currencyFormatter.format(n(row.cac_mes)) };
      case "ROI": return { ...kpi, value: percentFormatter.format(n(row.roi_mes)) };
      default: return kpi;
    }
  });
}

function normalizeQuadranteLabel(raw: string): string {
  const key = raw.toLowerCase().trim().replace(/\s+/g, "_").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return quadranteNomeMap[key] ?? raw;
}

function normalizeSegmentoLabel(raw: string): string {
  const key = raw.toLowerCase().trim().replace(/\s+/g, "_").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return segmentoNomeMap[key] ?? raw;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const supabase = getSupabaseClient();
    const [{ data: kpisRow, error: kpiError }, { data: topRent, error: rentError }, { data: topAlerts, error: alertError }, { data: quadrantes, error: quadranteError }, { data: segmentos, error: segmentoError }] = await Promise.all([
      supabase.from("vw_dashboard_kpis").select("*").maybeSingle<DashboardKpisRow>(),
      supabase.from("vw_top_clientes_rentaveis").select("cliente_id,nome,lucro,margem").limit(3).returns<TopClienteRentavel[]>(),
      supabase.from("vw_top_alertas_clientes").select("cliente_id,nome,lucro").limit(3).returns<TopClienteAlerta[]>(),
      supabase.from("vw_clientes_por_quadrante").select("quadrante,total_clientes").returns<ClienteQuadrante[]>(),
      supabase.from("vw_clientes_por_segmento").select("segmento,total_clientes").returns<ClienteSegmento[]>()
    ]);

    if (kpiError || rentError || alertError || quadranteError || segmentoError) {
      console.warn("Fallback para mock do dashboard por erro técnico no Supabase.", { kpiError, rentError, alertError, quadranteError, segmentoError });
      return { kpis, insights: dashboardInsights };
    }

    const hasKpiData = !!kpisRow && Object.values(kpisRow).some((value) => value !== null && value !== 0);
    const computedKpis = hasKpiData ? buildKpisFromRow(kpis, kpisRow) : buildZeroKpis(kpis);

    return {
      kpis: computedKpis,
      insights: {
        topProfitable: (topRent ?? []).map((row) => ({ id: row.cliente_id, name: row.nome, profit: currencyFormatter.format(n(row.lucro)), margin: `${percentFormatter.format(n(row.margem))} margem` })),
        topAlerts: (topAlerts ?? []).map((row) => ({ id: row.cliente_id, name: row.nome, loss: currencyFormatter.format(n(row.lucro) * -1), tag: "Prejuízo" })),
        quadrantChart: (quadrantes ?? []).map((row, index) => ({ name: normalizeQuadranteLabel(row.quadrante), value: n(row.total_clientes), color: quadrantColors[index % quadrantColors.length] })),
        segmentChart: (segmentos ?? []).map((row, index) => ({ name: normalizeSegmentoLabel(row.segmento), value: n(row.total_clientes), color: segmentColors[index % segmentColors.length] }))
      }
    };
  } catch (error) {
    console.warn("Fallback para mock do dashboard por erro técnico no Supabase.", error);
    return { kpis, insights: dashboardInsights };
  }
}
