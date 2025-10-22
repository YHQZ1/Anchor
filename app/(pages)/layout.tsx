"use client";

import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider, SidebarLayout } from "@/components/Sidebar";
import { usePathname, useRouter } from "next/navigation";

export default function PagesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  const publicPaths = ["/auth", "/unauthorized", "/onboarding"];

  const isPublicPath = publicPaths.some((path) => pathname?.startsWith(path));

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("jwtToken");

      console.log("Auth Check:", { pathname, token, isPublicPath });

      // If no token and trying to access protected path → redirect to auth
      if (!token && !isPublicPath) {
        console.log("No token, redirecting to auth");
        router.replace("/unauthorized");
        return;
      }

      // If has token, check onboarding status from DATABASE
      if (token) {
        try {
          // Check database for onboarding status
          const response = await fetch('/api/onboarding', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const dbData = await response.json();
            
            console.log("Onboarding status:", dbData.onboarding_completed);
            
            // 🔥 GENERIC PROTECTION: If NOT onboarded and trying to access ANY protected page → redirect to onboarding
            if (!dbData.onboarding_completed && !isPublicPath) {
              console.log("Not onboarded, redirecting from protected page to onboarding");
              router.replace("/onboarding");
              return;
            }

            // If user has completed onboarding but is on onboarding page → redirect to dashboard
            if (dbData.onboarding_completed && pathname?.startsWith("/onboarding")) {
              console.log("Already onboarded, redirecting from onboarding to dashboard");
              router.replace("/dashboard");
              return;
            }

            // If user is on auth/landing but has token, redirect to appropriate page
            if ((pathname?.startsWith("/auth") || pathname === "/") && dbData.onboarding_completed) {
              router.replace("/dashboard");
              return;
            }
            if ((pathname?.startsWith("/auth") || pathname === "/") && !dbData.onboarding_completed) {
              router.replace("/onboarding");
              return;
            }
          }
        } catch (error) {
          console.error("Database onboarding check failed:", error);
        }
      }

      // Mark auth as checked
      setAuthChecked(true);
    };

    // Small delay to ensure router is ready
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [pathname, router, isPublicPath]);

  // Show loading until auth check completes
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const hideSidebar = isPublicPath;

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