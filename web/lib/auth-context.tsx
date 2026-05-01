"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export interface User {
  id: string;
  uid: string; // e.g. "WU-20260429-xxxx"
  email: string;
  name: string;
  avatar?: string;
}

export interface ProductContext {
  id: string;
  userId: string;
  name: string;
  url?: string;
  oneLiner: string;
  description: string;
  category: string;
  stage: string;
  targetAudience: string;
  targetRegions: string[];
  competitors: string[];
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  productContext: ProductContext | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setProductContext: (ctx: ProductContext) => void;
  deleteProductContext: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function getSupabaseClient() {
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}

function generateUid(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WU-${y}${m}${d}-${rand}`;
}

function mapProductContext(row: Record<string, unknown>): ProductContext {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    url: (row.url as string) || undefined,
    oneLiner: row.one_liner as string,
    description: (row.description as string) ?? "",
    category: row.category as string,
    stage: (row.stage as string) ?? "",
    targetAudience: (row.target_audience as string) ?? "",
    targetRegions: (row.target_regions as string[]) ?? [],
    competitors: (row.competitors as string[]) ?? [],
    language: (row.language as string) ?? "en",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

const LS_USER_KEY = "welike_user";
const LS_CTX_KEY = "welike_product_context";

function localStorageAuth() {
  const getUser = (): User | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(LS_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  };

  const getProductContext = (): ProductContext | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(LS_CTX_KEY);
    return raw ? JSON.parse(raw) : null;
  };

  const saveUser = (u: User) =>
    localStorage.setItem(LS_USER_KEY, JSON.stringify(u));
  const saveProductContext = (ctx: ProductContext) =>
    localStorage.setItem(LS_CTX_KEY, JSON.stringify(ctx));
  const clear = () => {
    localStorage.removeItem(LS_USER_KEY);
    localStorage.removeItem(LS_CTX_KEY);
  };

  return { getUser, getProductContext, saveUser, saveProductContext, clear };
}

function buildUserFromSession(session: any): User {
  return {
    id: session.user.id,
    uid:
      session.user.user_metadata?.uid ??
      `WU-${session.user.id.substring(0, 8).toUpperCase()}`,
    email: session.user.email ?? "",
    name:
      session.user.user_metadata?.full_name ??
      session.user.user_metadata?.name ??
      session.user.email?.split("@")[0] ??
      "",
    avatar: session.user.user_metadata?.avatar_url,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    productContext: null,
    isLoading: true,
  });

  const useSupabase = isSupabaseConfigured();

  // Initialize
  useEffect(() => {
    const ls = localStorageAuth();
    const localUser = ls.getUser();
    const localCtx = ls.getProductContext();

    if (localUser) {
      setState({ user: localUser, productContext: localCtx, isLoading: false });
    }

    if (!useSupabase) {
      if (!localUser) {
        setState({ user: null, productContext: null, isLoading: false });
      }
      return;
    }

    let cancelled = false;

    const init = async () => {
      try {
        const supabase = await getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (cancelled) return;

        if (session?.user) {
          const user = buildUserFromSession(session);
          ls.saveUser(user);

          // Get latest product context via API route (bypasses RLS with service role key)
          // Fall back to localStorage if the API call fails
          let productContext = localCtx;
          try {
            const res = await fetch(`/api/product-context?userId=${user.id}`);
            if (res.ok) {
              const { data } = await res.json();
              if (data) {
                productContext = mapProductContext(data);
                ls.saveProductContext(productContext);
              }
            }
          } catch (err) {
            console.warn("API product-context read error (using local data):", err);
          }



          if (cancelled) return;
          setState({ user, productContext, isLoading: false });
        } else if (!localUser) {
          setState({ user: null, productContext: null, isLoading: false });
        }
      } catch (err) {
        console.warn("Supabase init error:", err);
        if (!localUser) {
          setState({ user: null, productContext: null, isLoading: false });
        }
      }
    };

    init();

    let subscription: { unsubscribe: () => void } | null = null;
    getSupabaseClient().then((supabase) => {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (cancelled) return;

          if (event === "SIGNED_IN" && session?.user) {
            const user = buildUserFromSession(session);
            ls.saveUser(user);

            // Fetch product context via API route (bypasses RLS)
            let productContext = ls.getProductContext();
            try {
              const res = await fetch(`/api/product-context?userId=${user.id}`);
              if (res.ok) {
                const { data } = await res.json();
                if (data) {
                  productContext = mapProductContext(data);
                  ls.saveProductContext(productContext);
                }
              }
            } catch (err) {
              console.warn("API read error (SIGNED_IN):", err);
            }

            setState({ user, productContext, isLoading: false });


          } else if (event === "SIGNED_OUT") {
            // Clear user data but keep product context in localStorage
            localStorage.removeItem(LS_USER_KEY);
            localStorage.removeItem("welike-supabase-auth");
            setState({ user: null, productContext: null, isLoading: false });

          }
        }
      );
      subscription = sub;
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [useSupabase]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (useSupabase) {
        // Use fetch API directly to avoid Supabase JS client lock contention
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const res = await fetch(
          `${supabaseUrl}/auth/v1/token?grant_type=password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseAnonKey,
            },
            body: JSON.stringify({ email, password }),
          }
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error_description || err.msg || "Login failed");
        }

        const data = await res.json();

        // Store session in localStorage for the Supabase client to pick up
        const session = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          expires_in: data.expires_in,
          token_type: data.token_type,
          user: data.user,
        };
        localStorage.setItem("welike-supabase-auth", JSON.stringify(session));

        // Build user and set state immediately — don't wait for setSession
        const user = buildUserFromSession(session);
        localStorageAuth().saveUser(user);
        // Also restore product context from localStorage so it shows up immediately
        const savedCtx = localStorageAuth().getProductContext();
        setState((s) => ({ ...s, user, productContext: savedCtx, isLoading: false }));


        // Set session on Supabase client in the background (don't await)
        getSupabaseClient().then((supabase) => {
          supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          }).catch((err) => {
            console.warn("Failed to set Supabase session:", err);
          });
        });

        // Fetch product context from API route (bypasses RLS) in the background
        // This ensures cross-device data is loaded
        fetch(`/api/product-context?userId=${user.id}`)
          .then((res) => res.ok ? res.json() : null)
          .then((result) => {
            if (result?.data) {
              const ctx = mapProductContext(result.data);
              localStorageAuth().saveProductContext(ctx);
              setState((s) => ({ ...s, productContext: ctx }));
            }
          })
          .catch((err) => {
            console.warn("Failed to fetch product context after login:", err);
          });



      } else {

        const ls = localStorageAuth();
        const user: User = {
          id: crypto.randomUUID(),
          uid: generateUid(),
          email,
          name: email.split("@")[0],
        };
        ls.saveUser(user);
        setState((s) => ({ ...s, user }));
      }
    },
    [useSupabase]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      if (useSupabase) {
        const uid = generateUid();
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, uid } },
        });
        if (error) throw new Error(error.message);

        // Immediately set user state so the user doesn't have to wait
        // for the email confirmation flow
        if (data?.user) {
          const user: User = {
            id: data.user.id,
            uid: uid,
            email: email,
            name: name,
          };
          localStorageAuth().saveUser(user);
          setState((s) => ({ ...s, user, isLoading: false }));
        }
      } else {
        const ls = localStorageAuth();
        const user: User = {
          id: crypto.randomUUID(),
          uid: generateUid(),
          email,
          name,
        };
        ls.saveUser(user);
        setState((s) => ({ ...s, user }));
      }
    },
    [useSupabase]
  );

  const loginWithGoogle = useCallback(async () => {
    if (useSupabase) {
      const supabase = await getSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw new Error(error.message);
    } else {
      alert("Google login requires Supabase configuration.");
    }
  }, [useSupabase]);

  const logout = useCallback(async () => {
    // Clear user data but KEEP product context in localStorage
    // so it's available after re-login (until Supabase RLS is fixed)
    localStorage.removeItem(LS_USER_KEY);
    localStorage.removeItem("welike-supabase-auth");
    setState({ user: null, productContext: null, isLoading: false });

    if (useSupabase) {
      getSupabaseClient().then((supabase) => {
        supabase.auth.signOut().catch((err) => {
          console.warn("Supabase signOut error:", err);
        });
      });
    }
  }, [useSupabase]);


  const setProductContext = useCallback(
    (ctx: ProductContext) => {
      // Save to localStorage (always keep latest)
      localStorageAuth().saveProductContext(ctx);
      setState((s) => ({ ...s, productContext: ctx }));

      // Save to Supabase via API route (uses service role key, bypasses RLS)
      // This ensures the data is available across devices
      if (useSupabase && state.user) {
        fetch("/api/product-context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: state.user!.id,
            name: ctx.name,
            url: ctx.url,
            oneLiner: ctx.oneLiner,
            description: ctx.description,
            category: ctx.category,
            stage: ctx.stage,
            targetAudience: ctx.targetAudience,
            targetRegions: ctx.targetRegions,
            competitors: ctx.competitors,
            language: ctx.language,
          }),
        }).catch((err) => {
          console.warn("API route save failed:", err);
        });
      }
    },
    [useSupabase, state.user]
  );

  const deleteProductContext = useCallback(async () => {

    localStorage.removeItem(LS_CTX_KEY);
    if (useSupabase && state.user) {
      const supabase = await getSupabaseClient();
      await supabase.from("product_contexts").delete().eq("user_id", state.user.id);
    }
    setState((s) => ({ ...s, productContext: null }));
  }, [useSupabase, state.user]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        loginWithGoogle,
        logout,
        setProductContext,
        deleteProductContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
