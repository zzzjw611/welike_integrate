"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "redirecting" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        const supabase = getSupabase();

        // Check for code in URL params (PKCE flow — used by Supabase)
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Auth callback error:", error.message);
            if (!cancelled) {
              setStatus("error");
              setErrorMsg(error.message);
            }
            return;
          }
        }

        // Check for hash fragment (implicit flow fallback)
        const hash = window.location.hash;
        if (hash) {
          const { data, error } = await supabase.auth.getSession();
          if (error || !data.session) {
            console.error("Auth callback error:", error?.message);
            if (!cancelled) {
              setStatus("error");
              setErrorMsg(error?.message || "No session found");
            }
            return;
          }
        }

        // If we got here without code or hash, check if session already exists
        if (!code && !hash) {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            if (!cancelled) {
              setStatus("error");
              setErrorMsg("No authentication code or session found");
            }
            return;
          }
        }

        // Wait a brief moment for the auth state to propagate to listeners
        if (!cancelled) {
          setStatus("redirecting");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!cancelled) {
          router.replace("/workspace");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(err instanceof Error ? err.message : "Authentication failed");
        }
      }
    };

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid">
      <div className="text-center">
        {status === "processing" && (
          <>
            <div className="h-10 w-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <p className="text-surface-300 text-sm font-medium">Signing you in...</p>
            <p className="text-surface-500 text-xs mt-2">Completing authentication</p>
          </>
        )}
        {status === "redirecting" && (
          <>
            <div className="h-10 w-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <p className="text-surface-300 text-sm font-medium">Almost there!</p>
            <p className="text-surface-500 text-xs mt-2">Redirecting to your workspace</p>
          </>
        )}
        {status === "error" && (
          <div>
            <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <p className="text-surface-300 text-sm font-medium mb-1">Authentication failed</p>
            <p className="text-surface-500 text-xs mb-4">{errorMsg || "Please try again"}</p>
            <button
              onClick={() => router.replace("/login")}
              className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-black hover:bg-brand-400 transition-colors"
            >
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}