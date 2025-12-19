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
import Image from "next/image";

// Menu Item Type
type NavItem = {
  // icon: LucideIcon;
  icon: string;
  label: string;
  href: string;
};

// Define Menu Items
// const navItems: NavItem[] = [
//   { icon: HomeIcon, label: "হোম", href: "/" },
//   { icon: GiftIcon, label: "প্রমোশন", href: "/promotion" },
//   { icon: TrophyIcon, label: "পুরস্কার কেন্দ্র", href: "/rewards" },
//   { icon: UserIcon, label: "সদস্য", href: "/dashboard/" }, // base
// ];
const navItems: NavItem[] = [
  { icon: '/images/home-icon.png', label: "হোম", href: "/" },
  { icon: '/images/gift-icon.png', label: "প্রমোশন", href: "/promotion" },
  { icon: '/images/trophy-icon.png', label: "পুরস্কার কেন্দ্র", href: "/rewards" },
  { icon: '/images/user-icon.png', label: "সদস্য", href: "/dashboard/" }, // base
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
      <div className="w-full max-w-[450px] fixed left-1/2 -translate-x-1/2 bottom-0 bg-navbg flex justify-around items-center px-1 py-3 shadow-md z-[9999]">
        {navItems.slice(0, 2).map(({ icon: Icon, label, href }) => (
          <NavItem
            key={label}
            icon={Icon}
            label={label}
            href={href}
          />
        ))}

        {/* Center Share Button */}
        <div className="relative -mt-4 z-10 -translate-x-6">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isAuthenticated || !user?.role) {
                setShowLogin(true);
                return;
              }
              router.push(`/dashboard/${user.role.toLowerCase()}/referral`);
            }}
            className="bg-purple-600 p-3 rounded-full shadow-lg animate-doubleBounceGap absolute h-[65px] w-[65px] -top-10 left-1/2 -translate-x-1/2 flex justify-center items-center"
          >
          
             <Image className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4" src={'/images/share-icon.png'} alt="Logo" width={30} height={30} />
             <p className="text-xs text-white text-center mt-1 absolute bottom-1">শেয়ার</p>
          </button>
          
        </div>

        

        {navItems.slice(2).map(({ icon: Icon, label, href }) => (
          <NavItem
            key={label}
            // icon={<Icon className="h-7 w-7" />}
            icon={Icon}
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
  // icon: React.ReactNode;
  icon: string;
  label: string;
  href: string;
  onClick?: (e: React.MouseEvent, label: string, href: string) => void;
}) => (
  <Link
    href={href}
    onClick={(e) => onClick?.(e, label, href)}
    className="flex flex-col items-center justify-center text-white group"
  >
    {/* {icon} */}
    <Image src={icon} alt="Logo" width={30} height={30} />
    <span className="text-xs mt-1">{label}</span>
  </Link>
);

export default BottomNav;
