import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import NewsCard from "@/components/NewsCard";
import BackButton from "@/components/BackButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buscarMarcadores } from "@/lib/marcadores";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface InteressePageProps {
  params: Promise<{ tema: string }>;
}

export default async function InteressePage({ params }: InteressePageProps) {
  const { tema: temaParam } = await params;
  const nomeTema = decodeURIComponent(temaParam);

  const tema = await prisma.theme.findUnique({ where: { nome: nomeTema } });
  if (!tema) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const [noticias, { readLaterIds, favoritoIds }] = await Promise.all([
    prisma.news.findMany({
      where: { themeId: tema.id },
      include: { tema: true },
      orderBy: { dataPublicacao: "desc" },
    }),
    buscarMarcadores(session?.user?.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <BackButton />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl font-bold text-zinc-50">{tema.nome}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Notícias sobre {tema.nome}, resumidas por IA.
        </p>
      </div>

      {noticias.length === 0 ? (
        <p className="text-zinc-400">Nenhuma notícia disponível para este tema no momento.</p>
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
