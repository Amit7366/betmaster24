"use client";

import {
  HomeIcon,
  GiftIcon,
  ShareIcon,
  TrophyIcon,
  UserIcon,
} from "lucide-react";

const BottomNav = () => {
  return (
    <div className="w-full fixed bottom-0 left-0 right-0 bg-primary flex justify-around items-center py-2 shadow-md z-[9999]">
      <NavItem icon={<HomeIcon className="h-6 w-6 text-white" />} label="Home" />
      <NavItem icon={<GiftIcon className="h-6 w-6 text-white" />} label="Promotion" />
      <div className="relative -mt-8 z-10">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-full shadow-lg animate-pulse">
          <ShareIcon className="h-6 w-6 text-white" />
        </div>
        <p className="text-xs text-white text-center mt-1">Share</p>
      </div>
      <NavItem icon={<TrophyIcon className="h-6 w-6 text-white" />} label="Reward Center" />
      <NavItem icon={<UserIcon className="h-6 w-6 text-white" />} label="Member" />
    </div>
  );
};

const NavItem = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex flex-col items-center justify-center text-white">
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </div>
);

export default BottomNav;
