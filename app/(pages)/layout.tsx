/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider, SidebarLayout } from "@/components/Sidebar";
import { usePathname, useRouter } from "next/navigation";

let cachedOnboardingStatus: boolean | null = null;

const PUBLIC_PATHS = ["/auth", "/unauthorized", "/onboarding"];

export default function PagesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (!isMounted) return;

      const token = localStorage.getItem("jwtToken");
      const isPublicPath = PUBLIC_PATHS.some((path) =>
        pathname?.startsWith(path)
      );

      if (!token && !isPublicPath) {
        router.replace("/unauthorized");
        return;
      }

      if (token) {
        setIsAuthenticated(true);

        if (cachedOnboardingStatus === true) {
          if (pathname?.startsWith("/onboarding")) {
            router.replace("/dashboard");
            return;
          }
          if (pathname?.startsWith("/auth") || pathname === "/") {
            router.replace("/dashboard");
            return;
          }
          if (isMounted) setIsLoading(false);
          return;
        }

        try {
          const response = await fetch("/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const dbData = await response.json();
            const onboardingCompleted = dbData.profile?.onboarding_completed;
            cachedOnboardingStatus = onboardingCompleted;

            if (onboardingCompleted && pathname?.startsWith("/onboarding")) {
              router.replace("/dashboard");
              return;
            }

            if (!onboardingCompleted && !isPublicPath) {
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
          console.error("Database onboarding check failed:", error);
        }
      }

      if (isMounted) setIsLoading(false);
    };

    setIsLoading(true);
    const timer = setTimeout(checkAuth, 10);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [pathname, router]);

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname?.startsWith(path));
  const hideSidebar = isPublicPath;

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
