"use client";
import SignupModal from "@/components/modal/SignupModal";
import { Navbar } from "@/components/shared/Navbar";
import { SidebarProvider } from "@/context/SidebarContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { useState } from "react";
import { Toaster } from "sonner";





export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  return (
    <SidebarProvider>
      <Toaster />
      <Navbar
        // toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenSignup={() => setIsSignupModalOpen(true)}
      />
      <section
        className="bg-background overflow-auto hide-scrollbar"
      
      >
        {children}
      </section>
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
      />
    </SidebarProvider>
  );
}
