"use client";

import React, { useState } from 'react';
import { Calendar, Bell, BarChart3, BookOpen, CheckCircle, Users, Moon, Sun, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Assignment Tracker",
      description: "Automatically sync with Moodle to track all assignments, deadlines, and submission status in one centralized dashboard."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Notifications",
      description: "Never miss a deadline with intelligent alerts for new assignments and upcoming due dates delivered in real-time."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Attendance Monitor",
      description: "Track attendance thresholds intelligently and receive warnings before falling below minimum requirements."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Productivity Insights",
      description: "Comprehensive analytics on academic performance with detailed workload patterns and completion trends."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Centralized Hub",
      description: "Access all assignment files, requirements, and submission details instantly without switching platforms."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaboration Tools",
      description: "Manage group projects efficiently, share resources with peers, and track team progress seamlessly."
    }
  ];

  const benefits = [
    { icon: <Zap className="w-5 h-5" />, text: "Lightning fast sync" },
    { icon: <Shield className="w-5 h-5" />, text: "Secure & private" },
    { icon: <Sparkles className="w-5 h-5" />, text: "Always up to date" }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>
      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-50 backdrop-blur-xl border-b ${theme === 'dark' ? 'bg-black/80 border-gray-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-8xl mx-auto px-6 lg:px-20 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-600'}`}>
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold">Anchor</span>
            </div>
            <div className="flex items-center space-x-8">
              <a href="#features" className={`hidden md:block text-sm font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-purple-400' : 'text-slate-700 hover:text-purple-600'}`}>
                Features
              </a>
              <a href="#about" className={`hidden md:block text-sm font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-purple-400' : 'text-slate-700 hover:text-purple-600'}`}>
                About
              </a>
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-lg ${theme === 'dark' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-slate-100 hover:bg-slate-200'}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
              <span className={`block ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>Academic Journey</span>
            </h1>
            <p className={`text-xl md:text-2xl mb-10 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
              Unified assignment tracking, attendance monitoring, and productivity insights. 
              <span className="block mt-2">Minimize effort, maximize success.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className={`group px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2 shadow-lg shadow-purple-500/25 ${theme === 'dark' ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className={`px-8 py-4 rounded-xl font-semibold text-lg ${theme === 'dark' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-slate-100 hover:bg-slate-200'}`}>
                View Demo
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {benefits.map((benefit, i) => (
                <div key={i} className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                  <div className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>{benefit.icon}</div>
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-24 px-6 lg:px-8 ${theme === 'dark' ? 'bg-gray-950/50' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
              Comprehensive tools designed for modern student life
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl border hover:shadow-xl hover:shadow-purple-500/10 transition-all ${theme === 'dark' ? 'bg-gray-950 border-gray-800 hover:border-purple-700' : 'bg-white border-slate-200 hover:border-purple-300'}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${theme === 'dark' ? 'bg-purple-950/50 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {feature.title}
                </h3>
                <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-24 px-6 lg:px-8 border-y ${theme === 'dark' ? 'border-gray-800' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16 text-center">
            <div>
              <div className={`text-5xl md:text-6xl font-bold mb-3 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>100%</div>
              <div className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>Automated Tracking</div>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>Zero manual entry required</p>
            </div>
            <div>
              <div className={`text-5xl md:text-6xl font-bold mb-3 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>Universal</div>
              <div className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>Works Everywhere</div>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>Any college, any course</p>
            </div>
            <div>
              <div className={`text-5xl md:text-6xl font-bold mb-3 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>Real-time</div>
              <div className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>Instant Updates</div>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>Always synchronized</p>
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
          <div className={`space-y-6 text-lg leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
            <p className="text-center">
              Anchor integrates seamlessly with your college management system to automate assignment tracking, 
              monitor attendance, and provide actionable insights to optimize your academic performance.
            </p>
            <p className="text-center">
              Stop juggling multiple platforms and spreadsheets. Centralize your entire academic life in one intuitive, 
              powerful interface that works the way you do.
            </p>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>Smart</div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}>Intelligent automation that learns your patterns</p>
            </div>
            <div className="p-6">
              <div className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>Simple</div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}>Clean interface, zero learning curve</p>
            </div>
            <div className="p-6">
              <div className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>Secure</div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}>Your data stays private and protected</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 px-6 lg:px-8 ${theme === 'dark' ? 'bg-gray-950/50' : 'bg-slate-50'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Student Life?
          </h2>
          <p className={`text-xl mb-10 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
            Join students who are already optimizing their academic journey with intelligent automation
          </p>
          <button className={`group px-10 py-5 rounded-xl font-semibold text-lg flex items-center space-x-2 mx-auto shadow-lg shadow-purple-500/25 ${theme === 'dark' ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
            <span>Get Started Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 lg:px-8 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}>
            © 2025 Anchor. Empowering students everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}