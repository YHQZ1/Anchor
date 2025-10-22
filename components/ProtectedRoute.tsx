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
      // DON'T set isAuth to false here - just redirect
    } else {
      setIsAuth(true);
    }
  }, [router]);

  // Only return children if isAuth is EXPLICITLY true
  // If isAuth is null or false, return loading or nothing
  if (isAuth !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Checking authentication...</div>
      </div>
    );
  }

  return <>{children}</>;
}