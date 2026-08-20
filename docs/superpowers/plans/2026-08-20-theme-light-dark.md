# Tema Claro/Escuro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users pick light or dark theme at signup and change it later in Edit Profile, with the choice persisted to the database and applied instantly across the whole site.

**Architecture:** A new `colorScheme` enum field on `User` (Prisma) is the source of truth. `app/layout.tsx` (Server Component) reads it per-request and sets a `light` class on `<html>` (dark = no class = default). A client `ThemeProvider` context mirrors that value and, on change, toggles `document.documentElement.classList` directly and PATCHes the change to the DB — no cookies, no NextAuth session changes. All color usage across the app is retrofitted from literal `navy-*`/`zinc-*`/`blue-purple-gradient` Tailwind classes to semantic tokens (`bg-background`, `text-foreground`, `bg-accent`, etc.) backed by CSS custom properties that flip value under a `.light` class on `<html>`, so a single class toggle repaints the entire tree (including portal-rendered modals) instantly.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`), Prisma + PostgreSQL, NextAuth v4 (JWT sessions).

**Spec:** `docs/superpowers/specs/2026-08-20-theme-light-dark-design.md`

## Global Constraints

- DB field is named `colorScheme` (Prisma enum `ColorScheme { LIGHT DARK }`, default `DARK`) — never `theme`, which collides with the existing `Theme`/`temas` news-interest model.
- Client/React-level theme values are the lowercase strings `"light" | "dark"` (type `ColorScheme` exported from `components/ThemeProvider.tsx`) — convert to/from the uppercase Prisma enum (`"LIGHT" | "DARK"`) only at the DB boundary (`lib/theme.ts`, `app/cadastro/actions.ts`, `app/api/perfil/route.ts`).
- Klein blue `#002FA7` is the fixed accent color in both themes — registered once as `--color-accent`, not overridden under `.light`.
- The "Virar PRO" CTA (amber/yellow gradient in `UpgradeProModal.tsx` and `UserMenu.tsx`) is explicitly excluded from the Klein rebrand — it stays amber/gold in both themes.
- `components/ThemeBadge.tsx` (per-category news badges: Economia, Agronegócio, Esportes, Política, Tecnologia) is explicitly excluded from this retrofit — those are category-differentiation colors, not site-theme colors, and are not touched by any task below.
- No `tailwind.config.js` exists or should be created — this project uses Tailwind v4 CSS-first config; all token work happens in `app/globals.css`.
- Every retrofit task's file list must end with zero remaining matches (except in `app/globals.css` itself and `components/ThemeBadge.tsx`) for: `navy-950`, `navy-900`, `navy-800`, `navy-700`, `navy-600`, `navy-500`, `zinc-50`, `zinc-100`, `zinc-200`, `zinc-300`, `zinc-400`, `zinc-500`, `zinc-600`, `from-blue-600`, `to-purple-600`, `from-blue-500`, `to-purple-500`, `text-blue-`, `border-blue-`, `ring-blue-`, `bg-blue-` (this exact exclusion list is verified in Task 14).

## Color Migration Reference

Canonical old-class → new-class mapping used by every retrofit task below. New classes resolve to semantic tokens defined in Task 2.

| Old (literal) | New (semantic) | Notes |
|---|---|---|
| `bg-navy-950`, `bg-navy-950/NN` | `bg-background`, `bg-background/NN` | page bg, modal overlay, modal panel |
| `bg-navy-900`, `bg-navy-900/NN`, `bg-navy-800`, `bg-navy-800/NN` | `bg-surface-muted`, `bg-surface-muted/NN` | inputs, hover rows, chat bubbles, dropdown panels |
| `hover:bg-navy-900` | `hover:bg-surface-muted` | |
| `border-navy-950/NN` | `border-background/NN` | (only appears as `bg-navy-950/70` overlay in `Modal.tsx`, no border use) |
| `border-navy-800`, `border-navy-800/NN` | `border-border`, `border-border/NN` | standard dividers/panels |
| `ring-navy-800` | `ring-border` | disabled chip ring |
| `border-navy-700`, `ring-navy-700` | `border-border-strong`, `ring-border-strong` | chip default ring, LogoutButton/EditInterestsModal button border |
| `hover:border-navy-500`, `hover:ring-navy-500` | `hover:border-border-hover`, `hover:ring-border-hover` | hover emphasis |
| `text-zinc-50`, `text-zinc-100` | `text-foreground` | headings, high-emphasis body/input text |
| `text-zinc-200`, `text-zinc-300` | `text-foreground-secondary` | labels, secondary readable text |
| `text-zinc-400`, `text-zinc-500` | `text-muted-foreground` | placeholders, timestamps, muted text |
| `text-zinc-600` | `text-subtle-foreground` | disabled text, empty-state icons |
| `text-zinc-900` | *(unchanged)* | only in `UpgradeProModal.tsx` — contrast text on amber CTA, not theme-related |
| `bg-gradient-to-r from-blue-600 to-purple-600` | `bg-accent` | primary CTA — solid Klein, no gradient |
| `bg-gradient-to-r from-blue-600/20 to-purple-600/20` | `bg-accent/15` | translucent accent tint (chat "em breve" pill, "from me" bubble) |
| `bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent` | `text-accent` | Logo `.IA` — drop gradient/clip-text, solid Klein text |
| `text-blue-400`, `text-blue-300` | `text-accent` | accent-colored text/icons/links |
| `border-blue-500`, `border-blue-500/NN` | `border-accent`, `border-accent/NN` | |
| `focus:border-blue-500` | `focus:border-accent` | |
| `ring-blue-500`, `ring-blue-500/NN` | `ring-accent`, `ring-accent/NN` | |
| `bg-blue-500/10`, `bg-blue-500` (dot) | `bg-accent/10`, `bg-accent` | |
| `bg-blue-600` (Header notification pill) | `bg-accent` | |
| `text-blue-600` (native checkbox accent-color) | `text-accent` | |

## Task 1: Prisma schema — `colorScheme` field

**Files:**
- Modify: `prisma/schema.prisma:14-17` (enums block), `prisma/schema.prisma:25-46` (`User` model)
- Create: migration under `prisma/migrations/` (generated by Prisma CLI)

**Interfaces:**
- Produces: `ColorScheme` enum (`LIGHT`, `DARK`) and `User.colorScheme: ColorScheme` (default `DARK`), consumed by Task 3 (`lib/theme.ts`), Task 5 (`app/cadastro/actions.ts`), Task 6 (`app/api/perfil/route.ts`, `components/Header.tsx`).

- [ ] **Step 1: Add the enum and field**

In `prisma/schema.prisma`, add a new enum right after the existing `Plan` enum (line 17):

```prisma
enum Plan {
  FREE
  PRO
}

enum ColorScheme {
  LIGHT
  DARK
}
```

Then add the field to `User`, right after `plano`:

```prisma
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  nome           String
  senha          String
  dataNascimento DateTime
  areaAtuacao    String
  plano          Plan     @default(FREE)
  colorScheme    ColorScheme @default(DARK)
  createdAt      DateTime @default(now())
  ...
```

- [ ] **Step 2: Generate and apply the migration**

Run: `npx prisma migrate dev --name add_user_color_scheme`
Expected: a new folder `prisma/migrations/<timestamp>_add_user_color_scheme/migration.sql` is created containing `CREATE TYPE "ColorScheme" AS ENUM ('LIGHT', 'DARK');` and `ALTER TABLE "users" ADD COLUMN "colorScheme" "ColorScheme" NOT NULL DEFAULT 'DARK';`, and the command exits 0 (applies to the local dev DB and regenerates the Prisma client).

- [ ] **Step 3: Verify the Prisma client picked up the field**

Run: `npx tsc --noEmit -p . 2>&1 | head -50` (or `grep -r "colorScheme" node_modules/.prisma/client/index.d.ts | head -3`)
Expected: no type errors related to `colorScheme`, and the grep finds `colorScheme` in the generated client types.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "Adiciona campo colorScheme ao User para tema claro/escuro"
```

---

## Task 2: CSS semantic tokens

**Files:**
- Modify: `app/globals.css` (full file)

**Interfaces:**
- Produces: Tailwind utility classes `bg-background`, `text-foreground`, `text-foreground-secondary`, `text-muted-foreground`, `text-subtle-foreground`, `bg-surface-muted`, `border-border`, `ring-border`, `border-border-strong`, `ring-border-strong`, `border-border-hover`, `ring-border-hover`, `bg-accent`, `text-accent`, `border-accent`, `ring-accent` — consumed by every retrofit task (5, 6, 7, 8, 9, 10, 11, 12, 13) and by `components/ThemePicker.tsx` (Task 4).
- The `.light` class on `<html>` (applied by Task 3) is what switches these tokens.

- [ ] **Step 1: Replace `app/globals.css`**

```css
@import "tailwindcss";

:root {
  /* Escala navy: valores-base do tema escuro (padrão do site). */
  --navy-950: #0a1128;
  --navy-900: #101a33;
  --navy-800: #182544;
  --navy-700: #263b63;
  --navy-600: #385080;
  --navy-500: #5570a0;

  --background: var(--navy-950);
  --foreground: #f4f4f5;
  --foreground-secondary: #d4d4d8;
  --muted-foreground: #a1a1aa;
  --subtle-foreground: #52525b;
  --surface-muted: var(--navy-900);
  --border: var(--navy-800);
  --border-strong: var(--navy-700);
  --border-hover: var(--navy-500);
  --accent: #002fa7;
}

:root.light {
  --background: #ffffff;
  --foreground: #0a1128;
  --foreground-secondary: #3f3f46;
  --muted-foreground: #71717a;
  --subtle-foreground: #a1a1aa;
  --surface-muted: #f4f4f5;
  --border: #e4e4e7;
  --border-strong: #d4d4d8;
  --border-hover: #a1a1aa;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-foreground-secondary: var(--foreground-secondary);
  --color-muted-foreground: var(--muted-foreground);
  --color-subtle-foreground: var(--subtle-foreground);
  --color-surface-muted: var(--surface-muted);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-border-hover: var(--border-hover);
  --color-accent: var(--accent);
  --color-navy-950: var(--navy-950);
  --color-navy-900: var(--navy-900);
  --color-navy-800: var(--navy-800);
  --color-navy-700: var(--navy-700);
  --color-navy-600: var(--navy-600);
  --color-navy-500: var(--navy-500);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 2: Verify Tailwind compiles the new utilities**

Run: `npm run build 2>&1 | tail -30`
Expected: build succeeds (existing components still reference the old `navy-*`/`zinc-*` classes at this point, which is fine — this step only confirms `app/globals.css` itself is valid CSS and doesn't break the build).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "Adiciona tokens semânticos de cor para tema claro/escuro"
```

---

## Task 3: ThemeProvider + server-side theme resolution

**Files:**
- Create: `components/ThemeProvider.tsx`
- Create: `lib/theme.ts`
- Modify: `components/Providers.tsx` (full file)
- Modify: `app/layout.tsx:23-38`

**Interfaces:**
- Consumes: `prisma.user.findUnique` (existing `lib/prisma.ts` client), `getServerSession`/`authOptions` (existing `lib/auth.ts`), `User.colorScheme` (Task 1).
- Produces: type `ColorScheme = "light" | "dark"` and hook `useTheme(): { theme: ColorScheme; setTheme: (t: ColorScheme) => void }` from `components/ThemeProvider.tsx`, consumed by Task 6 (`EditProfileModal.tsx`) and Task 4 (`ThemePicker.tsx` imports the type only). Produces `obterTemaInicial(): Promise<ColorScheme>` from `lib/theme.ts`, consumed by `app/layout.tsx`.

- [ ] **Step 1: Create `components/ThemeProvider.tsx`**

```tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type ColorScheme = "light" | "dark";

interface ThemeContextValue {
  theme: ColorScheme;
  setTheme: (theme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: ColorScheme;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<ColorScheme>(initialTheme);

  function setTheme(novoTema: ColorScheme) {
    document.documentElement.classList.toggle("light", novoTema === "light");
    setThemeState(novoTema);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
}
```

- [ ] **Step 2: Create `lib/theme.ts`**

```ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ColorScheme } from "@/components/ThemeProvider";

export async function obterTemaInicial(): Promise<ColorScheme> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return "dark";
  }

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { colorScheme: true },
  });

  return usuario?.colorScheme === "LIGHT" ? "light" : "dark";
}
```

- [ ] **Step 3: Replace `components/Providers.tsx`**

```tsx
"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { ThemeProvider, type ColorScheme } from "@/components/ThemeProvider";

export default function Providers({
  children,
  temaInicial,
}: {
  children: ReactNode;
  temaInicial: ColorScheme;
}) {
  return (
    <SessionProvider>
      <ThemeProvider initialTheme={temaInicial}>{children}</ThemeProvider>
    </SessionProvider>
  );
}
```

- [ ] **Step 4: Wire into `app/layout.tsx`**

Add the import (after the `MobileBottomNav` import, before `./globals.css`):

```tsx
import { obterTemaInicial } from "@/lib/theme";
```

Replace the `RootLayout` function (lines 23-38):

```tsx
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const temaInicial = await obterTemaInicial();

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${
        temaInicial === "light" ? "light" : ""
      }`}
    >
      <body className="flex min-h-full flex-col">
        <Providers temaInicial={temaInicial}>
          <Header />
          <div className="flex flex-1 flex-col pb-20 md:pb-0">{children}</div>
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify it builds and renders**

Run: `npm run build 2>&1 | tail -30`
Expected: build succeeds with no type errors (RootLayout is now `async`, which Next.js App Router server components support natively).

- [ ] **Step 6: Commit**

```bash
git add components/ThemeProvider.tsx lib/theme.ts components/Providers.tsx app/layout.tsx
git commit -m "Adiciona ThemeProvider e resolução de tema por request no layout"
```

---

## Task 4: `ThemePicker` component

**Files:**
- Create: `components/ThemePicker.tsx`

**Interfaces:**
- Consumes: `ColorScheme` type from `components/ThemeProvider.tsx` (Task 3).
- Produces: `<ThemePicker value={ColorScheme} onChange={(t: ColorScheme) => void} />`, consumed by Task 5 (`CadastroForm.tsx`) and Task 6 (`EditProfileModal.tsx`).

- [ ] **Step 1: Create `components/ThemePicker.tsx`**

```tsx
"use client";

import { Check } from "lucide-react";
import type { ColorScheme } from "@/components/ThemeProvider";

interface ThemePickerProps {
  value: ColorScheme;
  onChange: (theme: ColorScheme) => void;
}

const OPCOES: { valor: ColorScheme; rotulo: string; bg: string; fg: string }[] = [
  { valor: "dark", rotulo: "Escuro", bg: "#0a1128", fg: "#f4f4f5" },
  { valor: "light", rotulo: "Claro", bg: "#ffffff", fg: "#0a1128" },
];

export default function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {OPCOES.map((opcao) => {
        const selecionado = value === opcao.valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            onClick={() => onChange(opcao.valor)}
            aria-pressed={selecionado}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition ${
              selecionado
                ? "border-accent ring-1 ring-accent"
                : "border-border hover:border-border-hover"
            }`}
          >
            <span
              className="relative flex h-12 w-full items-center justify-center gap-1 rounded-lg border border-border"
              style={{ backgroundColor: opcao.bg }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#002FA7" }} />
              <span
                className="h-1.5 w-8 rounded-full"
                style={{ backgroundColor: opcao.fg, opacity: 0.6 }}
              />
              {selecionado && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
                  <Check size={10} />
                </span>
              )}
            </span>
            <span className="text-sm font-medium text-foreground">{opcao.rotulo}</span>
          </button>
        );
      })}
    </div>
  );
}
```

Note: the swatch colors (`opcao.bg`/`opcao.fg`/the Klein dot) are intentionally set via inline `style`, not theme tokens — they must always show each option's own fixed colors (e.g. the "Claro" swatch is always white) regardless of which theme is currently active on the page.

- [ ] **Step 2: Verify it builds**

Run: `npm run build 2>&1 | tail -30`
Expected: build succeeds (component isn't used anywhere yet, so this only checks it compiles standalone).

- [ ] **Step 3: Commit**

```bash
git add components/ThemePicker.tsx
git commit -m "Adiciona componente ThemePicker reutilizável"
```

---

## Task 5: Cadastro — theme choice at signup

**Files:**
- Modify: `app/cadastro/actions.ts` (full file)
- Modify: `components/CadastroForm.tsx` (full file)

**Interfaces:**
- Consumes: `ThemePicker` (Task 4), `ColorScheme` type (Task 3).
- Produces: `registrarUsuario` now accepts `colorScheme: ColorScheme` and persists it.

- [ ] **Step 1: Update `app/cadastro/actions.ts`**

Add the import and extend the interface (top of file):

```ts
"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { ColorScheme } from "@/components/ThemeProvider";

interface RegistrarInput {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: string;
  areaAtuacao: string;
  temaIds: string[];
  colorScheme: ColorScheme;
}
```

Update the `prisma.user.create` call to include the field:

```ts
  await prisma.user.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      dataNascimento,
      areaAtuacao,
      colorScheme: input.colorScheme === "light" ? "LIGHT" : "DARK",
      temas: {
        create: input.temaIds.map((themeId) => ({ themeId })),
      },
    },
  });
```

- [ ] **Step 2: Update `components/CadastroForm.tsx`**

Add imports (after the `AREAS_ATUACAO` import):

```tsx
import ThemePicker from "@/components/ThemePicker";
import type { ColorScheme } from "@/components/ThemeProvider";
```

Add state (after `const [temaIds, setTemaIds] = useState<string[]>([]);`):

```tsx
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
```

Include it in the `registrarUsuario` call:

```tsx
      const resultado = await registrarUsuario({
        nome,
        email,
        senha,
        dataNascimento,
        areaAtuacao,
        temaIds,
        colorScheme,
      });
```

Add the picker to the form — insert this block right after the "Interesses" `<div className="flex flex-col gap-2">...</div>` block (before the `{erro && ...}` line):

```tsx
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground-secondary">Tema</span>
        <ThemePicker value={colorScheme} onChange={setColorScheme} />
      </div>
```

Now retrofit every remaining literal color class in this file per the Color Migration Reference table:

- Line 16 (`inputClass`): `border-navy-800 bg-navy-900/50 ... text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500` → `border-border bg-surface-muted/50 ... text-foreground placeholder:text-muted-foreground focus:border-accent`
- Lines 110, 126, 143, 159, 180, 194, 218: `text-zinc-300` → `text-foreground-secondary`
- Line 202: `` `${inputClass} ${areaAtuacao ? "text-zinc-100" : "text-zinc-500"}` `` → `` `${inputClass} ${areaAtuacao ? "text-foreground" : "text-muted-foreground"}` ``
- Line 208: `text-zinc-100` (option) → `text-foreground`
- Lines 221-222: `` temaIds.length === MAX_TEMAS ? "text-blue-400" : "text-zinc-500" `` → `` temaIds.length === MAX_TEMAS ? "text-accent" : "text-muted-foreground" ``
- Lines 238-243 (chip button):
  ```tsx
  selecionado
    ? "bg-accent text-white ring-transparent"
    : desabilitado
      ? "cursor-not-allowed text-subtle-foreground ring-border"
      : "text-foreground-secondary ring-border-strong hover:ring-border-hover"
  ```
  (was `bg-gradient-to-r from-blue-600 to-purple-600 text-white ring-transparent` / `cursor-not-allowed text-zinc-600 ring-navy-800` / `text-zinc-300 ring-navy-700 hover:ring-navy-500`)
- Line 257: `bg-gradient-to-r from-blue-600 to-purple-600` (submit button) → `bg-accent`
- Line 262: `text-zinc-400` → `text-muted-foreground`
- Line 264: `text-blue-400` → `text-accent`

- [ ] **Step 3: Verify build and lint**

Run: `npm run build 2>&1 | tail -30`
Expected: build succeeds, no type errors, no leftover unused imports.

- [ ] **Step 4: Manual check**

Run: `npm run dev`, open `/cadastro` in a browser. Expected: form renders normally, the new "Tema" section shows two cards ("Escuro" selected by default, "Claro" as the other option), clicking "Claro" visibly selects it (border/ring changes) even though the page itself is still rendered in the site's current (dark) theme — the picker's own selection state is independent of the page theme at this point (page-wide light rendering only happens after Task 3's `<html>` class is set on next load, which requires the account to already exist with `colorScheme: LIGHT`).

- [ ] **Step 5: Commit**

```bash
git add app/cadastro/actions.ts components/CadastroForm.tsx
git commit -m "Adiciona escolha de tema no cadastro e retrofit de cores do formulário"
```

---

## Task 6: Editar Perfil — theme change with real-time apply

**Files:**
- Modify: `app/api/perfil/route.ts` (full file)
- Modify: `components/Header.tsx:16-19, 44-49`
- Modify: `components/UserMenu.tsx` (full file)
- Modify: `components/EditProfileModal.tsx` (full file)

**Interfaces:**
- Consumes: `ThemePicker` (Task 4), `useTheme` hook + `ColorScheme` type (Task 3).
- Produces: `PATCH /api/perfil` now accepts an optional `colorScheme` field; `UserMenu` now requires a `colorScheme: ColorScheme` prop; `EditProfileModal` now requires `colorSchemeAtual: ColorScheme` and applies the change live via `useTheme().setTheme`.

- [ ] **Step 1: Update `app/api/perfil/route.ts`**

Extend the request body type and destructuring:

```ts
  const { nome, areaAtuacao, dataNascimento, colorScheme } = (await request.json().catch(() => ({}))) as {
    nome?: string;
    areaAtuacao?: string;
    dataNascimento?: string;
    colorScheme?: "light" | "dark";
  };
```

Add validation right after the `dataNascimentoConvertida` check, before the `prisma.user.update` call:

```ts
  if (colorScheme !== undefined && colorScheme !== "light" && colorScheme !== "dark") {
    return NextResponse.json({ erro: "Tema inválido." }, { status: 400 });
  }
```

Update the `prisma.user.update` call:

```ts
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      nome: nomeTratado,
      areaAtuacao,
      dataNascimento: dataNascimentoConvertida,
      ...(colorScheme !== undefined ? { colorScheme: colorScheme === "light" ? "LIGHT" : "DARK" } : {}),
    },
  });
```

- [ ] **Step 2: Update `components/Header.tsx`**

Extend the `select` in the `prisma.user.findUnique` call (line 16-19):

```tsx
      prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            nome: true,
            email: true,
            areaAtuacao: true,
            dataNascimento: true,
            plano: true,
            colorScheme: true,
          },
        })
```

Pass the converted value to `UserMenu` (in the JSX around line 43-49):

```tsx
            <UserMenu
              nome={usuario.nome}
              email={usuario.email}
              areaAtuacao={usuario.areaAtuacao}
              dataNascimento={usuario.dataNascimento.toISOString().slice(0, 10)}
              plano={usuario.plano}
              colorScheme={usuario.colorScheme === "LIGHT" ? "light" : "dark"}
            />
```

Also retrofit this file's own literal classes per the Color Migration Reference:
- Line 25: `border-navy-800 bg-navy-950/70` → `border-border bg-background/70`
- Line 34: `text-zinc-400 transition hover:text-zinc-200` → `text-muted-foreground transition hover:text-foreground-secondary`
- Line 38: `bg-blue-600` → `bg-accent`
- Line 54: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`

- [ ] **Step 3: Update `components/UserMenu.tsx`**

Add the prop and import:

```tsx
import type { ColorScheme } from "@/components/ThemeProvider";

interface UserMenuProps {
  nome: string;
  email: string;
  areaAtuacao: string;
  dataNascimento: string;
  plano: "FREE" | "PRO";
  colorScheme: ColorScheme;
}

export default function UserMenu({
  nome,
  email,
  areaAtuacao,
  dataNascimento,
  plano,
  colorScheme,
}: UserMenuProps) {
```

Pass it through to `EditProfileModal`:

```tsx
      <EditProfileModal
        key={editAberto ? "editar-aberto" : "editar-fechado"}
        aberto={editAberto}
        onFechar={() => setEditAberto(false)}
        nomeAtual={nome}
        areaAtuacaoAtual={areaAtuacao}
        dataNascimentoAtual={dataNascimento}
        colorSchemeAtual={colorScheme}
      />
```

Retrofit this file's literal classes per the Color Migration Reference:
- Line 68: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`
- Line 74: `border-navy-800 bg-navy-950` → `border-border bg-background`
- Line 75: `border-navy-800` → `border-border`
- Line 76: `text-zinc-100` → `text-foreground`
- Line 77: `text-zinc-500` → `text-muted-foreground`
- Line 84: `text-zinc-300 transition hover:bg-navy-900 hover:text-zinc-100` → `text-foreground-secondary transition hover:bg-surface-muted hover:text-foreground`
- Line 91: `text-zinc-300` → `text-foreground-secondary`
- Line 107: `border-navy-800` → `border-border`
- Line 111: `text-zinc-300 transition hover:bg-navy-900 hover:text-zinc-100` → `text-foreground-secondary transition hover:bg-surface-muted hover:text-foreground`

(Line 98's amber CTA gradient stays unchanged — it's the "Virar PRO" button, excluded per Global Constraints.)

- [ ] **Step 4: Update `components/EditProfileModal.tsx`**

Add imports and the new prop:

```tsx
import ThemePicker from "@/components/ThemePicker";
import { useTheme, type ColorScheme } from "@/components/ThemeProvider";

interface EditProfileModalProps {
  aberto: boolean;
  onFechar: () => void;
  nomeAtual: string;
  areaAtuacaoAtual: string;
  dataNascimentoAtual: string;
  colorSchemeAtual: ColorScheme;
}
```

Update the component signature and add state + the `useTheme` hook:

```tsx
export default function EditProfileModal({
  aberto,
  onFechar,
  nomeAtual,
  areaAtuacaoAtual,
  dataNascimentoAtual,
  colorSchemeAtual,
}: EditProfileModalProps) {
  const router = useRouter();
  const { update } = useSession();
  const { setTheme } = useTheme();
  const [nome, setNome] = useState(nomeAtual);
  const [areaAtuacao, setAreaAtuacao] = useState(areaAtuacaoAtual);
  const [dataNascimento, setDataNascimento] = useState(dataNascimentoAtual);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(colorSchemeAtual);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
```

Update `salvar()` to send and apply the theme:

```tsx
    setErro(null);
    startTransition(async () => {
      const resposta = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, areaAtuacao, dataNascimento, colorScheme }),
      });

      const dados = (await resposta.json().catch(() => ({}))) as { erro?: string };

      if (!resposta.ok) {
        setErro(dados.erro ?? "Não foi possível salvar as alterações.");
        return;
      }

      setTheme(colorScheme);
      await update({ name: nome });
      onFechar();
      router.refresh();
    });
```

Add the picker to the form — insert this block right after the "Área de atuação" `<div className="flex flex-col gap-1.5">...</div>` block (before `{erro && ...}`):

```tsx
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground-secondary">Tema</span>
          <ThemePicker value={colorScheme} onChange={setColorScheme} />
        </div>
```

Retrofit this file's remaining literal classes per the Color Migration Reference:
- Line 18 (`inputClass`): `border-navy-800 bg-navy-900/50 ... text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500` → `border-border bg-surface-muted/50 ... text-foreground placeholder:text-muted-foreground focus:border-accent`
- Lines 70, 83, 96: `text-zinc-300` → `text-foreground-secondary`
- Line 119: `text-zinc-400 transition hover:text-zinc-200` → `text-muted-foreground transition hover:text-foreground-secondary`
- Line 127: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`

- [ ] **Step 5: Verify build**

Run: `npm run build 2>&1 | tail -30`
Expected: build succeeds, no type errors.

- [ ] **Step 6: Manual real-time check**

Run: `npm run dev`, log in as an existing user, open the user menu → "Editar perfil", change the theme selection to the option different from the current one, click "Salvar". Expected: the whole page (header, page background, the modal itself as it closes) visibly switches theme immediately, with no full page reload.

- [ ] **Step 7: Commit**

```bash
git add app/api/perfil/route.ts components/Header.tsx components/UserMenu.tsx components/EditProfileModal.tsx
git commit -m "Adiciona troca de tema em Editar Perfil com aplicação em tempo real"
```

---

## Task 7: Retrofit — Modal chrome (`Modal.tsx`, `UpgradeProModal.tsx`)

**Files:**
- Modify: `components/Modal.tsx`
- Modify: `components/UpgradeProModal.tsx`

- [ ] **Step 1: Retrofit `components/Modal.tsx`**

- Line 43: `bg-navy-950/70` → `bg-background/70`
- Line 50: `border-navy-800 bg-navy-950` → `border-border bg-background`
- Line 53: `text-zinc-50` → `text-foreground`
- Line 60: `text-zinc-500 transition hover:text-zinc-300` → `text-muted-foreground transition hover:text-foreground-secondary`

- [ ] **Step 2: Retrofit `components/UpgradeProModal.tsx`**

- Line 36: `text-zinc-50` → `text-foreground`
- Line 37: `text-zinc-400` → `text-muted-foreground`
- Line 43: `text-zinc-200` → `text-foreground-secondary`

Everything else in this file (the amber/gold gradient card, the `Check`/green benefit icon, the amber CTA button including its `text-zinc-900` contrast text) stays **unchanged** — it's the "Virar PRO" branding, explicitly excluded from the Klein rebrand per Global Constraints.

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -30`
Expected: build succeeds.

- [ ] **Step 4: Verify no leftover literal classes**

Run: `grep -n "navy-\|zinc-5\|zinc-4\|zinc-3\|zinc-2\|zinc-1\|zinc-0" components/Modal.tsx components/UpgradeProModal.tsx`
Expected: no output from `Modal.tsx`. `UpgradeProModal.tsx` may still show `text-zinc-900` (line 59, intentionally kept).

- [ ] **Step 5: Commit**

```bash
git add components/Modal.tsx components/UpgradeProModal.tsx
git commit -m "Retrofit de cores: Modal e UpgradeProModal"
```

---

## Task 8: Retrofit — layout shell (`Header`, `MobileBottomNav`, `Navigation`, `Logo`, `LogoutButton`, `BackButton`)

**Files:**
- Modify: `components/MobileBottomNav.tsx`
- Modify: `components/Navigation.tsx`
- Modify: `components/Logo.tsx`
- Modify: `components/LogoutButton.tsx`
- Modify: `components/BackButton.tsx`

(`components/Header.tsx` was already retrofitted in Task 6, Step 2.)

- [ ] **Step 1: Retrofit `components/MobileBottomNav.tsx`**

- Line 11: `border-navy-800 bg-navy-950/90` → `border-border bg-background/90`
- Line 20: `active ? "text-blue-400" : "text-zinc-500"` → `active ? "text-accent" : "text-muted-foreground"`

- [ ] **Step 2: Retrofit `components/Navigation.tsx`**

- Line 19: `active ? "text-blue-400" : "text-zinc-400 hover:text-zinc-200"` → `active ? "text-accent" : "text-muted-foreground hover:text-foreground-secondary"`

- [ ] **Step 3: Retrofit `components/Logo.tsx`**

Replace:

```tsx
    <Link href="/" className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
      NOTIC
      <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        .IA
      </span>
    </Link>
```

with:

```tsx
    <Link href="/" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
      NOTIC
      <span className="text-accent">.IA</span>
    </Link>
```

- [ ] **Step 4: Retrofit `components/LogoutButton.tsx`**

- Line 10: `border-navy-700 ... text-zinc-300 transition hover:border-navy-500 hover:text-zinc-100` → `border-border-strong ... text-foreground-secondary transition hover:border-border-hover hover:text-foreground`

- [ ] **Step 5: Retrofit `components/BackButton.tsx`**

- Line 14: `text-zinc-400 transition hover:text-zinc-100` → `text-muted-foreground transition hover:text-foreground`

- [ ] **Step 6: Verify build**

Run: `npm run build 2>&1 | tail -30`
Expected: build succeeds.

- [ ] **Step 7: Verify no leftover literal classes**

Run: `grep -n "navy-\|zinc-\|blue-\|purple-" components/MobileBottomNav.tsx components/Navigation.tsx components/Logo.tsx components/LogoutButton.tsx components/BackButton.tsx`
Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add components/MobileBottomNav.tsx components/Navigation.tsx components/Logo.tsx components/LogoutButton.tsx components/BackButton.tsx
git commit -m "Retrofit de cores: navegação, logo e botões de voltar/sair"
```

---

## Task 9: Retrofit — news cards (`NewsCard`, `CompactNewsCard`, `NewsCardActions`)

**Files:**
- Modify: `components/NewsCard.tsx`
- Modify: `components/CompactNewsCard.tsx`
- Modify: `components/NewsCardActions.tsx`

- [ ] **Step 1: Retrofit `components/NewsCard.tsx`**

- Line 35: `border-navy-800 bg-navy-900/50 p-5 transition hover:border-navy-700` → `border-border bg-surface-muted/50 p-5 transition hover:border-border-strong`
- Line 46: `text-zinc-50 transition hover:text-blue-400` → `text-foreground transition hover:text-accent`
- Line 49: `text-zinc-400` → `text-muted-foreground`
- Line 50: `text-zinc-500` → `text-muted-foreground`

(`ThemeBadge` usage on line 37 stays untouched — excluded per Global Constraints.)

- [ ] **Step 2: Retrofit `components/CompactNewsCard.tsx`**

- Line 22: `border-navy-800 bg-navy-950/60 p-2.5 transition hover:border-navy-700` → `border-border bg-background/60 p-2.5 transition hover:border-border-strong`
- Line 25: `text-zinc-100` → `text-foreground`
- Line 26: `text-zinc-500` → `text-muted-foreground`

- [ ] **Step 3: Retrofit `components/NewsCardActions.tsx`**

- Line 67: `readLater ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"` → `readLater ? "text-accent" : "text-muted-foreground hover:text-foreground-secondary"`
- Line 79: `favorito ? "text-pink-400" : "text-zinc-500 hover:text-zinc-300"` → `favorito ? "text-pink-400" : "text-muted-foreground hover:text-foreground-secondary"` (the pink favorito color is unrelated to the site accent, left as-is)

- [ ] **Step 4: Verify build**

Run: `npm run build 2>&1 | tail -30`
Expected: build succeeds.

- [ ] **Step 5: Verify no leftover literal classes**

Run: `grep -n "navy-\|zinc-\|text-blue-" components/NewsCard.tsx components/CompactNewsCard.tsx components/NewsCardActions.tsx`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add components/NewsCard.tsx components/CompactNewsCard.tsx components/NewsCardActions.tsx
git commit -m "Retrofit de cores: cards de notícia"
```

---

## Task 10: Retrofit — feed & news detail pages (`app/page.tsx`, `app/noticia/[id]/page.tsx`, `app/interesse/[tema]/page.tsx`, `ChatPanel.tsx`)

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/noticia/[id]/page.tsx`
- Modify: `app/interesse/[tema]/page.tsx`
- Modify: `components/ChatPanel.tsx`

- [ ] **Step 1: Retrofit `app/page.tsx`**

- Line 23: `text-zinc-50` → `text-foreground`
- Line 24: `text-zinc-400` → `text-muted-foreground`
- Line 30: `text-zinc-400` → `text-muted-foreground`

- [ ] **Step 2: Retrofit `app/noticia/[id]/page.tsx`**

- Line 77: `text-zinc-50` → `text-foreground`
- Line 79: `text-zinc-500` → `text-muted-foreground`
- Line 85: `text-zinc-300` → `text-foreground-secondary`
- Line 91: `text-blue-400` → `text-accent`

- [ ] **Step 3: Retrofit `app/interesse/[tema]/page.tsx`**

- Line 40: `text-zinc-50` → `text-foreground`
- Line 41: `text-zinc-400` → `text-muted-foreground`
- Line 47: `text-zinc-400` → `text-muted-foreground`

- [ ] **Step 4: Retrofit `components/ChatPanel.tsx`**

- Line 41: `border-navy-800 bg-navy-900/70` → `border-border bg-surface-muted/70`
- Line 42: `border-navy-800` → `border-border`
- Line 44: `text-blue-400` → `text-accent`
- Line 45: `text-zinc-100` → `text-foreground`
- Line 47: `bg-gradient-to-r from-blue-600/20 to-purple-600/20 ... text-blue-300 uppercase ring-1 ring-inset ring-blue-500/30` → `bg-accent/15 ... text-accent uppercase ring-1 ring-inset ring-accent/30`
- Lines 61-63: `"bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "bg-navy-800 text-zinc-200"` → `"bg-accent text-white" : "bg-surface-muted text-foreground-secondary"`
- Line 73: `border-navy-800` → `border-border`
- Line 79: `border-navy-800 bg-navy-900/50 ... text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500` → `border-border bg-surface-muted/50 ... text-foreground placeholder:text-muted-foreground focus:border-accent`
- Line 85: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`

- [ ] **Step 5: Verify build**

Run: `npm run build 2>&1 | tail -30`
Expected: build succeeds.

- [ ] **Step 6: Verify no leftover literal classes**

Run: `grep -n "navy-\|zinc-\|blue-\|purple-" app/page.tsx "app/noticia/[id]/page.tsx" "app/interesse/[tema]/page.tsx" components/ChatPanel.tsx`
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx "app/noticia/[id]/page.tsx" "app/interesse/[tema]/page.tsx" components/ChatPanel.tsx
git commit -m "Retrofit de cores: feed, tela de notícia e chat"
```

---

## Task 11: Retrofit — busca e seguindo (`app/search/page.tsx`, `app/seguindo/page.tsx`, `SeguindoFeed.tsx`)

**Files:**
- Modify: `app/search/page.tsx`
- Modify: `app/seguindo/page.tsx`
- Modify: `components/SeguindoFeed.tsx`

- [ ] **Step 1: Retrofit `app/search/page.tsx`**

- Line 79: `text-zinc-50` → `text-foreground`
- Line 81: `border-navy-800` → `border-border`
- Lines 85-87: `aba === "noticias" ? "border-b-2 border-blue-500 text-blue-400" : "text-zinc-400 hover:text-zinc-200"` → `aba === "noticias" ? "border-b-2 border-accent text-accent" : "text-muted-foreground hover:text-foreground-secondary"`
- Lines 95-97: same pattern for the "Pessoas" tab → same replacement
- Line 108: `text-zinc-500` → `text-muted-foreground`
- Line 116: `border-navy-800 bg-navy-900/50 ... text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500` → `border-border bg-surface-muted/50 ... text-foreground placeholder:text-muted-foreground focus:border-accent`
- Line 121: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`
- Line 128: `text-zinc-400` → `text-muted-foreground`
- Line 129: `text-zinc-200` → `text-foreground-secondary`
- Line 130: `text-blue-400` → `text-accent`
- Lines 139, 141, 161, 168, 170: `text-zinc-400` → `text-muted-foreground`
- Line 162: `text-blue-400` → `text-accent`

- [ ] **Step 2: Retrofit `app/seguindo/page.tsx`**

- Line 18: `text-zinc-600` → `text-subtle-foreground`
- Line 19: `text-zinc-50` → `text-foreground`
- Line 20: `text-zinc-400` → `text-muted-foreground`
- Line 25: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`

- [ ] **Step 3: Retrofit `components/SeguindoFeed.tsx`**

- Line 77: `text-zinc-50` → `text-foreground`
- Lines 86-89: `dropdownAberto ? "border-blue-500 text-blue-400" : "border-navy-700 text-zinc-400 hover:border-navy-500 hover:text-zinc-100"` → `dropdownAberto ? "border-accent text-accent" : "border-border-strong text-muted-foreground hover:border-border-hover hover:text-foreground"`
- Line 96: `border-navy-800 bg-navy-950` → `border-border bg-background`
- Line 97: `text-zinc-500` → `text-muted-foreground`
- Line 106: `text-zinc-200 transition hover:bg-navy-900` → `text-foreground-secondary transition hover:bg-surface-muted`
- Line 112: `border-navy-700 bg-navy-900 text-blue-600 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0` → `border-border-strong bg-surface-muted text-accent focus:ring-1 focus:ring-accent focus:ring-offset-0`
- Lines 131, 136, 140: `text-zinc-400` → `text-muted-foreground`

(`ThemeBadge` usage on line 126 stays untouched.)

- [ ] **Step 4: Verify build**

Run: `npm run build 2>&1 | tail -30`
Expected: build succeeds.

- [ ] **Step 5: Verify no leftover literal classes**

Run: `grep -n "navy-\|zinc-\|blue-\|purple-" app/search/page.tsx app/seguindo/page.tsx components/SeguindoFeed.tsx`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add app/search/page.tsx app/seguindo/page.tsx components/SeguindoFeed.tsx
git commit -m "Retrofit de cores: busca e seguindo"
```

---

## Task 12: Retrofit — conexões e chat (`app/conexoes/page.tsx` e componentes)

**Files:**
- Modify: `app/conexoes/page.tsx`
- Modify: `components/ConnectionRequestItem.tsx`
- Modify: `components/ConversationListItem.tsx`
- Modify: `components/ConversationPanel.tsx`
- Modify: `components/PersonCard.tsx`
- Modify: `components/SendToConnectionModal.tsx`
- Modify: `components/ShareNewsModal.tsx`
- Modify: `components/EditInterestsModal.tsx`

- [ ] **Step 1: Retrofit `app/conexoes/page.tsx`**

- Line 23: `text-zinc-50` → `text-foreground`
- Line 26: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`
- Line 57: `border-navy-800` → `border-border`
- Line 59: `border-navy-800` → `border-border`
- Line 63: `border-navy-800` → `border-border`
- Line 64: `text-zinc-50` → `text-foreground`
- Line 68: `border-navy-800` → `border-border`
- Line 69: `text-zinc-500` → `text-muted-foreground`
- Line 81: `text-zinc-500` → `text-muted-foreground`
- Line 115: `text-zinc-500` → `text-muted-foreground`

- [ ] **Step 2: Retrofit `components/ConnectionRequestItem.tsx`**

- Line 31: `border-navy-800 bg-navy-900/50` → `border-border bg-surface-muted/50`
- Line 33: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`
- Line 36: `text-zinc-100` → `text-foreground`
- Line 45: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`
- Line 53: `border-navy-800 ... text-zinc-300 transition hover:text-zinc-100` → `border-border ... text-foreground-secondary transition hover:text-foreground`

- [ ] **Step 3: Retrofit `components/ConversationListItem.tsx`**

- Line 21: `border-navy-800/60` → `border-border/60`
- Line 22: `ativa ? "bg-navy-800/60" : "hover:bg-navy-900"` → `ativa ? "bg-surface-muted/60" : "hover:bg-surface-muted"`
- Line 25: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`
- Line 30: `text-zinc-100` → `text-foreground`
- Line 31: `bg-blue-500` → `bg-accent`
- Line 34: `` naoLidas > 0 ? "font-medium text-zinc-300" : "text-zinc-500" `` → `` naoLidas > 0 ? "font-medium text-foreground-secondary" : "text-muted-foreground" ``

- [ ] **Step 4: Retrofit `components/ConversationPanel.tsx`**

- Line 59: `border-navy-800` → `border-border`
- Line 63: `text-zinc-400 transition hover:text-zinc-200` → `text-muted-foreground transition hover:text-foreground-secondary`
- Line 67: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`
- Line 70: `text-zinc-50` → `text-foreground`
- Line 75: `text-zinc-500` → `text-muted-foreground`
- Lines 87-89: `mensagem.deMim ? "border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-purple-600/20" : "border border-navy-800 bg-navy-900/60"` → `mensagem.deMim ? "border border-accent/30 bg-accent/15" : "border border-border bg-surface-muted/60"`
- Line 94: `text-zinc-200` → `text-foreground-secondary`
- Line 109: `text-zinc-500` → `text-muted-foreground`
- Line 123: `border-navy-800` → `border-border`
- Line 129: `border-navy-800 bg-navy-900/50 ... text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500` → `border-border bg-surface-muted/50 ... text-foreground placeholder:text-muted-foreground focus:border-accent`
- Line 135: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`

- [ ] **Step 5: Retrofit `components/PersonCard.tsx`**

- Line 58: `border-navy-800 bg-navy-900/50` → `border-border bg-surface-muted/50`
- Line 60: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`
- Line 63: `text-zinc-100` → `text-foreground`
- Line 71: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`
- Line 82: `border-navy-800 ... text-zinc-500` → `border-border ... text-muted-foreground`
- Line 94: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`
- Line 102: `border-navy-800 ... text-zinc-300 transition hover:text-zinc-100` → `border-border ... text-foreground-secondary transition hover:text-foreground`
- Line 118: `border-navy-800 ... text-zinc-300 transition hover:border-blue-500/50 hover:text-blue-400` → `border-border ... text-foreground-secondary transition hover:border-accent/50 hover:text-accent`

- [ ] **Step 6: Retrofit `components/SendToConnectionModal.tsx`**

- Line 95: `text-zinc-500` → `text-muted-foreground`
- Line 103: `border-navy-800 bg-navy-900/50 ... text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500` → `border-border bg-surface-muted/50 ... text-foreground placeholder:text-muted-foreground focus:border-accent`
- Line 108: `border-navy-800` → `border-border`
- Line 110: `text-zinc-500` → `text-muted-foreground`
- Lines 119-122: `border-navy-800 ...` / `selecionada?.id === noticia.id ? "bg-blue-500/10 text-blue-400" : "text-zinc-200 hover:bg-navy-900"` → `border-border ...` / `selecionada?.id === noticia.id ? "bg-accent/10 text-accent" : "text-foreground-secondary hover:bg-surface-muted"`
- Line 133: `text-zinc-400` → `text-muted-foreground`
- Line 134: `text-zinc-200` → `text-foreground-secondary`
- Line 143: `border-navy-800 bg-navy-900/50 ... text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500` → `border-border bg-surface-muted/50 ... text-foreground placeholder:text-muted-foreground focus:border-accent`
- Line 152: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`

- [ ] **Step 7: Retrofit `components/ShareNewsModal.tsx`**

- Line 76: `text-zinc-500 transition hover:text-zinc-300` → `text-muted-foreground transition hover:text-foreground-secondary`
- Line 85: `text-zinc-400` → `text-muted-foreground`
- Line 94: `text-zinc-200 hover:bg-navy-900` → `text-foreground-secondary hover:bg-surface-muted`
- Line 100: `border-navy-700 bg-navy-900 text-blue-600 focus:ring-blue-500` → `border-border-strong bg-surface-muted text-accent focus:ring-accent`
- Line 112: `border-navy-800 bg-navy-900/50 ... text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500` → `border-border bg-surface-muted/50 ... text-foreground placeholder:text-muted-foreground focus:border-accent`
- Line 121: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`

- [ ] **Step 8: Retrofit `components/EditInterestsModal.tsx`**

- Line 79: `border-navy-700 text-zinc-400 transition hover:border-navy-500 hover:text-zinc-100` → `border-border-strong text-muted-foreground transition hover:border-border-hover hover:text-foreground`
- Line 87: `text-zinc-400` → `text-muted-foreground`
- Lines 94-96: `limite !== null && selecionados.length === limite ? "text-blue-400" : "text-zinc-500"` → `limite !== null && selecionados.length === limite ? "text-accent" : "text-muted-foreground"`
- Lines 115-119: same pattern as Task 5's chip button → `bg-accent text-white ring-transparent` / `cursor-not-allowed text-subtle-foreground ring-border` / `text-foreground-secondary ring-border-strong hover:ring-border-hover`
- Line 135: `text-zinc-400 transition hover:text-zinc-200` → `text-muted-foreground transition hover:text-foreground-secondary`
- Line 143: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`

- [ ] **Step 9: Verify build**

Run: `npm run build 2>&1 | tail -30`
Expected: build succeeds.

- [ ] **Step 10: Verify no leftover literal classes**

Run: `grep -n "navy-\|zinc-\|blue-\|purple-" app/conexoes/page.tsx components/ConnectionRequestItem.tsx components/ConversationListItem.tsx components/ConversationPanel.tsx components/PersonCard.tsx components/SendToConnectionModal.tsx components/ShareNewsModal.tsx components/EditInterestsModal.tsx`
Expected: no output.

- [ ] **Step 11: Commit**

```bash
git add app/conexoes/page.tsx components/ConnectionRequestItem.tsx components/ConversationListItem.tsx components/ConversationPanel.tsx components/PersonCard.tsx components/SendToConnectionModal.tsx components/ShareNewsModal.tsx components/EditInterestsModal.tsx
git commit -m "Retrofit de cores: conexões, conversas e compartilhamento"
```

---

## Task 13: Retrofit — auth pages and remaining pages (`login`, `cadastro` page shell, `not-found`, `LoginForm`, `app/user/page.tsx`)

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `app/cadastro/page.tsx`
- Modify: `app/not-found.tsx`
- Modify: `components/LoginForm.tsx`
- Modify: `app/user/page.tsx`

- [ ] **Step 1: Retrofit `app/login/page.tsx`**

- Line 7: `text-zinc-50` → `text-foreground`
- Line 8: `text-zinc-400` → `text-muted-foreground`

- [ ] **Step 2: Retrofit `app/cadastro/page.tsx`**

- Line 13: `text-zinc-50` → `text-foreground`
- Line 14: `text-zinc-400` → `text-muted-foreground`

- [ ] **Step 3: Retrofit `app/not-found.tsx`**

- Line 6: `text-zinc-50` → `text-foreground`
- Line 7: `text-zinc-400` → `text-muted-foreground`
- Line 12: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`

- [ ] **Step 4: Retrofit `components/LoginForm.tsx`**

- Line 9 (`inputClass`): `border-navy-800 bg-navy-900/50 ... text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500` → `border-border bg-surface-muted/50 ... text-foreground placeholder:text-muted-foreground focus:border-accent`
- Lines 42, 58: `text-zinc-300` → `text-foreground-secondary`
- Line 78: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`
- Line 83: `text-zinc-400` → `text-muted-foreground`
- Line 85: `text-blue-400` → `text-accent`

- [ ] **Step 5: Retrofit `app/user/page.tsx`**

- Line 19: `text-zinc-600` → `text-subtle-foreground`
- Line 20: `text-zinc-50` → `text-foreground`
- Line 21: `text-zinc-400` → `text-muted-foreground`
- Line 27: `bg-gradient-to-r from-blue-600 to-purple-600` → `bg-accent`
- Line 56: `text-zinc-400` → `text-muted-foreground`
- Line 69: `text-zinc-50` → `text-foreground`
- Line 76: `text-zinc-400` → `text-muted-foreground`
- Line 84: `border-navy-800 bg-navy-900/50 ... text-zinc-100 transition hover:border-blue-500/50 hover:text-blue-400` → `border-border bg-surface-muted/50 ... text-foreground transition hover:border-accent/50 hover:text-accent`
- Line 93: `text-zinc-50` → `text-foreground`
- Line 94: `text-zinc-400` → `text-muted-foreground`
- Line 96: `border-navy-800 bg-navy-900/50 ... text-zinc-400` → `border-border bg-surface-muted/50 ... text-muted-foreground`
- Line 120: `text-zinc-50` → `text-foreground`
- Line 121: `text-zinc-400` → `text-muted-foreground`
- Line 123: `border-navy-800 bg-navy-900/50 ... text-zinc-400` → `border-border bg-surface-muted/50 ... text-muted-foreground`

(`EditInterestsModal` on line 70 was already retrofitted in Task 12; `NewsCard` on lines 102/129 already retrofitted in Task 9.)

- [ ] **Step 6: Verify build**

Run: `npm run build 2>&1 | tail -30`
Expected: build succeeds.

- [ ] **Step 7: Verify no leftover literal classes**

Run: `grep -n "navy-\|zinc-\|blue-\|purple-" app/login/page.tsx app/cadastro/page.tsx app/not-found.tsx components/LoginForm.tsx app/user/page.tsx`
Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add app/login/page.tsx app/cadastro/page.tsx app/not-found.tsx components/LoginForm.tsx app/user/page.tsx
git commit -m "Retrofit de cores: login, cadastro, 404 e perfil"
```

---

## Task 14: Full-repo verification sweep + manual QA

**Files:** none (verification only)

- [ ] **Step 1: Repo-wide grep sweep**

Run:
```bash
grep -rn "navy-950\|navy-900\|navy-800\|navy-700\|navy-600\|navy-500\|zinc-50\|zinc-100\|zinc-200\|zinc-300\|zinc-400\|zinc-500\|zinc-600\|from-blue-600\|to-purple-600\|from-blue-500\|to-purple-500\|text-blue-\|border-blue-\|ring-blue-\|bg-blue-" app components --include="*.tsx"
```
Expected: the only matches are `components/ThemeBadge.tsx` (category colors, intentionally excluded) and `components/UpgradeProModal.tsx` line 59 (`text-zinc-900`, intentionally excluded per Global Constraints). If any other file appears, retrofit it using the same Color Migration Reference table before continuing.

- [ ] **Step 2: Full production build**

Run: `npm run build 2>&1 | tail -50`
Expected: build completes successfully with no type errors.

- [ ] **Step 3: Start the production server**

Run: `npm run start &` (background) then wait a few seconds and check `curl -sI http://localhost:3000 | head -1`
Expected: `HTTP/1.1 200 OK` (or a redirect), confirming the server started.

- [ ] **Step 4: Manual QA — signup with light theme**

In a browser, go to `http://localhost:3000/cadastro`, fill the form, select "Claro" in the Tema picker, choose 3 interests, submit.
Expected: after redirect to the feed, the whole site renders in light theme — white background, dark text, Klein-blue accents on buttons/links, header and mobile nav included.

- [ ] **Step 5: Manual QA — real-time switch + persistence**

Open the user menu → "Editar perfil", switch the theme to "Escuro", save.
Expected: page switches to dark theme immediately (no reload), including the header/nav.
Reload the page (`Cmd+R`/`F5`).
Expected: still dark (confirms server-side read from DB).
Log out, log back in with the same account.
Expected: still dark (confirms persistence survives a fresh session).

- [ ] **Step 6: Manual QA — modals reflect the active theme**

While in the state from Step 5 (dark theme active), open "Editar perfil" and "Virar PRO" modals.
Expected: both render with the dark theme's background/border/text tokens (PRO modal's amber CTA stays amber, everything else follows the dark tokens).

- [ ] **Step 7: Stop the server**

Run: `kill %1` (or find and kill the `npm run start` background process).

---

## Task 15: Git push

**Files:** none

- [ ] **Step 1: Confirm all commits are in place**

Run: `git log --oneline -20` and `git status -sb`
Expected: a clean working tree, with the commits from Tasks 1-13 visible on top of the pre-existing history.

- [ ] **Step 2: Push to `main`**

Run: `git push origin main`
Expected: push succeeds (fast-forward, since no one else pushed to `main` in the meantime — if it's not a fast-forward, stop and report to the user rather than force-pushing).
