import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { enviarMensagemTexto } from "@/lib/conexoes";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "É preciso estar logado." }, { status: 401 });
  }

  const { receiverId, text } = (await request.json().catch(() => ({}))) as {
    receiverId?: string;
    text?: string;
  };

  const textoTratado = text?.trim();
  if (!receiverId || !textoTratado) {
    return NextResponse.json(
      { erro: "receiverId e text são obrigatórios." },
      { status: 400 },
    );
  }

  const mensagem = await enviarMensagemTexto(session.user.id, receiverId, textoTratado);
  if (!mensagem) {
    return NextResponse.json(
      { erro: "Você só pode enviar mensagens para conexões aceitas." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    mensagem: {
      id: mensagem.id,
      deMim: true,
      mensagem: mensagem.message,
      createdAt: mensagem.createdAt,
      noticia: null,
    },
  });
}
