import Link from "next/link";
import { getServerSession } from "next-auth";
import { UserRound } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import NewsCard from "@/components/NewsCard";
import EditProfileModal from "@/components/EditProfileModal";
import EditInterestsModal from "@/components/EditInterestsModal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function UserPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <UserRound size={40} className="text-zinc-600" />
        <h1 className="text-2xl font-bold text-zinc-50">Faça login para ver seu perfil</h1>
        <p className="max-w-md text-zinc-400">
          Acompanhe os temas que você segue, seu histórico de chat com as notícias e gerencie sua
          assinatura.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Entrar ou criar conta
        </Link>
      </main>
    );
  }

  const [usuario, todosOsTemas] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        temas: { include: { theme: true } },
        readLaters: {
          include: { news: { include: { tema: true } } },
          orderBy: { createdAt: "desc" },
        },
        favorites: {
          include: { news: { include: { tema: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.theme.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!usuario) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-zinc-400">Não foi possível carregar seu perfil.</p>
        <LogoutButton />
      </main>
    );
  }

  const readLaterIds = new Set(usuario.readLaters.map((item) => item.newsId));
  const favoritoIds = new Set(usuario.favorites.map((item) => item.newsId));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 md:flex-row md:items-stretch">
        <div className="relative flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <EditProfileModal nomeAtual={usuario.nome} areaAtuacaoAtual={usuario.areaAtuacao} />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-xl font-bold text-white">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50">{usuario.nome}</h1>
            <p className="text-sm text-zinc-400">{usuario.email}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div>
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Área de atuação
            </p>
            <p className="mt-1 text-sm text-zinc-200">{usuario.areaAtuacao}</p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Data de nascimento
            </p>
            <p className="mt-1 text-sm text-zinc-200">
              {usuario.dataNascimento.toLocaleDateString("pt-BR", { timeZone: "UTC" })}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Plano</p>
            <p className="mt-1 text-sm text-zinc-200">
              {usuario.plano === "PRO" ? "PRO" : "Gratuito"}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-50">Seus interesses</h2>
          <EditInterestsModal
            temas={todosOsTemas}
            selecionadosAtuais={usuario.temas.map(({ theme }) => theme.id)}
            plano={usuario.plano}
          />
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          Toque em um tema para ver o feed filtrado só com ele.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {usuario.temas.map(({ theme }) => (
            <Link
              key={theme.id}
              href={`/interesse/${encodeURIComponent(theme.nome)}`}
              className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-5 text-center font-medium text-zinc-100 transition hover:border-blue-500/50 hover:text-blue-400"
            >
              {theme.nome}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-50">Ler depois</h2>
        <p className="mt-1 text-sm text-zinc-400">Notícias que você marcou para ler com calma.</p>
        {usuario.readLaters.length === 0 ? (
          <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-400">
            Você ainda não marcou nenhuma notícia para ler depois.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {usuario.readLaters.map(({ news }) => (
              <NewsCard
                key={news.id}
                id={news.id}
                temaNome={news.tema.nome}
                titulo={news.titulo}
                resumo={news.resumoIA}
                fonte={news.nomeFonte}
                data={news.dataPublicacao}
                autenticado
                readLater={readLaterIds.has(news.id)}
                favorito={favoritoIds.has(news.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-50">Favoritos</h2>
        <p className="mt-1 text-sm text-zinc-400">Notícias que você marcou como favoritas.</p>
        {usuario.favorites.length === 0 ? (
          <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-400">
            Você ainda não adicionou nenhum favorito.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {usuario.favorites.map(({ news }) => (
              <NewsCard
                key={news.id}
                id={news.id}
                temaNome={news.tema.nome}
                titulo={news.titulo}
                resumo={news.resumoIA}
                fonte={news.nomeFonte}
                data={news.dataPublicacao}
                autenticado
                readLater={readLaterIds.has(news.id)}
                favorito={favoritoIds.has(news.id)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="mt-10 flex justify-center">
        <LogoutButton />
      </div>
    </main>
  );
}
