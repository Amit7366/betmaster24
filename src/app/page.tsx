"use client";
import React, { useState } from "react";

import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { LoginModal } from "@/components/modal/LoginModal";
import Hero from "@/components/home/Hero";
import { GamesSection } from "@/components/home/GamesSection";
import { PromotionSection } from "@/components/home/PromotionSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { FAQSection } from "@/components/home/FAQSection";
import LeftSidebar from "@/components/sidebar/leftsidebar";
import ChatPanel from "@/components/sidebar/ChatPanel";
import SignupModal from "@/components/modal/SignupModal";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  return (
    <>
     <Navbar toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} onOpenSignup={() => setIsSignupModalOpen(true)} />
      <div className="flex flex-col sm:flex-row justify-between bg-background">
        {/* Mobile Sidebar (only shown if open) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 sm:hidden bg-black bg-opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          >
            <aside
              className="absolute left-0 top-0 h-full w-64 bg-graybg p-2 shadow-lg animate-slideIn overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // Prevent closing on inner click
            >
              <LeftSidebar />
            </aside>
          </div>
        )}

        {/* Static Sidebar for sm and larger */}
        <aside className="hidden sm:block w-full sm:w-[15%] bg-graybg p-2">
          <LeftSidebar />
        </aside>
        <main className="w-full sm:w-[70%]">
          <Hero />
          {/*<GamesSection />
      <PromotionSection />
      <ServicesSection />
      <FAQSection />
      <Footer />
      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
      <RegisterModal open={showRegister} onOpenChange={setShowRegister} /> */}
        </main>
        <aside className="hidden sm:block w-full sm:w-[15%] p-2">
          <ChatPanel />
        </aside>
      </div>
      <SignupModal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)} />
    </>
  );
}
