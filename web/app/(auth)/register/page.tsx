"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { useLang } from "@/lib/use-lang";
import { Turnstile } from "@marsidev/react-turnstile";

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const lang = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError(lang === 'zh' ? '请完成人机验证。' : "Please complete the verification.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Server-side Turnstile verification
      const verifyRes = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.valid) {
        setError(lang === 'zh' ? '人机验证失败，请重试。' : "Verification failed. Please try again.");
        return;
      }
      await register(name, email, password);
      router.push("/workspace");
    } catch {
      setError(lang === 'zh' ? '注册失败，请重试。' : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-grid">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-surface-400 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {lang === 'zh' ? '返回' : 'Back'}
          </Link>
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="h-10 w-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <span className="text-black font-bold">W</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">
            {lang === 'zh' ? '创建工作空间' : 'Create your workspace'}
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            {lang === 'zh' ? '使用 WeLike 开始发布你的 AI 产品' : 'Start launching your AI product with WeLike'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              {lang === 'zh' ? '你的名字' : 'Your name'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === 'zh' ? '怎么称呼你？' : "Your name"}
              className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 focus-brand transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              {lang === 'zh' ? '工作邮箱' : 'Work email'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 focus-brand transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              {lang === 'zh' ? '密码' : 'Password'}
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={lang === 'zh' ? '至少 8 个字符' : 'At least 8 characters'}
              className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 focus-brand transition-colors"
            />
          </div>

          {/* Turnstile */}
          <div ref={turnstileRef}>
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              options={{
                theme: 'dark',
                language: lang === 'zh' ? 'zh-CN' : 'en',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name || !email || !password || !turnstileToken}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-400 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              lang === 'zh' ? '创建工作空间' : "Create workspace"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface-950 px-3 text-surface-500">
              {lang === 'zh' ? '或继续使用' : 'or continue with'}
            </span>
          </div>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <p className="text-center text-sm text-surface-500 mt-6">
          {lang === 'zh' ? '已有账户？' : "Already have an account?"}{" "}
          <Link href="/login" className="text-brand-500 hover:text-brand-400 font-medium">
            {lang === 'zh' ? '登录' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
