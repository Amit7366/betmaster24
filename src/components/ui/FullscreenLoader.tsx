// src/components/ui/FullscreenLoader.tsx
"use client";

import Image from "next/image";

export default function FullscreenLoader({ message = "Please wait..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full border-4 border-white/30 border-t-white animate-spin" />
        <Image src="/sbm777.png" alt="Logo" width={50} height={50} />
        <p className="text-white font-semibold">{message}</p>
      </div>
    </div>
  );
}
