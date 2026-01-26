"use client";

import WeeklyRewardModal from "@/components/modal/WeeklyRewardModal";
import CircularProgress from "@/components/ui/CircularProgress";
import { useGetAdminPromotionSummaryQuery } from "@/redux/api/adminApi";
import { useAuth } from "@/redux/hook/useAuth";
import {
  ArrowBigRight,
  Copy,
  ShieldCheck,
  Wallet2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getUserInfo } from "@/services/actions/auth.services";
import type { LucideIcon } from "lucide-react";

// Menu Item Type
type MenuItem = {
  icon: LucideIcon;
  title: string;
  value: string;
  href: string;
};

const menuItems: MenuItem[] = [
  {
    icon: require("lucide-react").DollarSign,
    title: "Deposit",
    value: "৳2000",
    href: "/dashboard/user/deposit",
  },
  {
    icon: require("lucide-react").ArrowDownCircle,
    title: "Withdraw",
    value: "৳1000",
    href: "/dashboard/user/withdraw",
  },
  {
    icon: require("lucide-react").Clock,
    title: "History",
    value: "45 txns",
    href: "/dashboard/user/transactions",
  },
  {
    icon: require("lucide-react").User,
    title: "Profile",
    value: "Updated",
    href: "/dashboard/user/profile",
  },
  {
    icon: require("lucide-react").Banknote,
    title: "Bank Details",
    value: "2 Accounts",
    href: "/dashboard/user/wallet",
  },
  {
    icon: require("lucide-react").Banknote,
    title: "Game History",
    value: "2 Accounts",
    href: "/dashboard/user/game-history",
  },
];

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] text-white/55">{label}</p>
      <p className="mt-1 text-base font-bold text-white">{value}</p>
    </div>
  );
}

const DashboardCard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loadingBalance, setLoadingBalance] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const userInfo = getUserInfo();
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ?? undefined
      : undefined;

  const objectId = userInfo.objectId;
  const adminId = objectId;

  const { data: dashboard, loading: dashboardLoading } = useDashboardData(
    objectId,
    token
  );

  // 👇 New state to control when turnover should load
  const [showTurnover, setShowTurnover] = useState(false);

  const {
    data: promoSummary,
    isLoading: promoLoading,
    error: promoError,
    refetch: refetchTurnover,
  } = useGetAdminPromotionSummaryQuery(adminId, {
    skip: !showTurnover || !adminId,
  });

  const balance = dashboard?.balance ?? 0;
  const userData = dashboard?.user ?? null;

  const completed = promoSummary?.data?.totalTurnoverCompleted;
  const required = promoSummary?.data?.totalTurnoverRequired;

  const safeCompleted = Math.max(0, Number(completed));
  const safeRequired = Math.max(0, Number(required));
  const isDone = safeRequired > 0 && safeCompleted >= safeRequired;

  const progressText = useMemo(() => {
    if (!showTurnover) return "";
    if (promoLoading) return "Loading...";
    if (!safeRequired) return "—";
    // UI only (better display)
    return `${safeCompleted} / ${safeRequired}`;
  }, [showTurnover, promoLoading, safeCompleted, safeRequired]);

  const handleCopy = () => {
    if (userData?.id) {
      navigator.clipboard.writeText(userData.id);
      toast.success("Reffer ID Copied to clipboard!", {
        description: userData.id,
      });
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-primary px-3 pb-24 pt-6 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        {/* ===== Header / Profile Card ===== */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Profile */}
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-2">
                <div className="relative h-[64px] w-[64px] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <Image
                    src={userData?.profileImg || "/avatar.png"}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white truncate">
                    {userData?.name ? userData.name : "User"}
                  </p>
                  <p className="mt-0.5 text-xs text-white/60 truncate">
                    @{userData?.userName || "username"}
                  </p>
                </div>
              </div>
              <div className="min-w-0">
                {/* Referral chip */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] text-white/80 hover:bg-white/[0.08] transition"
                >
                  <span className="text-white/60">Reffer ID:</span>
                  <span className="font-semibold text-accent">
                    {userData?.id || "—"}
                  </span>
                  <Copy className="h-3.5 w-3.5" />
                </button>

                {/* Level */}
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-[11px] text-accent ring-1 ring-accent/25">
                  <Sparkles className="h-3.5 w-3.5" />
                  Level: {userData?.level || "Normal"}
                </div>
              </div>
            </div>

            {/* Right: Turnover Card */}
            <div
              className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.06] transition"
              onClick={() => setShowTurnover(true)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {showTurnover ? "Turnover" : "See Turnover"}
                    </p>
                    <p className="text-[11px] text-white/60">
                      {showTurnover
                        ? isDone
                          ? "Completed"
                          : promoLoading
                          ? "Loading..."
                          : "Tap to refresh"
                        : "Tap to load"}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[10px] ring-1",
                      isDone
                        ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/20"
                        : "bg-white/5 text-white/70 ring-white/10"
                    )}
                  >
                    {showTurnover
                      ? isDone
                        ? "Done"
                        : "In progress"
                      : "Not loaded"}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap justify-center items-center gap-3">
                <CircularProgress
                  completed={showTurnover ? safeCompleted : 0}
                  required={showTurnover ? safeRequired : 100}
                />
                <div className="min-w-0">
                  <p className="text-xs text-white/60">Progress</p>
                  <p className="text-xs font-semibold text-white truncate">
                    {progressText || "—"}
                  </p>
                  {isDone ? (
                    <span className="mt-1 inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-200 ring-1 ring-emerald-400/20">
                      Completed
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Balance row */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatPill
              label="Main Balance"
              value={
                loadingBalance
                  ? "..."
                  : `${(typeof balance === "number" && balance > 0
                      ? balance
                      : 0
                    ).toFixed(2)} TK`
              }
            />
            <StatPill label="Status" value="Active" />
            <StatPill label="Wallet" value="Ready" />
          </div>
        </div>

        {/* ===== Quick Actions ===== */}
        <div className="rounded-3xl border border-white/10 bg-secondary/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Quick Actions</p>
              <p className="mt-1 text-xs text-white/60">
                Fast access to your most used pages.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {menuItems.map(({ icon: Icon, title, href }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.07] hover:border-white/20"
              >
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10 group-hover:ring-accent/30 group-hover:bg-accent/15 transition">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="mt-2 text-center text-[11px] text-white/75 group-hover:text-white">
                  {title}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* ===== Menu List ===== */}
        <div className="rounded-3xl border border-white/10 bg-secondary/70 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          {menuItems.map(({ icon: Icon, title, value, href }, idx) => (
            <Link
              key={idx}
              href={href}
              className="flex items-center justify-between rounded-2xl px-4 py-3 transition hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {title}
                  </p>
                  <p className="text-[11px] text-white/60 truncate">{value}</p>
                </div>
              </div>

              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
                <ArrowBigRight className="h-4 w-4 text-white/80" />
              </div>
            </Link>
          ))}
        </div>

        {isModalOpen && (
          <WeeklyRewardModal
            userId={objectId}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardCard;

// "use client";

// import WeeklyRewardModal from "@/components/modal/WeeklyRewardModal";
// import TopNav from "@/components/shared/TopNav";
// import CircularProgress from "@/components/ui/CircularProgress";
// import { useGetAdminPromotionSummaryQuery } from "@/redux/api/adminApi";
// import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
// import { useAuth } from "@/redux/hook/useAuth";
// import { getFromLocalStorage } from "@/utils/local-storage";
// import {
//   DollarSign,
//   ArrowDownCircle,
//   Clock,
//   User,
//   Banknote,
//   MessageCircle,
//   Gift,
//   LucideIcon,
//   Settings,
//   CreditCard,
//   Users,
//   Info,
//   LogOut,
//   Settings2,
//   ArrowBigRight,
//   Copy,
// } from "lucide-react";
// import Cookies from "js-cookie";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import { toast } from "sonner";
// import { useDashboardData } from "@/hooks/useDashboardData";
// import { getUserInfo } from "@/services/actions/auth.services";

// // Menu Item Type
// type MenuItem = {
//   icon: LucideIcon;
//   title: string;
//   value: string;
//   href: string;
// };
// interface MenuItem2 {
//   label: string;
//   icon: JSX.Element;
// }

// const menuItems: MenuItem[] = [
//   {
//     icon: DollarSign,
//     title: "Deposit",
//     value: "৳2000",
//     href: "/dashboard/user/deposit",
//   },
//   {
//     icon: ArrowDownCircle,
//     title: "Withdraw",
//     value: "৳1000",
//     href: "/dashboard/user/withdraw",
//   },
//   {
//     icon: Clock,
//     title: "History",
//     value: "45 txns",
//     href: "/dashboard/user/transactions",
//   },
//   {
//     icon: User,
//     title: "Profile",
//     value: "Updated",
//     href: "/dashboard/user/profile",
//   },
//   {
//     icon: Banknote,
//     title: "Bank Details",
//     value: "2 Accounts",
//     href: "/dashboard/user/wallet",
//   },
//   {
//     icon: Banknote,
//     title: "Game History",
//     value: "2 Accounts",
//     href: "/dashboard/user/game-history",
//   },
// ];

// const menuItems2: MenuItem2[] = [
//   { label: "Settings", icon: <Settings className="w-5 h-5" /> },
//   { label: "Billing Details", icon: <CreditCard className="w-5 h-5" /> },
//   { label: "User Management", icon: <Users className="w-5 h-5" /> },
//   { label: "Information", icon: <Info className="w-5 h-5" /> },
//   { label: "Log out", icon: <LogOut className="w-5 h-5" /> },
// ];

// const DashboardCard = () => {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   // const [userData, setUserData] = useState<any>(null);
//   const [loadingBalance, setLoadingBalance] = useState(false);
//   const { user, isAuthenticated } = useAuth();
//   const userInfo = getUserInfo();
//   // console.log(userInfo);
//   const token =
//     typeof window !== "undefined"
//       ? localStorage.getItem("accessToken") ?? undefined
//       : undefined;
//   const objectId = userInfo.objectId;
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // console.log(user);
//   // const adminId = "68722b350bbc20fe4d837598";
//   const adminId = objectId;
//   const { data: dashboard, loading: dashboardLoading } = useDashboardData(
//     objectId,
//     token
//   );
//   // 👇 New state to control when turnover should load
//   const [showTurnover, setShowTurnover] = useState(false);

//   const {
//     data: promoSummary,
//     isLoading: promoLoading,
//     error: promoError,
//     refetch: refetchTurnover,
//   } = useGetAdminPromotionSummaryQuery(adminId, {
//     skip: !showTurnover || !adminId, // ✅ skip until user clicks
//   });

//   // const {
//   //   data: balanceData,
//   //   error,
//   //   isLoading,
//   //   refetch, // optional manual refetch
//   // } = useGetUserBalanceQuery(objectId!, {
//   //   skip: !objectId,
//   // });
//   // const {
//   //   data: promoSummary,
//   //   isLoading: promoLoading,
//   //   error: promoError,
//   // } = useGetAdminPromotionSummaryQuery(adminId);
//   // const completed = promoSummary?.data?.totalTurnoverCompleted;
//   // const required = promoSummary?.data?.totalTurnoverRequired;
//   const balance = dashboard?.balance ?? 0;
//   const userData = dashboard?.user ?? null;
//   // console.log(userData)
//   // promo progress (safe defaults)
//   const completed = promoSummary?.data?.totalTurnoverCompleted;

//   const required = promoSummary?.data?.totalTurnoverRequired;
//   const availableGames = userData?.promotion?.eligibleGames || [];
//   const handleCopy = () => {
//     if (userData?.id) {
//       navigator.clipboard.writeText(userData.id);
//       toast.success("Reffer ID Copied to clipboard!", {
//         description: userData.id,
//       });
//     }
//   };

//   // useEffect(() => {
//   //   const t = localStorage.getItem("accessToken") || Cookies.get("accessToken"); // ✅ fallback
//   //   const id = objectId; // however you get this; ensure it’s not undefined

//   //   if (!t || !id) return; // wait until both exist

//   //   const controller = new AbortController();

//   //   const run = async () => {
//   //     try {
//   //       const res = await fetch(`/api/users/${id}`, {
//   //         method: "GET",
//   //         headers: {
//   //           Authorization: `${t}`,              // ✅ always send Bearer
//   //           Accept: "application/json",
//   //         },
//   //         cache: "no-store",                           // ✅ avoid stale cache on Chrome
//   //         signal: controller.signal,                   // ✅ abort on unmount
//   //       });

//   //       const data = await res.json().catch(() => ({}));
//   //       if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   //       setUserData(data?.data ?? data);
//   //     } catch (e: any) {
//   //       if (e?.name !== "AbortError") toast.error(e?.message || "Failed to fetch user info user page");
//   //     }
//   //   };

//   //   run();
//   //   return () => controller.abort();
//   // }, [objectId]);
//   // console.log(completed, required)
//   const safeCompleted = Math.max(0, Number(completed));
//   const safeRequired = Math.max(0, Number(required));
//   const isDone = safeRequired > 0 && safeCompleted >= safeRequired;
//   return (
//     <div className="w-full min-h-screen px-4 bg-primary text-white space-y-4">
//       {/* Header */}
//       {/* <TopNav /> */}

//       <section className="">
//         {/* Score */}
//         <div className="bg-navbg text-cardbg rounded-b-3xl px-4 py-7 mb-5">
//           <div className="flex gap-2 items-center justify-between">
//             <div>
//               <Image
//                 src={userData?.profileImg || "/avatar.png"}
//                 alt="avatar"
//                 width={70}
//                 height={70}
//                 className="rounded-full"
//               />
//               <div className="flex flex-col">
//                 <p className="text-white font-semibold text-xs">
//                   Name: {userData?.name}
//                 </p>
//                 <p className="text-white font-semibold text-xs">
//                   UserName: {userData?.userName}
//                 </p>
//                 <p
//                   className="text-sm text-gray-300 cursor-pointer flex items-center gap-2"
//                   onClick={handleCopy}
//                 >
//                   Reffer ID: <span className="text-accent">{userData?.id}</span>{" "}
//                   <Copy className="w-3 h-3" />
//                 </p>
//               </div>
//             </div>
//             <div className="flex flex-col items-center">
//               {/* pass isDone if your CircularProgress can react to it */}
//               <div
//                 className="relative flex flex-col items-center cursor-pointer group"
//                 onClick={() => setShowTurnover(true)}
//               >
//                 <CircularProgress
//                   completed={showTurnover ? safeCompleted : 0}
//                   required={showTurnover ? safeRequired : 100}
//                 />

//                 <small className="bg-white rounded-md px-2 py-1 text-black text-xs my-2 group-hover:text-yellow-400 transition">
//                   {showTurnover
//                     ? isDone
//                       ? "Turnover Completed"
//                       : "Turnover"
//                     : "See Turnover"}
//                 </small>

//                 {!showTurnover ? (
//                   <span className="text-[10px] text-white/70">
//                     {/* (Not Loaded) */}
//                   </span>
//                 ) : promoLoading ? (
//                   <span className="text-[10px] text-yellow-300">
//                     Loading...
//                   </span>
//                 ) : isDone ? (
//                   <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] text-emerald-300 bg-emerald-500/20 ring-1 ring-emerald-400/40">
//                     Completed
//                   </span>
//                 ) : (
//                   <></>
//                   // <span className="mt-1 text-[10px] text-white/70">
//                   //   {safeCompleted} / {safeRequired}
//                   // </span>
//                 )}
//               </div>

//               {/* optional: show a badge when done OR the numeric progress when not */}
//               {isDone ? (
//                 <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] text-emerald-300 bg-emerald-500/20 ring-1 ring-emerald-400/40">
//                   Completed
//                 </span>
//               ) : showTurnover ? (
//                 <span className="mt-1 text-[10px] text-white/70">{safeCompleted/safeRequired}</span>
//               ) : null}
//             </div>
//           </div>
//           <p className="text-accent text-sm">
//             Level: {userData?.level || "Normal"}
//           </p>
//           <p className="text-white font-medium text-2xl mt-4">
//             <span> {loadingBalance ? "..." : balance?.toFixed(2)} TK</span>
//           </p>
//           {/* <div className="flex justify-between items-center">
//           <p className="text-sm">Turnover Completed</p>
//           <div className="text-xl font-bold">45%</div>
//         </div> */}
//         </div>
//         {/* <div className="w-full max-w-xs bg-gray-900 text-yellow-400 p-4 rounded-lg shadow-md space-y-4">
//           {menuItems2.map((item, index) => (
//             <div
//               key={index}
//               className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition rounded-md px-4 py-2 cursor-pointer"
//             >
//               <div className="flex items-center gap-3">
//                 <div className="text-yellow-400">{item.icon}</div>
//                 <span className="text-sm font-medium">{item.label}</span>
//               </div>
//               <div className="text-yellow-400">{">"}</div>
//             </div>
//           ))}
//         </div> */}

//         {/* Menu Cards */}
//         <div className="grid grid-cols-5 gap-1">
//           {menuItems.map(({ icon: Icon, title, value, href }) => (
//             <Link
//               key={title}
//               href={href}
//               className="relative px-4 py-4 rounded-sm group hover:bg-accent hover:scale-105 duration-700"
//             >
//               <div className="w-8 h-8 border-2 border-accent group-hover:border-white rounded-full mx-auto bg-[#415162] group-hover:bg-accent flex justify-center items-center group-hover:animate-spin ">
//                 <Icon className="w-3 h-3" />
//               </div>
//               {/* <div className="flex justify-between items-center">
//                 <div className="text-2xl group-hover:text-3xl duration-300 text-white font-semibold">
//                   {value}
//                 </div>
//               </div> */}
//               <p className="text-xs text-center text-textcolor mt-1 group-hover:text-navbg">
//                 {title}
//               </p>
//             </Link>
//           ))}
//         </div>

//         <div className="grid grid-cols-1 gap-2 border-t-[1px]">
//           {menuItems.map(({ icon: Icon, title, value, href }, idx) => (
//             <Link
//               key={idx}
//               href={href}
//               className="px-4 py-3 rounded-sm group hover:bg-accent flex justify-between items-center duration-700"
//             >
//               <div className="flex justify-center items-center gap-2">
//                 <div className="w-8 h-8 bg-secondary flex justify-center items-center rounded-md">
//                   <Icon className="w-3 h-3" />
//                 </div>
//                 <p className="text-sm group-hover:text-navbg">{title}</p>
//               </div>
//               <div className="w-7 h-7 rounded-full bg-secondary flex justify-center items-center">
//                 <ArrowBigRight className="w-3 h-3" />
//               </div>
//             </Link>
//           ))}
//         </div>
//       </section>

//       {isModalOpen && (
//         <WeeklyRewardModal
//           userId={objectId}
//           onClose={() => setIsModalOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default DashboardCard;
