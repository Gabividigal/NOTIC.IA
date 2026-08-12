"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import Modal from "@/components/Modal";

const BENEFICIOS_PRO = [
  "Temas seguidos ilimitados (vs. até 3 no grátis)",
  "Perguntas no chat IA ilimitadas (vs. poucas por dia no grátis)",
  "Análise crítica, comparativa e com contexto histórico no chat (vs. resumo básico)",
  "Notificações push em tempo real",
  "Sem anúncios",
  "Histórico e busca de notícias antigas",
  "Histórico de conversas do chat salvo",
];

export default function UpgradeProModal() {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  function assinar() {
    setMensagem("Em breve! Ainda estamos preparando os pagamentos. 🚀");
  }

  function abrir() {
    setMensagem(null);
    setAberto(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1.5 text-xs font-bold text-zinc-900 shadow-[0_0_16px_rgba(251,191,36,0.45)] transition hover:opacity-90"
      >
        <Sparkles size={14} />
        Virar PRO
      </button>

      <Modal
        aberto={aberto}
        onFechar={() => setAberto(false)}
        titulo="NOTIC.IA PRO"
        largura="max-w-lg"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-1 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 py-5 text-center">
            <span className="text-xs font-medium tracking-wide text-amber-400 uppercase">
              Plano PRO
            </span>
            <p className="text-3xl font-bold text-zinc-50">
              R$ 34,99<span className="text-base font-medium text-zinc-400">/mês</span>
            </p>
          </div>

          <ul className="flex flex-col gap-2.5">
            {BENEFICIOS_PRO.map((beneficio) => (
              <li key={beneficio} className="flex items-start gap-2.5 text-sm text-zinc-200">
                <Check size={18} className="mt-0.5 shrink-0 text-green-500" />
                <span>{beneficio}</span>
              </li>
            ))}
          </ul>

          {mensagem && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-sm text-amber-300">
              {mensagem}
            </p>
          )}

          <button
            type="button"
            onClick={assinar}
            className="w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-3 text-sm font-bold text-zinc-900 shadow-[0_0_16px_rgba(251,191,36,0.45)] transition hover:opacity-90"
          >
            Assinar agora
          </button>
        </div>
      </Modal>
    </>
  );
}
