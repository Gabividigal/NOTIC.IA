import Link from "next/link";

interface ConversationListItemProps {
  id: string;
  nome: string;
  preview: string;
  naoLidas: number;
  ativa: boolean;
}

export default function ConversationListItem({
  id,
  nome,
  preview,
  naoLidas,
  ativa,
}: ConversationListItemProps) {
  return (
    <Link
      href={`/conexoes?with=${id}`}
      className={`flex items-center gap-3 border-b border-navy-800/60 px-4 py-3 transition ${
        ativa ? "bg-navy-800/60" : "hover:bg-navy-900"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white">
        {nome.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-zinc-100">{nome}</span>
          {naoLidas > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
        </div>
        <p
          className={`truncate text-xs ${naoLidas > 0 ? "font-medium text-zinc-300" : "text-zinc-500"}`}
        >
          {preview}
        </p>
      </div>
    </Link>
  );
}
