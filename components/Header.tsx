import Link from "next/link";
import Logo from "@/components/Logo";
import Navigation from "@/components/Navigation";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <Navigation />
        <Link
          href="/login"
          className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Entrar ou criar conta
        </Link>
      </div>
    </header>
  );
}
