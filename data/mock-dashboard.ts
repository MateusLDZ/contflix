export type Kpi = {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "alert" | "accent";
};

export type ClienteAtivoRow = {
  id: string;
  cliente: string;
  cnpjCpf: string;
  regime: string;
  segmento: string;
  cidade: string;
  honorario: number;
  margem: number | null;
  quadrante: string | null;
};

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

export const clientesAtivosRows: ClienteAtivoRow[] = [
  { id: "1", cliente: "A.R.M. BUSINESS", cnpjCpf: "12.234.345/0001-56", regime: "Simples", segmento: "Consultoria", cidade: "Florianópolis", honorario: 1980, margem: 0.26, quadrante: "⭐ Alta Margem · Baixo Esforço" },
  { id: "2", cliente: "ABÍLIO PEREIRA", cnpjCpf: "123.456.789-00", regime: "MEI", segmento: "Serviços", cidade: "São José", honorario: 420, margem: 0.12, quadrante: "📈 Baixa Margem · Baixo Esforço" },
  { id: "3", cliente: "AD CONSULTORIA", cnpjCpf: "33.111.777/0001-90", regime: "Lucro Presumido", segmento: "Consultoria", cidade: "Palhoça", honorario: 3200, margem: 0.31, quadrante: "⭐ Alta Margem · Baixo Esforço" },
  { id: "4", cliente: "AKSQ", cnpjCpf: "45.876.123/0001-01", regime: "Simples", segmento: "Tecnologia", cidade: "Florianópolis", honorario: 1350, margem: 0.18, quadrante: "📈 Baixa Margem · Baixo Esforço" },
  { id: "5", cliente: "ALEX", cnpjCpf: "998.877.665-11", regime: "MEI", segmento: "Alimentação", cidade: "Biguaçu", honorario: 300, margem: null, quadrante: null },
  { id: "6", cliente: "ALEXANDRE SIMAS", cnpjCpf: "67.222.888/0001-30", regime: "Simples", segmento: "Comércio", cidade: "Itajaí", honorario: 980, margem: -0.06, quadrante: "🔴 PREJUÍZO" }
];
