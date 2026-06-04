import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast"

const inter = Inter({subsets: ["latin"]})

export const metadata: Metadata = {
  title: "nakulike - Tafta Mpenzi Wako",
  description: "Modern dating app built with Next.js, Tailwind CSS, and TypeScript. Connect with like-minded individuals or polar opposites and find your perfect match today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en">
      <body
      className={`${inter.className} `}
      >
        {children}
        <Toaster/>
      </body>
    </html>
  );
}
