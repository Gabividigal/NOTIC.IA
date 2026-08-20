import { getUsuarioAtual } from "@/lib/usuarioAtual";
import type { ColorScheme } from "@/components/ThemeProvider";

export async function obterTemaInicial(): Promise<ColorScheme> {
  const usuario = await getUsuarioAtual();
  return usuario?.colorScheme === "LIGHT" ? "light" : "dark";
}
