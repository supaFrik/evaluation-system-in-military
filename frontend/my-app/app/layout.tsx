import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hệ thống Quản lý và Theo dõi Thi đua Quân nhân trong Trung đội",
  description: "Phần mềm quản lý, theo dõi và đánh giá thi đua quyết thắng",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden max-w-full`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 overflow-x-hidden max-w-full">
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
