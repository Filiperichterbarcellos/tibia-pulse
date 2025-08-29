// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "TibiaPulse",
  description: "GuildStats reimaginado — ferramentas para jogadores de Tibia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Suprime diferenças de hidratação causadas por extensões/atributos injetados
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-neutral-50 text-neutral-900"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="min-h-dvh">{children}</main>
      </body>
    </html>
  );
}
