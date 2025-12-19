"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/redux/hook/useAuth";
import LoginModal from "../modal/LoginModal";
import NavItem from "./NavItem";

type NavItem = {
  icon: string;
  label: string;
  href: string;
};

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const navItems: NavItem[] = [
    { icon: "/images/home-icon.png", label: "হোম", href: "/" },
    { icon: "/images/gift-icon.png", label: "প্রমোশন", href: "/promotion" },
    {
      icon: "/images/share-icon.png",
      label: "শেয়ার",
      href: `/dashboard/${user?.role.toLowerCase()}/referral`,
    },
    {
      icon: "/images/trophy-icon.png",
      label: "পুরস্কার কেন্দ্র",
      href: "/rewards",
    },
    { icon: "/images/user-icon.png", label: "সদস্য", href: "/dashboard" },
  ];

  const activeIndex = navItems.findIndex(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      <div
        className="fixed bottom-3 left-1/2 -translate-x-1/2
  w-[400px] h-[70px]
  bg-[#313131] rounded-[15px]
  grid grid-cols-5 place-items-center
   z-[9999]"
      >
        {/* Animated Indicator */}
        <div
          className="
    absolute top-[-27px]
    left-[6px]
    w-[70px] h-[70px]
    bg-[#2373b4]
    rounded-full
    border-[6px] border-[#d9d9d9]
    transition-[transform] ease-out duration-300

  "
          style={{ transform: `translateX(${activeIndex * 80}px)` }}
        />

        {navItems.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <NavItem
              key={item.label}
              {...item}
              isActive={isActive}
              onClick={(e) => {
                if (
                  (item.label === "সদস্য" || item.label === "শেয়ার") &&
                  (!isAuthenticated || !user?.role)
                ) {
                  e.preventDefault();
                  setShowLogin(true);
                  return;
                }

                if (item.label === "সদস্য") {
                  e.preventDefault();
                  router.push(`/dashboard`);
                }
              }}
            />
          );
        })}
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
