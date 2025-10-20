"use client";

import React, { useState, useEffect } from "react";
import { Zap, Shield, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import Header from "../components/Header";

export default function Landing() {
  const { theme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

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
      <Header />

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
