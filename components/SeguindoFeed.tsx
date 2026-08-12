"use client";

import { useMemo, useState } from "react";
import NewsCard from "@/components/NewsCard";

interface Tema {
  id: string;
  nome: string;
}

interface Noticia {
  id: string;
  titulo: string;
  resumo: string;
  fonte: string;
  data: Date;
  temaId: string;
  temaNome: string;
  readLater: boolean;
  favorito: boolean;
}

interface SeguindoFeedProps {
  noticias: Noticia[];
  temasSeguidos: Tema[];
}

export default function SeguindoFeed({ noticias, temasSeguidos }: SeguindoFeedProps) {
  const [filtroTemaId, setFiltroTemaId] = useState<string | null>(null);

  const noticiasFiltradas = useMemo(() => {
    if (!filtroTemaId) {
      return noticias;
    }
    return noticias.filter((noticia) => noticia.temaId === filtroTemaId);
  }, [noticias, filtroTemaId]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFiltroTemaId(null)}
          aria-pressed={filtroTemaId === null}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ring-inset transition ${
            filtroTemaId === null
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ring-transparent"
              : "text-zinc-300 ring-zinc-700 hover:ring-zinc-500"
          }`}
        >
          Todos
        </button>
        {temasSeguidos.map((tema) => (
          <button
            key={tema.id}
            type="button"
            onClick={() => setFiltroTemaId(tema.id)}
            aria-pressed={filtroTemaId === tema.id}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ring-inset transition ${
              filtroTemaId === tema.id
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ring-transparent"
                : "text-zinc-300 ring-zinc-700 hover:ring-zinc-500"
            }`}
          >
            {tema.nome}
          </button>
        ))}
      </div>

      {noticiasFiltradas.length === 0 ? (
        <p className="text-zinc-400">Nenhuma notícia encontrada para esse filtro.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {noticiasFiltradas.map((noticia) => (
            <NewsCard
              key={noticia.id}
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
          ))}
        </div>
      )}
    </div>
  );
}
