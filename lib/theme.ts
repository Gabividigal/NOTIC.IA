import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ColorScheme } from "@/components/ThemeProvider";

export async function obterTemaInicial(): Promise<ColorScheme> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return "dark";
  }

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { colorScheme: true },
  });

  return usuario?.colorScheme === "LIGHT" ? "light" : "dark";
}
