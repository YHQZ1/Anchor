"use client";

import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider, SidebarLayout } from "@/components/Sidebar";
import { usePathname, useRouter } from "next/navigation";

// Cache onboarding status globally
let cachedOnboardingStatus: boolean | null = null;

export default function PagesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const publicPaths = ["/auth", "/unauthorized", "/onboarding"];

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (!isMounted) return;

      const token = localStorage.getItem("jwtToken");
      const isPublicPath = publicPaths.some((path) =>
        pathname?.startsWith(path)
      );

      console.log("🔄 Auth Check:", { pathname, token, isPublicPath });

      // If no token and trying to access protected path → redirect to auth
      if (!token && !isPublicPath) {
        console.log("❌ No token, redirecting to unauthorized");
        router.replace("/unauthorized");
        return;
      }

      // If has token, check onboarding status
      if (token) {
        setIsAuthenticated(true);
        // If we already know user is onboarded, skip API call
        if (cachedOnboardingStatus === true) {
          console.log("✅ Using cached onboarding status: true");

          // Handle redirect cases with cached data
          if (pathname?.startsWith("/onboarding")) {
            console.log(
              "🔄 Already onboarded, redirecting from onboarding to dashboard"
            );
            router.replace("/dashboard");
            return;
          }

          if (pathname?.startsWith("/auth") || pathname === "/") {
            router.replace("/dashboard");
            return;
          }

          // Show content immediately
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        try {
          const response = await fetch("/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });

          if (response.ok) {
            const dbData = await response.json();
            const onboardingCompleted = dbData.profile?.onboarding_completed;

            // Cache the onboarding status
            cachedOnboardingStatus = onboardingCompleted;

            console.log("✅ Onboarding status:", onboardingCompleted);

            // Handle all redirect cases
            if (onboardingCompleted && pathname?.startsWith("/onboarding")) {
              console.log(
                "🔄 Already onboarded, redirecting from onboarding to dashboard"
              );
              router.replace("/dashboard");
              return;
            }

            if (!onboardingCompleted && !isPublicPath) {
              console.log(
                "🔄 Not onboarded, redirecting from protected page to onboarding"
              );
              router.replace("/onboarding");
              return;
            }

            if (
              (pathname?.startsWith("/auth") || pathname === "/") &&
              onboardingCompleted
            ) {
              router.replace("/dashboard");
              return;
            }

            if (
              (pathname?.startsWith("/auth") || pathname === "/") &&
              !onboardingCompleted
            ) {
              router.replace("/onboarding");
              return;
            }
          }
        } catch (error) {
          console.error("❌ Database onboarding check failed:", error);
        }
      }

      // If we get here, no redirect is needed - show content
      if (isMounted) {
        console.log("✅ All checks passed, showing content");
        setIsLoading(false);
      }
    };

    setIsLoading(true);

    const timer = setTimeout(checkAuth, 10);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [pathname, router]);

  const isPublicPath = publicPaths.some((path) => pathname?.startsWith(path));
  const hideSidebar = isPublicPath;

  // For public paths, show full loading screen
  if (hideSidebar && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // For protected paths, show sidebar with loading in content area
  // For protected paths, show sidebar with loading in content area
  return (
    <SidebarProvider>
      {hideSidebar ? (
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      ) : (
        <SidebarLayout>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-foreground">Loading page...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </SidebarLayout>
      )}
    </SidebarProvider>
  );
}
