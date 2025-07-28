"use client";

import { useAuth } from "@/redux/hook/useAuth";
import {
  HomeIcon,
  GiftIcon,
  ShareIcon,
  TrophyIcon,
  UserIcon,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoginModal from "../modal/LoginModal";

// Menu Item Type
type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

// Define Menu Items
const navItems: NavItem[] = [
  { icon: HomeIcon, label: "Home", href: "/" },
  { icon: GiftIcon, label: "Promotion", href: "/promotion" },
  { icon: TrophyIcon, label: "Reward Center", href: "/rewards" },
  { icon: UserIcon, label: "Profile", href: "/dashboard/" }, // base
];

const BottomNav = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  // console.log(user)
  const handleNavClick = (e: React.MouseEvent, label: string, href: string) => {
    if (label === "Profile") {
      e.preventDefault();

      if (!isAuthenticated || !user?.role) {
        setShowLogin(true); // Open login modal
        return;
      }

      // Navigate to dynamic dashboard
      router.push(`/dashboard/${user.role.toLowerCase()}`);
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="w-full max-w-[405px] fixed left-1/2 -translate-x-1/2 bottom-1 bg-navbg rounded-full flex justify-around items-center px-4 py-3 shadow-md z-[9999]">
        {navItems.slice(0, 2).map(({ icon: Icon, label, href }) => (
          <NavItem
            key={label}
            icon={<Icon className="h-5 w-5" />}
            label={label}
            href={href}
          />
        ))}

        {/* Center Share Button */}
        <div className="relative -mt-4 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isAuthenticated || !user?.role) {
                setShowLogin(true);
                return;
              }
              router.push(`/dashboard/${user.role.toLowerCase()}/referral`);
            }}
            className="bg-accent p-3 rounded-full shadow-lg animate-pulse"
          >
            <ShareIcon className="h-3 w-3 text-white" />
          </button>
          <p className="text-xs text-white text-center mt-1">Share</p>
        </div>

        {navItems.slice(2).map(({ icon: Icon, label, href }) => (
          <NavItem
            key={label}
            icon={<Icon className="h-5 w-5" />}
            label={label}
            href={href}
            onClick={handleNavClick}
          />
        ))}
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};

const NavItem = ({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick?: (e: React.MouseEvent, label: string, href: string) => void;
}) => (
  <Link
    href={href}
    onClick={(e) => onClick?.(e, label, href)}
    className="flex flex-col items-center justify-center text-textcolor hover:text-white group"
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </Link>
);

export default BottomNav;
