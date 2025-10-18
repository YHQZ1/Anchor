"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Bell,
  BarChart3,
  BookOpen,
  CheckCircle,
  Users,
  Moon,
  Sun,
  ArrowRight,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";

import Image from "next/image";
import Link from "next/link";

export default function Landing() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Assignment Tracker",
      description:
        "Automatically sync with Moodle to track all assignments, deadlines, and submission status in one centralized dashboard.",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Notifications",
      description:
        "Never miss a deadline with intelligent alerts for new assignments and upcoming due dates delivered in real-time.",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Attendance Monitor",
      description:
        "Track attendance thresholds intelligently and receive warnings before falling below minimum requirements.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Productivity Insights",
      description:
        "Comprehensive analytics on academic performance with detailed workload patterns and completion trends.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Centralized Hub",
      description:
        "Access all assignment files, requirements, and submission details instantly without switching platforms.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaboration Tools",
      description:
        "Manage group projects efficiently, share resources with peers, and track team progress seamlessly.",
    },
  ];

  const benefits = [
    { icon: <Zap className="w-5 h-5" />, text: "Lightning fast sync" },
    { icon: <Shield className="w-5 h-5" />, text: "Secure & private" },
    { icon: <Sparkles className="w-5 h-5" />, text: "Always up to date" },
  ];

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-slate-900"
      }`}
    >
      {/* Navigation */}

      <nav
        className={`fixed w-full top-0 z-50 backdrop-blur-xl border-b ${
          theme === "dark"
            ? "bg-black/80 border-gray-800"
            : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="max-w-8xl mx-auto px-6 lg:px-20 py-0">
          <div className="flex items-center justify-between">
            {/* Left side: Logo + Features/About */}
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <div className="w-20 h-15 relative">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Navigation links */}
              <a
                href="#features"
                className={`hidden md:block text-base font-medium ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-purple-400"
                    : "text-slate-700 hover:text-purple-600"
                }`}
              >
                Features
              </a>
              <a
                href="#about"
                className={`hidden md:block text-base font-medium ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-purple-400"
                    : "text-slate-700 hover:text-purple-600"
                }`}
              >
                About
              </a>
            </div>

            {/* Right side: Sign In/Sign Up + Theme toggle */}
            <div className="flex items-center space-x-6">
              <Link
                href="/signin"
                className={`hidden md:block text-base font-medium ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-purple-400"
                    : "text-slate-700 hover:text-purple-600"
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`hidden md:block text-base font-medium ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-purple-400"
                    : "text-slate-700 hover:text-purple-600"
                }`}
              >
                Sign Up
              </Link>
              <button className="cursor-pointer"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun /> : <Moon />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Master Your
              <span
                className={`block ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`}
              >
                Academic Journey
              </span>
            </h1>
            <p
              className={`text-xl md:text-2xl mb-10 leading-relaxed ${
                theme === "dark" ? "text-gray-400" : "text-slate-600"
              }`}
            >
              Unified assignment tracking, attendance monitoring, and
              productivity insights.
              <span className="block mt-2">
                Minimize effort, maximize success.
              </span>
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className={`flex items-center space-x-2 ${
                    theme === "dark" ? "text-gray-400" : "text-slate-600"
                  }`}
                >
                  <div
                    className={
                      theme === "dark" ? "text-purple-400" : "text-purple-600"
                    }
                  >
                    {benefit.icon}
                  </div>
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className={`py-24 px-6 lg:px-8 border-y ${
          theme === "dark" ? "border-gray-800" : "border-slate-200"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16 text-center">
            <div>
              <div
                className={`text-5xl md:text-6xl font-bold mb-3 ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`}
              >
                100%
              </div>
              <div
                className={`text-lg font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Automated Tracking
              </div>
              <p
                className={`text-sm mt-2 ${
                  theme === "dark" ? "text-gray-500" : "text-slate-500"
                }`}
              >
                Zero manual entry required
              </p>
            </div>
            <div>
              <div
                className={`text-5xl md:text-6xl font-bold mb-3 ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`}
              >
                Universal
              </div>
              <div
                className={`text-lg font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Works Everywhere
              </div>
              <p
                className={`text-sm mt-2 ${
                  theme === "dark" ? "text-gray-500" : "text-slate-500"
                }`}
              >
                Any college, any course
              </p>
            </div>
            <div>
              <div
                className={`text-5xl md:text-6xl font-bold mb-3 ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`}
              >
                Real-time
              </div>
              <div
                className={`text-lg font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Instant Updates
              </div>
              <p
                className={`text-sm mt-2 ${
                  theme === "dark" ? "text-gray-500" : "text-slate-500"
                }`}
              >
                Always synchronized
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for the Students
            </h2>
          </div>
          <div
            className={`space-y-6 text-lg leading-relaxed ${
              theme === "dark" ? "text-gray-400" : "text-slate-600"
            }`}
          >
            <p className="text-center">
              Anchor integrates seamlessly with your college management system
              to automate assignment tracking, monitor attendance, and provide
              actionable insights to optimize your academic performance.
            </p>
            <p className="text-center">
              Stop juggling multiple platforms and spreadsheets. Centralize your
              entire academic life in one intuitive, powerful interface that
              works the way you do.
            </p>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div
                className={`text-3xl font-bold mb-2 ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`}
              >
                Smart
              </div>
              <p
                className={
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }
              >
                Intelligent automation that learns your patterns
              </p>
            </div>
            <div className="p-6">
              <div
                className={`text-3xl font-bold mb-2 ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`}
              >
                Simple
              </div>
              <p
                className={
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }
              >
                Clean interface, zero learning curve
              </p>
            </div>
            <div className="p-6">
              <div
                className={`text-3xl font-bold mb-2 ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`}
              >
                Secure
              </div>
              <p
                className={
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }
              >
                Your data stays private and protected
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-4 px-6 lg:px-8 border-t ${
          theme === "dark" ? "border-gray-800" : "border-slate-200"
        }`}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className={theme === "dark" ? "text-gray-400" : "text-slate-600"}>
            © 2025 Anchor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
