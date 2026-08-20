"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  children: ReactNode;
  largura?: string;
}

export default function Modal({
  aberto,
  onFechar,
  titulo,
  children,
  largura = "max-w-md",
}: ModalProps) {
  useEffect(() => {
    if (!aberto) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onFechar();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [aberto, onFechar]);

  if (!aberto) {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      onClick={onFechar}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 px-4 py-8"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(event) => event.stopPropagation()}
        className={`w-full ${largura} rounded-xl border border-border bg-background p-6 shadow-xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-titulo" className="text-lg font-semibold text-foreground">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="text-muted-foreground transition hover:text-foreground-secondary"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
