"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive } from "@/lib/navItems";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <ul className="hidden items-center gap-8 md:flex">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isNavItemActive(pathname, href);
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
  );
}
