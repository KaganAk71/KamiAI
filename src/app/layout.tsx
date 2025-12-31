import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for a clean, modern look or Outfit
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { ThemeCustomizer } from "@/components/theme-customizer";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KamiAI",
  description: "Private, Local Teachable Machine with IoT Integration",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KamiAI",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        font.className
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeCustomizer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
