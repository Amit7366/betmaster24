"use client";

import { useSidebar } from "@/context/SidebarNewContext";
import { RootState } from "@/redux/store";
import { logoutUser } from "@/services/actions/logoutUser";
import { Menu, ChevronDown, LogOut, DollarSign, Wallet } from "lucide-react";
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
import { useDashboardData } from "@/hooks/useDashboardData";
import { useGetDashboardQuery } from "@/redux/api/baseApi";
import useGetStoredUserBalance from "@/hooks/useGetStoredUserBalance";

const TopNav = () => {
  const { toggle } = useSidebar();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  // const { userData, loading } = useUserData();
  // console.log(userData);
  const objectId = user?.objectId;

  // console.log(user?.id,objectId);
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
  // const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // const completed = promoSummary?.data?.totalTurnoverCompleted;
  // const required = promoSummary?.data?.totalTurnoverRequired;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ?? undefined
      : undefined;
  // Unified fetch: user profile + balance
  // const { data: dashboard, loading: dashboardLoading } = useDashboardData(
  //   objectId,
  //   token
  // );
const { data: dashboard, isFetching: dashboardLoading } = useGetDashboardQuery(objectId, {
  refetchOnFocus: true,
  refetchOnReconnect: true,
});
//   const balance = dashboard?.balance ?? 0;
//   const userData = dashboard?.user ?? null;

//   // promo progress (safe defaults)
// const completed = dashboard?.promoSummary?.totalTurnoverCompleted ?? 0;
// const required  = dashboard?.promoSummary?.totalTurnoverRequired ?? 0;

// NEW ✅
const balance = dashboard?.data?.balance ?? 0;
const userData = dashboard?.data?.user ?? null;
// const existingData = localStorage.getItem(userData?.id);
//   const parsedData = JSON.parse(existingData);
    // const localData = useGetStoredUserBalance(userData?.id);
    // console.log((localData?.todayBalance)?.toFixed(2))

const completed = promoSummary?.data?.totalTurnoverCompleted;

const required  = promoSummary?.data?.totalTurnoverRequired;
// console.log(completed,required)
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
  // useEffect(() => {
  //   const fetchBalance = async () => {
  //     if (!user || !token) return;

  //     setLoadingBalance(true);
  //     try {
  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/balance/${user?.objectId}`,
  //         {
  //           headers: {
  //             Authorization: `${token}`,
  //           },
  //         }
  //       );

  //       if (!res.ok) throw new Error("Failed to fetch balance");

  //       const result = await res.json();
  //       setBalance(result?.data?.currentBalance ?? 0);
  //     } catch (error) {
  //       console.error("Error fetching balance:", error);
  //       setBalance(null);
  //     } finally {
  //       setLoadingBalance(false);
  //     }
  //   };

  //   if (isAuthenticated) fetchBalance();
  // }, [isAuthenticated, user, token]);

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
            ></Link>
          </div>
          {isAuthenticated && (
            <Link
              href="/dashboard/user/deposit"
              className="text-accent flex items-center justify-center gap-2 animate-pulse"
            >
              <Wallet /> <small>Deposit Here</small>
            </Link>
          )}
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
                  {/*
        Safeguards + computed values
      */}
                  {(() => {
                    const safeCompleted = Math.max(0, Number(completed) || 0);
                    const safeRequired = Math.max(0, Number(required) || 0);
                    const isDone =
                      safeRequired > 0 && safeCompleted >= safeRequired;
                    const widthPct =
                      safeRequired > 0
                        ? Math.min((safeCompleted / safeRequired) * 100, 100)
                        : 0;

                    return (
                      <div className="w-full mt-1 h-5 bg-white/20 rounded-full relative overflow-hidden">
                        {/* filled bar */}
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-in-out animate-pulse"
                          style={{
                            width: `${widthPct}%`,
                            backgroundImage:
                              "linear-gradient(to right, #ff8800, #ffaa00, #ffd700)",
                          }}
                        />

                        {/* centered label */}
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-semibold">
                          {isDone
                            ? "Turnover Completed"
                            : `${safeCompleted} / ${safeRequired}`}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            <div className="w-full">
              <span className="text-white text-xs">Welcome,</span>
              <span className="capitalize text-accent text-xs"> {user?.userName} / {user?.id}</span> 
            </div>
            <div className="w-full text-xs text-right font-bold text-accent flex flex-col justify-end">
              <small>Level: {userData?.userLevel}</small>
              <span>
                {" "}
                <span>
                  {loadingBalance ? '...' : balance?.toFixed(2) + " TK"}
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
