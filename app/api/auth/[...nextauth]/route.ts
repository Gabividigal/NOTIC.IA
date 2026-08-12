import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Explícito: o Prisma Client exige Node.js runtime completo (não roda em
// Edge). Não há middleware.ts neste projeto nem uso de Edge Runtime em
// nenhuma rota, mas fixamos isso aqui para garantir e documentar o
// requisito, já que authOptions consulta o Prisma no authorize().
export const runtime = "nodejs";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
