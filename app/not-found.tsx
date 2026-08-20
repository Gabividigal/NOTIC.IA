import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold text-foreground">Página não encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        O conteúdo que você procura não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Voltar para o feed
      </Link>
    </main>
  );
}
