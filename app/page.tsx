import { getServerSession } from "next-auth";
import NewsCard from "@/components/NewsCard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buscarMarcadores } from "@/lib/marcadores";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const [noticias, { readLaterIds, favoritoIds }] = await Promise.all([
    prisma.news.findMany({
      include: { tema: true },
      orderBy: { dataPublicacao: "desc" },
    }),
    buscarMarcadores(session?.user?.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Feed de notícias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumidas por IA, atualizadas de todos os temas. Sem necessidade de login.
        </p>
      </div>

      {noticias.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma notícia disponível no momento.</p>
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
