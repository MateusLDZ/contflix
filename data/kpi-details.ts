import { ClienteAtivo, KpiDetailConfig } from "@/types/kpi-details";

const clientesAtivosRows: ClienteAtivo[] = [
  { id: "1", cliente: "A.R.M. BUSINESS", cnpjCpf: "12.234.345/0001-56", regime: "Simples", segmento: "Consultoria", cidade: "Florianópolis", honorario: 1980, margem: 0.26, quadrante: "⭐ Alta Margem · Baixo Esforço" },
  { id: "2", cliente: "ABÍLIO PEREIRA", cnpjCpf: "123.456.789-00", regime: "MEI", segmento: "Serviços", cidade: "São José", honorario: 420, margem: 0.12, quadrante: "📈 Baixa Margem · Baixo Esforço" },
  { id: "3", cliente: "AD CONSULTORIA", cnpjCpf: "33.111.777/0001-90", regime: "Lucro Presumido", segmento: "Consultoria", cidade: "Palhoça", honorario: 3200, margem: 0.31, quadrante: "⭐ Alta Margem · Baixo Esforço" },
  { id: "4", cliente: "AKSQ", cnpjCpf: "45.876.123/0001-01", regime: "Simples", segmento: "Tecnologia", cidade: "Florianópolis", honorario: 1350, margem: 0.18, quadrante: "📈 Baixa Margem · Baixo Esforço" },
  { id: "5", cliente: "ALEX", cnpjCpf: "998.877.665-11", regime: "MEI", segmento: "Alimentação", cidade: "Biguaçu", honorario: 300, margem: null, quadrante: null },
  { id: "6", cliente: "ALEXANDRE SIMAS", cnpjCpf: "67.222.888/0001-30", regime: "Simples", segmento: "Comércio", cidade: "Itajaí", honorario: 980, margem: -0.06, quadrante: "🔴 PREJUÍZO" },
  { id: "7", cliente: "ALISSON HOLSTEIN", cnpjCpf: "111.222.333-44", regime: "MEI", segmento: "Marketing", cidade: "Florianópolis", honorario: 580, margem: 0.15, quadrante: "📈 Baixa Margem · Baixo Esforço" },
  { id: "8", cliente: "SHIRANAI SUSHI", cnpjCpf: "22.333.444/0001-55", regime: "Simples", segmento: "Restaurante", cidade: "São José", honorario: 1750, margem: 0.2, quadrante: "📈 Baixa Margem · Baixo Esforço" },
  { id: "9", cliente: "FABRO & MENEZES", cnpjCpf: "56.789.012/0001-77", regime: "Lucro Real", segmento: "Jurídico", cidade: "Curitiba", honorario: 5200, margem: 0.34, quadrante: "⭐ Alta Margem · Baixo Esforço" },
  { id: "10", cliente: "LSS SUSHI", cnpjCpf: "87.111.990/0001-64", regime: "Simples", segmento: "Restaurante", cidade: "Blumenau", honorario: 1420, margem: -0.04, quadrante: "🔴 PREJUÍZO" }
];

export const clientesAtivosDetail: KpiDetailConfig<ClienteAtivo> = {
  key: "clientes-ativos",
  title: "👥 Clientes Ativos",
  subtitle: "194 clientes com status Ativo",
  badges: ["194 ativos", "MRR R$ 107.893,76", "18 cidades"],
  csvFileName: "clientes-ativos.csv",
  sourceLabel: "Ordenado A→Z · Base importada da planilha",
  rows: clientesAtivosRows
};
