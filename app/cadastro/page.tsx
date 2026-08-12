import CadastroForm from "@/components/CadastroForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CadastroPage() {
  const temas = await prisma.theme.findMany({ orderBy: { nome: "asc" } });

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-50">Criar conta</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Escolha 3 temas de interesse para personalizar seu feed.
        </p>
      </div>
      <CadastroForm temas={temas} />
    </main>
  );
}
