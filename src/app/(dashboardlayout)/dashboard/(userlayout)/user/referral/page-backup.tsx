"use client";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/redux/hook/useAuth";
import { getFromLocalStorage } from "@/utils/local-storage";
import {
  Copy,
  DollarSign,
  Users,
  Share2,
  Mail,
  Activity,
  Facebook,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReferralCard() {
  // const [userData, setUserData] = useState<any>(null);
  const { user, isAuthenticated } = useAuth();
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ?? undefined
      : undefined;
  // console.log(userData);
  const objectId = user?.objectId;
  const { data: dashboard, loading: dashboardLoading } = useDashboardData(
    objectId,
    token
  );

  const userData = dashboard?.user ?? null;
  console.log(userData);
  const referralLink = `https://www.sbm777.com/register?refId=${userData?.referralId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Clik2Earn",
          text: "Get ₹5 bonus! Use my referral link:",
          url: referralLink,
        });
      } catch (err) {
        toast.error("Sharing cancelled.");
      }
    } else {
      toast.info("Sharing not supported on this device.");
    }
  };

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/normalUsers/${objectId}`,
  //         {
  //           headers: { Authorization: `${token}` },
  //         }
  //       );
  //       const json = await res.json();
  //       setUserData(json.data);
  //     } catch {
  //       toast.error("Failed to fetch user info refferal");
  //     }
  //   };

  //   fetchUserData();
  // }, [token]);

  return (
    <div className="bg-[#0B1622] text-white w-full min-h-screen mx-auto rounded-lg p-4 space-y-4 shadow-lg">
      {/* Profile section */}
      <div className="bg-[#111d2c] flex flex-col items-center text-center">
        <Image
          src={userData?.profileImg || "/avatar.png"} // replace with dynamic or static image path
          alt="Profile"
          width={64}
          height={64}
          className="rounded-full mb-2"
        />
        <p className="text-lg font-semibold">{userData?.name}</p>
        <p className="text-xs text-gray-300">
          You&apos;ll get <b className="text-accent">500 tk</b> of your
          friend&apos;s bonus as referral commission
        </p>
      </div>

      {/* Stats */}
      <div className="bg-[#111d2c] rounded-md p-3">
        <p className="text-sm font-semibold text-green-500 mb-2">Statistics</p>
        <div className="flex justify-between items-center text-sm text-gray-200 py-1">
          <div className="flex items-center gap-1">
            <DollarSign size={16} /> Total Earnings
          </div>
          <span>0.00 BDT</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-200 py-1">
          <div className="flex items-center gap-1">
            <Users size={16} /> Users Referred
          </div>
          <span>{userData?.refferCount || "0"}</span>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-[#111d2c] rounded-md p-3 text-sm">
        <p className="mb-1 text-gray-300">Your referral link</p>
        <div className="flex items-center justify-between bg-[#1a2a3a] rounded px-2 py-1 text-xs">
          <input
            readOnly
            className="bg-transparent w-full text-white outline-none"
            value={referralLink}
          />
          <button onClick={copyToClipboard}>
            <Copy size={16} />
          </button>
        </div>

        {/* Share buttons */}
        <div className="mt-3 flex flex-col items-center gap-2">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
          >
            <Share2 size={16} /> Share referral link
          </button>
          <div className="flex gap-3 justify-center mt-2 text-gray-300">
            <Mail
              size={18}
              className="cursor-pointer hover:text-white"
              onClick={handleShare}
            />
            <Activity
              size={18}
              className="cursor-pointer hover:text-white"
              onClick={handleShare}
            />
            <Facebook
              size={18}
              className="cursor-pointer hover:text-white"
              onClick={handleShare}
            />
            <Twitter
              size={18}
              className="cursor-pointer hover:text-white"
              onClick={handleShare}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
