import { ClienteAtivo } from "@/types/kpi-details";

export function filterClientesAtivos(rows: ClienteAtivo[], term: string) {
  const query = term.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter((row) => [row.cliente, row.cnpjCpf, row.regime, row.segmento, row.cidade, row.quadrante ?? ""].some((f) => f.toLowerCase().includes(query)));
}

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function exportClientesAtivosCsv(rows: ClienteAtivo[], fileName: string) {
  if (!rows.length) return;
  const header = ["Cliente", "CNPJ/CPF", "Regime", "Segmento", "Cidade", "Honorário", "Margem", "Quadrante"];
  const body = rows.map((row) => [
    row.cliente,
    row.cnpjCpf,
    row.regime,
    row.segmento,
    row.cidade,
    currency(row.honorario),
    row.margem == null ? "-" : `${(row.margem * 100).toFixed(1).replace(".", ",")}%`,
    row.quadrante ?? "-"
  ]);
  const csv = [header, ...body].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
