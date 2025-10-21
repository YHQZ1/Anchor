"use client";

import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider, SidebarLayout } from "@/components/Sidebar";
import { usePathname, useRouter } from "next/navigation";

export default function PagesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  const hideSidebar = 
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/unauthorized");

  useEffect(() => {
    // Check if we're on a page that doesn't require auth
    if (hideSidebar) {
      setIsAuth(true);
      return;
    }

    const checkAuth = () => {
      try {
        const token = localStorage.getItem("jwtToken");
        
        if (!token) {
          setIsAuth(false);
          // Use the correct path including /pages
          router.replace("/unauthorized");
        } else {
          setIsAuth(true);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // If localStorage access fails (SSR), treat as unauthorized
        setIsAuth(false);
        router.replace("/unauthorized");
      }
    };

    // Small delay to ensure we're on client side
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [pathname, hideSidebar, router]);

  // Show loading state while checking auth
  if (isAuth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Don't render layout if not authenticated (redirect will happen)
  if (isAuth === false) {
    return null;
  }

  return (
    <SidebarProvider>
      {hideSidebar ? (
        <>{children}</>
      ) : (
        <SidebarLayout>{children}</SidebarLayout>
      )}
    </SidebarProvider>
  );
}