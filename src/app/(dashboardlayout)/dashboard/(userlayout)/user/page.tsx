"use client";

import WeeklyRewardModal from "@/components/modal/WeeklyRewardModal";
import TopNav from "@/components/shared/TopNav";
import CircularProgress from "@/components/ui/CircularProgress";
import { useGetAdminPromotionSummaryQuery } from "@/redux/api/adminApi";
import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
import { useAuth } from "@/redux/hook/useAuth";
import { getFromLocalStorage } from "@/utils/local-storage";
import {
  DollarSign,
  ArrowDownCircle,
  Clock,
  User,
  Banknote,
  MessageCircle,
  Gift,
  LucideIcon,
  Settings,
  CreditCard,
  Users,
  Info,
  LogOut,
  Settings2,
  ArrowBigRight,
  Copy,
} from "lucide-react";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getUserInfo } from "@/services/actions/auth.services";

// Menu Item Type
type MenuItem = {
  icon: LucideIcon;
  title: string;
  value: string;
  href: string;
};
interface MenuItem2 {
  label: string;
  icon: JSX.Element;
}

const menuItems: MenuItem[] = [
  {
    icon: DollarSign,
    title: "Deposit",
    value: "৳2000",
    href: "/dashboard/user/deposit",
  },
  {
    icon: ArrowDownCircle,
    title: "Withdraw",
    value: "৳1000",
    href: "/dashboard/user/withdraw",
  },
  {
    icon: Clock,
    title: "History",
    value: "45 txns",
    href: "/dashboard/user/transactions",
  },
  {
    icon: User,
    title: "Profile",
    value: "Updated",
    href: "/dashboard/user/profile",
  },
  {
    icon: Banknote,
    title: "Bank Details",
    value: "2 Accounts",
    href: "/dashboard/user/wallet",
  },
  {
    icon: Banknote,
    title: "Game History",
    value: "2 Accounts",
    href: "/dashboard/user/game-history",
  },
];

const menuItems2: MenuItem2[] = [
  { label: "Settings", icon: <Settings className="w-5 h-5" /> },
  { label: "Billing Details", icon: <CreditCard className="w-5 h-5" /> },
  { label: "User Management", icon: <Users className="w-5 h-5" /> },
  { label: "Information", icon: <Info className="w-5 h-5" /> },
  { label: "Log out", icon: <LogOut className="w-5 h-5" /> },
];

const DashboardCard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  // const [userData, setUserData] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const userInfo = getUserInfo();
  // console.log(userInfo);
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ?? undefined
      : undefined;
  const objectId = userInfo.objectId;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // console.log(user);
  // const adminId = "68722b350bbc20fe4d837598";
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
    skip: !showTurnover || !adminId, // ✅ skip until user clicks
  });



  // const {
  //   data: balanceData,
  //   error,
  //   isLoading,
  //   refetch, // optional manual refetch
  // } = useGetUserBalanceQuery(objectId!, {
  //   skip: !objectId,
  // });
  // const {
  //   data: promoSummary,
  //   isLoading: promoLoading,
  //   error: promoError,
  // } = useGetAdminPromotionSummaryQuery(adminId);
  // const completed = promoSummary?.data?.totalTurnoverCompleted;
  // const required = promoSummary?.data?.totalTurnoverRequired;
  const balance = dashboard?.balance ?? 0;
  const userData = dashboard?.user ?? null;
  // console.log(userData)
  // promo progress (safe defaults)
  const completed = promoSummary?.data?.totalTurnoverCompleted;

  const required = promoSummary?.data?.totalTurnoverRequired;
  const availableGames = userData?.promotion?.eligibleGames || [];
  const handleCopy = () => {
    if (userData?.id) {
      navigator.clipboard.writeText(userData.id);
      toast.success("Reffer ID Copied to clipboard!", {
        description: userData.id,
      });
    }
  };

  // useEffect(() => {
  //   const t = localStorage.getItem("accessToken") || Cookies.get("accessToken"); // ✅ fallback
  //   const id = objectId; // however you get this; ensure it’s not undefined

  //   if (!t || !id) return; // wait until both exist

  //   const controller = new AbortController();

  //   const run = async () => {
  //     try {
  //       const res = await fetch(`/api/users/${id}`, {
  //         method: "GET",
  //         headers: {
  //           Authorization: `${t}`,              // ✅ always send Bearer
  //           Accept: "application/json",
  //         },
  //         cache: "no-store",                           // ✅ avoid stale cache on Chrome
  //         signal: controller.signal,                   // ✅ abort on unmount
  //       });

  //       const data = await res.json().catch(() => ({}));
  //       if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  //       setUserData(data?.data ?? data);
  //     } catch (e: any) {
  //       if (e?.name !== "AbortError") toast.error(e?.message || "Failed to fetch user info user page");
  //     }
  //   };

  //   run();
  //   return () => controller.abort();
  // }, [objectId]);
  // console.log(completed, required)
  const safeCompleted = Math.max(0, Number(completed));
  const safeRequired = Math.max(0, Number(required));
  const isDone = safeRequired > 0 && safeCompleted >= safeRequired;
  return (
    <div className="w-full min-h-screen px-4 bg-primary text-white space-y-4">
      {/* Header */}
      {/* <TopNav /> */}

      <section className="">
        {/* Score */}
        <div className="bg-navbg text-cardbg rounded-b-3xl px-4 py-7 mb-5">
          <div className="flex gap-2 items-center justify-between">
            <div>
              <Image
                src={userData?.profileImg || "/avatar.png"}
                alt="avatar"
                width={70}
                height={70}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <p className="text-white font-semibold text-xs">
                  Name: {userData?.name}
                </p>
                <p className="text-white font-semibold text-xs">
                  UserName: {userData?.userName}
                </p>
                <p
                  className="text-sm text-gray-300 cursor-pointer flex items-center gap-2"
                  onClick={handleCopy}
                >
                  Reffer ID: <span className="text-accent">{userData?.id}</span> <Copy className="w-3 h-3" />
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              {/* pass isDone if your CircularProgress can react to it */}
              <div
                className="relative flex flex-col items-center cursor-pointer group"
                onClick={() => setShowTurnover(true)}
              >
                <CircularProgress
                  completed={showTurnover ? safeCompleted : 0}
                  required={showTurnover ? safeRequired : 100}
                />

                <small className="text-white text-xs my-2 group-hover:text-yellow-400 transition">
                  {showTurnover
                    ? isDone
                      ? "Turnover Completed"
                      : "Turnover"
                    : "See Turnover"}
                </small>

                {!showTurnover ? (
                  <span className="text-[10px] text-white/70">(Not Loaded)</span>
                ) : promoLoading ? (
                  <span className="text-[10px] text-yellow-300">Loading...</span>
                ) : isDone ? (
                  <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] text-emerald-300 bg-emerald-500/20 ring-1 ring-emerald-400/40">
                    Completed
                  </span>
                ) : ( <></>
                  // <span className="mt-1 text-[10px] text-white/70">
                  //   {safeCompleted} / {safeRequired}
                  // </span>
                )}
              </div>


              {/* optional: show a badge when done OR the numeric progress when not */}
              {isDone ? (
                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] text-emerald-300 bg-emerald-500/20 ring-1 ring-emerald-400/40">
                  Completed
                </span>
              ) : (
                <span className="mt-1 text-[10px] text-white/70">
                  {safeCompleted} / {safeRequired}
                </span>
              )}
            </div>
          </div>
          <p className="text-accent text-sm">
            Level: {userData?.level || "Normal"}
          </p>
          <p className="text-white font-medium text-2xl mt-4">
            <span> {loadingBalance ? "..." : balance?.toFixed(2)} TK</span>
          </p>
          {/* <div className="flex justify-between items-center">
          <p className="text-sm">Turnover Completed</p>
          <div className="text-xl font-bold">45%</div>
        </div> */}
        </div>
        {/* <div className="w-full max-w-xs bg-gray-900 text-yellow-400 p-4 rounded-lg shadow-md space-y-4">
          {menuItems2.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition rounded-md px-4 py-2 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="text-yellow-400">{item.icon}</div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="text-yellow-400">{">"}</div>
            </div>
          ))}
        </div> */}

        {/* Menu Cards */}
        <div className="grid grid-cols-5 gap-1">
          {menuItems.map(({ icon: Icon, title, value, href }) => (
            <Link
              key={title}
              href={href}
              className="relative px-4 py-4 rounded-sm group hover:bg-accent hover:scale-105 duration-700"
            >
              <div className="w-8 h-8 border-2 border-accent group-hover:border-white rounded-full mx-auto bg-[#415162] group-hover:bg-accent flex justify-center items-center group-hover:animate-spin ">
                <Icon className="w-3 h-3" />
              </div>
              {/* <div className="flex justify-between items-center">
                <div className="text-2xl group-hover:text-3xl duration-300 text-white font-semibold">
                  {value}
                </div>
              </div> */}
              <p className="text-xs text-center text-textcolor mt-1 group-hover:text-navbg">
                {title}
              </p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 border-t-[1px]">
          {menuItems.map(({ icon: Icon, title, value, href }, idx) => (
            <Link
              key={idx}
              href={href}
              className="px-4 py-3 rounded-sm group hover:bg-accent flex justify-between items-center duration-700"
            >
              <div className="flex justify-center items-center gap-2">
                <div className="w-8 h-8 bg-secondary flex justify-center items-center rounded-md">
                  <Icon className="w-3 h-3" />
                </div>
                <p className="text-sm group-hover:text-navbg">{title}</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-secondary flex justify-center items-center">
                <ArrowBigRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <WeeklyRewardModal
          userId={objectId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardCard;
