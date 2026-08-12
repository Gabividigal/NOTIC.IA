import { prisma } from "@/lib/prisma";

export async function buscarMarcadores(userId: string | undefined) {
  if (!userId) {
    return { readLaterIds: new Set<string>(), favoritoIds: new Set<string>() };
  }

  const [readLaters, favoritos] = await Promise.all([
    prisma.readLater.findMany({ where: { userId }, select: { newsId: true } }),
    prisma.favorite.findMany({ where: { userId }, select: { newsId: true } }),
  ]);

  return {
    readLaterIds: new Set(readLaters.map((item) => item.newsId)),
    favoritoIds: new Set(favoritos.map((item) => item.newsId)),
  };
}

interface ModeloMarcavel {
  findUnique(args: {
    where: { userId_newsId: { userId: string; newsId: string } };
  }): Promise<{ id: string } | null>;
  create(args: { data: { userId: string; newsId: string } }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
}

export async function alternarMarcador(modelo: ModeloMarcavel, userId: string, newsId: string) {
  const existente = await modelo.findUnique({ where: { userId_newsId: { userId, newsId } } });

  if (existente) {
    await modelo.delete({ where: { id: existente.id } });
    return false;
  }

  await modelo.create({ data: { userId, newsId } });
  return true;
}
