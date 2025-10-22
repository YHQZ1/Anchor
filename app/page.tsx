"use client";

import React, { useState, useEffect } from "react";
import { Zap, Shield, Sparkles } from "lucide-react";
import Header from "@/components/Header";

export default function Landing() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const benefits = [
    { icon: <Zap className="w-5 h-5" />, text: "Lightning fast sync" },
    { icon: <Shield className="w-5 h-5" />, text: "Secure & private" },
    { icon: <Sparkles className="w-5 h-5" />, text: "Always up to date" },
  ];

  const stats = [
    { 
      value: "100%", 
      title: "Automated Tracking", 
      description: "Zero manual entry required" 
    },
    { 
      value: "Universal", 
      title: "Works Everywhere", 
      description: "Any college, any course" 
    },
    { 
      value: "Real-time", 
      title: "Instant Updates", 
      description: "Always synchronized" 
    },
  ];

  const features = [
    { 
      title: "Smart", 
      description: "Intelligent automation that learns your patterns" 
    },
    { 
      title: "Simple", 
      description: "Clean interface, zero learning curve" 
    },
    { 
      title: "Secure", 
      description: "Your data stays private and protected" 
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Master Your
              <span className="block text-purple-600 dark:text-purple-400">
                Academic Journey
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 leading-relaxed text-muted-foreground">
              Unified assignment tracking, attendance monitoring, and
              productivity insights.
              <span className="block mt-2">
                Minimize effort, maximize success.
              </span>
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-muted-foreground"
                >
                  <div className="text-purple-600 dark:text-purple-400">
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
      <section className="py-24 px-6 lg:px-8 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-5xl md:text-6xl font-bold mb-3 text-purple-600 dark:text-purple-400">
                  {stat.value}
                </div>
                <div className="text-lg font-medium text-muted-foreground">
                  {stat.title}
                </div>
                <p className="text-sm mt-2 text-muted-foreground/70">
                  {stat.description}
                </p>
              </div>
            ))}
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
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground text-center">
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
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            {features.map((feature, index) => (
              <div key={index} className="p-6">
                <div className="text-3xl font-bold mb-2 text-purple-600 dark:text-purple-400">
                  {feature.title}
                </div>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2025 Anchor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}