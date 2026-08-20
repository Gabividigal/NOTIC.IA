# Tema claro/escuro — Design

Data: 2026-08-20

## Contexto e objetivo

O NOTIC.IA hoje é inteiramente dark (fundo navy). O usuário deve poder escolher
entre tema **claro** e **escuro** no cadastro, e trocar depois em Editar
Perfil, com aplicação em tempo real e persistência no banco. As cores devem
seguir o manual de identidade visual da marca: Klein `#002FA7` como cor de
destaque (fixa nos dois temas), preto/navy para o fundo escuro, branco para o
fundo claro.

Escopo adicional aprovado: substituir os CTAs primários do site (hoje
gradiente `blue-600→purple-600`) por Klein sólido, unificando a cor de
destaque de ações/IA em todo o site. O CTA "Virar PRO" (gradiente
âmbar/dourado) fica como está — é uma marca de "premium" distinta da cor de
destaque de IA/ações.

## Modelo de dados

Novo enum e campo no `User` (`prisma/schema.prisma`):

```prisma
enum ColorScheme {
  LIGHT
  DARK
}

model User {
  // ...campos existentes...
  colorScheme ColorScheme @default(DARK)
}
```

Não reutilizamos o nome `theme`: já existe um modelo `Theme`/relação `temas`
(interesses de notícia do usuário) — usar o mesmo nome para a preferência de
cor causaria colisão conceitual e de import. Migration gerada via
`prisma migrate dev --name add_user_color_scheme`, seguindo o padrão de
nomenclatura já usado em `prisma/migrations/`.

## Entrega do tema por request (SSR) — decisão central

**Abordagem escolhida: busca no banco por request + classe no `<html>`.**

`app/layout.tsx` (Server Component) ganha uma busca leve — mesmo padrão já
usado em `components/Header.tsx` e `app/user/page.tsx`, que já refazem
`prisma.user.findUnique` a cada request para pegar campos frescos do usuário
logado:

```
session = getServerSession(authOptions)
colorScheme = session ? (await prisma.user.findUnique({ where: { id }, select: { colorScheme: true } }))?.colorScheme ?? "DARK" : "DARK"
```

O `<html>` recebe a classe `light` quando `colorScheme === "LIGHT"` (dark é o
padrão, sem classe extra) — sem flash de conteúdo, sem cookies, sem alterar
NextAuth/JWT.

Alternativas descartadas:
- **Cookie sincronizado**: evitaria a query extra, mas exige lógica adicional
  para setar o cookie no login (NextAuth credentials não tem hook simples
  pra isso) e pode dessincronizar do banco (ex.: troca em outro dispositivo).
- **Guardar no JWT/sessão do NextAuth** (como já é feito com `name` via
  `update()`): evita a query extra para usuários logados, mas acopla uma
  preferência de UI ao token de auth, tem o mesmo problema de staleness entre
  abas/dispositivos, e exige mexer em `lib/auth.ts` +
  `types/next-auth.d.ts`.

A query extra é uma busca por chave primária (`select` de um único campo) —
custo desprezível, e sempre reflete o banco corretamente.

## Atualização em tempo real (client)

`components/ThemeProvider.tsx` (client component, novo), contexto
`{ theme, setTheme }`:

- Inicializado com o valor vindo do server (prop `initialTheme` passada de
  `app/layout.tsx` → `components/Providers.tsx` → `ThemeProvider`), para
  bater com o que o servidor já renderizou (evita mismatch de hidratação).
- `setTheme(novoTema)` atualiza o estado React **e** chama
  `document.documentElement.classList.toggle('light', novoTema === 'light')`
  diretamente — mesma técnica usada por bibliotecas como `next-themes`. Como
  todos os componentes usam classes Tailwind semânticas baseadas em CSS
  custom properties escopadas pela classe `.light` no `<html>`, alternar essa
  classe já propaga instantaneamente para toda a árvore, **incluindo modais**
  (`Modal.tsx` usa `createPortal` para `document.body`, ainda descendente do
  `<html>`) — sem precisar re-renderizar cada componente individualmente.

`ThemeProvider` é adicionado em `components/Providers.tsx`, ao lado do
`SessionProvider` já existente.

## Tokens de cor (CSS vars + Tailwind v4)

O projeto usa Tailwind v4 (CSS-first config, sem `tailwind.config.js`) e já
tem um padrão de token em `app/globals.css`
(`--background`/`--foreground` → `@theme inline` → utilitários
`bg-background`/`text-foreground`), hoje não usado pelos componentes.
Vamos estender esse padrão em vez de introduzir o mecanismo `dark:` do
Tailwind (não usado em lugar nenhum do código hoje):

Novos tokens semânticos, valores dark (padrão, em `:root`) e claros
(`:root.light`):

| Token | Uso | Dark (atual) | Light |
|---|---|---|---|
| `--color-background` | fundo de página | `#0a1128` (navy-950) | `#FFFFFF` |
| `--color-foreground` | texto principal | `#f4f4f5` | `#0a1128` |
| `--color-surface` | painéis/modais (`Modal.tsx`) | `#0a1128` | `#FFFFFF` com borda visível |
| `--color-surface-muted` | inputs, superfícies secundárias | `navy-900/50` | cinza bem claro |
| `--color-border` | bordas (`border-navy-800`) | `#182544` | cinza claro |
| `--color-muted-foreground` | texto secundário (`zinc-400/500`) | tons de zinc atuais | tons de cinza escuro equivalentes |
| `--color-accent` | Klein, destaque de IA/ações — **fixo nos dois temas** | `#002FA7` | `#002FA7` |

`--color-accent` substitui os gradientes `from-blue-600 to-purple-600` em
CTAs primários (botões de ação principal, links de destaque, estados ativos)
em todo o site.

## Retrofit de componentes

Nenhum componente usa a variante `dark:` do Tailwind hoje — todo o código usa
classes diretas (`bg-navy-950`, `text-zinc-100`, etc.), então a troca de tema
não afetaria nada sem esse retrofit. Arquivos a converter para os tokens
semânticos acima (levantamento feito via grep, ~34 usos de `navy-*` e ~167 de
`zinc-*`):

- `components/Modal.tsx`
- `components/EditProfileModal.tsx`
- `components/UpgradeProModal.tsx` (mantém gradiente âmbar do CTA PRO; só o
  restante do modal — texto, painel — usa os tokens novos)
- `components/UserMenu.tsx`
- `components/Header.tsx`
- `components/CadastroForm.tsx`
- `components/MobileBottomNav.tsx`
- `app/user/page.tsx`
- Telas de feed, notícia, conexões/chat (arquivos identificados durante a
  implementação, mesmo critério: qualquer `bg-navy-*`/`text-zinc-*`/gradiente
  azul-roxo vira token semântico)

## UI novo: seletor de tema

`components/ThemePicker.tsx` — dois cards clicáveis ("Escuro" / "Claro"),
cada um com uma prévia em miniatura das cores do tema (fundo + destaque
Klein), reaproveitando o padrão visual de chip/toggle já usado no seletor de
interesses em `CadastroForm.tsx` (pill buttons, `ring-1 ring-inset`, estado
selecionado com destaque visual). Componente controlado
(`value`, `onChange`), usado em dois lugares:

1. **Cadastro** (`components/CadastroForm.tsx`): novo campo no formulário,
   estado local `colorScheme`, enviado para a server action.
2. **Editar Perfil** (`components/EditProfileModal.tsx`): mesmo componente,
   inicializado com o valor atual do usuário.

## Rotas afetadas

- `app/cadastro/actions.ts` (`registrarUsuario`): aceita `colorScheme` do
  form e grava em `prisma.user.create`.
- `app/api/perfil/route.ts` (`PATCH`): aceita `colorScheme` opcional, valida
  contra o enum, inclui no `prisma.user.update`.
- `components/EditProfileModal.tsx`: no sucesso do PATCH, chama
  `setTheme()` do `ThemeProvider` (aplicação instantânea) além do
  `router.refresh()` já existente para os outros campos.

## Plano de teste

`npm run build && npm run start`:

1. Criar conta escolhendo tema claro → confirmar que o site abre nesse tema
   (fundo branco, texto escuro, destaque Klein).
2. Editar Perfil → trocar para escuro → confirmar troca em tempo real em
   pelo menos: feed, modal de Editar Perfil aberto, modal de Virar PRO.
3. Recarregar a página → tema escuro persiste (vem do banco via SSR).
4. Logout/login → tema escuro persiste.

## Git

Ao final: `git add` dos arquivos relevantes, commit com mensagem clara, push
para `main` (conforme pedido explicitamente pelo usuário).
