import Link from "next/link";
import { getServerSession } from "next-auth";
import { Inbox } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contarPendencias } from "@/lib/conexoes";
import Logo from "@/components/Logo";
import Navigation from "@/components/Navigation";
import UserMenu from "@/components/UserMenu";

export default async function Header() {
  const session = await getServerSession(authOptions);

  const [usuario, pendencias] = await Promise.all([
    session?.user
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { nome: true, email: true, areaAtuacao: true, dataNascimento: true, plano: true },
        })
      : Promise.resolve(null),
    session?.user ? contarPendencias(session.user.id) : Promise.resolve(0),
  ]);

  return (
    <header className="sticky top-0 z-30 border-b border-navy-800 bg-navy-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <Navigation />
        {usuario ? (
          <div className="flex items-center gap-3">
            <Link
              href="/conexoes"
              aria-label="Conexões"
              className="relative text-zinc-400 transition hover:text-zinc-200"
            >
              <Inbox size={20} />
              {pendencias > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                  {pendencias > 9 ? "9+" : pendencias}
                </span>
              )}
            </Link>
            <UserMenu
              nome={usuario.nome}
              email={usuario.email}
              areaAtuacao={usuario.areaAtuacao}
              dataNascimento={usuario.dataNascimento.toISOString().slice(0, 10)}
              plano={usuario.plano}
            />
          </div>
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
