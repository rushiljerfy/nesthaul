import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NestHaul",
  description: "Build a move-in shopping plan without blowing your budget."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
