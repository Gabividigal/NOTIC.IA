"use client";

import NewsCard from "@/components/NewsCard";

interface SharedNewsItemProps {
  id: string;
  remetente: string;
  mensagem: string | null;
  lida: boolean;
  noticia: {
    id: string;
    temaNome: string;
    titulo: string;
    resumo: string;
    fonte: string;
    data: Date;
    readLater: boolean;
    favorito: boolean;
  };
}

export default function SharedNewsItem({
  id,
  remetente,
  mensagem,
  lida,
  noticia,
}: SharedNewsItemProps) {
  function marcarComoLida() {
    if (lida) return;
    fetch(`/api/shared-news/${id}`, { method: "PATCH" }).catch(() => {});
  }

  return (
    <div
      onClick={marcarComoLida}
      className="flex flex-col gap-2 rounded-xl border border-navy-800 bg-navy-900/30 p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-400">
          <span className="font-medium text-zinc-200">{remetente}</span> enviou esta notícia para
          você
        </p>
        {!lida && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
      </div>

      {mensagem && (
        <p className="rounded-lg bg-navy-900/60 px-3 py-2 text-sm text-zinc-300">
          &ldquo;{mensagem}&rdquo;
        </p>
      )}

      <NewsCard
        id={noticia.id}
        temaNome={noticia.temaNome}
        titulo={noticia.titulo}
        resumo={noticia.resumo}
        fonte={noticia.fonte}
        data={noticia.data}
        autenticado
        readLater={noticia.readLater}
        favorito={noticia.favorito}
      />
    </div>
  );
}
