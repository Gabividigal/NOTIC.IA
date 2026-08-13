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
