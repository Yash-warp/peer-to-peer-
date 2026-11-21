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
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen bg-[#060911] text-slate-100 bg-ambient-glow antialiased selection:bg-cyan-500/25 selection:text-cyan-200">
        <Navbar />
        <main className="flex-1 flex flex-col relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
