"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registrarUsuario } from "@/app/cadastro/actions";
import { AREAS_ATUACAO } from "@/lib/areasAtuacao";

interface Tema {
  id: string;
  nome: string;
}

const inputClass =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none";

const MAX_TEMAS = 3;

export default function CadastroForm({ temas }: { temas: Tema[] }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [areaAtuacao, setAreaAtuacao] = useState("");
  const [temaIds, setTemaIds] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleTema(id: string) {
    setTemaIds((atuais) => {
      if (atuais.includes(id)) {
        return atuais.filter((temaId) => temaId !== id);
      }
      if (atuais.length >= MAX_TEMAS) {
        return atuais;
      }
      return [...atuais, id];
    });
  }

  const senhasPreenchidasEIguais = senha.length >= 6 && senha === confirmarSenha;

  const podeEnviar = useMemo(() => {
    return Boolean(
      nome.trim() &&
        email.trim() &&
        senhasPreenchidasEIguais &&
        dataNascimento &&
        areaAtuacao.trim() &&
        temaIds.length === MAX_TEMAS &&
        !isPending,
    );
  }, [nome, email, senhasPreenchidasEIguais, dataNascimento, areaAtuacao, temaIds, isPending]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (temaIds.length !== MAX_TEMAS) {
      setErro("Selecione exatamente 3 interesses.");
      return;
    }

    startTransition(async () => {
      const resultado = await registrarUsuario({
        nome,
        email,
        senha,
        dataNascimento,
        areaAtuacao,
        temaIds,
      });

      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }

      const loginResultado = await signIn("credentials", {
        email,
        password: senha,
        redirect: false,
      });

      if (!loginResultado || loginResultado.error) {
        setErro("Conta criada com sucesso. Faça login para continuar.");
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-zinc-300">
          Nome completo
        </label>
        <input
          id="nome"
          type="text"
          autoComplete="name"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={inputClass}
          placeholder="Seu nome completo"
        />
      </div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="senha" className="text-sm font-medium text-zinc-300">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            autoComplete="new-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={inputClass}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmarSenha" className="text-sm font-medium text-zinc-300">
            Confirmar senha
          </label>
          <input
            id="confirmarSenha"
            type="password"
            autoComplete="new-password"
            required
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className={inputClass}
            placeholder="Repita a senha"
          />
          {confirmarSenha.length > 0 && senha !== confirmarSenha && (
            <p className="text-xs text-red-400">As senhas não coincidem.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dataNascimento" className="text-sm font-medium text-zinc-300">
            Data de nascimento
          </label>
          <input
            id="dataNascimento"
            type="date"
            required
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="areaAtuacao" className="text-sm font-medium text-zinc-300">
            Área de atuação
          </label>
          <select
            id="areaAtuacao"
            required
            value={areaAtuacao}
            onChange={(e) => setAreaAtuacao(e.target.value)}
            className={`${inputClass} ${areaAtuacao ? "text-zinc-100" : "text-zinc-500"}`}
          >
            <option value="" disabled>
              Selecione sua área de atuação
            </option>
            {AREAS_ATUACAO.map((area) => (
              <option key={area} value={area} className="text-zinc-100">
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-300">Interesses</span>
          <span
            className={`text-xs font-medium ${
              temaIds.length === MAX_TEMAS ? "text-blue-400" : "text-zinc-500"
            }`}
          >
            {temaIds.length}/{MAX_TEMAS} selecionados
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {temas.map((tema) => {
            const selecionado = temaIds.includes(tema.id);
            const desabilitado = !selecionado && temaIds.length >= MAX_TEMAS;
            return (
              <button
                key={tema.id}
                type="button"
                disabled={desabilitado}
                onClick={() => toggleTema(tema.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition ${
                  selecionado
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ring-transparent"
                    : desabilitado
                      ? "cursor-not-allowed text-zinc-600 ring-zinc-800"
                      : "text-zinc-300 ring-zinc-700 hover:ring-zinc-500"
                }`}
              >
                {tema.nome}
              </button>
            );
          })}
        </div>
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={!podeEnviar}
        className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Já tem conta?{" "}
        <Link href="/login" className="text-blue-400 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
