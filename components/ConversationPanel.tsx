"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import CompactNewsCard from "@/components/CompactNewsCard";
import type { MensagemConversa } from "@/lib/conexoes";

interface ConversationPanelProps {
  nome: string;
  outroId: string;
  mensagensIniciais: MensagemConversa[];
}

export default function ConversationPanel({ nome, outroId, mensagensIniciais }: ConversationPanelProps) {
  const router = useRouter();
  const [mensagens, setMensagens] = useState(mensagensIniciais);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: "end" });
  }, [mensagens.length]);

  function enviar(event: FormEvent) {
    event.preventDefault();
    const textoTratado = texto.trim();
    if (!textoTratado) return;

    setErro(null);
    startTransition(async () => {
      const resposta = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: outroId, text: textoTratado }),
      });

      if (!resposta.ok) {
        const dados = (await resposta.json().catch(() => ({}))) as { erro?: string };
        setErro(dados.erro ?? "Não foi possível enviar a mensagem.");
        return;
      }

      const dados = (await resposta.json()) as { mensagem: MensagemConversa };
      setMensagens((atual) => [
        ...atual,
        { ...dados.mensagem, createdAt: new Date(dados.mensagem.createdAt) },
      ]);
      setTexto("");
      router.refresh();
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-navy-800 px-4 py-3">
        <Link
          href="/conexoes"
          aria-label="Voltar para a lista de conversas"
          className="text-zinc-400 transition hover:text-zinc-200 md:hidden"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white">
          {nome.charAt(0).toUpperCase()}
        </div>
        <span className="font-semibold text-zinc-50">{nome}</span>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {mensagens.length === 0 ? (
          <p className="m-auto max-w-xs text-center text-sm text-zinc-500">
            Nenhuma mensagem trocada com {nome} ainda. Escreva algo ou envie uma notícia a partir da
            tela de uma notícia.
          </p>
        ) : (
          mensagens.map((mensagem) => (
            <div
              key={mensagem.id}
              className={`flex flex-col gap-1 ${mensagem.deMim ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 sm:max-w-sm ${
                  mensagem.deMim
                    ? "border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-purple-600/20"
                    : "border border-navy-800 bg-navy-900/60"
                }`}
              >
                {mensagem.mensagem && (
                  <p
                    className={`text-sm leading-relaxed text-zinc-200 ${mensagem.noticia ? "mb-2" : ""}`}
                  >
                    {mensagem.mensagem}
                  </p>
                )}
                {mensagem.noticia && (
                  <CompactNewsCard
                    id={mensagem.noticia.id}
                    titulo={mensagem.noticia.titulo}
                    temaNome={mensagem.noticia.temaNome}
                    fonte={mensagem.noticia.fonte}
                    data={mensagem.noticia.data}
                  />
                )}
              </div>
              <span className="px-1 text-[11px] text-zinc-500">
                {new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(mensagem.createdAt)}
              </span>
            </div>
          ))
        )}
        <div ref={fimRef} />
      </div>

      <form onSubmit={enviar} className="flex items-center gap-2 border-t border-navy-800 p-3">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-full border border-navy-800 bg-navy-900/50 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!texto.trim() || isPending}
          aria-label="Enviar mensagem"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
      {erro && <p className="px-3 pb-2 text-xs text-red-400">{erro}</p>}
    </div>
  );
}
