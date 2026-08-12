"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Voltar"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition hover:text-zinc-100"
    >
      <ArrowLeft size={18} />
      Voltar
    </button>
  );
}
