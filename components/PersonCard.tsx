"use client";

import { useState, useTransition } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import SendToConnectionModal from "@/components/SendToConnectionModal";
import type { StatusConexao } from "@/lib/conexoes";

interface PersonCardProps {
  id: string;
  nome: string;
  status: StatusConexao;
  connectionId: string | null;
}

export default function PersonCard({
  id,
  nome,
  status: statusInicial,
  connectionId: connectionIdInicial,
}: PersonCardProps) {
  const [status, setStatus] = useState(statusInicial);
  const [connectionId, setConnectionId] = useState(connectionIdInicial);
  const [modalAberto, setModalAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  function conectar() {
    startTransition(async () => {
      const resposta = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: id }),
      });

      if (resposta.ok) {
        const dados = (await resposta.json()) as { conexao: { id: string } };
        setStatus("PENDENTE_ENVIADA");
        setConnectionId(dados.conexao.id);
      }
    });
  }

  function responder(acao: "aceitar" | "recusar") {
    if (!connectionId) return;
    startTransition(async () => {
      const resposta = await fetch(`/api/connections/${connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao }),
      });

      if (resposta.ok) {
        setStatus(acao === "aceitar" ? "ACEITA" : "NENHUMA");
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-navy-800 bg-navy-900/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white">
          {nome.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-zinc-100">{nome}</span>
      </div>

      {status === "NENHUMA" && (
        <button
          type="button"
          onClick={conectar}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <UserPlus size={14} />
          Conectar
        </button>
      )}

      {status === "PENDENTE_ENVIADA" && (
        <button
          type="button"
          disabled
          className="rounded-full border border-navy-800 px-3 py-1.5 text-xs font-medium text-zinc-500"
        >
          Pedido enviado
        </button>
      )}

      {status === "PENDENTE_RECEBIDA" && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => responder("aceitar")}
            disabled={isPending}
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Aceitar
          </button>
          <button
            type="button"
            onClick={() => responder("recusar")}
            disabled={isPending}
            className="rounded-full border border-navy-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Recusar
          </button>
        </div>
      )}

      {status === "ACEITA" && (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-medium text-green-400">
            <UserCheck size={14} />
            Conectado
          </span>
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="rounded-full border border-navy-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-blue-500/50 hover:text-blue-400"
          >
            Enviar notícia
          </button>
        </div>
      )}

      <SendToConnectionModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        receiverId={id}
        receiverNome={nome}
      />
    </div>
  );
}
