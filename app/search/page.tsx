import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import NewsCard from "@/components/NewsCard";
import BackButton from "@/components/BackButton";
import PersonCard from "@/components/PersonCard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buscarMarcadores } from "@/lib/marcadores";
import { buscarStatusConexoes, type StatusConexao } from "@/lib/conexoes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; tema?: string; aba?: string }>;
}

function urlAba(aba: "noticias" | "pessoas", q: string) {
  const params = new URLSearchParams();
  if (aba !== "noticias") params.set("aba", aba);
  if (q) params.set("q", q);
  const query = params.toString();
  return `/search${query ? `?${query}` : ""}`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", tema = "", aba: abaParam = "noticias" } = await searchParams;
  const termo = q.trim();
  const aba = abaParam === "pessoas" ? "pessoas" : "noticias";

  const session = await getServerSession(authOptions);

  const [noticias, { readLaterIds, favoritoIds }] = await Promise.all([
    aba === "noticias" && (termo || tema)
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

  let pessoas: { id: string; nome: string }[] = [];
  let statusConexoes = new Map<string, { status: StatusConexao; connectionId: string | null }>();
  if (aba === "pessoas" && session?.user && termo) {
    pessoas = await prisma.user.findMany({
      where: {
        AND: [{ id: { not: session.user.id } }, { nome: { contains: termo, mode: "insensitive" } }],
      },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
      take: 30,
    });
    statusConexoes = await buscarStatusConexoes(
      session.user.id,
      pessoas.map((pessoa) => pessoa.id),
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      {tema && aba === "noticias" && <BackButton />}

      <div className={tema && aba === "noticias" ? "mt-6 mb-8" : "mb-8"}>
        <h1 className="text-2xl font-bold text-zinc-50">Buscar</h1>

        <div className="mt-4 flex items-center gap-1 border-b border-navy-800">
          <Link
            href={urlAba("noticias", q)}
            className={`px-3 py-2 text-sm font-medium transition ${
              aba === "noticias"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Notícias
          </Link>
          <Link
            href={urlAba("pessoas", q)}
            className={`px-3 py-2 text-sm font-medium transition ${
              aba === "pessoas"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Pessoas
          </Link>
        </div>

        <form action="/search" method="GET" className="mt-4 flex items-center gap-2">
          {aba === "pessoas" && <input type="hidden" name="aba" value="pessoas" />}
          <div className="relative flex-1">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-500"
              size={18}
            />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder={aba === "noticias" ? "Buscar por título ou resumo..." : "Buscar por nome..."}
              className="w-full rounded-full border border-navy-800 bg-navy-900/50 py-2.5 pr-4 pl-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Buscar
          </button>
        </form>

        {tema && aba === "noticias" && (
          <p className="mt-3 text-sm text-zinc-400">
            Filtrando por tema: <span className="text-zinc-200">{tema}</span>{" "}
            <Link href="/search" className="text-blue-400 hover:underline">
              limpar
            </Link>
          </p>
        )}
      </div>

      {aba === "noticias" ? (
        !termo && !tema ? (
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
        )
      ) : !session?.user ? (
        <p className="text-zinc-400">
          <Link href="/login" className="text-blue-400 hover:underline">
            Faça login
          </Link>{" "}
          para buscar pessoas e se conectar.
        </p>
      ) : !termo ? (
        <p className="text-zinc-400">Digite um nome acima para buscar pessoas.</p>
      ) : pessoas.length === 0 ? (
        <p className="text-zinc-400">Nenhuma pessoa encontrada.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pessoas.map((pessoa) => {
            const info = statusConexoes.get(pessoa.id);
            return (
              <PersonCard
                key={pessoa.id}
                id={pessoa.id}
                nome={pessoa.nome}
                status={info?.status ?? "NENHUMA"}
                connectionId={info?.connectionId ?? null}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
