"use client";

import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider, SidebarLayout } from "@/components/Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Add this import

export default function PagesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession(); // Add session hook
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
        // Check BOTH localStorage AND NextAuth session
        const localToken = localStorage.getItem("jwtToken");
        const sessionToken = session?.yourJWT; // Check NextAuth session
        
        console.log("Auth Debug:", { 
          localToken: !!localToken, 
          sessionToken: !!sessionToken,
          session: session 
        }); // Debug logging

        // User is authenticated if they have EITHER token
        if (!localToken && !sessionToken) {
          setIsAuth(false);
          router.replace("/unauthorized");
        } else {
          setIsAuth(true);
          
          // If we have a session token but no local token, sync them
          if (sessionToken && !localToken) {
            console.log("Syncing JWT from session to localStorage");
            localStorage.setItem("jwtToken", sessionToken);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuth(false);
        router.replace("/unauthorized");
      }
    };

    // Wait for session to load before checking auth
    if (status !== 'loading') {
      const timer = setTimeout(checkAuth, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, hideSidebar, router, session, status]); // Add session and status to dependencies

  // Show loading state while checking auth or session is loading
  if (isAuth === null || status === 'loading') {
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