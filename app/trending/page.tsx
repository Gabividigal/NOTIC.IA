import Link from "next/link";
import ThemeBadge from "@/components/ThemeBadge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  const temas = await prisma.theme.findMany({
    include: { _count: { select: { noticias: true } } },
    orderBy: { noticias: { _count: "desc" } },
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-50">Temas em alta</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Os temas com mais notícias no momento, do maior para o menor.
        </p>
      </div>

      {temas.length === 0 ? (
        <p className="text-zinc-400">Nenhum tema cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {temas.map((tema) => (
            <Link
              key={tema.id}
              href={`/search?tema=${encodeURIComponent(tema.nome)}`}
              className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700"
            >
              <ThemeBadge nome={tema.nome} />
              <span className="text-sm text-zinc-400">
                {tema._count.noticias}{" "}
                {tema._count.noticias === 1 ? "notícia" : "notícias"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
