"use client";

import { useSidebar } from "@/context/SidebarNewContext";
import { logoutUser } from "@/services/actions/logoutUser";
import { Menu, ChevronDown, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
import { useAuth } from "@/redux/hook/useAuth";
import { useGetAdminPromotionSummaryQuery } from "@/redux/api/adminApi";
import Cookies from "js-cookie";
import { useGetDashboardQuery } from "@/redux/api/baseApi";
import AuthModal from "./AuthModal";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const TopNav = () => {
  const { toggle } = useSidebar();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const objectId = user?.objectId;

  const adminId = objectId;

  const {
    data: balanceData,
    error,
    isLoading,
    refetch,
  } = useGetUserBalanceQuery(objectId!, {
    skip: !objectId,
  });

  // turnover lazy load (unchanged)
  const [fetchTurnover, setFetchTurnover] = useState(false);
  const {
    data: promoSummary,
    isLoading: promoLoading,
    error: promoError,
    refetch: refetchTurnover,
  } = useGetAdminPromotionSummaryQuery(adminId, {
    skip: !fetchTurnover || !adminId,
  });

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ?? undefined
      : undefined;

  const { data: dashboard, isFetching: dashboardLoading } = useGetDashboardQuery(
    objectId,
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const balance = dashboard?.data?.balance ?? 0;
  const userData = dashboard?.data?.user ?? null;

  const completed = promoSummary?.data?.totalTurnoverCompleted;
  const required = promoSummary?.data?.totalTurnoverRequired;

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

  const handleLogout = () => {
    Cookies.remove("accessToken");
    localStorage.removeItem("accessToken");
    logoutUser(dispatch as any, () => router.replace("/"));
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
      <div className="fixed left-1/2 top-0 z-[9999] w-full max-w-[450px] -translate-x-1/2 px-3 pt-3">
        {/* Main bar */}
        <div className="rounded-3xl border border-white/10 bg-primary/80 shadow-[0_10px_35px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="flex items-center justify-between gap-2 px-4 py-4">
            {/* Left */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggle}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/[0.08] transition"
              >
                <Menu className="h-5 w-5 text-accent" />
              </button>

              <Link href="/" className="relative h-10 w-[120px]">
                <Image
                  src="/logo-new.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Right */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-2xl px-2 py-2",
                isAuthenticated ? "bg-secondary/60 ring-1 ring-white/10" : ""
              )}
            >
              {isAuthenticated && (
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 ring-1 ring-white/10">
                  <span className="text-[11px] text-white/60">Balance</span>
                  <span className="text-sm font-bold text-white">
                    {loadingBalance ? "..." : `${balance?.toFixed(2)} TK`}
                  </span>
                </div>
              )}

              <div ref={dropdownRef} className="relative">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-2xl bg-white/[0.06] px-2.5 py-2 ring-1 ring-white/10 hover:bg-white/[0.08] transition select-none"
                  >
                    <Image
                      src={userData?.profileImg || "/icons/boy.png"}
                      alt="avatar"
                      width={32}
                      height={32}
                      className="rounded-xl border border-accent/40 object-cover"
                    />
                    <ChevronDown className="h-4 w-4 text-white/80" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowRegister(true)}
                      className="rounded-2xl border border-accent/40 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-accent hover:bg-white/[0.06] transition"
                    >
                      নিবন্ধন
                    </button>
                    <button
                      onClick={() => setShowLogin(true)}
                      className="rounded-2xl bg-accent px-3 py-2 text-xs font-semibold text-primary hover:brightness-110 transition ring-1 ring-accent/30"
                    >
                      লগইন
                    </button>
                  </div>
                )}

                {/* Dropdown */}
                {dropdownOpen && isAuthenticated && (
                  <div className="absolute right-0 mt-3 w-44 overflow-hidden rounded-2xl border border-white/10 bg-primary/95 shadow-2xl backdrop-blur">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-xs text-white/60">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">
                        {userData?.userName || user?.id || "User"}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-300 hover:bg-white/[0.06] transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom quick actions */}
          {isAuthenticated && (
            <div className="border-t border-white/10 px-3 py-2">
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/dashboard/user/deposit"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/[0.06] transition"
                >
                  <Image
                    src="/icons/deposit-new.png"
                    alt="deposit"
                    width={18}
                    height={18}
                  />
                  Deposit
                </Link>

                <Link
                  href="/dashboard/user/withdraw"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/[0.06] transition"
                >
                  <Image
                    src="/icons/deposit.png"
                    alt="withdraw"
                    width={18}
                    height={18}
                  />
                  Withdraw
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/[0.06] transition"
                >
                  <Image
                    src="/icons/profile.png"
                    alt="profile"
                    width={18}
                    height={18}
                  />
                  Profile
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modals */}
      <AuthModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        openTab="login"
      />

      <AuthModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        openTab="register"
      />
    </>
  );
};

export default TopNav;

// "use client";

// import { useSidebar } from "@/context/SidebarNewContext";
// import { RootState } from "@/redux/store";
// import { logoutUser } from "@/services/actions/logoutUser";
// import { Menu, ChevronDown, LogOut, DollarSign, Wallet } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { useDispatch, useSelector } from "react-redux";
// import { useRouter } from "next/navigation";
// import { useEffect, useRef, useState } from "react";
// import LoginModal from "../modal/LoginModal";
// import SignupModal from "../modal/SignupModal";
// import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
// import { useAuth } from "@/redux/hook/useAuth";
// import { useGetAdminPromotionSummaryQuery } from "@/redux/api/adminApi";
// import Cookies from "js-cookie";
// import { useUserData } from "@/hooks/getMyInfo";
// import { useDashboardData } from "@/hooks/useDashboardData";
// import { useGetDashboardQuery } from "@/redux/api/baseApi";
// import useGetStoredUserBalance from "@/hooks/useGetStoredUserBalance";
// import AuthModal from "./AuthModal";

// const TopNav = () => {
//   const { toggle } = useSidebar();
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { user, isAuthenticated } = useAuth();
//   // const { userData, loading } = useUserData();
//   // console.log(userData);
//   const objectId = user?.objectId;

//   // console.log(user?.id,objectId);
//   // const adminId = "68722b350bbc20fe4d837598";
//   const adminId = objectId;
//   const {
//     data: balanceData,
//     error,
//     isLoading,
//     refetch, // optional manual refetch
//   } = useGetUserBalanceQuery(objectId!, {
//     skip: !objectId,
//   });
//   // --- replace the existing useGetAdminPromotionSummaryQuery ---
//   const [fetchTurnover, setFetchTurnover] = useState(false);

//   const {
//     data: promoSummary,
//     isLoading: promoLoading,
//     error: promoError,
//     refetch: refetchTurnover,
//   } = useGetAdminPromotionSummaryQuery(adminId, {
//     skip: !fetchTurnover || !adminId, // ⛔ skip until user clicks
//   });
//   // console.log(promoSummary?.data?.totalTurnoverCompleted,promoSummary?.data?.totalTurnoverRequired)
//   const [showLogin, setShowLogin] = useState(false);
//   const [showRegister, setShowRegister] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   // const [balance, setBalance] = useState<number | null>(null);
//   const [loadingBalance, setLoadingBalance] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   // const completed = promoSummary?.data?.totalTurnoverCompleted;
//   // const required = promoSummary?.data?.totalTurnoverRequired;

//   const token =
//     typeof window !== "undefined"
//       ? localStorage.getItem("accessToken") ?? undefined
//       : undefined;
//   // Unified fetch: user profile + balance
//   // const { data: dashboard, loading: dashboardLoading } = useDashboardData(
//   //   objectId,
//   //   token
//   // );
//   const { data: dashboard, isFetching: dashboardLoading } =
//     useGetDashboardQuery(objectId, {
//       refetchOnFocus: true,
//       refetchOnReconnect: true,
//     });
//   //   const balance = dashboard?.balance ?? 0;
//   //   const userData = dashboard?.user ?? null;

//   //   // promo progress (safe defaults)
//   // const completed = dashboard?.promoSummary?.totalTurnoverCompleted ?? 0;
//   // const required  = dashboard?.promoSummary?.totalTurnoverRequired ?? 0;

//   // NEW ✅
//   const balance = dashboard?.data?.balance ?? 0;
//   const userData = dashboard?.data?.user ?? null;
//   // const existingData = localStorage.getItem(userData?.id);
//   //   const parsedData = JSON.parse(existingData);
//   // const localData = useGetStoredUserBalance(userData?.id);
//   // console.log((localData?.todayBalance)?.toFixed(2))

//   const completed = promoSummary?.data?.totalTurnoverCompleted;

//   const required = promoSummary?.data?.totalTurnoverRequired;
//   // console.log(completed,required)
//   // Click outside to close dropdown
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setDropdownOpen(false);
//       }
//     };

//     if (dropdownOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.removeEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [dropdownOpen]);
//   // useEffect(() => {
//   //   const fetchBalance = async () => {
//   //     if (!user || !token) return;

//   //     setLoadingBalance(true);
//   //     try {
//   //       const res = await fetch(
//   //         `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/balance/${user?.objectId}`,
//   //         {
//   //           headers: {
//   //             Authorization: `${token}`,
//   //           },
//   //         }
//   //       );

//   //       if (!res.ok) throw new Error("Failed to fetch balance");

//   //       const result = await res.json();
//   //       setBalance(result?.data?.currentBalance ?? 0);
//   //     } catch (error) {
//   //       console.error("Error fetching balance:", error);
//   //       setBalance(null);
//   //     } finally {
//   //       setLoadingBalance(false);
//   //     }
//   //   };

//   //   if (isAuthenticated) fetchBalance();
//   // }, [isAuthenticated, user, token]);

//   const handleLogout = () => {
//     Cookies.remove("accessToken");
//     localStorage.removeItem("accessToken");
//     logoutUser(dispatch, () => router.replace("/")); // ✅ Safe redirect
//   };

//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         refetch();
//       }
//     };
//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => {
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//     };
//   }, [refetch]);

//   return (
//     <>
//       <div className="fixed w-full max-w-[450px]  left-1/2 -translate-x-1/2 px-4 top-0  bg-primary  py-4 z-[9999]">
//         <div className="flex items-center justify-between gap-2">
//           <div className="flex items-center gap-2">
//             <Menu
//               className="h-6 w-6 text-accent cursor-pointer"
//               onClick={toggle}
//             />
//             {/* Responsive Logo Wrapper */}
//             <div className="relative w-[120px] h-10">
//               <Image
//                 src="/logo-new.png"
//                 alt="Logo"
//                 fill
//                 className="object-contain"
//             //     sizes="(max-width: 120px) 96px,
//             //  (max-width: 120x) 128px,
//             //  (max-width: 120px) 160px,
//             //  192px"
//               />
//             </div>
//             <Link
//               href="/"
//               className="text-yellow-400 font-extrabold text-xl flex items-center"
//             ></Link>
//           </div>
//           <div
//             className={`flex justify-end items-center gap-2 ${
//               isAuthenticated ? "bg-secondary" : "bg-transparent"
//             } px-2 py-2 rounded-md bg-opacity-35`}
//           >
//             {isAuthenticated && (
//               <>
//                 <span className="text-white text-sm font-bold">
//                   {loadingBalance ? "..." : balance?.toFixed(2) + " TK"}
//                 </span>
//                 {/* <Link
//                   title="Deposit Here"
//                   href="/dashboard/user/deposit"
//                   className="text-green-500 flex items-center justify-center gap-2 "
//                 >
//                   <Image
//                     src="/icons/deposit.png"
//                     alt="avatar"
//                     width={30}
//                     height={30}
//                     className="animate-bounce"
//                   />
//                 </Link> */}
//               </>
//             )}
//             <div ref={dropdownRef} className="relative">
//               {isAuthenticated ? (
//                 <div
//                   className="flex items-center gap-[1px] px-3 text-yellow-500 cursor-pointer select-none"
//                   onClick={() => setDropdownOpen((prev) => !prev)}
//                 >
//                   <Image
//                     src="/icons/boy.png"
//                     alt="avatar"
//                     width={30}
//                     height={30}
//                     className="rounded-full border border-accent"
//                   />
//                   {/* <div className="flex items-center gap-1 text-green-300 text-sm bg-white px-2 py-1 rounded-md">
//                 <DollarSign className="w-4 h-4" />
//                 {loadingBalance ? "..." : balance?.toFixed(2)}
//               </div> */}
//                   <ChevronDown className="w-4 h-4 text-white" />
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => setShowRegister(true)}
//                     className="bg-transparent border border-accent text-accent px-3 py-1 text-sm rounded-tr-xl rounded-bl-xl hover:bg-cyan-900 transition"
//                   >
//                     নিবন্ধন
//                   </button>
//                   <button
//                     onClick={() => setShowLogin(true)}
//                     className="bg-accent text-primary px-3 py-1 text-sm rounded-tr-xl rounded-bl-xl hover:bg-green-500 transition"
//                   >
//                     লগইন
//                   </button>
//                 </div>
//               )}

//               {/* Dropdown menu */}
//               {dropdownOpen && isAuthenticated && (
//                 <div className="absolute right-0 mt-3 w-24 bg-white shadow-lg rounded-md z-[99999]">
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center gap-2  px-4 py-2 text-xs text-red-600 hover:bg-gray-100"
//                   >
//                     <LogOut className="w-3 h-3" />
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//         {isAuthenticated && (
//           <div className="pt-2 flex justify-between items-center">
//             <Link
//               href={"/dashboard/user/deposit"}
//               className="text-white flex items-center gap-2 justify-center w-28 py-1"
//             >
//               <Image
//                 src="/icons/deposit-new.png"
//                 alt="avatar"
//                 width={20}
//                 height={20}
//               />
//               <span className="text-sm">Deposit</span>
//             </Link>
//             <Link
//               href={"/dashboard/user/withdraw"}
//               className="text-white flex items-center gap-2 justify-center w-28 py-1"
//             >
//               <Image
//                 src="/icons/deposit.png"
//                 alt="avatar"
//                 width={20}
//                 height={20}
//               />
//               <span className="text-sm">Withdraw</span>
//             </Link>
//             <Link
//               href={"/dashboard"}
//               className="flex items-center gap-2 justify-center text-white w-28 py-1"
//             >
//               <Image
//                 src="/icons/profile.png"
//                 alt="avatar"
//                 width={20}
//                 height={20}
//               />
//               <span className="text-sm">Profile</span>
//             </Link>
//           </div>
//         )}
//         {/* {isAuthenticated && (
//           <div className="w-full flex items-center justify-between pt-3 gap-3">
//             <div className="w-full text-xs text-white">
//               {!fetchTurnover ? (
//                 <button
//                   onClick={() => setFetchTurnover(true)}
//                   className="bg-yellow-400 text-white hover:scale-110 px-3 py-[4px] transition rounded-full"
//                 >
//                   See Turnover
//                 </button>
//               ) : promoLoading ? (
//                 "Loading..."
//               ) : (
//                 <>
//                   {(() => {
//                     const completed = promoSummary?.data?.totalTurnoverCompleted ?? 0;
//                     const required = promoSummary?.data?.totalTurnoverRequired ?? 0;
//                     const safeCompleted = Math.max(0, Number(completed) || 0);
//                     const safeRequired = Math.max(0, Number(required) || 0);
//                     const isDone =
//                       safeRequired > 0 && safeCompleted >= safeRequired;
//                     const widthPct =
//                       safeRequired > 0
//                         ? Math.min((safeCompleted / safeRequired) * 100, 100)
//                         : 0;

//                     return (
//                       <div className="w-full mt-1 h-5 bg-white/20 rounded-full relative overflow-hidden">
//                         <div
//                           className="h-full rounded-full transition-all duration-700 ease-in-out animate-pulse"
//                           style={{
//                             width: `${widthPct}%`,
//                             backgroundImage:
//                               "linear-gradient(to right, #ff8800, #ffaa00, #ffd700)",
//                           }}
//                         />
//                         <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-semibold">
//                           {isDone
//                             ? "Turnover Completed"
//                             : `${safeCompleted} / ${safeRequired}`}
//                         </div>
//                       </div>
//                     );
//                   })()}
//                 </>
//               )}
//             </div>

//             <div className="w-full">
//               <span className="text-white text-xs">Welcome,</span>
//               <span className="capitalize text-accent text-xs">
//                 {" "}
//                {user?.id}
//               </span>
//             </div>

//             <div className="w-full text-xs text-right font-bold text-accent flex flex-col justify-end">
//               <small>Level: {userData?.userLevel}</small>
//               <span>
//                 {loadingBalance ? "..." : balance?.toFixed(2) + " TK"}
//               </span>
//             </div>
//           </div>
//         )} */}
//       </div>
//       {/* Auth Modals */}
//       {/* <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
//       <SignupModal
//         isOpen={showRegister}
//         onClose={() => setShowRegister(false)}
//       /> */}

//       <AuthModal
//         isOpen={showLogin}
//         onClose={() => setShowLogin(false)}
//         openTab="login"
//       />

//       <AuthModal
//         isOpen={showRegister}
//         onClose={() => setShowRegister(false)}
//         openTab="register"
//       />
//     </>
//   );
// };

// export default TopNav;
