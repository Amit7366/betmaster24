"use client";

import { useSidebar } from "@/context/SidebarNewContext";
import { RootState } from "@/redux/store";
import { logoutUser } from "@/services/actions/logoutUser";
import { Menu, ChevronDown, LogOut, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoginModal from "../modal/LoginModal";
import SignupModal from "../modal/SignupModal";
import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";

const TopNav = () => {
  const { toggle } = useSidebar();
  const dispatch = useDispatch();
  const router = useRouter();

  const auth = useSelector((state: RootState) => state.auth);
  const { user, isAuthenticated } = auth;

  const objectId = user?.objectId;

  const {
    data: balanceData,
    error,
    isLoading,
    refetch, // optional manual refetch
  } = useGetUserBalanceQuery(objectId!, {
    skip: !objectId,
  });
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

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
    logoutUser(dispatch, () => router.push("/login"));
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
      <div className="fixed w-full px-4 top-0 left-0 bg-primary flex items-center justify-between py-4 shadow-md z-[9999]">
        <div className="flex items-center gap-2">
          <Menu
            className="h-6 w-6 text-white cursor-pointer"
            onClick={toggle}
          />
          <div className="text-yellow-400 font-extrabold text-xl flex items-center">
            <Image src="/sbm777.png" alt="Logo" width={120} height={40} />
          </div>
        </div>

        <div className="relative">
          {isAuthenticated ? (
            <div
              className="flex items-center gap-4 px-3 text-yellow-500 cursor-pointer select-none"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <div className="text-white font-semibold capitalize">
                Welcome, {user?.userName} <br />
                <span className="text-sm text-gray-300">
                  BDT{" "}
                  {loadingBalance
                    ? "..."
                    : balanceData?.data?.currentBalance?.toFixed(2)}
                </span>
              </div>
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
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-[99999]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
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
