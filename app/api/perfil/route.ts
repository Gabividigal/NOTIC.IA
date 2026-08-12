import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AREAS_ATUACAO } from "@/lib/areasAtuacao";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "É preciso estar logado." }, { status: 401 });
  }

  const { nome, areaAtuacao } = (await request.json().catch(() => ({}))) as {
    nome?: string;
    areaAtuacao?: string;
  };

  const nomeTratado = nome?.trim();
  if (!nomeTratado) {
    return NextResponse.json({ erro: "Nome é obrigatório." }, { status: 400 });
  }

  if (!areaAtuacao || !(AREAS_ATUACAO as readonly string[]).includes(areaAtuacao)) {
    return NextResponse.json({ erro: "Selecione uma área de atuação válida." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { nome: nomeTratado, areaAtuacao },
  });

  return NextResponse.json({ ok: true });
}
