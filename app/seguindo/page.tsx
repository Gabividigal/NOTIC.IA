import Link from "next/link";
import { getServerSession } from "next-auth";
import { UserCheck } from "lucide-react";
import SeguindoFeed from "@/components/SeguindoFeed";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buscarMarcadores } from "@/lib/marcadores";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SeguindoPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <UserCheck size={40} className="text-zinc-600" />
        <h1 className="text-2xl font-bold text-zinc-50">Faça login para ver o Seguindo</h1>
        <p className="max-w-md text-zinc-400">
          Essa aba mostra só as notícias dos temas que você escolheu acompanhar no cadastro.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Entrar ou criar conta
        </Link>
      </main>
    );
  }

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { temas: { select: { theme: { select: { id: true, nome: true } } } } },
  });
  const temasSeguidos = usuario?.temas.map(({ theme }) => theme) ?? [];
  const themeIds = temasSeguidos.map((tema) => tema.id);

  const [noticias, { readLaterIds, favoritoIds }] = await Promise.all([
    prisma.news.findMany({
      where: { themeId: { in: themeIds } },
      include: { tema: true },
      orderBy: { dataPublicacao: "desc" },
    }),
    buscarMarcadores(session.user.id),
  ]);

  const noticiasFormatadas = noticias.map((noticia) => ({
    id: noticia.id,
    titulo: noticia.titulo,
    resumo: noticia.resumoIA,
    fonte: noticia.nomeFonte,
    data: noticia.dataPublicacao,
    temaId: noticia.themeId,
    temaNome: noticia.tema.nome,
    readLater: readLaterIds.has(noticia.id),
    favorito: favoritoIds.has(noticia.id),
  }));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <SeguindoFeed noticias={noticiasFormatadas} temasSeguidos={temasSeguidos} />
    </main>
  );
}
