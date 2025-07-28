"use client";

import { useSidebar } from "@/context/SidebarNewContext";
import { RootState } from "@/redux/store";
import { logoutUser } from "@/services/actions/logoutUser";
import { Menu, ChevronDown, LogOut, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LoginModal from "../modal/LoginModal";
import SignupModal from "../modal/SignupModal";
import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
import { useAuth } from "@/redux/hook/useAuth";
import { useGetAdminPromotionSummaryQuery } from "@/redux/api/adminApi";
import Cookies from "js-cookie";
import { useUserData } from "@/hooks/getMyInfo";

const TopNav = () => {
  const { toggle } = useSidebar();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { userData, loading } = useUserData();
  // console.log(userData); 
  const objectId = user?.objectId;
  // console.log(objectId);
  // const adminId = "68722b350bbc20fe4d837598";
  const adminId = objectId;
  const {
    data: balanceData,
    error,
    isLoading,
    refetch, // optional manual refetch
  } = useGetUserBalanceQuery(objectId!, {
    skip: !objectId,
  });
  const {
    data: promoSummary,
    isLoading: promoLoading,
    error: promoError,
  } = useGetAdminPromotionSummaryQuery(adminId);
  // console.log(promoSummary?.data?.totalTurnoverCompleted,promoSummary?.data?.totalTurnoverRequired)
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const completed =
    promoSummary?.data?.totalTurnoverCompleted;
  const required =promoSummary?.data?.totalTurnoverRequired;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user || !token) return;

      setLoadingBalance(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/balance/${user?.objectId}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch balance");

        const result = await res.json();
        setBalance(result?.data?.currentBalance ?? 0);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    };

    if (isAuthenticated) fetchBalance();
  }, [isAuthenticated, user, token]);

  const handleLogout = () => {
    Cookies.remove("accessToken");
    localStorage.removeItem("accessToken");
    logoutUser(dispatch, () => router.replace("/")); // ✅ Safe redirect
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  return (
    <>
      <div className="fixed w-full max-w-[450px]  left-1/2 -translate-x-1/2 px-4 top-0  bg-primary  py-4 shadow-md z-[9999]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Menu
              className="h-6 w-6 text-accent cursor-pointer"
              onClick={toggle}
            />
            <Link
              href="/"
              className="text-yellow-400 font-extrabold text-xl flex items-center"
            >
              <Image src="/sbm777.png" alt="Logo" width={120} height={40} />
            </Link>
          </div>

          <div ref={dropdownRef} className="relative">
            {isAuthenticated ? (
              <div
                className="flex items-center gap-4 px-3 text-yellow-500 cursor-pointer select-none"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <Image
                  src="/avatar.png"
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                {/* <div className="flex items-center gap-1 text-green-300 text-sm bg-white px-2 py-1 rounded-md">
                <DollarSign className="w-4 h-4" />
                {loadingBalance ? "..." : balance?.toFixed(2)}
              </div> */}
                <ChevronDown className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRegister(true)}
                  className="bg-transparent border border-cyan-400 text-cyan-300 px-3 py-1 text-sm rounded-tr-xl rounded-bl-xl hover:bg-cyan-900 transition"
                >
                  Register
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-green-400 text-black px-3 py-1 text-sm rounded-tr-xl rounded-bl-xl hover:bg-green-500 transition"
                >
                  Login
                </button>
              </div>
            )}

            {/* Dropdown menu */}
            {dropdownOpen && isAuthenticated && (
              <div className="absolute right-0 mt-3 w-24 bg-white shadow-lg rounded-md z-[99999]">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2  px-4 py-2 text-xs text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        {isAuthenticated && (
          <div className="w-full flex items-center justify-between pt-3 gap-3">
            <div className="w-full text-xs text-white">
              Turnover:&nbsp;
              {promoLoading ? (
                "0/0"
              ) : (
                <>
                  {/* <span>
        {completed}/{required}
      </span> */}

                  {/* Wrapper for progress bar */}
                  <div className="w-full mt-1 h-5 bg-white/20 rounded-full relative overflow-hidden">
                    {/* Front (filled) bar */}
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-in-out animate-pulse"
                      style={{
                        width: `${Math.min(
                          (completed / required) * 100,
                          100
                        )}%`,
                        backgroundImage:
                          "linear-gradient(to right, #ff8800, #ffaa00, #ffd700)",
                      }}
                    />

                    {/* Absolute label centered inside bar */}
                    {completed > 0 || required > 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-semibold">
                        {completed} / {required}
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            <div className="w-full">
              <span className="text-white">Welcome,</span>
              <span className="capitalize text-accent"> {user?.userName}</span>
            </div>
            <div className="w-full text-xs text-right font-bold text-accent flex flex-col justify-end">
              <small>Level: {userData?.userLevel}</small>
              <span>
                BDT{" "}
                <span>
                  {loadingBalance
                    ? "..."
                    : balanceData?.data?.currentBalance?.toFixed(2)}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modals */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <SignupModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
      />
    </>
  );
};

export default TopNav;
