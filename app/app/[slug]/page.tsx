import { AppShell } from "@/components/layout/AppShell";
import { menuItems } from "@/data/menu";
import { GreetingBanner } from "@/components/dashboard/GreetingBanner";
import { kpis } from "@/data/mock-dashboard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { SupabaseTimesLogger } from "@/components/debug/SupabaseTimesLogger";

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const current = menuItems.find((item) => item.key === slug) ?? menuItems[0];
  const isDashboard = slug === "painel-geral";

  return <AppShell activeKey={current.key} title={current.label}>{isDashboard ? <div className="space-y-6"><GreetingBanner /><SupabaseTimesLogger /><section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4">{kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}</section><InsightsSection /></div> : <div className="rounded-2xl border border-dashed border-contflix-primary/30 bg-white p-10 text-center"><h2 className="text-2xl font-semibold mb-2">{current.label}</h2><p className="text-contflix-muted mb-6">Área administrativa da Contflix Contabilidade</p><div className="inline-block rounded-xl bg-contflix-bg px-6 py-4 text-contflix-text font-medium">Módulo em desenvolvimento</div></div>}</AppShell>;
}
