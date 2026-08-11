import ThemeBadge from "@/components/ThemeBadge";

interface NewsCardProps {
  temaNome: string;
  titulo: string;
  resumo: string;
  fonte: string;
  data: Date;
}

export default function NewsCard({ temaNome, titulo, resumo, fonte, data }: NewsCardProps) {
  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(data);

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700">
      <ThemeBadge nome={temaNome} />
      <h2 className="text-lg font-semibold text-zinc-50">{titulo}</h2>
      <p className="text-sm leading-relaxed text-zinc-400">{resumo}</p>
      <div className="mt-auto flex items-center justify-between pt-2 text-xs text-zinc-500">
        <span>{fonte}</span>
        <span>{dataFormatada}</span>
      </div>
    </article>
  );
}
