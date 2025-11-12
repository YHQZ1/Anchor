"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed w-full top-0 z-50 backdrop-blur-xl border-b bg-background/80 border-border">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-0 flex items-center justify-between">
        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0 my-2"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14">
              <Image
                src="/logo-light.png"
                alt="Logo"
                fill
                className="object-contain transition-opacity duration-300 dark:hidden"
                priority
              />
              <Image
                src="/logo-dark.png"
                alt="Logo"
                fill
                className="object-contain transition-opacity duration-300 hidden dark:block"
                priority
              />
            </div>
            <span className="text-2xl sm:text-2xl md:text-3xl font-semibold tracking-wide text-foreground">
              Anchor
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
          <Link
            href="/auth?mode=signin"
            className="text-md lg:text-base font-medium transition-none text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400"
          >
            Sign In
          </Link>
          <Link
            href="/auth?mode=signup"
            className="text-md lg:text-base font-medium transition-none text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400"
          >
            Sign Up
          </Link>

          <button
            className="cursor-pointer p-2 rounded-lg transition-none text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-accent/50"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {!mounted ? (
              <div className="w-6 h-6 sm:w-6 sm:h-6" />
            ) : theme === "dark" ? (
              <Sun className="w-6 h-6 sm:w-6 sm:h-6" />
            ) : (
              <Moon className="w-4 h-4 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
