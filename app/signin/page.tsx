"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export default function SignIn() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Generate random triangles
  const triangles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: 40 + Math.random() * 100,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
    duration: 20 + Math.random() * 30,
    delay: Math.random() * 5,
  }));

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      theme === "dark" ? "bg-black text-white" : "bg-white text-slate-900"
    }`}>
      {/* Animated Triangle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {triangles.map((triangle) => (
          <motion.div
            key={triangle.id}
            className="absolute"
            style={{
              left: `${triangle.x}%`,
              top: `${triangle.y}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              rotate: [triangle.rotation, triangle.rotation + 180, triangle.rotation + 360],
            }}
            transition={{
              duration: triangle.duration,
              repeat: Infinity,
              ease: "linear",
              delay: triangle.delay,
            }}
          >
            <svg
              width={triangle.size}
              height={triangle.size}
              viewBox="0 0 100 100"
              className={theme === "dark" ? "opacity-15" : "opacity-20"}
            >
              <polygon
                points="50,10 90,90 10,90"
                fill="none"
                stroke={theme === "dark" ? "#ffffff" : "#000000"}
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        ))}

        {/* Floating thin lines */}
        {Array.from({ length: 0 }).map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className={`absolute h-px ${
              theme === "dark" ? "bg-white/10" : "bg-black/10"
            }`}
            style={{
              width: "200px",
              top: `${10 + i * 12}%`,
              left: "-200px",
            }}
            animate={{
              x: ["0vw", "120vw"],
            }}
            transition={{
              duration: 25 + i * 3,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          />
        ))}

        {/* Small geometric shapes */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`geo-${i}`}
            className={`absolute border ${
              theme === "dark" ? "border-white/10" : "border-black/10"
            }`}
            style={{
              width: "60px",
              height: "60px",
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* Sign In Form */}
      <section className="relative z-10 pt-20 pb-16 px-6 lg:px-8">
        <motion.div 
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
            <p className={`text-lg ${
              theme === "dark" ? "text-gray-400" : "text-slate-600"
            }`}>
              Sign in to continue
            </p>
          </motion.div>

          {/* Form Container with Card Style */}
          <motion.div 
            className={`rounded-2xl p-8 backdrop-blur-sm ${
              theme === "dark" 
                ? "bg-gray-900/90 border border-gray-800 shadow-2xl" 
                : "bg-white/90 border border-slate-200 shadow-2xl"
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="space-y-6">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    theme === "dark"
                      ? "bg-black border-gray-800 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  }`}
                  placeholder="Enter your email"
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      theme === "dark"
                        ? "bg-black border-gray-800 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      theme === "dark"
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className={`w-4 h-4 rounded focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-purple-500"
                        : "bg-white border-slate-300 text-purple-600"
                    }`}
                  />
                  <label
                    htmlFor="rememberMe"
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-slate-600"
                    }`}
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#forgot-password"
                  className="text-sm text-purple-500 hover:text-purple-600 font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                onClick={handleSubmit}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            <p className={theme === "dark" ? "text-gray-400" : "text-slate-600"}>
              Don`t have an account?{" "}
              <a
                href="/signup"
                className="text-purple-500 hover:text-purple-600 font-semibold transition-colors"
              >
                Sign Up
              </a>
            </p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}