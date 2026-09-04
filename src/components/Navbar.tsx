"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { NotificationsBell } from "./NotificationsBell";

type NavbarProps = {
  username: string;
  name: string;
  avatarUrl: string | null;
};

export function Navbar({ username, name, avatarUrl }: NavbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-4">
      <div className="flex items-center gap-3 min-w-fit">
        <Link href="/" className="text-[#1877f2] text-2xl font-extrabold">
          connectly
        </Link>
      </div>

      <form onSubmit={onSearch} className="flex-1 max-w-xs hidden sm:block">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Connectly"
          className="w-full bg-[#f0f2f5] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </form>

      <nav className="flex-1 hidden md:flex items-center justify-center gap-2">
        <Link
          href="/"
          className="px-8 py-2 rounded-lg text-gray-500 hover:bg-gray-100 font-medium"
        >
          Home
        </Link>
        <Link
          href="/friends"
          className="px-8 py-2 rounded-lg text-gray-500 hover:bg-gray-100 font-medium"
        >
          Friends
        </Link>
      </nav>

      <div className="flex items-center gap-2 ml-auto relative">
        <Link
          href={`/profile/${username}`}
          className="flex items-center gap-2 rounded-full hover:bg-gray-100 px-2 py-1"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="w-8 h-8 rounded-full bg-[#1877f2] text-white flex items-center justify-center text-xs font-bold">
              {initials}
            </span>
          )}
          <span className="hidden lg:inline text-sm font-medium">{name}</span>
        </Link>
        <NotificationsBell />
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700"
            aria-label="Menu"
          >
            ▾
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              <Link
                href={`/profile/${username}`}
                className="block px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                My profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
