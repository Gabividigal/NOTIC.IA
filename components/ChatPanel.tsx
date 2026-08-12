"use client";

import { useState, type FormEvent } from "react";
import { Send, Sparkles } from "lucide-react";

interface Mensagem {
  id: string;
  autor: "usuario" | "ia";
  texto: string;
}

const RESPOSTA_PADRAO = "Essa função estará disponível em breve!";

export default function ChatPanel() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: "boas-vindas",
      autor: "ia",
      texto: "Oi! Pergunte o que quiser sobre esta notícia.",
    },
  ]);
  const [texto, setTexto] = useState("");

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mensagemTexto = texto.trim();
    if (!mensagemTexto) {
      return;
    }

    const agora = Date.now();
    setMensagens((atuais) => [
      ...atuais,
      { id: `usuario-${agora}`, autor: "usuario", texto: mensagemTexto },
      { id: `ia-${agora}`, autor: "ia", texto: RESPOSTA_PADRAO },
    ]);
    setTexto("");
  }

  return (
    <div className="flex h-[32rem] flex-col overflow-hidden rounded-xl border border-navy-800 bg-navy-900/70 lg:h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between gap-2 border-b border-navy-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Pergunte sobre esta notícia</h2>
        </div>
        <span className="rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-2.5 py-1 text-[10px] font-medium tracking-wide text-blue-300 uppercase ring-1 ring-inset ring-blue-500/30">
          Em breve
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {mensagens.map((mensagem) => (
            <div
              key={mensagem.id}
              className={`flex ${mensagem.autor === "usuario" ? "justify-end" : "justify-start"}`}
            >
              <p
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  mensagem.autor === "usuario"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "bg-navy-800 text-zinc-200"
                }`}
              >
                {mensagem.texto}
              </p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={enviar} className="flex items-center gap-2 border-t border-navy-800 p-3">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pergunte algo sobre esta notícia..."
          className="flex-1 rounded-full border border-navy-800 bg-navy-900/50 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!texto.trim()}
          aria-label="Enviar mensagem"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
