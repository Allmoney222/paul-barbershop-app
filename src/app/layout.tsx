import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthRedirectHandler } from "@/components/auth-redirect-handler";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "2Gether Hair Studio | Buffalo, NY",
  description:
    "Where beauty, style, and community come together. Book your appointment with 2Gether Hair Studio in Buffalo, NY.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased font-sans">
        <AuthRedirectHandler />
        {children}
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
