export type Plan = "FREE" | "PRO";

export interface Theme {
  id: string;
  nome: string;
}

export interface News {
  id: string;
  titulo: string;
  resumoIA: string;
  linkFonte: string;
  nomeFonte: string;
  dataPublicacao: string;
  themeId: string;
}

export interface ChatMessage {
  id: string;
  pergunta: string;
  resposta: string;
  createdAt: string;
  userId: string;
  newsId: string;
}
