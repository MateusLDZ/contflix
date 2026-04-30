"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardInsightsData } from "@/data/dashboard";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Trophy, AlertTriangle, ChartNoAxesCombined, Calculator } from "lucide-react";

const EMPTY_INSIGHTS: DashboardInsightsData = {
  topProfitable: [],
  topAlerts: [],
  quadrantChart: [],
  segmentChart: []
};

type ChartItem = { name: string; value: number; color: string };

const FIXED_QUADRANTS: ChartItem[] = [
  { name: "Alta Margem · Baixo Esforço", value: 0, color: "#10B981" },
  { name: "Prejuízo", value: 0, color: "#3B82F6" },
  { name: "Baixa Margem · Baixo Esforço", value: 0, color: "#F59E0B" },
  { name: "Alta Margem · Alto Esforço", value: 0, color: "#EF4444" },
  { name: "Baixa Margem · Alto Esforço", value: 0, color: "#A855F7" },
  { name: "Sem quadrante", value: 0, color: "#4B4F70" }
];

const FIXED_SEGMENTS: ChartItem[] = [
  { name: "Comércio", value: 0, color: "#4B4F70" },
  { name: "Serviços", value: 0, color: "#10B981" },
  { name: "Indústria", value: 0, color: "#C13B56" },
  { name: "Sem segmento", value: 0, color: "#F59E0B" }
];

function mergeWithFixedCategories(fixed: ChartItem[], source: ChartItem[]): ChartItem[] {
  const map = new Map(source.map((item) => [item.name, item]));
  return fixed.map((item) => {
    const found = map.get(item.name);
    return { ...item, value: found?.value ?? 0 };
  });
}

function ClickableLegend({ items, disabledItems, onToggle }: { items: ChartItem[]; disabledItems: Set<string>; onToggle: (name: string) => void }) {
  return (
    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 text-sm">
      {items.map((item) => {
        const disabled = disabledItems.has(item.name);
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onToggle(item.name)}
            className="flex items-center gap-2 text-left transition-opacity"
            style={{ opacity: disabled ? 0.45 : 1 }}
          >
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className={disabled ? "line-through" : ""}>{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function InsightsSection({ insights }: { insights?: DashboardInsightsData }) {
  const safeInsights = insights ?? EMPTY_INSIGHTS;
  const topProfitable = safeInsights.topProfitable ?? [];
  const alerts = safeInsights.topAlerts ?? [];

  const quadrantItems = useMemo(() => mergeWithFixedCategories(FIXED_QUADRANTS, safeInsights.quadrantChart ?? []), [safeInsights.quadrantChart]);
  const segmentItems = useMemo(() => mergeWithFixedCategories(FIXED_SEGMENTS, safeInsights.segmentChart ?? []), [safeInsights.segmentChart]);

  const [disabledQuadrants, setDisabledQuadrants] = useState<Set<string>>(new Set());
  const [disabledSegments, setDisabledSegments] = useState<Set<string>>(new Set());

  const visibleQuadrants = useMemo(
    () => quadrantItems.filter((item) => item.value > 0 && !disabledQuadrants.has(item.name)),
    [quadrantItems, disabledQuadrants]
  );
  const visibleSegments = useMemo(
    () => segmentItems.filter((item) => item.value > 0 && !disabledSegments.has(item.name)),
    [segmentItems, disabledSegments]
  );

  const toggleQuadrant = (name: string) => {
    setDisabledQuadrants((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleSegment = (name: string) => {
    setDisabledSegments((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-emerald-100/80 rounded-t-2xl border-b border-emerald-200/70 py-4">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-emerald-900"><Trophy className="h-6 w-6" />Top 3 Mais Rentáveis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topProfitable.length === 0 ? <div className="h-[204px] flex items-center justify-center text-contflix-muted font-medium">Aguardando dados</div> : topProfitable.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">{index + 1}</span>
                <div>
                  <p className="font-semibold text-contflix-text">{item.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-600">{item.profit}</p>
                <p className="text-sm text-contflix-muted">{item.margin}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-rose-100/80 rounded-t-2xl border-b border-rose-200/70 py-4">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-rose-900"><AlertTriangle className="h-6 w-6" />Top 3 Alertas (Prejuízo/Churn)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {alerts.length === 0 ? <div className="h-[204px] flex items-center justify-center text-contflix-muted font-medium">Aguardando dados</div> : alerts.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-semibold">!</span>
                <div>
                  <p className="font-semibold text-contflix-text">{item.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-rose-600">{item.loss}</p>
                <p className="text-sm text-contflix-muted">{item.tag}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="py-4 border-b">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-contflix-text"><ChartNoAxesCombined className="h-6 w-6" /> Clientes por Quadrante</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px] relative">
          {quadrantItems.length === 0 ? <div className="h-full flex items-center justify-center text-contflix-muted font-medium">Aguardando dados</div> : <>
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={visibleQuadrants} dataKey="value" nameKey="name" cx="42%" cy="50%" innerRadius={60} outerRadius={100} isAnimationActive>{visibleQuadrants.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
            <ClickableLegend items={quadrantItems} disabledItems={disabledQuadrants} onToggle={toggleQuadrant} />
            {visibleQuadrants.length === 0 ? <div className="absolute inset-0 flex items-center justify-center text-contflix-muted font-medium pointer-events-none">Nenhum item selecionado</div> : null}
          </>}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="py-4 border-b">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-contflix-text"><Calculator className="h-6 w-6" />Clientes por Segmento</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px] relative">
          {segmentItems.length === 0 ? <div className="h-full flex items-center justify-center text-contflix-muted font-medium">Aguardando dados</div> : <>
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={visibleSegments} dataKey="value" nameKey="name" cx="42%" cy="50%" innerRadius={60} outerRadius={100} isAnimationActive>{visibleSegments.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
            <ClickableLegend items={segmentItems} disabledItems={disabledSegments} onToggle={toggleSegment} />
            {visibleSegments.length === 0 ? <div className="absolute inset-0 flex items-center justify-center text-contflix-muted font-medium pointer-events-none">Nenhum item selecionado</div> : null}
          </>}
        </CardContent>
      </Card>
    </section>
  );
}
