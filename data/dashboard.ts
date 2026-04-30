import { getSupabaseClient } from "@/lib/supabase/client";

export type KpiTone = "default" | "alert" | "accent";

export type Kpi = {
  label: string;
  value: string;
  hint: string;
  tone?: KpiTone;
};

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

const KPI_TEMPLATE: Array<{ label: string; hint: string; tone?: KpiTone; type: "number" | "currency" | "percent" | "months" | "decimal" }> = [
  { label: "Clientes Ativos", hint: "Base ativa no mês", tone: "accent", type: "number" },
  { label: "Receita Bruta MRR", hint: "Apuração mensal", type: "currency" },
  { label: "Lucro Líquido", hint: "Após custos operacionais", type: "currency" },
  { label: "Em Prejuízo", hint: "Clientes com margem negativa", tone: "alert", type: "number" },
  { label: "Ticket Médio", hint: "Receita por cliente", type: "currency" },
  { label: "Churn", hint: "Cancelamentos do período", tone: "alert", type: "number" },
  { label: "Entrantes", hint: "Novos clientes no mês", tone: "accent", type: "number" },
  { label: "LTV Médio Projetado", hint: "Com base histórica", type: "currency" },
  { label: "Ocupação da Equipe", hint: "Capacidade alocada", tone: "accent", type: "percent" },
  { label: "MO Ociosa", hint: "Mão de obra sem alocação", tone: "alert", type: "currency" },
  { label: "Tempo Médio de Casa", hint: "Relacionamento médio", type: "months" },
  { label: "Clientes/Colaborador", hint: "Produtividade por headcount", type: "decimal" },
  { label: "CAC", hint: "Custo de aquisição", type: "currency" },
  { label: "ROI", hint: "Retorno agregado", type: "percent" }
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const decimalFormatter = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
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

const segmentoNomeMap: Record<string, string> = {
  comercio: "Comércio",
  servicos: "Serviços",
  industria: "Indústria",
  sem_segmento: "Sem segmento"
};

function n(value: number | null | undefined) {
  return value ?? 0;
}

function formatByType(type: (typeof KPI_TEMPLATE)[number]["type"], value: number): string {
  switch (type) {
    case "currency":
      return currencyFormatter.format(value);
    case "percent":
      return percentFormatter.format(value);
    case "months":
      return `${Math.round(value)} meses`;
    case "decimal":
      return decimalFormatter.format(value);
    default:
      return String(Math.round(value));
  }
}

function buildKpisFromRow(row: DashboardKpisRow | null): Kpi[] {
  const totalClientes = n(row?.total_clientes);
  const clientesAtivos = n(row?.clientes_ativos);
  const receita = n(row?.receita_mensal_total);
  const lucro = n(row?.lucro_mensal_total);
  const churn = Math.max(totalClientes - clientesAtivos, 0);
  const ticket = clientesAtivos > 0 ? receita / clientesAtivos : 0;

  const valuesByLabel: Record<string, number> = {
    "Clientes Ativos": clientesAtivos,
    "Receita Bruta MRR": receita,
    "Lucro Líquido": lucro,
    "Em Prejuízo": 0,
    "Ticket Médio": ticket,
    Churn: churn,
    Entrantes: n(row?.vendas_mes),
    "LTV Médio Projetado": 0,
    "Ocupação da Equipe": n(row?.margem_media),
    "MO Ociosa": 0,
    "Tempo Médio de Casa": 0,
    "Clientes/Colaborador": n(row?.oportunidades_mes),
    CAC: n(row?.cac_mes),
    ROI: n(row?.roi_mes)
  };

  return KPI_TEMPLATE.map((item) => ({
    label: item.label,
    hint: item.hint,
    tone: item.tone,
    value: formatByType(item.type, valuesByLabel[item.label] ?? 0)
  }));
}

function normalizeLabel(raw: string, nameMap: Record<string, string>): string {
  const key = raw.toLowerCase().trim().replace(/\s+/g, "_").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return nameMap[key] ?? raw;
}

export async function getDashboardKpis(): Promise<Kpi[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("vw_dashboard_kpis").select("*").maybeSingle<DashboardKpisRow>();

  if (error) {
    console.error("Erro vw_dashboard_kpis:", error);
  }

  console.log("vw_dashboard_kpis data:", data);

  return buildKpisFromRow(data ?? null);
}

export async function getDashboardInsights(): Promise<DashboardInsightsData> {
  const supabase = getSupabaseClient();
  const [rentResponse, alertsResponse, quadrantesResponse, segmentosResponse] = await Promise.all([
    supabase.from("vw_top_clientes_rentaveis").select("cliente_id,nome,lucro,margem").limit(3).returns<TopClienteRentavel[]>(),
    supabase.from("vw_top_alertas_clientes").select("cliente_id,nome,lucro").limit(3).returns<TopClienteAlerta[]>(),
    supabase.from("vw_clientes_por_quadrante").select("quadrante,total_clientes").returns<ClienteQuadrante[]>(),
    supabase.from("vw_clientes_por_segmento").select("segmento,total_clientes").returns<ClienteSegmento[]>()
  ]);

  if (rentResponse.error) {
    console.error("Erro vw_top_clientes_rentaveis:", rentResponse.error);
  }
  if (alertsResponse.error) {
    console.error("Erro vw_top_alertas_clientes:", alertsResponse.error);
  }
  if (quadrantesResponse.error) {
    console.error("Erro vw_clientes_por_quadrante:", quadrantesResponse.error);
  }
  if (segmentosResponse.error) {
    console.error("Erro vw_clientes_por_segmento:", segmentosResponse.error);
  }

  console.log("vw_top_clientes_rentaveis data:", rentResponse.data);
  console.log("vw_top_alertas_clientes data:", alertsResponse.data);
  console.log("vw_clientes_por_quadrante data:", quadrantesResponse.data);
  console.log("vw_clientes_por_segmento data:", segmentosResponse.data);

  const topRent = rentResponse.data;
  const topAlerts = alertsResponse.data;
  const quadrantes = quadrantesResponse.data;
  const segmentos = segmentosResponse.data;

  return {
    topProfitable: (topRent ?? []).map((row) => ({
      id: row.cliente_id,
      name: row.nome,
      profit: currencyFormatter.format(n(row.lucro)),
      margin: `${percentFormatter.format(n(row.margem))} margem`
    })),
    topAlerts: (topAlerts ?? []).map((row) => ({
      id: row.cliente_id,
      name: row.nome,
      loss: currencyFormatter.format(Math.min(n(row.lucro), 0)),
      tag: "Prejuízo"
    })),
    quadrantChart: (quadrantes ?? []).map((row, index) => ({
      name: normalizeLabel(row.quadrante, quadranteNomeMap),
      value: n(row.total_clientes),
      color: quadrantColors[index % quadrantColors.length]
    })),
    segmentChart: (segmentos ?? []).map((row, index) => ({
      name: normalizeLabel(row.segmento, segmentoNomeMap),
      value: n(row.total_clientes),
      color: segmentColors[index % segmentColors.length]
    }))
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const [kpis, insights] = await Promise.all([getDashboardKpis(), getDashboardInsights()]);
  return { kpis, insights };
}
