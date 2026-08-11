import Link from "next/link";
import { UserRound } from "lucide-react";

export default function UserPage() {
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
