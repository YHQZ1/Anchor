/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          router.push("/auth?error=oauth_failed");
          return;
        }

        if (session?.user) {
          await checkUserInDatabase(session.user);
        } else {
          router.push("/auth");
        }
      } catch (error) {
        router.push("/auth?error=unknown");
      }
    };

    handleCallback();
  }, [router]);

  const checkUserInDatabase = async (user: any) => {
    try {
      const response = await fetch("/api/auth/oauth-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar: user.user_metadata?.avatar_url,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("jwtToken", data.token);
        
        if (data.profile.onboarding_completed) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } else {
        router.push("/auth?error=database");
      }
    } catch (error) {
      router.push("/auth?error=database");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="text-foreground">Completing Google sign in...</p>
      </div>
    </div>
  );
}