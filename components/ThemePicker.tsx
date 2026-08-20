"use client";

import { Check } from "lucide-react";
import type { ColorScheme } from "@/components/ThemeProvider";

interface ThemePickerProps {
  value: ColorScheme;
  onChange: (theme: ColorScheme) => void;
}

const OPCOES: { valor: ColorScheme; rotulo: string; bg: string; fg: string }[] = [
  { valor: "dark", rotulo: "Escuro", bg: "#0a1128", fg: "#f4f4f5" },
  { valor: "light", rotulo: "Claro", bg: "#ffffff", fg: "#0a1128" },
];

export default function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {OPCOES.map((opcao) => {
        const selecionado = value === opcao.valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            onClick={() => onChange(opcao.valor)}
            aria-pressed={selecionado}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition ${
              selecionado
                ? "border-accent ring-1 ring-accent"
                : "border-border hover:border-border-hover"
            }`}
          >
            <span
              className="relative flex h-12 w-full items-center justify-center gap-1 rounded-lg border border-border"
              style={{ backgroundColor: opcao.bg }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#002FA7" }} />
              <span
                className="h-1.5 w-8 rounded-full"
                style={{ backgroundColor: opcao.fg, opacity: 0.6 }}
              />
              {selecionado && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
                  <Check size={10} />
                </span>
              )}
            </span>
            <span className="text-sm font-medium text-foreground">{opcao.rotulo}</span>
          </button>
        );
      })}
    </div>
  );
}
