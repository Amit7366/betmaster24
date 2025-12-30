"use client";

import BottomNav from "@/components/shared/BottomNav";
import Sidebar from "@/components/shared/Sidebar";
import SocialFloatingBar from "@/components/shared/SocialFloatingBar";
import TopNav from "@/components/shared/TopNav";
import { SidebarProvider } from "@/context/SidebarNewContext";
import { useAuth } from "@/redux/hook/useAuth";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import PromoModals from "@/components/modal/PromoModals";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // prevent mismatch during hydration
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-w-[450px] mx-auto">
      <SidebarProvider>
        {/* <Toaster /> */}
        <div className="bg-primary relative">
          <TopNav />
          <Sidebar />
          <main
            className={`pb-20 ${
              isAuthenticated ? "pt-8" : "pb-16"
            } min-h-screen`}
          >
            {children}
          </main>
          <BottomNav />
          <SocialFloatingBar />
          <PromoModals/>
        </div>
      </SidebarProvider>
    </div>
  );
}
