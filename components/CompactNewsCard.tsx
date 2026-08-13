import Link from "next/link";
import ThemeBadge from "@/components/ThemeBadge";

interface CompactNewsCardProps {
  id: string;
  titulo: string;
  temaNome: string;
  fonte: string;
  data: Date;
}

export default function CompactNewsCard({ id, titulo, temaNome, fonte, data }: CompactNewsCardProps) {
  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(data);

  return (
    <Link
      href={`/noticia/${id}`}
      className="block rounded-lg border border-navy-800 bg-navy-950/60 p-2.5 transition hover:border-navy-700"
    >
      <ThemeBadge nome={temaNome} />
      <p className="mt-1.5 line-clamp-2 text-sm font-medium text-zinc-100">{titulo}</p>
      <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500">
        <span>{fonte}</span>
        <span>{dataFormatada}</span>
      </div>
    </Link>
  );
}
