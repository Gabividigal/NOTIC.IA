import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Logo from "@/components/Logo";
import Navigation from "@/components/Navigation";
import UserMenu from "@/components/UserMenu";

export default async function Header() {
  const session = await getServerSession(authOptions);

  const usuario = session?.user
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { nome: true, email: true, areaAtuacao: true, dataNascimento: true, plano: true },
      })
    : null;

  return (
    <header className="sticky top-0 z-30 border-b border-navy-800 bg-navy-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <Navigation />
        {usuario ? (
          <UserMenu
            nome={usuario.nome}
            email={usuario.email}
            areaAtuacao={usuario.areaAtuacao}
            dataNascimento={usuario.dataNascimento.toISOString().slice(0, 10)}
            plano={usuario.plano}
          />
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Entrar ou criar conta
          </Link>
        )}
      </div>
    </header>
  );
}
