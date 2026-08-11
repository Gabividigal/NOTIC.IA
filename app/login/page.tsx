import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold text-zinc-50">Em breve</h1>
      <p className="max-w-md text-zinc-400">
        O login e a criação de conta ainda estão sendo construídos. Por enquanto, aproveite o
        feed público de notícias.
      </p>
      <Link
        href="/"
        className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Voltar para o feed
      </Link>
    </main>
  );
}
