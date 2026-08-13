"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive } from "@/lib/navItems";

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-navy-800 bg-navy-950/90 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-5xl items-stretch justify-around">
        {NAV_ITEMS.map(({ href, mobileLabel, icon: Icon }) => {
          const active = isNavItemActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] leading-none ${
                  active ? "text-blue-400" : "text-zinc-500"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {mobileLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
