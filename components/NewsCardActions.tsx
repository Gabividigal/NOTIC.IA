"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Heart } from "lucide-react";

interface NewsCardActionsProps {
  newsId: string;
  autenticado: boolean;
  initialReadLater: boolean;
  initialFavorito: boolean;
}

export default function NewsCardActions({
  newsId,
  autenticado,
  initialReadLater,
  initialFavorito,
}: NewsCardActionsProps) {
  const router = useRouter();
  const [readLater, setReadLater] = useState(initialReadLater);
  const [favorito, setFavorito] = useState(initialFavorito);
  const [, startTransition] = useTransition();

  function alternar(
    endpoint: "read-later" | "favorites",
    valorAtual: boolean,
    setValor: (valor: boolean) => void,
  ) {
    if (!autenticado) {
      router.push("/login");
      return;
    }

    setValor(!valorAtual);

    startTransition(async () => {
      try {
        const resposta = await fetch(`/api/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newsId }),
        });

        if (!resposta.ok) {
          setValor(valorAtual);
          return;
        }

        const dados = (await resposta.json()) as { marcado: boolean };
        setValor(dados.marcado);
      } catch {
        setValor(valorAtual);
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => alternar("read-later", readLater, setReadLater)}
        aria-pressed={readLater}
        aria-label={readLater ? "Remover de ler depois" : "Marcar para ler depois"}
        title={readLater ? "Remover de ler depois" : "Marcar para ler depois"}
        className={`rounded-full p-1.5 transition ${
          readLater ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <Bookmark size={16} fill={readLater ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        onClick={() => alternar("favorites", favorito, setFavorito)}
        aria-pressed={favorito}
        aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        title={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        className={`rounded-full p-1.5 transition ${
          favorito ? "text-pink-400" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <Heart size={16} fill={favorito ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
