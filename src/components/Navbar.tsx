"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-yellow-900/20 bg-yellow-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-yellow-500">
              xultra bearish
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-yellow-500 text-black"
                  : "text-yellow-500/70 hover:text-yellow-500"
              }`}
            >
              RFA
            </Link>
            <Link
              href="/bgt"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/bgt"
                  ? "bg-yellow-500 text-black"
                  : "text-yellow-500/70 hover:text-yellow-500"
              }`}
            >
              BGT
            </Link>
            <a
              href="https://x.com/intent/follow?screen_name=0x_ultra"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 hover:border-yellow-500/40"
            >
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="font-mono">0x_ultra</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
