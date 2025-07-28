"use client";

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
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

// Menu Item Type
type MenuItem = {
  icon: LucideIcon;
  title: string;
  value: string;
  href: string;
};

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
  // {
  //   icon: MessageCircle,
  //   title: "Messages",
  //   value: "5 New",
  //   href: "#",
  // },
  // {
  //   icon: Gift,
  //   title: "Gifts",
  //   value: "3 Unopened",
  //   href: "#",
  // },
];

const DashboardCard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const token = getFromLocalStorage("accessToken");

  const objectId = user?.objectId;
  // console.log(user);
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
  const completed = promoSummary?.data?.totalTurnoverCompleted;
  const required = promoSummary?.data?.totalTurnoverRequired;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/normalUsers/${objectId}`,
          {
            headers: { Authorization: `${token}` },
          }
        );
        const json = await res.json();
        setUserData(json.data);
      } catch {
        toast.error("Failed to fetch user info");
      }
    };

    fetchUserData();
  }, [token]);
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
                <p className="text-white font-semibold text-lg">
                  {userData?.name}
                </p>
                <p className="text-sm text-gray-300">{userData?.userName}</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <CircularProgress completed={completed} required={required} />
              <small className="text-white text-xs">Turnover</small>
            </div>
          </div>
          <p className="text-accent text-sm">
            Level: {userData?.level || "Normal"}
          </p>
          <p className="text-white font-medium text-4xl mt-4">
            <span>
              BDT{" "}
              {loadingBalance
                ? "..."
                : balanceData?.data?.currentBalance?.toFixed(2)}
            </span>
          </p>
          {/* <div className="flex justify-between items-center">
          <p className="text-sm">Turnover Completed</p>
          <div className="text-xl font-bold">45%</div>
        </div> */}
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map(({ icon: Icon, title, value, href }) => (
            <Link
              key={title}
              href={href}
              className="bg-secondary relative px-4 py-10 rounded-xl group hover:bg-accent"
            >
              <div className="w-12 h-12 border-4 border-accent group-hover:border-white rounded-full absolute -top-2 -right-2 bg-[#415162] group-hover:bg-accent flex justify-center items-center group-hover:animate-spin ">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-2xl group-hover:text-3xl duration-300 text-white font-semibold">
                  {value}
                </div>
              </div>
              <p className="text-sm text-textcolor mt-1 group-hover:text-navbg">
                {title}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardCard;
