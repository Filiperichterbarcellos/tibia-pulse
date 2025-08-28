import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "TibiaPulse",
  description: "GuildStats reimaginado — ferramentas para jogadores de Tibia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // use apenas classes estáticas aqui para evitar inconsistência de hidratação
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-neutral-50 text-neutral-900">
        <Navbar />
        <main className="min-h-dvh">{children}</main>
      </body>
    </html>
  );
}
