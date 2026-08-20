import Link from "next/link";
import { getServerSession } from "next-auth";
import { Inbox } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { contarPendencias } from "@/lib/conexoes";
import { getUsuarioAtual } from "@/lib/usuarioAtual";
import Logo from "@/components/Logo";
import Navigation from "@/components/Navigation";
import UserMenu from "@/components/UserMenu";

export default async function Header() {
  const session = await getServerSession(authOptions);

  const [usuario, pendencias] = await Promise.all([
    getUsuarioAtual(),
    session?.user ? contarPendencias(session.user.id) : Promise.resolve(0),
  ]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <Navigation />
        {usuario ? (
          <div className="flex items-center gap-3">
            <Link
              href="/conexoes"
              aria-label="Conexões"
              className="relative text-muted-foreground transition hover:text-foreground-secondary"
            >
              <Inbox size={20} />
              {pendencias > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
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
              colorScheme={usuario.colorScheme === "LIGHT" ? "light" : "dark"}
            />
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Entrar ou criar conta
          </Link>
        )}
      </div>
    </header>
  );
}
