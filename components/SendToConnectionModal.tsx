"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import Modal from "@/components/Modal";

interface NoticiaResumo {
  id: string;
  titulo: string;
  temaNome: string;
  fonte: string;
}

interface SendToConnectionModalProps {
  aberto: boolean;
  onFechar: () => void;
  receiverId: string;
  receiverNome: string;
}

export default function SendToConnectionModal({
  aberto,
  onFechar,
  receiverId,
  receiverNome,
}: SendToConnectionModalProps) {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<NoticiaResumo[]>([]);
  const [selecionada, setSelecionada] = useState<NoticiaResumo | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [buscaPending, startBusca] = useTransition();

  function buscar(valor: string) {
    setTermo(valor);
    setSelecionada(null);

    if (!valor.trim()) {
      setResultados([]);
      return;
    }

    startBusca(async () => {
      const resposta = await fetch(`/api/news?q=${encodeURIComponent(valor)}`);
      if (resposta.ok) {
        const dados = (await resposta.json()) as { noticias: NoticiaResumo[] };
        setResultados(dados.noticias);
      }
    });
  }

  function enviar() {
    if (!selecionada) return;
    setErro(null);
    startTransition(async () => {
      const resposta = await fetch("/api/shared-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsId: selecionada.id,
          receiverIds: [receiverId],
          message: mensagem.trim() || undefined,
        }),
      });

      if (resposta.ok) {
        setEnviado(true);
      } else {
        const dados = (await resposta.json().catch(() => ({}))) as { erro?: string };
        setErro(dados.erro ?? "Não foi possível enviar a notícia.");
      }
    });
  }

  function fechar() {
    onFechar();
    setTermo("");
    setResultados([]);
    setSelecionada(null);
    setMensagem("");
    setEnviado(false);
    setErro(null);
  }

  return (
    <Modal aberto={aberto} onFechar={fechar} titulo={`Enviar notícia para ${receiverNome}`}>
      {enviado ? (
        <p className="text-sm text-green-400">Notícia enviada!</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              value={termo}
              onChange={(e) => buscar(e.target.value)}
              placeholder="Buscar notícia por título..."
              className="w-full rounded-lg border border-border bg-surface-muted/50 py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
          </div>

          {termo.trim() && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
              {resultados.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">
                  {buscaPending ? "Buscando..." : "Nenhuma notícia encontrada."}
                </p>
              ) : (
                resultados.map((noticia) => (
                  <button
                    key={noticia.id}
                    type="button"
                    onClick={() => setSelecionada(noticia)}
                    className={`block w-full border-b border-border px-3 py-2 text-left text-sm last:border-b-0 ${
                      selecionada?.id === noticia.id
                        ? "bg-accent/10 text-accent"
                        : "text-foreground-secondary hover:bg-surface-muted"
                    }`}
                  >
                    {noticia.titulo}
                  </button>
                ))
              )}
            </div>
          )}

          {selecionada && (
            <p className="text-xs text-muted-foreground">
              Selecionada: <span className="text-foreground-secondary">{selecionada.titulo}</span>
            </p>
          )}

          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Mensagem (opcional)"
            rows={2}
            className="w-full rounded-lg border border-border bg-surface-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
          />

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <button
            type="button"
            disabled={!selecionada || isPending}
            onClick={enviar}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending ? "Enviando..." : "Enviar"}
          </button>
        </div>
      )}
    </Modal>
  );
}
