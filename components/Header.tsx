"use client";

import React, { useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <nav
        className={`fixed w-full top-0 z-50 backdrop-blur-xl border-b ${
          theme === "dark"
            ? "bg-black/80 border-gray-800"
            : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-0 flex items-center justify-between">
          {/* Left: Logo + Desktop Navigation */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0 my-2"
            >
              {/* Logo */}
              <div className="relative w-12 sm:w-20 h-12 sm:h-12">
                {theme && (
                  <Image
                    src={
                      theme === "dark" ? "/logo-dark.png" : "/logo-light.png"
                    }
                    alt="Logo"
                    fill
                    className="object-contain transition-opacity duration-300"
                    priority
                  />
                )}
              </div>

              {/* Name */}
              <span
                className={`text-2xl sm:text-3xl font-semibold tracking-wide transition-colors duration-300 ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-purple-400"
                    : "text-slate-700 hover:text-purple-600"
                }`}
              >
                Anchor
              </span>
            </Link>

            {/* Desktop Navigation Menu - Hidden on mobile/tablet */}
            {/* <div className="hidden lg:block">
              <NavigationMenu>
                <NavigationMenuList className="flex gap-2 xl:gap-4">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="cursor-pointer text-sm xl:text-base">
                      Features
                    </NavigationMenuTrigger>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="cursor-pointer text-sm xl:text-base">
                      About
                    </NavigationMenuTrigger>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="cursor-pointer text-sm xl:text-base">
                      Docs
                    </NavigationMenuTrigger>
                  </NavigationMenuItem>
                </NavigationMenuList>
                <NavigationMenuViewport />
              </NavigationMenu>
            </div> */}
          </div>

          {/* Right: Sign In/Sign Up + Theme Toggle + Mobile Menu */}
          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
            {/* Desktop Auth Links */}
            <Link
              href="/auth?mode=signin"
              className={`hidden md:block text-sm lg:text-base font-medium transition-colors ${
                theme === "dark"
                  ? "text-gray-300 hover:text-purple-400"
                  : "text-slate-700 hover:text-purple-600"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              className={`hidden md:block text-sm lg:text-base font-medium transition-colors ${
                theme === "dark"
                  ? "text-gray-300 hover:text-purple-400"
                  : "text-slate-700 hover:text-purple-600"
              }`}
            >
              Sign Up
            </Link>

            {/* Theme Toggle */}
            <button
              className="cursor-pointer p-2 rounded-lg transition-colors"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-[60px] sm:top-[64px] right-0 h-[calc(100vh-60px)] sm:h-[calc(100vh-64px)] w-full sm:w-80 z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } ${
          theme === "dark"
            ? "bg-black/95 border-l border-gray-800"
            : "bg-white/95 border-l border-slate-200"
        } backdrop-blur-xl`}
      >
        <div className="flex flex-col h-full p-6 space-y-6">
          {/* Mobile Navigation Links */}
          <div className="space-y-0">
            <button
              className={`w-full text-left text-lg font-medium py-3 px-4 rounded-lg transition-colors ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-800 hover:text-purple-400"
                  : "text-slate-700 hover:bg-gray-100 hover:text-purple-600"
              }`}
              onClick={toggleMobileMenu}
            >
              Features
            </button>
            <button
              className={`w-full text-left text-lg font-medium py-3 px-4 rounded-lg transition-colors ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-800 hover:text-purple-400"
                  : "text-slate-700 hover:bg-gray-100 hover:text-purple-600"
              }`}
              onClick={toggleMobileMenu}
            >
              About
            </button>
            <button
              className={`w-full text-left text-lg font-medium py-3 px-4 rounded-lg transition-colors ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-800 hover:text-purple-400"
                  : "text-slate-700 hover:bg-gray-100 hover:text-purple-600"
              }`}
              onClick={toggleMobileMenu}
            >
              Docs
            </button>
          </div>

          {/* Divider */}
          <div
            className={`border-t ${
              theme === "dark" ? "border-gray-800" : "border-slate-200"
            }`}
          />

          {/* Mobile Auth Links */}
          <div className="space-y-3 md:hidden">
            <Link
              href="/auth?mode=signin"
              className={`block w-full text-center text-base font-medium py-3 px-4 rounded-lg transition-colors ${
                theme === "dark"
                  ? "text-gray-300 bg-gray-800 hover:bg-gray-700"
                  : "text-slate-700 bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={toggleMobileMenu}
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              className={`block w-full text-center text-base font-semibold py-3 px-4 rounded-lg transition-colors ${
                theme === "dark"
                  ? "text-white bg-purple-600 hover:bg-purple-700"
                  : "text-white bg-purple-600 hover:bg-purple-700"
              }`}
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
