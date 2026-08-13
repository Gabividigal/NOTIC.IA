import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "É preciso estar logado." }, { status: 401 });
  }

  const { id } = await params;

  const compartilhada = await prisma.sharedNews.findUnique({ where: { id } });
  if (!compartilhada) {
    return NextResponse.json({ erro: "Notícia compartilhada não encontrada." }, { status: 404 });
  }

  if (compartilhada.receiverId !== session.user.id) {
    return NextResponse.json({ erro: "Você não pode marcar essa notícia como lida." }, { status: 403 });
  }

  await prisma.sharedNews.update({ where: { id }, data: { read: true } });

  return NextResponse.json({ ok: true });
}
