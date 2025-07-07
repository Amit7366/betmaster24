import WelcomeBonusModal from "@/components/modal/WelcomeBonusModal";
import BottomNav from "@/components/shared/BottomNav";
import Sidebar from "@/components/shared/Sidebar";
import SocialFloatingBar from "@/components/shared/SocialFloatingBar";
import TopNav from "@/components/shared/TopNav";
import { SidebarProvider } from "@/context/SidebarNewContext";
import { Toaster } from "sonner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Toaster />
      <div className="bg-primary relative">
        <TopNav />
        <Sidebar />
        <main className="pt-24 pb-20 min-h-screen">{children}</main>
        <BottomNav />
        <SocialFloatingBar />
        <WelcomeBonusModal />
      </div>
    </SidebarProvider>
  );
}
