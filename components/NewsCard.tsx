import Link from "next/link";
import ThemeBadge from "@/components/ThemeBadge";
import NewsCardActions from "@/components/NewsCardActions";

interface NewsCardProps {
  id: string;
  temaNome: string;
  titulo: string;
  resumo: string;
  fonte: string;
  data: Date;
  autenticado?: boolean;
  readLater?: boolean;
  favorito?: boolean;
}

export default function NewsCard({
  id,
  temaNome,
  titulo,
  resumo,
  fonte,
  data,
  autenticado = false,
  readLater = false,
  favorito = false,
}: NewsCardProps) {
  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(data);

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-surface-muted/50 p-5 transition hover:border-border-strong">
      <div className="flex items-start justify-between gap-2">
        <ThemeBadge nome={temaNome} />
        <NewsCardActions
          newsId={id}
          autenticado={autenticado}
          initialReadLater={readLater}
          initialFavorito={favorito}
        />
      </div>
      <Link href={`/noticia/${id}`} className="contents">
        <h2 className="text-lg font-semibold text-foreground transition hover:text-accent">
          {titulo}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{resumo}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>{fonte}</span>
          <span>{dataFormatada}</span>
        </div>
      </Link>
    </article>
  );
}
