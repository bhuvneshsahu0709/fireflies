import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import ToastProvider from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Fireflies — Meeting Intelligence",
  description: "AI-powered meeting transcription, summaries, and action items",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="h-full flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        <ToastProvider />
      </body>
    </html>
  );
}
