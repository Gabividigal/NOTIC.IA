"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import Modal from "@/components/Modal";

interface Conexao {
  id: string;
  nome: string;
}

export default function ShareNewsModal({
  newsId,
  conexoes,
}: {
  newsId: string;
  conexoes: Conexao[];
}) {
  const [aberto, setAberto] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function alternar(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  function abrir() {
    setSelecionados(new Set());
    setMensagem("");
    setEnviado(false);
    setErro(null);
    setAberto(true);
  }

  function enviar() {
    if (selecionados.size === 0) return;
    setErro(null);
    startTransition(async () => {
      const resposta = await fetch("/api/shared-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsId,
          receiverIds: Array.from(selecionados),
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

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-label="Enviar para conexão"
        title="Enviar para conexão"
        className="rounded-full p-1.5 text-muted-foreground transition hover:text-foreground-secondary"
      >
        <Send size={16} />
      </button>

      <Modal aberto={aberto} onFechar={() => setAberto(false)} titulo="Enviar notícia">
        {enviado ? (
          <p className="text-sm text-green-400">Notícia enviada!</p>
        ) : conexoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Você ainda não tem conexões aceitas. Conecte-se com alguém na busca por pessoas.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
              {conexoes.map((conexao) => (
                <label
                  key={conexao.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground-secondary hover:bg-surface-muted"
                >
                  <input
                    type="checkbox"
                    checked={selecionados.has(conexao.id)}
                    onChange={() => alternar(conexao.id)}
                    className="h-4 w-4 rounded border-border-strong bg-surface-muted text-accent focus:ring-accent"
                  />
                  {conexao.nome}
                </label>
              ))}
            </div>

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
              disabled={selecionados.size === 0 || isPending}
              onClick={enviar}
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Enviando..." : "Enviar"}
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
