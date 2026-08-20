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
