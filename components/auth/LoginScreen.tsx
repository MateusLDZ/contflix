"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const LOGO_URL = "/logo-contflix.png";

export function LoginScreen() {
  const router = useRouter();

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#EDEFF3]">
      <aside className="hidden lg:flex flex-col justify-center items-center bg-contflix-navy text-white px-16 relative">
        <img src={LOGO_URL} alt="Contflix" className="h-24 w-24 object-contain mb-8" />
        <p className="max-w-xs text-center text-slate-300">Sua área exclusiva para acompanhar seus dados financeiros, documentos e relatórios contábeis.</p>
      </aside>
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-white shadow-xl p-8">
          <h1 className="text-2xl font-bold">Contflix Contabilidade</h1>
          <p className="text-contflix-muted mb-6">Portal de Gestão Interno</p>
          <label className="text-sm font-medium">Usuário</label>
          <input className="mt-2 mb-4 h-11 w-full rounded-lg border border-slate-200 px-3" placeholder="seu@email.com" />
          <label className="text-sm font-medium">Senha</label>
          <input type="password" className="mt-2 mb-6 h-11 w-full rounded-lg border border-slate-200 px-3" placeholder="••••••••" />
          <Button className="w-full h-11 font-semibold" onClick={() => router.push('/app/painel-geral')}>Entrar no Portal</Button>
        </div>
      </main>
    </div>
  );
}
