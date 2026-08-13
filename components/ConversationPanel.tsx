import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CompactNewsCard from "@/components/CompactNewsCard";
import type { MensagemConversa } from "@/lib/conexoes";

interface ConversationPanelProps {
  nome: string;
  mensagens: MensagemConversa[];
}

export default function ConversationPanel({ nome, mensagens }: ConversationPanelProps) {
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
            Nenhuma notícia trocada com {nome} ainda. Envie uma a partir da tela de uma notícia.
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
                  <p className="mb-2 text-sm leading-relaxed text-zinc-200">{mensagem.mensagem}</p>
                )}
                <CompactNewsCard
                  id={mensagem.noticia.id}
                  titulo={mensagem.noticia.titulo}
                  temaNome={mensagem.noticia.temaNome}
                  fonte={mensagem.noticia.fonte}
                  data={mensagem.noticia.data}
                />
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
      </div>
    </div>
  );
}
