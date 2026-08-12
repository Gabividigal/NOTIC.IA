import Link from "next/link";
import { getServerSession } from "next-auth";
import { UserRound } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import ThemeBadge from "@/components/ThemeBadge";

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

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { temas: { include: { theme: true } } },
  });

  if (!usuario) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-zinc-400">Não foi possível carregar seu perfil.</p>
        <LogoutButton />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-xl font-bold text-white">
          {usuario.nome.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">{usuario.nome}</h1>
          <p className="text-sm text-zinc-400">{usuario.email}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
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
        <div>
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
            Temas de interesse
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {usuario.temas.map(({ theme }) => (
              <ThemeBadge key={theme.id} nome={theme.nome} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <LogoutButton />
      </div>
    </main>
  );
}
