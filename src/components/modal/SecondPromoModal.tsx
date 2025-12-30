"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SecondPromoModal({ open, onClose }: Props) {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;

    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center px-4">
      <div className="relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-b from-slate-900 to-slate-800">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-1 z-10"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        <div className="relative w-full h-56">
          <Image
            src="/images/promotions/sign up  bonus.png"
            alt="Second Promo"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="p-4 text-center text-white space-y-2">
          <h3 className="text-xl font-extrabold">New User Sign Up Bonus</h3>
          <p className="text-sm text-white/80">
            নতুন ইউজার রেজিস্টার করলে বোনাস পাবেন
          </p>

          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40 text-emerald-200 font-bold">
            🎁 50 Tk Bonus
          </div>

          <p className="text-xs text-white/60 pt-2">SBM77.COM</p>
        </div>
      </div>
    </div>
  );
}
