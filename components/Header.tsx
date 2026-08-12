import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Logo from "@/components/Logo";
import Navigation from "@/components/Navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-30 border-b border-navy-800 bg-navy-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <Navigation />
        {session?.user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-zinc-300 sm:inline">
              {session.user.name}
            </span>
            <LogoutButton />
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
