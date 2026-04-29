"use client";

import Link from "next/link";
import { menuItems } from "@/data/menu";
import { cn } from "@/lib/utils";
import { accountData } from "@/data/account";

export function Sidebar({
  activeKey,
  onNavigate,
}: {
  activeKey: string;
  onNavigate?: () => void;
}) {
  const sections = ["Principal", "Administração", "Controle"] as const;

  return (
    <div className="h-full w-[280px] bg-gradient-to-b from-contflix-navy to-contflix-navy2 text-white p-4 overflow-y-auto">
      <div className="mb-6">
        <p className="text-xl font-bold">Contflix</p>
        <p className="text-slate-300 text-sm">Contabilidade</p>
      </div>

    <div className="mb-6 rounded-xl bg-white/10 p-4">
      <div className="flex items-center gap-3">

        <div className="h-10 w-10 rounded-full bg-contflix-cyan text-contflix-navy grid place-items-center font-bold text-lg shrink-0">
          {accountData.avatar}
        </div>

        <div className="flex flex-col justify-center gap-1">
          <p className="font-semibold leading-tight text-white">
            {accountData.nome}
          </p>

        <span className="inline-block w-fit text-xs px-2 py-1 rounded bg-white/20 text-white leading-none">
          {accountData.sigla}
        </span>
      </div>

      </div>
    </div>
          
      {sections.map((section) => (
        <div key={section} className="mb-5">
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-300">
            {section}
          </p>

          <div className="space-y-1">
            {menuItems
              .filter((item) => item.section === section)
              .map((item) => {
                const Icon = item.icon;
                const active = activeKey === item.key;

                return (
                  <Link
                    onClick={onNavigate}
                    key={item.key}
                    href={`/app/${item.key}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                active
                  ? "bg-white/10 text-white border-l-2 border-contflix-cyan shadow-sm"
                  : "text-slate-200 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}