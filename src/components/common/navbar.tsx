"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NavbarActions } from "./navbar-actions";

export default function Navbar() {
  const pathname = usePathname();

  // Hide navbar on dashboard routes
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 glass border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Name & Icon */}
          <Link href="/" className="flex items-center space-x-2.5 group" id="brand-logo-link">
            <div className="relative w-9 h-9 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              <Image
                src="/logo_light.png"
                alt="CareerEdge Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain dark:hidden"
                priority
              />
              <Image
                src="/logo_dark.png"
                alt="CareerEdge Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain hidden dark:block"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
              Career<span className="text-indigo-500 dark:text-indigo-400">Edge</span>
            </span>
          </Link>

          {/* Actions (Theme, Signin, Signup, Dropdown) */}
          <NavbarActions />
        </div>
      </div>
    </header>
  );
}
