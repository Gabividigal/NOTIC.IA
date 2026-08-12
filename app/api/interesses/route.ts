import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "É preciso estar logado." }, { status: 401 });
  }

  const { temaIds } = (await request.json().catch(() => ({}))) as { temaIds?: string[] };
  if (!Array.isArray(temaIds) || temaIds.length === 0) {
    return NextResponse.json({ erro: "Selecione ao menos um interesse." }, { status: 400 });
  }

  const idsUnicos = Array.from(new Set(temaIds));

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plano: true },
  });
  if (!usuario) {
    return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });
  }

  if (usuario.plano !== "PRO" && idsUnicos.length !== 3) {
    return NextResponse.json(
      { erro: "Selecione exatamente 3 interesses no plano gratuito." },
      { status: 400 },
    );
  }

  const temasValidos = await prisma.theme.findMany({ where: { id: { in: idsUnicos } } });
  if (temasValidos.length !== idsUnicos.length) {
    return NextResponse.json(
      { erro: "Um ou mais temas selecionados são inválidos." },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.userTheme.deleteMany({ where: { userId: session.user.id } }),
    prisma.userTheme.createMany({
      data: idsUnicos.map((themeId) => ({ userId: session.user.id, themeId })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
