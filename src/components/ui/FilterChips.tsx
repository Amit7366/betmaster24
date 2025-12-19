// src/components/ui/FilterChips.tsx
"use client";

import Image from "next/image";

export type ChipItem = { name: string; icon: string };

interface FilterChipsProps {
  items: ChipItem[];
  selected: string | null;             // lowercased value
  onToggle: (value: string | null) => void;
  className?: string;
}

export default function FilterChips({
  items,
  selected,
  onToggle,
  className = "",
}: FilterChipsProps) {
  return (
    <div className={`w-full overflow-x-auto hide-scrollbar ${className}`}>
      <div className="flex gap-3 px-4 pt-9 pb-3">
        {items.map((cat, i) => {
          const val = cat.name.toLowerCase();
          const isActive = selected === val;
          return (
            <button
              key={`${val}-${i}`}
              onClick={() => onToggle(isActive ? null : val)}
              className={`flex flex-col items-center justify-center px-3 py-2 min-w-[70px] transition-all rounded-tl-3xl rounded-bl-3xl rounded-tr-2xl ${
                isActive ? "bg-accent text-white" : " hover:bg-accent"
              }`}
            >
              <span className="relative w-8 h-8 mb-1">
                <Image src={cat.icon} alt={cat.name} fill className="object-contain" />
              </span>
              <span className="text-[14px] text-white text-center whitespace-nowrap">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
