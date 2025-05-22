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

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <Navbar />
      <div className="flex flex-row justify-between items-center">
        <aside className="w-1/5"></aside>
        <main className="w-3/5">
          <Hero />
          {/*<GamesSection />
      <PromotionSection />
      <ServicesSection />
      <FAQSection />
      <Footer />
      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
      <RegisterModal open={showRegister} onOpenChange={setShowRegister} /> */}
        </main>
        <aside className="w-1/5"></aside>
      </div>
    </>
  );
}
