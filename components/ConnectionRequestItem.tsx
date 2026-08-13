"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ConnectionRequestItem({ id, nome }: { id: string; nome: string }) {
  const router = useRouter();
  const [respondido, setRespondido] = useState(false);
  const [isPending, startTransition] = useTransition();

  function responder(acao: "aceitar" | "recusar") {
    startTransition(async () => {
      const resposta = await fetch(`/api/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao }),
      });

      if (resposta.ok) {
        setRespondido(true);
        router.refresh();
      }
    });
  }

  if (respondido) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-navy-800 bg-navy-900/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white">
          {nome.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-zinc-100">
          <span className="font-medium">{nome}</span> quer se conectar com você
        </span>
      </div>
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
    </div>
  );
}
