import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./theme.css";
import { DashboardDataProvider } from "@/lib/dashboard/DashboardDataContext";
import { ToastProvider } from "@/components/dashboard/shared/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "ChatAudit — панель настройки чат-ботов",
  description: "Создание и настройка чат-ботов: внешний вид, база знаний, диалоги, аналитика, лиды.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="dash min-h-full flex flex-col">
        <DashboardDataProvider>
          <ToastProvider>{children}</ToastProvider>
        </DashboardDataProvider>
      </body>
    </html>
  );
}
