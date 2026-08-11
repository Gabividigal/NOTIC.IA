import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
      NOTIC
      <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        .IA
      </span>
    </Link>
  );
}
