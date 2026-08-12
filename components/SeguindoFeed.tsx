"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ListFilter } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import ThemeBadge from "@/components/ThemeBadge";

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
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [temasOcultos, setTemasOcultos] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownAberto) return;

    function aoClicarFora(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownAberto(false);
      }
    }
    function aoTeclar(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownAberto(false);
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [dropdownAberto]);

  function alternarTema(id: string) {
    setTemasOcultos((atuais) => {
      const novo = new Set(atuais);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  const noticiasVisiveis = useMemo(
    () => noticias.filter((noticia) => !temasOcultos.has(noticia.temaId)),
    [noticias, temasOcultos],
  );

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2.5">
        <h1 className="text-2xl font-bold text-zinc-50">Seguindo</h1>

        {temasSeguidos.length > 0 && (
          <div ref={containerRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownAberto((atual) => !atual)}
              aria-label="Filtrar temas visíveis"
              aria-expanded={dropdownAberto}
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                dropdownAberto
                  ? "border-blue-500 text-blue-400"
                  : "border-navy-700 text-zinc-400 hover:border-navy-500 hover:text-zinc-100"
              }`}
            >
              <ListFilter size={14} />
            </button>

            {dropdownAberto && (
              <div className="absolute top-9 left-0 z-40 w-56 rounded-xl border border-navy-800 bg-navy-950 p-3 shadow-xl">
                <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Mostrar temas
                </p>
                <div className="flex flex-col gap-1">
                  {temasSeguidos.map((tema) => {
                    const visivel = !temasOcultos.has(tema.id);
                    return (
                      <label
                        key={tema.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-200 transition hover:bg-navy-900"
                      >
                        <input
                          type="checkbox"
                          checked={visivel}
                          onChange={() => alternarTema(tema.id)}
                          className="h-4 w-4 rounded border-navy-700 bg-navy-900 text-blue-600 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        {tema.nome}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {temasSeguidos.map((tema) => (
            <ThemeBadge key={tema.id} nome={tema.nome} />
          ))}
        </div>
      </div>

      <p className="mb-6 text-sm text-zinc-400">
        Notícias dos temas que você escolheu acompanhar.
      </p>

      {noticias.length === 0 ? (
        <p className="text-zinc-400">
          Nenhuma notícia disponível para os seus temas de interesse no momento.
        </p>
      ) : noticiasVisiveis.length === 0 ? (
        <p className="text-zinc-400">
          Nenhum tema selecionado no filtro. Marque ao menos um tema para ver notícias.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {noticiasVisiveis.map((noticia) => (
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
