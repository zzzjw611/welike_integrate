"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabase();

        // Check for code in URL params (PKCE flow)
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Auth callback error:", error.message);
            router.replace("/login?error=auth_failed");
            return;
          }
          router.replace("/workspace");
          return;
        }

        // Check for hash fragment (implicit flow fallback)
        const hash = window.location.hash;
        if (hash) {
          // Supabase client auto-detects hash tokens via getSession
          const { data, error } = await supabase.auth.getSession();
          if (error || !data.session) {
            console.error("Auth callback error:", error?.message);
            router.replace("/login?error=auth_failed");
            return;
          }
          router.replace("/workspace");
          return;
        }

        // No code or hash, something went wrong
        router.replace("/login?error=no_code");
      } catch (err) {
        console.error("Auth callback error:", err);
        router.replace("/login?error=auth_failed");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-surface-400 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
