"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

type AuthMode = "signup" | "signin";

export default function UnifiedAuth() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") as AuthMode;
  const [authMode, setAuthMode] = useState<AuthMode>(
    initialMode === "signin" ? "signin" : "signup"
  );

  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const numberOfShapes = 50;
  const shapeColor = theme === "dark" ? "bg-white/10" : "bg-black/10";
  const randomFloat = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  const [shapes, setShapes] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);

    // Generate shapes after mounting
    const newShapes = Array.from({ length: numberOfShapes }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 60 + 20,
      rotate: Math.random() * 360,
      type: ["square", "line", "triangle"][Math.floor(Math.random() * 3)],
    }));

    setShapes(newShapes);
  }, []);

  if (!mounted) return null;

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === "signup" ? "signin" : "signup"));
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign Up Data:", signUpData);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign In Data:", signInData);
  };

  // Floating motion variants (randomized)
  const floatVariants = {
    animate: () => ({
      x: randomFloat(-100, 100),
      y: randomFloat(-100, 100),
      rotate: randomFloat(-180, 180),
      transition: {
        duration: randomFloat(15, 25),
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    }),
  };

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${
        theme === "dark" ? "bg-black" : "bg-white"
      }`}
    >
      {/* Minimalist floating shapes */}
      {shapes.map((shape, idx) => {
        const style: React.CSSProperties = {
          top: shape.y,
          left: shape.x,
          width: shape.type === "line" ? shape.size * 1.5 : shape.size,
          height: shape.type === "line" ? 3 : shape.size,
          transform: `rotate(${shape.rotate}deg)`,
          position: "absolute",
          opacity: 0.6,
        };

        return (
          <motion.div
            key={idx}
            className={`${shapeColor} ${
              shape.type === "triangle" ? "clip-triangle" : ""
            } border-solid`}
            style={style}
            variants={floatVariants}
            animate="animate"
          />
        );
      })}

      {/* Auth Card */}
      <Card
        className={`relative w-full max-w-md z-10 ${
          theme === "dark" ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <CardHeader>
          <CardTitle>
            {authMode === "signup" ? "Create Account" : "Sign In"}
          </CardTitle>
          <CardDescription>
            {authMode === "signup"
              ? "Enter your details to create your account."
              : "Enter your credentials to sign in."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={
              authMode === "signup" ? handleSignUpSubmit : handleSignInSubmit
            }
            className="space-y-4"
          >
            {authMode === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="First Name"
                  name="firstName"
                  value={signUpData.firstName}
                  onChange={handleSignUpChange}
                  placeholder="John"
                  theme={theme}
                />
                <FormInput
                  label="Last Name"
                  name="lastName"
                  value={signUpData.lastName}
                  onChange={handleSignUpChange}
                  placeholder="Doe"
                  theme={theme}
                />
              </div>
            )}

            <FormInput
              label="Email"
              type="email"
              name="email"
              value={
                authMode === "signup" ? signUpData.email : signInData.email
              }
              onChange={
                authMode === "signup" ? handleSignUpChange : handleSignInChange
              }
              placeholder="you@example.com"
              theme={theme}
            />

            <PasswordInput
              label="Password"
              name="password"
              value={
                authMode === "signup"
                  ? signUpData.password
                  : signInData.password
              }
              onChange={
                authMode === "signup" ? handleSignUpChange : handleSignInChange
              }
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              placeholder="Password"
              theme={theme}
            />

            {authMode === "signup" && (
              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                value={signUpData.confirmPassword}
                onChange={handleSignUpChange}
                showPassword={showConfirmPassword}
                setShowPassword={setShowConfirmPassword}
                placeholder="Confirm Password"
                theme={theme}
              />
            )}

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors cursor-pointer duration-200 ${
                theme === "dark"
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {authMode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          {authMode === "signup" ? (
            <p>
              Already have an account?{" "}
              <button
                onClick={toggleAuthMode}
                className="underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button
                onClick={toggleAuthMode}
                className="underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// Reusable Inputs
const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  theme,
}: any) => (
  <div>
    <label
      className={`block text-sm font-medium mb-1 ${
        theme === "dark" ? "text-gray-300" : "text-gray-700"
      }`}
    >
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2 rounded-lg transition-all duration-200 border ${
        theme === "dark"
          ? "bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
          : "bg-gray-100 border-gray-300 text-black placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
      }`}
    />
  </div>
);

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  showPassword,
  setShowPassword,
  placeholder,
  theme,
}: any) => (
  <div>
    <label
      className={`block text-sm font-medium mb-1 ${
        theme === "dark" ? "text-gray-300" : "text-gray-700"
      }`}
    >
      {label}
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-lg transition-all duration-200 border ${
          theme === "dark"
            ? "bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
            : "bg-gray-100 border-gray-300 text-black placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
        }`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5 cursor-pointer" />
        ) : (
          <Eye className="w-5 h-5 cursor-pointer" />
        )}
      </button>
    </div>
  </div>
);
