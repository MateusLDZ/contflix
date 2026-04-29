export type Kpi = { label: string; value: string; hint: string; tone?: "default" | "alert" | "accent"; };

export const kpis: Kpi[] = [
  { label: "Clientes Ativos", value: "190", hint: "Base ativa no mês", tone: "accent" },
  { label: "Receita Bruta MRR", value: "R$ 110.473,15", hint: "Apuração março/2026" },
  { label: "Lucro Líquido", value: "R$ 12.706,78", hint: "Após custos operacionais" },
  { label: "Em Prejuízo", value: "29", hint: "Clientes com margem negativa", tone: "alert" },
  { label: "Ticket Médio", value: "R$ 581,44", hint: "Receita por cliente" },
  { label: "Churn", value: "2", hint: "Cancelamentos do período", tone: "alert" },
  { label: "Entrantes", value: "2 março de 2026", hint: "Novos clientes no mês", tone: "accent" },
  { label: "LTV Médio Projetado", value: "R$ 33.369,20", hint: "Com base histórica" },
  { label: "Ocupação da Equipe", value: "40.0%", hint: "Capacidade alocada", tone: "accent" },
  { label: "MO Ociosa", value: "R$ 32.648,61", hint: "Mão de obra sem alocação", tone: "alert" },
  { label: "Tempo Médio de Casa", value: "46 meses", hint: "Relacionamento médio" },
  { label: "Clientes/Colaborador", value: "19.4", hint: "Produtividade por headcount" },
  { label: "CAC", value: "R$ 1.250,00", hint: "Custo de aquisição" },
  { label: "ROI", value: "15.9%", hint: "Retorno agregado" }
];

export const dashboardInsights = {
  topProfitable: [
    { id: 303, name: "SHIRANAI SUSHI", profit: "R$ 3.495,86", margin: "74.8% margem" },
    { id: 10, name: "FABRO & MENEZES", profit: "R$ 981,25", margin: "53.9% margem" },
    { id: 175, name: "LABBO COMUNICAÇÃO", profit: "R$ 926,91", margin: "67.8% margem" }
  ],
  topAlerts: [
    { id: 308, name: "LSS SUSHI", loss: "-R$ 411,05", tag: "Prejuízo" },
    { id: 309, name: "AKSQ", loss: "-R$ 373,86", tag: "Prejuízo" },
    { id: 322, name: "DEEP SUSHI LAGOA", loss: "-R$ 315,10", tag: "Prejuízo" }
  ],
  quadrantChart: [
    { name: "Alta Margem · Baixo Esforço", value: 52, color: "#10B981" },
    { name: "Prejuízo", value: 10, color: "#3B82F6" },
    { name: "Baixa Margem · Baixo Esforço", value: 12, color: "#F59E0B" },
    { name: "Alta Margem · Alto Esforço", value: 17, color: "#EF4444" },
    { name: "Baixa Margem · Alto Esforço", value: 9, color: "#A855F7" }
  ],
  segmentChart: [
    { name: "Comércio", value: 188, color: "#4B4F70" },
    { name: "Serviços", value: 1, color: "#10B981" },
    { name: "Indústria", value: 1, color: "#C13B56" }
  ]
};
