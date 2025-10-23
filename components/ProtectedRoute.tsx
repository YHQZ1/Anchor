"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    
    if (!token) {
      router.replace("/unauthorized");
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          setIsAuth(true);
        } else {
          localStorage.removeItem("jwtToken");
          router.replace("/unauthorized");
        }
      } catch {
        localStorage.removeItem("jwtToken");
        router.replace("/unauthorized");
      }
    };

    validateToken();
  }, [router]);

  if (isAuth !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Checking authentication...</div>
      </div>
    );
  }

  return <>{children}</>;
}