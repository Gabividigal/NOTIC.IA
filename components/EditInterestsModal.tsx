"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check } from "lucide-react";
import Modal from "@/components/Modal";

interface Tema {
  id: string;
  nome: string;
}

interface EditInterestsModalProps {
  temas: Tema[];
  selecionadosAtuais: string[];
  plano: "FREE" | "PRO";
}

export default function EditInterestsModal({
  temas,
  selecionadosAtuais,
  plano,
}: EditInterestsModalProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [selecionados, setSelecionados] = useState<string[]>(selecionadosAtuais);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const limite = plano === "PRO" ? null : 3;

  function abrir() {
    setSelecionados(selecionadosAtuais);
    setErro(null);
    setAberto(true);
  }

  function alternar(id: string) {
    setSelecionados((atuais) => {
      if (atuais.includes(id)) {
        return atuais.filter((temaId) => temaId !== id);
      }
      if (limite !== null && atuais.length >= limite) {
        return atuais;
      }
      return [...atuais, id];
    });
  }

  const podeSalvar = (limite !== null ? selecionados.length === limite : selecionados.length > 0) && !isPending;

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const resposta = await fetch("/api/interesses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temaIds: selecionados }),
      });

      const dados = (await resposta.json().catch(() => ({}))) as { erro?: string };

      if (!resposta.ok) {
        setErro(dados.erro ?? "Não foi possível salvar as alterações.");
        return;
      }

      setAberto(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-label="Editar interesses"
        className="flex h-6 w-6 items-center justify-center rounded-full border border-border-strong text-muted-foreground transition hover:border-border-hover hover:text-foreground"
      >
        <Plus size={14} />
      </button>

      <Modal aberto={aberto} onFechar={() => setAberto(false)} titulo="Editar interesses">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {limite !== null
                ? `Escolha exatamente ${limite} temas.`
                : "Escolha seus temas de interesse."}
            </p>
            <span
              className={`text-xs font-medium whitespace-nowrap ${
                limite !== null && selecionados.length === limite
                  ? "text-accent"
                  : "text-muted-foreground"
              }`}
            >
              {selecionados.length}
              {limite !== null ? `/${limite}` : ""} selecionados
            </span>
          </div>

          <div className="flex max-h-72 flex-wrap gap-2 overflow-y-auto">
            {temas.map((tema) => {
              const selecionado = selecionados.includes(tema.id);
              const desabilitado = !selecionado && limite !== null && selecionados.length >= limite;
              return (
                <button
                  key={tema.id}
                  type="button"
                  disabled={desabilitado}
                  onClick={() => alternar(tema.id)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition ${
                    selecionado
                      ? "bg-accent text-white ring-transparent"
                      : desabilitado
                        ? "cursor-not-allowed text-subtle-foreground ring-border"
                        : "text-foreground-secondary ring-border-strong hover:ring-border-hover"
                  }`}
                >
                  {selecionado && <Check size={12} />}
                  {tema.nome}
                </button>
              );
            })}
          </div>

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!podeSalvar}
              onClick={salvar}
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
