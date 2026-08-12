import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-50">Entrar</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Acesse sua conta para acompanhar seus temas favoritos.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
