export type KpiKey = "clientes-ativos";

export type ClienteAtivo = {
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

export type KpiDetailConfig<T> = {
  key: KpiKey;
  title: string;
  subtitle: string;
  badges: string[];
  csvFileName: string;
  sourceLabel: string;
  rows: T[];
};
