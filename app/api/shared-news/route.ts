import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "É preciso estar logado." }, { status: 401 });
  }

  const { newsId, receiverIds, message } = (await request.json().catch(() => ({}))) as {
    newsId?: string;
    receiverIds?: string[];
    message?: string;
  };

  if (!newsId || !Array.isArray(receiverIds) || receiverIds.length === 0) {
    return NextResponse.json(
      { erro: "newsId e ao menos um receiverId são obrigatórios." },
      { status: 400 },
    );
  }

  const noticia = await prisma.news.findUnique({ where: { id: newsId } });
  if (!noticia) {
    return NextResponse.json({ erro: "Notícia não encontrada." }, { status: 404 });
  }

  const conexoesAceitas = await prisma.connection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: session.user.id, receiverId: { in: receiverIds } },
        { receiverId: session.user.id, requesterId: { in: receiverIds } },
      ],
    },
  });

  const destinatariosValidos = new Set(
    conexoesAceitas.map((conexao) =>
      conexao.requesterId === session.user.id ? conexao.receiverId : conexao.requesterId,
    ),
  );

  const receiverIdsValidos = receiverIds.filter((id) => destinatariosValidos.has(id));
  if (receiverIdsValidos.length === 0) {
    return NextResponse.json(
      { erro: "Nenhum dos destinatários é uma conexão sua." },
      { status: 400 },
    );
  }

  const mensagemTratada = message?.trim() || null;

  await prisma.sharedNews.createMany({
    data: receiverIdsValidos.map((receiverId) => ({
      senderId: session.user.id,
      receiverId,
      newsId,
      message: mensagemTratada,
    })),
  });

  return NextResponse.json({ ok: true, enviadas: receiverIdsValidos.length });
}
