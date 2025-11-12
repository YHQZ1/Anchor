"use client";

import React from "react";
import { Zap, Shield, Sparkles } from "lucide-react";
import Header from "@/components/Header";

const BENEFITS = [
  {
    icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
    text: "Lightning fast sync",
  },
  {
    icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />,
    text: "Secure & private",
  },
  {
    icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />,
    text: "Always up to date",
  },
];

const STATS = [
  {
    value: "100%",
    title: "Automated Tracking",
    description: "Zero manual entry required",
  },
  {
    value: "Universal",
    title: "Works Everywhere",
    description: "Any college, any course",
  },
  {
    value: "Real-time",
    title: "Instant Updates",
    description: "Always synchronized",
  },
];

const FEATURES = [
  {
    title: "Smart",
    description: "Intelligent automation that learns your patterns",
  },
  {
    title: "Simple",
    description: "Clean interface, zero learning curve",
  },
  {
    title: "Secure",
    description: "Your data stays private and protected",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              Master Your
              <span className="block text-purple-600 dark:text-purple-400 mt-2 sm:mt-3">
                Academic Journey
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 leading-relaxed text-muted-foreground max-w-3xl mx-auto px-4">
              Unified assignment tracking, attendance monitoring, and
              productivity insights.
              <span className="block mt-2 sm:mt-3">
                Minimize effort, maximize success.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-8 sm:mt-12 px-4">
              {BENEFITS.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-muted-foreground bg-card/50 px-4 py-2 rounded-lg border"
                >
                  <div className="text-purple-600 dark:text-purple-400">
                    {benefit.icon}
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16 text-center">
            {STATS.map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 sm:mb-3 text-purple-600 dark:text-purple-400">
                  {stat.value}
                </div>
                <div className="text-base sm:text-lg font-medium text-muted-foreground mb-1">
                  {stat.title}
                </div>
                <p className="text-sm text-muted-foreground/70 max-w-xs">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 tracking-tight">
              Built for the Students
            </h2>
          </div>
          <div className="space-y-4 sm:space-y-6 text-base sm:text-lg leading-relaxed text-muted-foreground text-center max-w-3xl mx-auto">
            <p>
              Anchor integrates seamlessly with your college management system
              to automate assignment tracking, monitor attendance, and provide
              actionable insights to optimize your academic performance.
            </p>
            <p>
              Stop juggling multiple platforms and spreadsheets. Centralize your
              entire academic life in one intuitive, powerful interface that
              works the way you do.
            </p>
          </div>
          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 bg-card/50 rounded-xl border"
              >
                <div className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-purple-600 dark:text-purple-400">
                  {feature.title}
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground text-sm sm:text-base">
            © 2025 Anchor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}