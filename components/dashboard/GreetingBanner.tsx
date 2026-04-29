export function GreetingBanner() {
  return <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-contflix-navy to-contflix-primary text-white flex items-start justify-between gap-4">
    <div><h2 className="text-2xl font-semibold mb-2">Boa tarde, Administrador! ☀️</h2><p className="text-slate-200">A confiança do cliente é o ativo mais valioso que temos.</p><p className="text-slate-300 mt-3 text-sm">— Contflix Contabilidade</p></div>
    <div className="rounded-xl bg-white/15 px-4 py-3 text-sm"><p>Administrador</p><p className="text-contflix-cyan">Online</p></div>
  </div>;
}
