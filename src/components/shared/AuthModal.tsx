"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import LoginFormComponent from "../shared/LoginFormComponent";
import RegisterFormContent from "../shared/RegisterFormContent";

// Toast Component
const Toast = ({ message }: { message: string }) => (
  <motion.div
    initial={{ x: 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 100, opacity: 0 }}
    transition={{ type: "spring", stiffness: 350, damping: 25 }}
    className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg font-semibold"
  >
    {message}
  </motion.div>
);

export default function AuthModal({
  isOpen,
  onClose,
  openTab = "login",
}: {
  isOpen: boolean;
  onClose: () => void;
  openTab?: "login" | "register";
}) {
  const [activeTab, setActiveTab] = useState(openTab);
  const [isSubmitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const y = useMotionValue(0);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // TAB SET ON OPEN
  useEffect(() => {
    if (isOpen) setActiveTab(openTab);
  }, [isOpen]);

  // SHOW ERROR TOAST
  const triggerError = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // DRAG TO CLOSE (MOBILE)
  const handleDragEnd = (_: any, info: any) => {
    if (info.velocity.y > 600 || info.offset.y > 180) onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* PARALLAX BACKGROUND  */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, backdropFilter: "blur(14px)" }}
        exit={{ opacity: 0 }}
        onClick={() => !isSubmitting && onClose()}
        className="fixed inset-0 bg-black/70 z-[99998]"
      />

      {/* GOD-MODE AUTH MODAL */}
      <motion.div
        ref={modalRef}
        drag="y"
        style={{ y }}
        dragElastic={0.2}
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        initial={{ y: 80, scale: 0.92, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 80, scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className={`
          fixed mx-auto left-0 right-0 top-[5%] -translate-y-[5%]  
          mobile:bottom-0 mobile:top-auto mobile:translate-y-0
          bg-[#0d1117]/95 border border-white/10 rounded-xl mobile:rounded-t-[28px]
          w-full max-w-md p-8 z-[99999] shadow-[0_0_40px_#00ffc840]
          backdrop-blur-3xl overflow-hidden
        `}
      >
        {/* ✖ Close Button */}
        <button
          disabled={isSubmitting}
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-red-400 transition"
        >
          <X size={26} />
        </button>

        {/* Floating Toast */}
        <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>

        {/* LOGO */}
        <div className="text-center mb-6">
          <img src="/logo.png" className="h-12 mx-auto" />
        </div>

        {/* TABS w/ PROGRESS WIDTH */}
        {/* Tabs */}
        <div className="relative w-full mb-6">
          <div className="grid grid-cols-2 relative border-b border-white/20">
            <button
              onClick={() => setActiveTab("login")}
              className={`py-3 text-center font-semibold transition-all ${
                activeTab === "login" ? "text-white" : "text-gray-400"
              }`}
            >
              লগইন
            </button>

            <button
              onClick={() => setActiveTab("register")}
              className={`py-3 text-center font-semibold transition-all ${
                activeTab === "register" ? "text-white" : "text-gray-400"
              }`}
            >
              রেজিস্ট্রেশন
            </button>

            {/* Bottom Animated Bar FIXED PERFECTLY */}
            <div
              className={`
        absolute bottom-0 h-[3px] bg-gradient-to-r from-cyan-400 to-green-400 
        transition-transform duration-300 ease-out 
        w-1/2
        ${activeTab === "login" ? "translate-x-0" : "translate-x-full"}
      `}
            />
          </div>
        </div>

        {/* FORM + SHAKE + SMART AUTOFOCUS */}
        <AnimatePresence mode="wait">
          {activeTab === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28 }}
            >
              <LoginFormComponent
                onSuccess={onClose}
                // setSubmitting={setSubmitting}
                // onError={(msg) => triggerError(msg)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28 }}
            >
              <RegisterFormContent
                onSuccess={onClose}
                // setSubmitting={setSubmitting}
                // onError={(msg) => triggerError(msg)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
