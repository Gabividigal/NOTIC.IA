"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-border-strong px-3 py-1.5 text-xs font-medium text-foreground-secondary transition hover:border-border-hover hover:text-foreground"
    >
      Sair
    </button>
  );
}
