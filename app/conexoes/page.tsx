import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buscarMarcadores } from "@/lib/marcadores";
import ConnectionRequestItem from "@/components/ConnectionRequestItem";
import SharedNewsItem from "@/components/SharedNewsItem";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ConexoesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-zinc-50">Faça login para ver suas conexões</h1>
        <Link
          href="/login"
          className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Entrar ou criar conta
        </Link>
      </main>
    );
  }

  const [pedidosPendentes, noticiasRecebidas, { readLaterIds, favoritoIds }] = await Promise.all([
    prisma.connection.findMany({
      where: { receiverId: session.user.id, status: "PENDING" },
      include: { requester: { select: { id: true, nome: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sharedNews.findMany({
      where: { receiverId: session.user.id },
      include: { sender: { select: { nome: true } }, news: { include: { tema: true } } },
      orderBy: { createdAt: "desc" },
    }),
    buscarMarcadores(session.user.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-50">Conexões</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-50">Pedidos de conexão</h2>
        {pedidosPendentes.length === 0 ? (
          <p className="mt-4 rounded-xl border border-navy-800 bg-navy-900/50 p-5 text-sm text-zinc-400">
            Nenhum pedido de conexão pendente.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {pedidosPendentes.map((pedido) => (
              <ConnectionRequestItem key={pedido.id} id={pedido.id} nome={pedido.requester.nome} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-50">Notícias recebidas</h2>
        {noticiasRecebidas.length === 0 ? (
          <p className="mt-4 rounded-xl border border-navy-800 bg-navy-900/50 p-5 text-sm text-zinc-400">
            Nenhuma notícia recebida ainda.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {noticiasRecebidas.map((item) => (
              <SharedNewsItem
                key={item.id}
                id={item.id}
                remetente={item.sender.nome}
                mensagem={item.message}
                lida={item.read}
                noticia={{
                  id: item.news.id,
                  temaNome: item.news.tema.nome,
                  titulo: item.news.titulo,
                  resumo: item.news.resumoIA,
                  fonte: item.news.nomeFonte,
                  data: item.news.dataPublicacao,
                  readLater: readLaterIds.has(item.news.id),
                  favorito: favoritoIds.has(item.news.id),
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
