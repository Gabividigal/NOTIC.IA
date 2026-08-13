import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import ThemeBadge from "@/components/ThemeBadge";
import BackButton from "@/components/BackButton";
import NewsCardActions from "@/components/NewsCardActions";
import ShareNewsModal from "@/components/ShareNewsModal";
import ChatPanel from "@/components/ChatPanel";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buscarConexoesAceitas } from "@/lib/conexoes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface NoticiaPageProps {
  params: Promise<{ id: string }>;
}

export default async function NoticiaPage({ params }: NoticiaPageProps) {
  const { id } = await params;

  const noticia = await prisma.news.findUnique({
    where: { id },
    include: { tema: true },
  });

  if (!noticia) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  let readLater = false;
  let favorito = false;
  let conexoesAceitas: { id: string; nome: string }[] = [];
  if (session?.user) {
    const [marcadoReadLater, marcadoFavorito, conexoes] = await Promise.all([
      prisma.readLater.findUnique({
        where: { userId_newsId: { userId: session.user.id, newsId: id } },
      }),
      prisma.favorite.findUnique({
        where: { userId_newsId: { userId: session.user.id, newsId: id } },
      }),
      buscarConexoesAceitas(session.user.id),
    ]);
    readLater = Boolean(marcadoReadLater);
    favorito = Boolean(marcadoFavorito);
    conexoesAceitas = conexoes;
  }

  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(noticia.dataPublicacao);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <BackButton />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <article className="flex flex-col gap-4 lg:w-[62%]">
          <div className="flex items-start justify-between gap-2">
            <ThemeBadge nome={noticia.tema.nome} />
            <div className="flex items-center gap-1">
              <NewsCardActions
                newsId={noticia.id}
                autenticado={Boolean(session?.user)}
                initialReadLater={readLater}
                initialFavorito={favorito}
              />
              {session?.user && <ShareNewsModal newsId={noticia.id} conexoes={conexoesAceitas} />}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-zinc-50 sm:text-3xl">{noticia.titulo}</h1>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{noticia.nomeFonte}</span>
            <span>·</span>
            <span>{dataFormatada}</span>
          </div>

          <p className="text-base leading-relaxed text-zinc-300">{noticia.resumoIA}</p>

          <Link
            href={noticia.linkFonte}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-fit text-sm font-medium text-blue-400 hover:underline"
          >
            Ler matéria completa na fonte original →
          </Link>
        </article>

        <aside className="lg:sticky lg:top-24 lg:w-[38%]">
          <ChatPanel />
        </aside>
      </div>
    </main>
  );
}
