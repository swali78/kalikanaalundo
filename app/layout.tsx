import "./globals.css";
import type { Metadata } from "next";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
