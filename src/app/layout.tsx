import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Choose Easy",
  description: "Advanced Career Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} dark antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body suppressHydrationWarning className="bg-surface text-on-surface font-body-md overflow-x-hidden min-h-screen flex flex-col">
        <SessionProviderWrapper>
          <ToastProvider>
            <Navbar />
            <main className="flex-grow flex flex-col items-center pt-32 w-full">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
