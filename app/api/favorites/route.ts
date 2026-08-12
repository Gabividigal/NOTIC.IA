import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { alternarMarcador } from "@/lib/marcadores";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "É preciso estar logado." }, { status: 401 });
  }

  const { newsId } = (await request.json().catch(() => ({}))) as { newsId?: string };
  if (!newsId) {
    return NextResponse.json({ erro: "newsId é obrigatório." }, { status: 400 });
  }

  const marcado = await alternarMarcador(prisma.favorite, session.user.id, newsId);

  return NextResponse.json({ marcado });
}
