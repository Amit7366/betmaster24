"use client";
import SignupModal from "@/components/modal/SignupModal";
import BottomNav from "@/components/shared/BottomNav";
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
  return <div className="bg-primary min-h-screen">{children}</div>;
}
