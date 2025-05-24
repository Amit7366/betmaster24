"use client";
import React, { useState } from "react";

import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { LoginModal } from "@/components/modal/LoginModal";
import { RegisterModal } from "@/components/modal/RegisterModal";
import Hero from "@/components/home/Hero";
import { GamesSection } from "@/components/home/GamesSection";
import { PromotionSection } from "@/components/home/PromotionSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { FAQSection } from "@/components/home/FAQSection";
import LeftSidebar from "@/components/sidebar/leftsidebar";
import ChatPanel from "@/components/sidebar/ChatPanel";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <Navbar />
      <div className="flex flex-col sm:flex-row justify-between bg-background">
        <aside className="w-full sm:w-[15%] bg-graybg p-2">
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
        <aside className="w-full sm:w-[15%] p-2">
          <ChatPanel/>
        </aside>
      </div>
    </>
  );
}
