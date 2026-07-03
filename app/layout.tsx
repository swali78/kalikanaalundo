import "./globals.css";
import type { Metadata } from "next";
import { Nunito, Outfit } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "kalikkanaalundo.com — Kerala's Real-Time Sports & Turf Player Network",
  description: "Find nearby players, book turf games, and build local sports communities across Kerala. കളിക്കാനാളട്ടുണ്ടോ? Join the movement today.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${outfit.variable} font-sans`}>
      <body className={nunito.className}>{children}</body>
    </html>
  );
}
