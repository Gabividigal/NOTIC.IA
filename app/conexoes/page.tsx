import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buscarConversas, buscarConversa, marcarConversaComoLida } from "@/lib/conexoes";
import ConnectionRequestItem from "@/components/ConnectionRequestItem";
import ConversationListItem from "@/components/ConversationListItem";
import ConversationPanel from "@/components/ConversationPanel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ConexoesPageProps {
  searchParams: Promise<{ with?: string }>;
}

export default async function ConexoesPage({ searchParams }: ConexoesPageProps) {
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

  const { with: withId } = await searchParams;

  const [pedidosPendentes, conversas] = await Promise.all([
    prisma.connection.findMany({
      where: { receiverId: session.user.id, status: "PENDING" },
      include: { requester: { select: { id: true, nome: true } } },
      orderBy: { createdAt: "desc" },
    }),
    buscarConversas(session.user.id),
  ]);

  const conversaAtiva = withId ? conversas.find((conversa) => conversa.usuario.id === withId) : undefined;

  const mensagens = conversaAtiva
    ? await buscarConversa(session.user.id, conversaAtiva.usuario.id)
    : [];

  if (conversaAtiva) {
    await marcarConversaComoLida(session.user.id, conversaAtiva.usuario.id);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col md:px-4 md:py-8">
      <div className="flex h-[75vh] overflow-hidden border-navy-800 md:h-[calc(100vh-10rem)] md:rounded-xl md:border">
        <aside
          className={`w-full flex-col overflow-y-auto border-navy-800 md:flex md:w-80 md:shrink-0 md:border-r ${
            withId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="border-b border-navy-800 p-4">
            <h1 className="text-lg font-bold text-zinc-50">Conexões</h1>
          </div>

          {pedidosPendentes.length > 0 && (
            <div className="border-b border-navy-800 p-3">
              <h2 className="px-1 pb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                Pedidos pendentes
              </h2>
              <div className="flex flex-col gap-2">
                {pedidosPendentes.map((pedido) => (
                  <ConnectionRequestItem key={pedido.id} id={pedido.id} nome={pedido.requester.nome} />
                ))}
              </div>
            </div>
          )}

          {conversas.length === 0 ? (
            <p className="p-4 text-sm text-zinc-500">
              Você ainda não tem conexões. Use a busca de pessoas para se conectar.
            </p>
          ) : (
            <div className="flex flex-col">
              {conversas.map((conversa) => (
                <ConversationListItem
                  key={conversa.usuario.id}
                  id={conversa.usuario.id}
                  nome={conversa.usuario.nome}
                  preview={
                    conversa.ultimaMensagem
                      ? `${conversa.ultimaMensagem.deMim ? "Você: " : ""}${
                          conversa.ultimaMensagem.texto ?? conversa.ultimaMensagem.noticiaTitulo
                        }`
                      : "Nenhuma mensagem ainda"
                  }
                  naoLidas={conversa.naoLidas}
                  ativa={conversa.usuario.id === withId}
                />
              ))}
            </div>
          )}
        </aside>

        <section className={`w-full flex-1 flex-col md:flex ${withId ? "flex" : "hidden"}`}>
          {conversaAtiva ? (
            <ConversationPanel nome={conversaAtiva.usuario.nome} mensagens={mensagens} />
          ) : (
            <div className="m-auto max-w-xs text-center text-sm text-zinc-500">
              Selecione uma conversa para ver as notícias trocadas.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
