"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Modal from "@/components/Modal";
import { AREAS_ATUACAO } from "@/lib/areasAtuacao";

interface EditProfileModalProps {
  aberto: boolean;
  onFechar: () => void;
  nomeAtual: string;
  areaAtuacaoAtual: string;
  dataNascimentoAtual: string;
}

const inputClass =
  "w-full rounded-lg border border-navy-800 bg-navy-900/50 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none";

export default function EditProfileModal({
  aberto,
  onFechar,
  nomeAtual,
  areaAtuacaoAtual,
  dataNascimentoAtual,
}: EditProfileModalProps) {
  const router = useRouter();
  const { update } = useSession();
  const [nome, setNome] = useState(nomeAtual);
  const [areaAtuacao, setAreaAtuacao] = useState(areaAtuacaoAtual);
  const [dataNascimento, setDataNascimento] = useState(dataNascimentoAtual);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function salvar() {
    if (!nome.trim()) {
      setErro("Nome é obrigatório.");
      return;
    }
    if (!dataNascimento) {
      setErro("Data de nascimento é obrigatória.");
      return;
    }

    setErro(null);
    startTransition(async () => {
      const resposta = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, areaAtuacao, dataNascimento }),
      });

      const dados = (await resposta.json().catch(() => ({}))) as { erro?: string };

      if (!resposta.ok) {
        setErro(dados.erro ?? "Não foi possível salvar as alterações.");
        return;
      }

      await update({ name: nome });
      onFechar();
      router.refresh();
    });
  }

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Editar perfil">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-nome" className="text-sm font-medium text-zinc-300">
            Nome completo
          </label>
          <input
            id="edit-nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-nascimento" className="text-sm font-medium text-zinc-300">
            Data de nascimento
          </label>
          <input
            id="edit-nascimento"
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-area" className="text-sm font-medium text-zinc-300">
            Área de atuação
          </label>
          <select
            id="edit-area"
            value={areaAtuacao}
            onChange={(e) => setAreaAtuacao(e.target.value)}
            className={inputClass}
          >
            {AREAS_ATUACAO.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!nome.trim() || !dataNascimento || isPending}
            onClick={salvar}
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
