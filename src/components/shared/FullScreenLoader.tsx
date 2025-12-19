"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function FullScreenLoader() {
  const [remainingTime, setRemainingTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(9, 59, 59, 999);

      const diff = endOfDay.getTime() - now.getTime();

      if (diff <= 0) {
        setRemainingTime("00:00:00");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setRemainingTime(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}:${String(seconds).padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary text-white">
      {/* Logo */}
      <Image
        src="/sbm777.png"
        alt="avatar"
        width={120}
        height={60}
        className="rounded-full mb-6"
      />

      {/* Animated Spinner */}
      <motion.div
        className="w-14 h-14 border-4 border-gray-700 border-t-accent rounded-full mb-6"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
      />

      {/* Text Message */}
      <motion.h2
        className="text-sm font-semibold text-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        দয়া করে কিছুক্ষণ অপেক্ষা করুন...  
        <br />
        <span className="text-accent">নতুন আপডেট আসছে 🔥</span>
      </motion.h2>

      {/* Countdown Timer */}
      <motion.div
        className="text-lg font-bold text-accent mt-2"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        ⏳ {remainingTime}
      </motion.div>
    </div>
  );
}
