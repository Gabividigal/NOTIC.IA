import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const getUsuarioAtual = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      nome: true,
      email: true,
      areaAtuacao: true,
      dataNascimento: true,
      plano: true,
      colorScheme: true,
    },
  });
});
