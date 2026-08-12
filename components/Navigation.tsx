"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UserCheck, Search, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Curadoria IA", icon: Home },
  { href: "/seguindo", label: "Seguindo", icon: UserCheck },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/user", label: "Perfil", icon: User },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: barra horizontal ao lado do Header */}
      <ul className="hidden items-center gap-8 md:flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-2 text-sm font-medium transition ${
                  active ? "text-blue-400" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Mobile: barra fixa no rodapé */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-navy-800 bg-navy-950/90 backdrop-blur md:hidden">
        <ul className="mx-auto flex max-w-5xl items-stretch justify-around">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                    active ? "text-blue-400" : "text-zinc-500"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
