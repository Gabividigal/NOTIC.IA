"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Pencil, Sparkles } from "lucide-react";
import EditProfileModal from "@/components/EditProfileModal";
import UpgradeProModal from "@/components/UpgradeProModal";
import type { ColorScheme } from "@/components/ThemeProvider";

interface UserMenuProps {
  nome: string;
  email: string;
  areaAtuacao: string;
  dataNascimento: string;
  plano: "FREE" | "PRO";
  colorScheme: ColorScheme;
}

export default function UserMenu({
  nome,
  email,
  areaAtuacao,
  dataNascimento,
  plano,
  colorScheme,
}: UserMenuProps) {
  const [aberto, setAberto] = useState(false);
  const [editAberto, setEditAberto] = useState(false);
  const [upgradeAberto, setUpgradeAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    function aoTeclar(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  function abrirEdicaoPerfil() {
    setAberto(false);
    setEditAberto(true);
  }

  function abrirUpgradePro() {
    setAberto(false);
    setUpgradeAberto(true);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        aria-label="Menu do usuário"
        aria-expanded={aberto}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white transition hover:opacity-90"
      >
        {nome.charAt(0).toUpperCase()}
      </button>

      {aberto && (
        <div className="absolute top-11 right-0 z-40 w-64 rounded-xl border border-border bg-background p-2 shadow-xl">
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium text-foreground">{nome}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>

          <div className="flex flex-col gap-0.5 py-1.5">
            <button
              type="button"
              onClick={abrirEdicaoPerfil}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground-secondary transition hover:bg-surface-muted hover:text-foreground"
            >
              <Pencil size={15} />
              Editar perfil
            </button>

            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="text-sm text-foreground-secondary">
                Plano: {plano === "PRO" ? "PRO" : "Gratuito"}
              </span>
              {plano !== "PRO" && (
                <button
                  type="button"
                  onClick={abrirUpgradePro}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1.5 text-xs font-bold text-zinc-900 shadow-[0_0_16px_rgba(251,191,36,0.45)] transition hover:opacity-90"
                >
                  <Sparkles size={14} />
                  Virar PRO
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-1.5">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground-secondary transition hover:bg-surface-muted hover:text-foreground"
            >
              <LogOut size={15} />
              Sair
            </button>
          </div>
        </div>
      )}

      <EditProfileModal
        key={editAberto ? "editar-aberto" : "editar-fechado"}
        aberto={editAberto}
        onFechar={() => setEditAberto(false)}
        nomeAtual={nome}
        areaAtuacaoAtual={areaAtuacao}
        dataNascimentoAtual={dataNascimento}
        colorSchemeAtual={colorScheme}
      />
      <UpgradeProModal
        key={upgradeAberto ? "upgrade-aberto" : "upgrade-fechado"}
        aberto={upgradeAberto}
        onFechar={() => setUpgradeAberto(false)}
      />
    </div>
  );
}
