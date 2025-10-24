"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <nav className="fixed w-full top-0 z-50 backdrop-blur-xl border-b bg-background/80 border-border">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-0 flex items-center justify-between">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0 my-2"
            >
              <div className="relative w-12 sm:w-20 h-12 sm:h-12">
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
              <span className="text-2xl sm:text-3xl font-semibold tracking-wide text-foreground">
                Anchor
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
            <Link
              href="/auth?mode=signin"
              className="hidden md:block text-sm lg:text-base font-medium transition-colors text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400"
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              className="hidden md:block text-sm lg:text-base font-medium transition-colors text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400"
            >
              Sign Up
            </Link>

            <button
              className="cursor-pointer p-2 rounded-lg transition-colors text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <div className="w-5 h-5" />
              ) : theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              className="lg:hidden p-2 rounded-lg transition-colors hover:bg-accent"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      <div
        className={`fixed top-[60px] sm:top-[64px] right-0 h-[calc(100vh-60px)] sm:h-[calc(100vh-64px)] w-full sm:w-80 z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } bg-background/95 border-l border-border backdrop-blur-xl`}
      >
        <div className="flex flex-col h-full p-6 space-y-6">
          <div className="space-y-0">
            <button
              className="w-full text-left text-lg font-medium py-3 px-4 rounded-lg transition-colors text-foreground hover:bg-accent hover:text-purple-600 dark:hover:text-purple-400"
              onClick={toggleMobileMenu}
            >
              Features
            </button>
            <button
              className="w-full text-left text-lg font-medium py-3 px-4 rounded-lg transition-colors text-foreground hover:bg-accent hover:text-purple-600 dark:hover:text-purple-400"
              onClick={toggleMobileMenu}
            >
              About
            </button>
            <button
              className="w-full text-left text-lg font-medium py-3 px-4 rounded-lg transition-colors text-foreground hover:bg-accent hover:text-purple-600 dark:hover:text-purple-400"
              onClick={toggleMobileMenu}
            >
              Docs
            </button>
          </div>

          <div className="border-t border-border" />

          <div className="space-y-3 md:hidden">
            <Link
              href="/auth?mode=signin"
              className="block w-full text-center text-base font-medium py-3 px-4 rounded-lg transition-colors text-foreground hover:bg-accent hover:text-purple-600 dark:hover:text-purple-400"
              onClick={toggleMobileMenu}
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              className="block w-full text-center text-base font-semibold py-3 px-4 rounded-lg transition-colors text-white bg-purple-600 hover:bg-purple-700"
              onClick={toggleMobileMenu}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}