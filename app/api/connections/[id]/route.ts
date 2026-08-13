import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "É preciso estar logado." }, { status: 401 });
  }

  const { id } = await params;
  const { acao } = (await request.json().catch(() => ({}))) as { acao?: string };

  if (acao !== "aceitar" && acao !== "recusar") {
    return NextResponse.json({ erro: "Ação inválida." }, { status: 400 });
  }

  const conexao = await prisma.connection.findUnique({ where: { id } });
  if (!conexao) {
    return NextResponse.json({ erro: "Pedido de conexão não encontrado." }, { status: 404 });
  }

  if (conexao.receiverId !== session.user.id) {
    return NextResponse.json({ erro: "Você não pode responder a esse pedido." }, { status: 403 });
  }

  if (conexao.status !== "PENDING") {
    return NextResponse.json({ erro: "Esse pedido já foi respondido." }, { status: 409 });
  }

  const atualizada = await prisma.connection.update({
    where: { id },
    data: { status: acao === "aceitar" ? "ACCEPTED" : "REJECTED" },
  });

  return NextResponse.json({ conexao: atualizada });
}
