import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-900 text-white p-4">
      <nav className="navigation">
        <Link href="/">Home</Link>
        <Link href="/github">GitHub API</Link>
      </nav>
    </header>
  );
}