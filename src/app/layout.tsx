import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BetMaster24",
  description: "The online Gaming Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background overflow-auto hide-scrollbar">
        <Toaster/>
        <Providers>{children}</Providers>
        {/* {children} */}
      </body>
    </html>
  );
}
