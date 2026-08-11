# NOTIC.IA

Plataforma de notícias com IA: feed personalizado por tema (economia, agronegócio, esportes, política, etc.), notícias resumidas automaticamente por IA, e um chat embutido em cada notícia para o leitor tirar dúvidas. Possui plano gratuito e plano pago (assinatura).

## Stack

- [Next.js](https://nextjs.org) 14+ (App Router) com TypeScript
- [Tailwind CSS](https://tailwindcss.com) para estilização
- [Prisma](https://www.prisma.io) como ORM, conectado a um banco Postgres
- Deploy: frontend na [Vercel](https://vercel.com), banco/backend no [Railway](https://railway.app)

## Estrutura de pastas

```
app/         # Rotas do Next.js (App Router)
components/  # Componentes React reutilizáveis
lib/         # Funções utilitárias e conexão com o Prisma (lib/prisma.ts)
types/       # Tipos TypeScript compartilhados
prisma/      # Schema e migrations do Prisma
```

## Modelos de dados

- **User**: usuário da plataforma (email, nome, senha em hash, plano FREE/PRO)
- **Theme**: tema de interesse (economia, esportes, política, agronegócio, ...)
- **UserTheme**: relação muitos-para-muitos entre usuários e temas seguidos
- **News**: notícia (título, resumo gerado por IA, link e nome da fonte, tema, data de publicação)
- **ChatMessage**: histórico de perguntas/respostas do chat de IA sobre cada notícia

## Como rodar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente: copie `.env.example` para `.env` e preencha `DATABASE_URL` com a connection string do seu Postgres (ex: banco criado no Railway).

   ```bash
   cp .env.example .env
   ```

3. Rode as migrations do Prisma para criar as tabelas no banco:

   ```bash
   npx prisma migrate dev
   ```

4. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse [http://localhost:3000](http://localhost:3000).

## Deploy

- **Frontend**: Vercel, apontando para este repositório. Configure a variável de ambiente `DATABASE_URL` no projeto da Vercel.
- **Banco de dados**: Postgres no Railway. Use a connection string fornecida pelo Railway como `DATABASE_URL`.
