import { Home, UserCheck, Search, User } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Curadoria IA", mobileLabel: "Início", icon: Home },
  { href: "/seguindo", label: "Seguindo", mobileLabel: "Seguindo", icon: UserCheck },
  { href: "/search", label: "Buscar", mobileLabel: "Buscar", icon: Search },
  { href: "/user", label: "Perfil", mobileLabel: "Perfil", icon: User },
] as const;

export function isNavItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
