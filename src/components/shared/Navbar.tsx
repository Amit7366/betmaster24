"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Bell, ChartArea, Menu, Send, Wallet } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/context/SidebarContext";
import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export const Navbar = ({
  onOpenSignup
}: {
  onOpenSignup: () => void;
}) => {

    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector(
      (state: RootState) => state.auth
    );
  
    const objectId = user?.objectId;
  
    const {
      data: balanceData,
      error,
      isLoading,
      refetch, // optional manual refetch
    } = useGetUserBalanceQuery(objectId!, {
      skip: !objectId,
    });
  const [timeLeft, setTimeLeft] = useState(43 * 60 + 7); // 43 minutes and 7 seconds in total seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `00 : ${mins} : ${secs}`;
  };
  const { toggleSidebar } = useSidebar();
  return (
    <div className="w-full bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3 flex flex-col md:flex-row items-center justify-between text-white">
      {/* Left Section */}
      <div className="w-full sm:max-w-xl flex items-center gap-4">
        <div className="w-full sm:w-[200px] flex items-center justify-between gap-2">
          <Link href="/" className="text-2xl font-bold text-white">
            <span className="text-[#00bfff]">Bet</span>Master24
          </Link>
          <Menu
            className="w-6 h-6 cursor-pointer block sm:hidden"
            onClick={toggleSidebar}
          />
        </div>
        <div className="hidden xl:flex gap-2 items-center ml-4 bg-gray-400 bg-opacity-15 rounded-md">
          <Link href="/games" className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">
            🎰 Casino
          </Link>
          <Link href="/games" className="text-sm cursor-pointer px-4 py-2">⚽ Sports</Link>
          <Link href="/games" className="text-sm cursor-pointer px-4 py-2">
            🧍 Live casino
          </Link>
        </div>
      </div>

      {/* Center Bonus Section */}
      <div className="hidden xl:flex flex-col items-center">
        {/* <img src="/gift-icon.png" alt="bonus" className="w-8 h-8 mb-1" /> */}
        <span className="text-xs">Claim Bonus</span>
        <span className="text-[10px]">{formatTime(timeLeft)}</span>
      </div>

      {/* Right Section */}
      <div className="w-full md:max-w-md flex justify-between flex-row-reverse sm:flex-row items-center gap-4 mt-2">
        <div className="flex items-center gap-2">
          <button className="text-white text-sm flex items-center gap-1 px-4 py-2 bg-gray-400 bg-opacity-15 rounded-md">
            <Wallet className="w-4 h-4" /> {balanceData?.data?.currentBalance || 0}
          </button>
          <Link
            href={"/member/deposit"}
            className="bg-[#00bfff] text-white px-4 py-2 rounded-md text-sm"
          >
            💰 Deposit
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link  href={"/member/deposit"} className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                }
                alt="avatar"
              />
              {/* <AvatarFallback>AD</AvatarFallback> */}
            </Avatar>
            <span className="text-sm hidden sm:inline-block">Abir Designs</span>
          </Link>
          <div className=" cursor-pointer bg-gray-400 bg-opacity-15 rounded-md w-8 h-8 flex justify-center items-center">
            <button onClick={onOpenSignup} >
           
              <Send className="w-3 h-3" />
            </button>
          </div>
          <div className=" cursor-pointer bg-gray-400 bg-opacity-15 rounded-md w-8 h-8 flex justify-center items-center">
            <Bell className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
