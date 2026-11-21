import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { COLLEGE_NAME } from "@/config/college";

export const metadata: Metadata = {
  title: `${COLLEGE_NAME} - Peer-to-Peer Campus Item Lending`,
  description:
    "Borrow and lend cycles, drafters, lab coats, cameras, fest equipment and electronics from verified students on your campus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-brand-100 selection:text-brand-900">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

