"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { signIn } from "next-auth/react";

type AuthMode = "signup" | "signin";
type AlertType = "success" | "error";

type ShapeType = "square" | "circle" | "triangle" | "line";

interface Shape {
  x: number;
  y: number;
  size: number;
  rotate: number;
  type: ShapeType;
  floatX: number;
  floatY: number;
  rotateDeg: number;
  duration: number;
}

interface InputProps {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  theme: "light" | "dark";
}

export default function Auth() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get("mode") as AuthMode;
  const [authMode, setAuthMode] = useState<AuthMode>(
    initialMode === "signin" ? "signin" : "signup"
  );

  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const [alert, setAlert] = useState<{
    type: AlertType;
    title: string;
    description: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const numberOfShapes = 20;
  const shapeColor = theme === "dark" ? "bg-white/20" : "bg-black/20";

  const [shapes, setShapes] = useState<Shape[]>([]);

  useEffect(() => {
    setMounted(true);

    const newShapes: Shape[] = Array.from({ length: numberOfShapes }).map(
      () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 80 + 30,
        rotate: Math.random() * 360,
        type: ["square", "circle", "triangle", "line"][
          Math.floor(Math.random() * 4)
        ] as ShapeType,
        floatX: (Math.random() - 0.5) * 100,
        floatY: (Math.random() - 0.5) * 100,
        rotateDeg: (Math.random() - 0.5) * 180,
        duration: Math.random() * 4 + 3,
      })
    );

    setShapes(newShapes);
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

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

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (signUpData.password !== signUpData.confirmPassword) {
      setAlert({
        type: "error",
        title: "Passwords do not match",
        description: "Please make sure both passwords are identical.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signUpData.username,
          email: signUpData.email,
          password: signUpData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store JWT token in localStorage
        localStorage.setItem("jwtToken", data.token);

        setAlert({
          type: "success",
          title: "Account created!",
          description: `Welcome, ${signUpData.username}! Your account has been successfully created.`,
        });

        // Redirect to dashboard after successful signup
        setTimeout(() => router.push("/onboarding"), 1000);
      } else {
        setAlert({
          type: "error",
          title: "Signup failed",
          description: data.error || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({
        type: "error",
        title: "Network error",
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signInData.email,
          password: signInData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store JWT token in localStorage (same as React version)
        localStorage.setItem("jwtToken", data.token);

        setAlert({
          type: "success",
          title: "Login successful!",
          description: `Welcome back!`,
        });

        // Redirect based on onboarding status from database
        setTimeout(() => {
          if (data.onboarding_completed) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        }, 1000);
      } else {
        setAlert({
          type: "error",
          title: "Login failed",
          description: data.error || "Invalid credentials.",
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({
        type: "error",
        title: "Network error",
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderShape = (shape: Shape, idx: number) => {
    const baseStyle: React.CSSProperties = {
      top: shape.y,
      left: shape.x,
      position: "absolute",
      opacity: 0.6,
    };

    const commonClasses = `${shapeColor}`;

    if (shape.type === "circle") {
      return (
        <motion.div
          key={idx}
          className={commonClasses}
          style={{
            ...baseStyle,
            width: shape.size,
            height: shape.size,
            borderRadius: "50%",
          }}
          animate={{
            x: [0, shape.floatX, 0],
            y: [0, shape.floatY, 0],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      );
    }

    if (shape.type === "triangle") {
      return (
        <motion.div
          key={idx}
          className={commonClasses}
          style={{
            ...baseStyle,
            width: 0,
            height: 0,
            borderLeft: `${shape.size / 2}px solid transparent`,
            borderRight: `${shape.size / 2}px solid transparent`,
            borderBottom: `${shape.size}px solid ${
              theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"
            }`,
            transform: `rotate(${shape.rotate}deg)`,
            backgroundColor: "transparent",
          }}
          animate={{
            x: [0, shape.floatX, 0],
            y: [0, shape.floatY, 0],
            rotate: [
              shape.rotate,
              shape.rotate + shape.rotateDeg,
              shape.rotate,
            ],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      );
    }

    if (shape.type === "line") {
      return (
        <motion.div
          key={idx}
          className={commonClasses}
          style={{
            ...baseStyle,
            width: shape.size * 1.5,
            height: 3,
            transform: `rotate(${shape.rotate}deg)`,
          }}
          animate={{
            x: [0, shape.floatX, 0],
            y: [0, shape.floatY, 0],
            rotate: [
              shape.rotate,
              shape.rotate + shape.rotateDeg,
              shape.rotate,
            ],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      );
    }

    return (
      <motion.div
        key={idx}
        className={commonClasses}
        style={{
          ...baseStyle,
          width: shape.size,
          height: shape.size,
          transform: `rotate(${shape.rotate}deg)`,
        }}
        animate={{
          x: [0, shape.floatX, 0],
          y: [0, shape.floatY, 0],
          rotate: [shape.rotate, shape.rotate + shape.rotateDeg, shape.rotate],
        }}
        transition={{
          duration: shape.duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
    );
  };

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${
        theme === "dark" ? "bg-black" : "bg-white"
      }`}
    >
      <AnimatePresence>
        {alert && (
          <motion.div
            className="fixed bottom-8 right-8 z-50 w-full max-w-md px-4"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Alert
              variant={alert.type === "success" ? "default" : "destructive"}
              className={`flex items-center gap-3 shadow-lg border-2 ${
                alert.type === "success"
                  ? "border-green-500 text-green-600 dark:border-green-600 dark:text-green-500"
                  : ""
              }`}
            >
              {alert.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <AlertTitle className="mb-1 mt-1">{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {shapes.map((shape, idx) => renderShape(shape, idx))}

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
          >
            <div className="space-y-4">
              {authMode === "signup" && (
                <FormInput
                  label="Username"
                  name="username"
                  value={signUpData.username}
                  onChange={handleSignUpChange}
                  placeholder="Username"
                  theme={theme === "dark" ? "dark" : "light"}
                />
              )}

              <FormInput
                label="Email"
                type="email"
                name="email"
                value={
                  authMode === "signup" ? signUpData.email : signInData.email
                }
                onChange={
                  authMode === "signup"
                    ? handleSignUpChange
                    : handleSignInChange
                }
                placeholder="Email"
                theme={theme === "dark" ? "dark" : "light"}
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
                  authMode === "signup"
                    ? handleSignUpChange
                    : handleSignInChange
                }
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                placeholder="Password"
                theme={theme === "dark" ? "dark" : "light"}
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
                  theme={theme === "dark" ? "dark" : "light"}
                />
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors cursor-pointer duration-200 flex items-center justify-center gap-2 ${
                  theme === "dark"
                    ? "bg-white text-black hover:bg-gray-200 disabled:bg-gray-400"
                    : "bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    {authMode === "signup"
                      ? "Creating Account..."
                      : "Signing In..."}
                  </>
                ) : authMode === "signup" ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="relative flex items-center justify-center mt-6 mb-4">
            <div
              className={`flex-1 border-t ${
                theme === "dark" ? "border-gray-800" : "border-gray-300"
              }`}
            ></div>
            <span
              className={`px-4 text-sm ${
                theme === "dark" ? "text-gray-500" : "text-gray-600"
              }`}
            >
              or continue with
            </span>
            <div
              className={`flex-1 border-t ${
                theme === "dark" ? "border-gray-800" : "border-gray-300"
              }`}
            ></div>
          </div>

          {/* Single centered Google button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className={`flex cursor-pointer items-center justify-center gap-3 py-3 px-6 rounded-lg font-medium transition-all duration-200 border w-full max-w-xs ${
                theme === "dark"
                  ? "bg-gray-1000 border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 hover:shadow-lg"
                  : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
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
              Dont have an account?{" "}
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

const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  theme,
}: InputProps) => (
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
          ? "bg-gray-1000 border-gray-800 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
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
}: InputProps & {
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
}) => (
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
            ? "bg-gray-1000 border-gray-800 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
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
