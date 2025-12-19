import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
import GoBackButton from "@/components/ui/GoBackButton";
import { Hind_Siliguri } from "next/font/google";
import FullScreenLoader from "@/components/shared/FullScreenLoader";
import Script from "next/script";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BetMaster24",
  description: "The online Gaming Platform",
};

const banglaFont = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={banglaFont.className}>
      <head>
        {/* Remove preloader after hydration */}
        <Script id="preloader-controller" strategy="beforeInteractive">
          {`
            window.hideAppPreloader = function () {
              const loader = document.getElementById("app-preloader");
              if (!loader) return;
              loader.style.opacity = "0";
              setTimeout(() => loader.remove(), 300);
            };
          `}
        </Script>
      </head>
      <body className="bg-primary overflow-auto hide-scrollbar">
        {/* FULL APP PRELOADER */}
        <div
          id="app-preloader"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0F2A] transition-opacity duration-300"
        >
          <div className="relative h-[70vh] w-[420px] mx-auto">
            <Image
              src="/preloader.jpg"
              alt="preloader"
              fill
              priority
              className="object-cover"
            />
          </div>
          {/* <div className="flex flex-col items-center gap-4">
           
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />

           
            <p className="text-sm text-white tracking-wide">
              অ্যাপ লোড হচ্ছে...
            </p>
          </div> */}
        </div>
        <Toaster richColors position="top-center" />
        <GoBackButton />
        <Providers>{children}</Providers>
        {/* <FullScreenLoader /> */}
        {/* {children} */}
      </body>
    </html>
  );
}
