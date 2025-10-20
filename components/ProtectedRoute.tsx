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
      setIsAuth(false);
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (isAuth === null) return null; // prevents flash

  return <>{children}</>;
}
