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

  const { receiverId } = (await request.json().catch(() => ({}))) as { receiverId?: string };
  if (!receiverId) {
    return NextResponse.json({ erro: "receiverId é obrigatório." }, { status: 400 });
  }

  if (receiverId === session.user.id) {
    return NextResponse.json({ erro: "Você não pode se conectar com você mesmo." }, { status: 400 });
  }

  const destinatario = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!destinatario) {
    return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });
  }

  const existente = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: session.user.id, receiverId },
        { requesterId: receiverId, receiverId: session.user.id },
      ],
    },
  });

  if (existente) {
    return NextResponse.json({ erro: "Já existe uma conexão com esse usuário." }, { status: 409 });
  }

  const conexao = await prisma.connection.create({
    data: { requesterId: session.user.id, receiverId, status: "PENDING" },
  });

  return NextResponse.json({ conexao });
}
