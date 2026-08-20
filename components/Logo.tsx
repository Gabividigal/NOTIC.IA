import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
      NOTIC
      <span className="text-accent">.IA</span>
    </Link>
  );
}
