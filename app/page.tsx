import NewsCard from "@/components/NewsCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  const noticias = await prisma.news.findMany({
    include: { tema: true },
    orderBy: { dataPublicacao: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-50">Feed de notícias</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Resumidas por IA, atualizadas de todos os temas. Sem necessidade de login.
        </p>
      </div>

      {noticias.length === 0 ? (
        <p className="text-zinc-400">Nenhuma notícia disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {noticias.map((noticia) => (
            <NewsCard
              key={noticia.id}
              temaNome={noticia.tema.nome}
              titulo={noticia.titulo}
              resumo={noticia.resumoIA}
              fonte={noticia.nomeFonte}
              data={noticia.dataPublicacao}
            />
          ))}
        </div>
      )}
    </main>
  );
}
