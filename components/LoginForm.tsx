"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

const inputClass =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    startTransition(async () => {
      const resultado = await signIn("credentials", {
        email,
        password: senha,
        redirect: false,
      });

      if (!resultado || resultado.error) {
        setErro("Email ou senha incorretos.");
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="voce@exemplo.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="text-sm font-medium text-zinc-300">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className={inputClass}
          placeholder="••••••••"
        />
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={isPending || !email || !senha}
        className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Não tem uma conta?{" "}
        <Link href="/cadastro" className="text-blue-400 hover:underline">
          Criar agora
        </Link>
      </p>
    </form>
  );
}
