"use client";
import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell({ activeKey, title, children }: { activeKey: string; title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-contflix-bg"><div className="hidden md:fixed md:inset-y-0 md:block"><Sidebar activeKey={activeKey}/></div>{open && <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setOpen(false)}><div className="h-full" onClick={(e)=>e.stopPropagation()}><Sidebar activeKey={activeKey} onNavigate={() => setOpen(false)} /></div></div>}<div className="md:ml-[280px]"><Topbar title={title} onMenu={() => setOpen(true)} /><main className="p-4 md:p-6">{children}</main></div></div>;
}
