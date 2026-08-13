import { prisma } from "@/lib/prisma";

export type StatusConexao = "NENHUMA" | "PENDENTE_ENVIADA" | "PENDENTE_RECEBIDA" | "ACEITA";

export interface InfoConexao {
  status: StatusConexao;
  connectionId: string | null;
}

export async function buscarStatusConexoes(
  userId: string,
  outrosIds: string[],
): Promise<Map<string, InfoConexao>> {
  const mapa = new Map<string, InfoConexao>();
  if (outrosIds.length === 0) {
    return mapa;
  }

  const conexoes = await prisma.connection.findMany({
    where: {
      OR: [
        { requesterId: userId, receiverId: { in: outrosIds } },
        { receiverId: userId, requesterId: { in: outrosIds } },
      ],
    },
  });

  for (const conexao of conexoes) {
    const outroId = conexao.requesterId === userId ? conexao.receiverId : conexao.requesterId;

    let status: StatusConexao;
    if (conexao.status === "ACCEPTED") {
      status = "ACEITA";
    } else if (conexao.status === "REJECTED") {
      status = "NENHUMA";
    } else if (conexao.requesterId === userId) {
      status = "PENDENTE_ENVIADA";
    } else {
      status = "PENDENTE_RECEBIDA";
    }

    mapa.set(outroId, { status, connectionId: conexao.id });
  }

  return mapa;
}

export async function buscarConexoesAceitas(userId: string) {
  const conexoes = await prisma.connection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
    include: {
      requester: { select: { id: true, nome: true } },
      receiver: { select: { id: true, nome: true } },
    },
  });

  return conexoes.map((conexao) =>
    conexao.requesterId === userId ? conexao.receiver : conexao.requester,
  );
}

export async function contarPendencias(userId: string) {
  const [pedidosPendentes, noticiasNaoLidas] = await Promise.all([
    prisma.connection.count({ where: { receiverId: userId, status: "PENDING" } }),
    prisma.sharedNews.count({ where: { receiverId: userId, read: false } }),
  ]);

  return pedidosPendentes + noticiasNaoLidas;
}

export interface ConversaPreview {
  usuario: { id: string; nome: string };
  ultimaMensagem: {
    texto: string | null;
    noticiaTitulo: string | null;
    createdAt: Date;
    deMim: boolean;
  } | null;
  naoLidas: number;
}

export async function buscarConversas(userId: string): Promise<ConversaPreview[]> {
  const conexoes = await prisma.connection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
    include: {
      requester: { select: { id: true, nome: true } },
      receiver: { select: { id: true, nome: true } },
    },
  });

  const conversas = await Promise.all(
    conexoes.map(async (conexao) => {
      const outro = conexao.requesterId === userId ? conexao.receiver : conexao.requester;

      const [ultima, naoLidas] = await Promise.all([
        prisma.sharedNews.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: outro.id },
              { senderId: outro.id, receiverId: userId },
            ],
          },
          orderBy: { createdAt: "desc" },
          include: { news: { select: { titulo: true } } },
        }),
        prisma.sharedNews.count({ where: { senderId: outro.id, receiverId: userId, read: false } }),
      ]);

      return {
        usuario: outro,
        ultimaMensagem: ultima
          ? {
              texto: ultima.message,
              noticiaTitulo: ultima.news?.titulo ?? null,
              createdAt: ultima.createdAt,
              deMim: ultima.senderId === userId,
            }
          : null,
        naoLidas,
      };
    }),
  );

  conversas.sort((a, b) => {
    const dataA = a.ultimaMensagem?.createdAt.getTime() ?? 0;
    const dataB = b.ultimaMensagem?.createdAt.getTime() ?? 0;
    return dataB - dataA;
  });

  return conversas;
}

export interface MensagemConversa {
  id: string;
  deMim: boolean;
  mensagem: string | null;
  createdAt: Date;
  noticia: { id: string; titulo: string; temaNome: string; fonte: string; data: Date } | null;
}

export async function buscarConversa(userId: string, outroId: string): Promise<MensagemConversa[]> {
  const mensagens = await prisma.sharedNews.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: outroId },
        { senderId: outroId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: { news: { include: { tema: true } } },
  });

  return mensagens.map((mensagem) => ({
    id: mensagem.id,
    deMim: mensagem.senderId === userId,
    mensagem: mensagem.message,
    createdAt: mensagem.createdAt,
    noticia: mensagem.news
      ? {
          id: mensagem.news.id,
          titulo: mensagem.news.titulo,
          temaNome: mensagem.news.tema.nome,
          fonte: mensagem.news.nomeFonte,
          data: mensagem.news.dataPublicacao,
        }
      : null,
  }));
}

export async function enviarMensagemTexto(senderId: string, receiverId: string, texto: string) {
  const conexao = await prisma.connection.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: senderId, receiverId },
        { requesterId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (!conexao) {
    return null;
  }

  return prisma.sharedNews.create({
    data: { senderId, receiverId, message: texto },
  });
}

export async function marcarConversaComoLida(userId: string, outroId: string) {
  await prisma.sharedNews.updateMany({
    where: { senderId: outroId, receiverId: userId, read: false },
    data: { read: true },
  });
}
