"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useUIStore } from "@/store/useUIStore";
import { ThemeToggle } from "./theme-toggle";
import { useClickOutside } from "@/hooks/useClickOutside";

export function NavbarActions() {
  const pathname = usePathname();
  const router = useRouter();
  const openModal = useUIStore((state) => state.openModal);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (dropdownOpen) {
      setDropdownOpen(false);
    }
  });

  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const isSigninPage = pathname === "/signin";
  const isSignupPage = pathname?.startsWith("/signup");

  return (
    <div className="flex items-center space-x-2.5 sm:space-x-4">
      {/* Theme Toggle Button */}
      <ThemeToggle />

      {/* Auth Buttons: Conditional rendering based on session */}
      {!isPending && (
        session ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 transition-all cursor-pointer bg-neutral-50/50 dark:bg-neutral-950/20"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm overflow-hidden relative">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name}
                    fill
                    sizes="(max-width: 640px) 28px, 32px"
                    className="object-cover"
                  />
                ) : (
                  session.user.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-foreground max-w-[100px] truncate pr-1">
                {session.user.name}
              </span>
            </button>

            {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-60 rounded-2xl glass border border-neutral-200/60 dark:border-neutral-800/60 bg-background shadow-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center space-x-3 p-2 border-b border-neutral-100 dark:border-neutral-900 pb-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md overflow-hidden relative">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        session.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">{session.user.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{session.user.email}</span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full text-left flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all mb-1"
                  >
                    Go to Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
            )}
          </div>
        ) : (
          <>
            {!isSigninPage && (
              <Button asChild variant="ghost" className="rounded-xl font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
                <Link href="/signin">Sign In</Link>
              </Button>
            )}

            {!isSignupPage && (
              <Button onClick={() => openModal("signup")} variant="premium" className="rounded-xl font-medium shadow-md text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
                Sign Up <Rocket className="ml-1.5 sm:ml-2 w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </Button>
            )}
          </>
        )
      )}
    </div>
  );
}
