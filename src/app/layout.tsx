import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expenses AI - Smart Expense Tracker",
  description: "AI-powered expense tracking and financial insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
