import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import NewsCard from "@/components/NewsCard";
import BackButton from "@/components/BackButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buscarMarcadores } from "@/lib/marcadores";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; tema?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", tema = "" } = await searchParams;
  const termo = q.trim();

  const session = await getServerSession(authOptions);

  const [noticias, { readLaterIds, favoritoIds }] = await Promise.all([
    termo || tema
      ? prisma.news.findMany({
          where: {
            AND: [
              termo
                ? {
                    OR: [
                      { titulo: { contains: termo, mode: "insensitive" } },
                      { resumoIA: { contains: termo, mode: "insensitive" } },
                    ],
                  }
                : {},
              tema ? { tema: { nome: tema } } : {},
            ],
          },
          include: { tema: true },
          orderBy: { dataPublicacao: "desc" },
        })
      : Promise.resolve([]),
    buscarMarcadores(session?.user?.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      {tema && <BackButton />}

      <div className={tema ? "mt-6 mb-8" : "mb-8"}>
        <h1 className="text-2xl font-bold text-zinc-50">Buscar notícias</h1>

        <form action="/search" method="GET" className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-500"
              size={18}
            />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por título ou resumo..."
              className="w-full rounded-full border border-zinc-800 bg-zinc-900/50 py-2.5 pr-4 pl-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Buscar
          </button>
        </form>

        {tema && (
          <p className="mt-3 text-sm text-zinc-400">
            Filtrando por tema: <span className="text-zinc-200">{tema}</span>{" "}
            <Link href="/search" className="text-blue-400 hover:underline">
              limpar
            </Link>
          </p>
        )}
      </div>

      {!termo && !tema ? (
        <p className="text-zinc-400">Digite um termo acima para buscar notícias.</p>
      ) : noticias.length === 0 ? (
        <p className="text-zinc-400">Nenhuma notícia encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {noticias.map((noticia) => (
            <NewsCard
              key={noticia.id}
              id={noticia.id}
              temaNome={noticia.tema.nome}
              titulo={noticia.titulo}
              resumo={noticia.resumoIA}
              fonte={noticia.nomeFonte}
              data={noticia.dataPublicacao}
              autenticado={Boolean(session?.user)}
              readLater={readLaterIds.has(noticia.id)}
              favorito={favoritoIds.has(noticia.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
