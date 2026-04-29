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
