import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "É preciso estar logado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const termo = searchParams.get("q")?.trim() ?? "";

  const noticias = await prisma.news.findMany({
    where: termo
      ? {
          OR: [
            { titulo: { contains: termo, mode: "insensitive" } },
            { resumoIA: { contains: termo, mode: "insensitive" } },
          ],
        }
      : {},
    include: { tema: true },
    orderBy: { dataPublicacao: "desc" },
    take: 20,
  });

  return NextResponse.json({
    noticias: noticias.map((noticia) => ({
      id: noticia.id,
      titulo: noticia.titulo,
      temaNome: noticia.tema.nome,
      fonte: noticia.nomeFonte,
    })),
  });
}
