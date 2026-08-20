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
    <div className="flex h-[32rem] flex-col overflow-hidden rounded-xl border border-border bg-surface-muted/70 lg:h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <h2 className="text-sm font-semibold text-foreground">Pergunte sobre esta notícia</h2>
        </div>
        <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-medium tracking-wide text-accent uppercase ring-1 ring-inset ring-accent/30">
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
                    ? "bg-accent text-white"
                    : "bg-surface-strong text-foreground-secondary"
                }`}
              >
                {mensagem.texto}
              </p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={enviar} className="flex items-center gap-2 border-t border-border p-3">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pergunte algo sobre esta notícia..."
          className="flex-1 rounded-full border border-border bg-surface-muted/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={!texto.trim()}
          aria-label="Enviar mensagem"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
