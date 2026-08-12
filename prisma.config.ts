
// Carrega .env localmente (fora do Next.js, ex: comandos `prisma` via CLI).
// Na Vercel não existe .env físico — essa chamada é um no-op e o
// DATABASE_URL já vem injetado diretamente em process.env pela plataforma.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Sem `engine`/`datasource` aqui de propósito: declarar `datasource.url`
  // exige o helper `env()` do Prisma, que lança PrismaConfigEnvError
  // imediatamente ao carregar o config caso a variável não esteja setada —
  // inclusive para comandos que não precisam de conexão nenhuma, como
  // `prisma generate` (rodado no postinstall). "classic" já é o engine
  // padrão, e a URL é lida de `process.env.DATABASE_URL` de forma lazy
  // pelo próprio schema.prisma (`datasource db { url = env(...) }`), que só
  // é avaliada quando um comando realmente precisa conectar.
});
