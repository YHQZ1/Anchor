"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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

export default function NotFound() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [shapes, setShapes] = useState<Shape[]>([]);

  const numberOfShapes = 30;
  const shapeColor = theme === "dark" ? "bg-white/20" : "bg-black/20";

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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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
      className={`relative min-h-screen flex items-center justify-center overflow-hidden px-6 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-slate-900"
      }`}
    >
      {/* Animated Shapes Background */}
      {shapes.map((shape, idx) => renderShape(shape, idx))}

      {/* Content */}
      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        {/* 404 */}
        <h1 className="text-8xl md:text-9xl font-bold">404</h1>

        {/* Message */}
        <p
          className={`text-lg ${
            theme === "dark" ? "text-gray-400" : "text-slate-600"
          }`}
        >
          Page not found
        </p>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg border font-medium transition-colors ${
            theme === "dark"
              ? "border-white/10 hover:bg-white/5"
              : "border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
          Go Back
        </button>
      </div>
    </div>
  );
}