"use client";


import { X } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { useSidebar } from "@/context/SidebarNewContext";

const menuItems = [
  { label: "প্রমোশন", icon: "🎁" },
  { label: "পুরস্কার", badge: "NEW", icon: "🏆" },
  { label: "রেফারেল প্রোগ্রাম", badge: "HOT", icon: "👥" },
  { label: "বেটিং পাস", badge: "HOT", icon: "🎫" },
  { label: "অ্যাকাউন্ট", icon: "👤" },
];

const games = [
  "ক্রিকেট", "ক্যাসিনো", "স্লট গেম", "টেবিল গেম", "খেলার ভাই", "মাছ ধরা", "ক্ল্যাস"
];

export default function Sidebar() {
  const { isOpen, toggle } = useSidebar();

  return (
    <div
      className={clsx(
        "fixed top-0 left-0 w-72 h-full bg-white text-black z-[99999] shadow-xl transform transition-transform duration-300 overflow-y-auto",
        {
          "translate-x-0": isOpen,
          "-translate-x-full": !isOpen,
        }
      )}
    >
      <div className="flex justify-between items-center p-4 border-b">
       <Image src="/sbm777.png" alt="Logo" width={140} height={40} />
        <X className="cursor-pointer" onClick={toggle} />
      </div>

      <ul className="p-4 space-y-3">
        {menuItems.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="text-lg">{item.icon}</span>
            {item.label}
            {item.badge && (
              <span
                className={clsx(
                  "text-xs ml-auto px-2 py-0.5 rounded-full font-semibold",
                  item.badge === "HOT" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                )}
              >
                {item.badge}
              </span>
            )}
          </li>
        ))}
        <div className="mt-4 border-t pt-3 text-xs font-semibold text-gray-500">
          Games
        </div>
        {games.map((game, i) => (
          <li key={i} className="pl-6 py-1 hover:bg-gray-100 rounded">{game}</li>
        ))}
      </ul>
    </div>
  );
}
