"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Copy, Facebook, Send, Share2, X } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/redux/hook/useAuth";

/* ---------------- TYPES ---------------- */
type TabKey = "summary" | "reward" | "income" | "record";

/* ---------------- PAGE ---------------- */
export default function ReferralPage() {
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
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const [incomeLoading, setIncomeLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = (
    platform: "facebook" | "x" | "telegram" | "whatsapp"
  ) => {
    const url = encodeURIComponent(referralLink);
    const map = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}`,
      whatsapp: `https://wa.me/?text=${url}`,
    };
    window.open(map[platform], "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      {/* ---------- HEADER ---------- */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-[#2A0A5E] to-[#3B0F7A] text-white">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">বন্ধুদের আমন্ত্রণ জানান</h1>
        </div>

        {/* Tabs */}
        <div className="flex text-sm">
          {[
            { key: "summary", label: "সংক্ষিপ্ত বর্ণনা" },
            { key: "reward", label: "পুরস্কার" },
            { key: "income", label: "আয়" },
            { key: "record", label: "রেকর্ড" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex-1 py-3 text-center ${
                activeTab === tab.key
                  ? "border-b-2 border-blue-400 text-blue-300 font-medium"
                  : "opacity-80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ---------- CONTENT ---------- */}
      <main className="px-4 py-5 space-y-5">
        {activeTab === "summary" && (
          <>
            {/* Share Card */}
            <section className="rounded-xl bg-white p-4 shadow">
              <h2 className="mb-3 text-center font-semibold text-[#3B2A7A]">
                আপনার বন্ধুদের সাথে ভাগ করুন
              </h2>

              <div className="flex justify-between px-2">
                <ShareIcon
                  label="Facebook"
                  onClick={() => handleShare("facebook")}
                >
                  <Facebook />
                </ShareIcon>
                <ShareIcon label="X" onClick={() => handleShare("x")}>
                  <X />
                </ShareIcon>
                <ShareIcon
                  label="Telegram"
                  onClick={() => handleShare("telegram")}
                >
                  <Send />
                </ShareIcon>
                <ShareIcon
                  label="WhatsApp"
                  onClick={() => handleShare("whatsapp")}
                >
                  <Send />
                </ShareIcon>
                <ShareIcon label="More">
                  <Share2 />
                </ShareIcon>
              </div>

              {/* Referral link */}
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#F1F3FF] p-2">
                <span className="flex-1 truncate text-sm text-gray-700">
                  {referralLink}
                </span>
                <button
                  onClick={handleCopy}
                  className="rounded-md bg-[#5B6CFF] px-3 py-1 text-sm text-white"
                >
                  {copied ? "কপি হয়েছে" : "কপি"}
                </button>
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 gap-3">
              <StatCard title="আজকের আয়" value="৳ 0.00" />
              <StatCard title="গতকালের আয়" value="৳ 0.00" />
              <StatCard title="সুচিপত্রধারী" value="0" />
              <StatCard title="যোগ্য পরিচয়কারী" value="0" />
            </section>

            {/* Commission */}
            <section className="relative rounded-2xl bg-gradient-to-br from-[#1B083E] to-[#3A0B6B] p-4 text-white">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/bajee.png"
                  alt="BAJEE"
                  width={60}
                  height={60}
                  className="rounded-xl"
                />
                <div>
                  <p className="text-sm opacity-80">বাজি কমিশন</p>
                  <p className="text-3xl font-bold">৳ 7,500.00</p>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "reward" && <RewardTab />}

        {activeTab === "income" &&
          (incomeLoading ? <IncomeSkeleton /> : <IncomeTab />)}

        {activeTab === "record" && (
          <div className="text-center text-gray-500">
            রেকর্ড তথ্য শীঘ্রই আসছে
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- REWARD TAB ---------------- */
function RewardTab() {
  const rewards = [
    {
      id: 1,
      title: "মোট 5 টির বেশি বৈধ আমন্ত্রণ",
      amount: 399,
      current: 0,
      total: 5,
    },
    {
      id: 2,
      title: "মোট 20 টির বেশি বৈধ আমন্ত্রণ",
      amount: 1699,
      current: 0,
      total: 20,
    },
    {
      id: 3,
      title: "মোট 50 টির বেশি বৈধ আমন্ত্রণ",
      amount: 3999,
      current: 0,
      total: 50,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="overflow-hidden rounded-xl">
        <Image
          src="https://images.484930494.com/mcs-images/announcement/betbdt2f4/2691100_1747644066454.jpeg"
          alt="Reward Banner"
          width={1200}
          height={400}
          className="w-full"
        />
      </div>

      {rewards.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between rounded-xl bg-[#EEF3FA] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-xl">
              🏅
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{r.title}</p>
              <p className="text-sm text-gray-500">
                ৳ {r.amount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-gray-500">
              {r.current}/{r.total}
            </span>
            <button
              disabled={r.current < r.total}
              className={`rounded-md px-4 py-1 text-sm text-white ${
                r.current >= r.total ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              উপলব্ধ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */
function ShareIcon({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-xs text-gray-600"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        {children}
      </div>
      {label}
    </button>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-[#7DD3FC] to-[#60A5FA] p-4 text-white">
      <p className="text-sm opacity-90">{title}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function IncomeTab() {
  const totalIncome = 0;
  const todayIncome = 0;

  const rows = [
    { label: "আমন্ত্রণ পুরস্কার", value: 0 },
    { label: "সাফল্য পুরস্কার", value: 0 },
    { label: "জমা ছাড়া", value: 0 },
    { label: "বেটিং রিবেট", value: 0 },
    { label: "সুচিপত্রধারী", value: 0, isCount: true },
    { label: "যোগ্য পরিচয়কারী", value: 0, isCount: true },
    { label: "জমাদানকারী", value: 0, isCount: true },
  ];

  return (
    <div className="space-y-4">
      {/* Total Income (Top) */}
      <div className="rounded-xl bg-white py-6 text-center shadow">
        <p className="text-sm text-gray-500">মোট আয়</p>
        <p className="mt-1 text-2xl font-semibold text-[#3B2A7A]">
          ৳ {totalIncome.toFixed(2)}
        </p>
      </div>

      {/* Today Income Box */}
      <div className="rounded-xl bg-[#F1F6FD] p-4">
        <p className="mb-3 text-sm text-gray-600">
          আজকের আয়:{" "}
          <span className="font-semibold text-[#3B2A7A]">
            ৳ {todayIncome.toFixed(2)}
          </span>
        </p>

        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-600">{row.label}</span>
              <span className="font-medium text-[#3B2A7A]">
                {row.isCount ? row.value : `৳ ${row.value.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="overflow-hidden rounded-xl">
        <Image
          src="https://images.484930494.com/mcs-images/announcement/betbdt2f4/2691100_1747644066454.jpeg"
          alt="Income Banner"
          width={1200}
          height={400}
          className="w-full"
        />
      </div>

      {/* Bottom Total */}
      <div className="rounded-xl bg-white py-4 text-center shadow">
        <p className="text-sm text-gray-500">মোট আয়</p>
        <p className="mt-1 text-xl font-semibold text-[#3B2A7A]">
          ৳ {totalIncome.toFixed(2)}
        </p>
      </div>

      {/* Note */}
      <p className="px-2 text-center text-xs text-gray-400">
        নোট: সিস্টেমটি তথ্যগুলি ১৫ মিনিট পর্যন্ত আপডেট করে।
      </p>
    </div>
  );
}
function IncomeSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Top Total */}
      <div className="rounded-xl bg-white py-6 shadow">
        <div className="mx-auto h-4 w-24 rounded bg-gray-200" />
        <div className="mx-auto mt-3 h-7 w-32 rounded bg-gray-300" />
      </div>

      {/* Breakdown Box */}
      <div className="rounded-xl bg-[#F1F6FD] p-4 space-y-3">
        <div className="h-4 w-40 rounded bg-gray-200" />

        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-4 w-20 rounded bg-gray-300" />
          </div>
        ))}
      </div>

      {/* Banner Skeleton */}
      <div className="h-[140px] w-full rounded-xl bg-gray-300" />

      {/* Bottom Total */}
      <div className="rounded-xl bg-white py-4 shadow">
        <div className="mx-auto h-4 w-24 rounded bg-gray-200" />
        <div className="mx-auto mt-2 h-6 w-28 rounded bg-gray-300" />
      </div>
    </div>
  );
}
