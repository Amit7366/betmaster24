"use client";

import { categories } from "@/constants";
import Image from "next/image";

export default function CategorySlider() {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar">
      <div className="flex gap-3 px-4 py-2">
        {categories.map((cat, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center px-3 py-2 bg-[#0e3d48] min-w-[70px] hover:bg-[#1b4c5c] transition-all rounded-tl-3xl rounded-bl-3xl rounded-tr-2xl"
          >
            <div className="relative w-8 h-8 mb-1">
              <Image
                src={cat.icon}
                alt={cat.name}
                fill
                className="object-contain"
              />
            </div>
            <span className="text-[10px] text-cyan-300 text-center whitespace-nowrap">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
