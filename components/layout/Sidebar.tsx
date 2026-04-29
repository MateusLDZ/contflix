"use client";
import Link from "next/link";
import { menuItems } from "@/data/menu";
import { cn } from "@/lib/utils";

export function Sidebar({ activeKey, onNavigate }: { activeKey: string; onNavigate?: () => void }) {
  const sections = ["Principal", "Administração", "Controle"] as const;
  return <div className="h-full w-[280px] bg-gradient-to-b from-contflix-navy to-contflix-navy2 text-white p-4 overflow-y-auto">
    <div className="mb-6"><p className="text-xl font-bold">Contflix</p><p className="text-slate-300 text-sm">Contabilidade</p></div>
    <div className="mb-6 rounded-xl bg-white/10 p-3"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-contflix-cyan text-contflix-navy grid place-items-center font-bold">A</div><div><p className="font-semibold">Administrador</p><p className="text-xs text-slate-300">Administrador · Florianópolis</p></div><span className="ml-auto text-xs px-2 py-1 rounded bg-white/20">ADM</span></div></div>
    {sections.map(section => <div key={section} className="mb-5"><p className="mb-2 text-xs uppercase tracking-wider text-slate-300">{section}</p><div className="space-y-1">{menuItems.filter(i => i.section===section).map(item => { const Icon = item.icon; const active = activeKey===item.key; return <Link onClick={onNavigate} key={item.key} href={`/app/${item.key}`} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition", active ? "bg-gradient-to-r from-contflix-wine/60 to-contflix-primary/70" : "hover:bg-white/10")}><Icon className="h-4 w-4"/>{item.label}</Link>;})}</div></div>)}
  </div>;
}
