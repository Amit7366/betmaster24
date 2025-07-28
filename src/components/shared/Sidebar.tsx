"use client";

import { X } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { useSidebar } from "@/context/SidebarNewContext";
import { useEffect, useRef } from "react";
import { categories } from "@/constants";
import Link from "next/link";

const menuItems = [
  { label: "Promotion", icon: "🎁",href:'/promotion' },
  { label: "Gift", badge: "NEW", icon: "🏆",href:'/' },
  { label: "Refferal Program", badge: "HOT", icon: "👥",href:'/' },
  { label: "Betting Plus", badge: "HOT", icon: "🎫",href:'/' },
  { label: "Account", icon: "👤",href:'/dashboard/user' },
];

const games = categories;

export default function Sidebar() {
  const { isOpen, toggle } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Detect outside click to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        toggle();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggle]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-[99990]" onClick={toggle} />
      )}

      {/* Sidebar wrapper targeting 450px layout */}
      <div className="fixed top-0 left-0 w-screen h-screen z-[99999] pointer-events-none">
        <div className="relative w-[450px] h-full mx-auto">
          <div
            ref={sidebarRef}
            className={clsx(
              "absolute top-0 left-0 w-72 h-full bg-navbg text-white shadow-xl transform transition-all duration-300 ease-in-out overflow-y-auto pointer-events-auto",
              {
                "translate-x-0 opacity-100": isOpen,
                "-translate-x-full opacity-0": !isOpen,
              }
            )}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <Image src="/sbm777.png" alt="Logo" width={140} height={40} />
              <X className="cursor-pointer" onClick={toggle} />
            </div>

            {/* Menu Items */}
            <ul className="p-4 space-y-1">
              {menuItems.map((item, i) => (
                <Link
                onClick={toggle}
                href={item.href}
                  key={i}
                  className="flex items-center gap-2 text-sm p-2 group hover:bg-accent"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-textcolor text-sm group-hover:text-white">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={clsx(
                        "text-xs ml-auto px-2 py-0.5 rounded-full font-semibold",
                        item.badge === "HOT"
                          ? "bg-red-500 text-white"
                          : "bg-green-500 text-white"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}

              {/* Games section */}
              <div className="mt-4 border-t pt-3 text-xs font-semibold text-gray-500">
                Games
              </div>
              {games.map((game, i) => (
                <li
                  key={i}
                  className="pl-6 py-3 text-textcolor hover:bg-accent hover:text-white rounded text-sm"
                  
                >
                 <Link href={`/${game?.type}/${game.name.toLocaleLowerCase()}`} onClick={toggle} >{game.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
