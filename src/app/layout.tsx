import type { Metadata } from "next";
import { Caveat, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hammarskjold Alumni Directory",
  description: "Alumni directory for Hammarskjold Co-Op at Stanford",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${caveat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
