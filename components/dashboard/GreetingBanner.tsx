"use client";

import { useEffect, useState } from "react";

export function GreetingBanner() {
  const frases = [
    "A confiança do cliente é o ativo mais valioso que temos.",
    "Processos organizados constroem empresas previsíveis.",
    "Quem mede com clareza, cresce com consistência.",
    "Disciplina operacional vence improviso.",
    "Atender bem é vender todos os dias.",
    "Pequenas melhorias geram grandes resultados.",
    "Eficiência interna protege a margem.",
    "Decisões melhores nascem de bons dados.",
    "Constância comercial cria estabilidade."
  ];

  const [fraseAtual, setFraseAtual] = useState(frases[0]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const trocarFrase = () => {
      setVisible(false);

      setTimeout(() => {
        const nova =
          frases[Math.floor(Math.random() * frases.length)];
        setFraseAtual(nova);
        setVisible(true);
      }, 400);
    };

    const loop = () => {
      const tempo = 20000 + Math.random() * 25000; // 20s até 45s
      setTimeout(() => {
        trocarFrase();
        loop();
      }, tempo);
    };

    loop();
  }, []);

  return (
    <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-contflix-navy to-contflix-primary text-white flex items-start justify-between gap-4">
<div>
  <p
    className={`text-2xl font-semibold mb-2 transition-all duration-500 ${
      visible ? "opacity-100" : "opacity-0"
    }`}
  >
    {fraseAtual}
  </p>

  <p className="text-slate-300 mt-3 text-sm">
    — Contflix Contabilidade
  </p>
</div>

      <div className="rounded-xl bg-white/10 px-4 py-4 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-sm text-slate-200">Sistema ativo</span>
      </div>
    </div>
  );
}