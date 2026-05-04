import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AuthProvider } from "@/lib/auth-context";
import { parseLangParam } from "@/lib/i18n";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "WeLike — GTM Workspace for AI Products",
  description: "WeLike is the GTM workspace for AI products. Battle-tested playbooks and tools from 100+ launches. Social listening, KOL pricing, AI news, and more.",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware guarantees the lang cookie is kept in sync; read it here
  // so the <html lang=""> attribute is correct for screen readers / SEO
  const cookieLang = cookies().get('lang')?.value;
  const lang = parseLangParam(cookieLang) ?? 'en';

  return (
    <html lang={lang} className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-surface-950 text-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
