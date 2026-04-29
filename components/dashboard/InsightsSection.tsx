"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardInsights } from "@/data/mock-dashboard";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function InsightsSection() {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-emerald-100/80 rounded-t-2xl border-b border-emerald-200/70 py-4">
          <CardTitle className="text-2xl font-semibold text-emerald-900">⭐ Top 3 Mais Rentáveis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dashboardInsights.topProfitable.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">{index + 1}</span>
                <div>
                  <p className="text-sm text-contflix-muted">#{item.id}</p>
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
          <CardTitle className="text-2xl font-semibold text-rose-900">🚨 Top 3 Alertas (Prejuízo/Churn)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dashboardInsights.topAlerts.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-semibold">!</span>
                <div>
                  <p className="text-sm text-contflix-muted">#{item.id}</p>
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
          <CardTitle className="text-2xl font-semibold text-contflix-text">📊 Clientes por Quadrante</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={dashboardInsights.quadrantChart} dataKey="value" nameKey="name" cx="42%" cy="50%" innerRadius={60} outerRadius={100}>
                {dashboardInsights.quadrantChart.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="py-4 border-b">
          <CardTitle className="text-2xl font-semibold text-contflix-text">🧮 Clientes por Segmento</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={dashboardInsights.segmentChart} dataKey="value" nameKey="name" cx="42%" cy="50%" innerRadius={60} outerRadius={100}>
                {dashboardInsights.segmentChart.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}
