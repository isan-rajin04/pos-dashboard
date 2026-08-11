import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "POS Dashboard",
  description: "Point of Sales Dashboard System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="page-container">
          <Sidebar />
          <main className="main-content">
            <Header />
            <div className="content-area">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
