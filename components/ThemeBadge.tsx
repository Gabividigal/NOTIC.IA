const CORES_POR_TEMA: Record<string, string> = {
  Economia: "bg-blue-500/15 text-blue-400 ring-blue-500/30",
  Agronegócio: "bg-teal-500/15 text-teal-400 ring-teal-500/30",
  Esportes: "bg-cyan-500/15 text-cyan-400 ring-cyan-500/30",
  Política: "bg-pink-500/15 text-pink-400 ring-pink-500/30",
  Tecnologia: "bg-purple-500/15 text-purple-400 ring-purple-500/30",
};

const COR_PADRAO = "bg-indigo-500/15 text-indigo-400 ring-indigo-500/30";

/** Usado só no tema escuro (ver globals.css) para variar a intensidade do badge Klein sem depender de cores diferentes por categoria. */
const INTENSIDADE_POR_TEMA: Record<string, "sutil" | "forte"> = {
  Economia: "sutil",
  Agronegócio: "forte",
  Esportes: "sutil",
  Política: "forte",
  Tecnologia: "sutil",
};
const INTENSIDADE_PADRAO = "forte";

export default function ThemeBadge({ nome }: { nome: string }) {
  const cor = CORES_POR_TEMA[nome] ?? COR_PADRAO;
  const intensidade = INTENSIDADE_POR_TEMA[nome] ?? INTENSIDADE_PADRAO;

  return (
    <span
      data-intensidade={intensidade}
      className={`theme-badge inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${cor}`}
    >
      {nome}
    </span>
  );
}
