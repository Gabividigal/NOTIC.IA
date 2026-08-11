import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center dark:bg-black">
      <Logo />
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Notícias resumidas por IA, personalizadas por tema, com um chat
        embutido para você tirar dúvidas sobre cada matéria.
      </p>
    </main>
  );
}
