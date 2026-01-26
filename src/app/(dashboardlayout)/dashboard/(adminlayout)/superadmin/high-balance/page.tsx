"use client";

import { getFromLocalStorage } from "@/utils/local-storage";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  TrendingUp,
  Wallet,
  Users,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";

export default function HighBalanceUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = getFromLocalStorage("accessToken");

  // UI-only: quick search
  const [q, setQ] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admins/users/high-balance/allusers", {
          headers: { Authorization: token || "" },
        });
        const data = await res.json();
        // console.log(data?.data)
        //   setUsers(data?.data);
        if (data.success) {
           setUsers(data?.data);
          // const sorted = data.data.sort(
          //   (a: any, b: any) => b.currentBalance - a.currentBalance
          // );
          // setUsers(sorted);
        } else {
          setError(data.message || "Failed to fetch data.");
        }
      } catch (err) {
        console.error(err);
        setError("Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const money = (n: any) => {
    const num = Number(n || 0);
    return Number.isFinite(num) ? num : 0;
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u: any) => {
      const id = (u.id || "").toLowerCase();
      const name = (u.userInfo?.name || "").toLowerCase();
      const userName = (u.userInfo?.userName || "").toLowerCase();
      const contact = (u.userInfo?.contactNo || "").toLowerCase();
      return id.includes(s) || name.includes(s) || userName.includes(s) || contact.includes(s);
    });
  }, [users, q]);

  // ✅ Summary stats (computed from filtered list)
  const stats = useMemo(() => {
    const totalUsers = filtered.length;

    let totalBalance = 0;
    let topBalance = 0;
    let activeCount = 0;
    let kycCount = 0;

    for (const u of filtered) {
      const bal = money(u.currentBalance);
      totalBalance += bal;
      if (bal > topBalance) topBalance = bal;

      const status = (u.userInfo?.status || "").toLowerCase();
      if (status === "active") activeCount++;

      if (u.userInfo?.kycVerified) kycCount++;
    }

    const avgBalance = totalUsers ? totalBalance / totalUsers : 0;

    return {
      totalUsers,
      totalBalance,
      avgBalance,
      topBalance,
      activeCount,
      kycCount,
    };
  }, [filtered]);

  if (loading)
    return (
      <section className="min-h-screen bg-slate-50/70 py-10">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-10 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
            <p className="mt-4 text-sm font-medium text-slate-700">
              Loading high balance users...
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Fetching & sorting users by balance.
            </p>
          </div>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="min-h-screen bg-slate-50/70 py-10">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <div className="font-semibold">Something went wrong</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </section>
    );

  return (
    <section className="min-h-screen bg-slate-50/70 py-8">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">
              High Balance Users
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Users sorted by current balance (high → low).
          </p>
        </div>

        {/* ✅ Summary Cards */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Users"
            value={stats.totalUsers.toLocaleString("en-BD")}
          />
          <StatCard
            icon={<Wallet className="h-4 w-4" />}
            label="Total Balance"
            value={`${fmt(stats.totalBalance)} BDT`}
          />
          <StatCard
            icon={<BadgeCheck className="h-4 w-4" />}
            label="Avg Balance"
            value={`${fmt(stats.avgBalance)} BDT`}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Top Balance"
            value={`${fmt(stats.topBalance)} BDT`}
          />
          <StatCard
            icon={<BadgeCheck className="h-4 w-4" />}
            label="Active"
            value={stats.activeCount.toLocaleString("en-BD")}
          />
          <StatCard
            icon={<ShieldCheck className="h-4 w-4" />}
            label="KYC Verified"
            value={stats.kycCount.toLocaleString("en-BD")}
          />
        </div>

        {/* Toolbar */}
        <div className="mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filtered.length}
              </span>{" "}
              result(s)
            </div>

            {/* Search (UI-only) */}
            <div className="relative w-full sm:w-[380px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by id / name / username / contact..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
              />
              {!!q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-10 text-center">
            <p className="text-sm font-semibold text-slate-800">No users found</p>
            <p className="mt-1 text-xs text-slate-500">
              Try clearing the search or check API response.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="sticky top-0 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3 text-right">Total Deposit</th>
                    <th className="px-4 py-3 text-right">Total Withdraw</th>
                    <th className="px-4 py-3 text-right">Current Balance</th>
                    <th className="px-4 py-3 text-right">Coin Balance</th>
                    <th className="px-4 py-3 text-right">Referral</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">KYC</th>
                    <th className="px-4 py-3">User Level</th>
                    <th className="px-4 py-3">Signup Bonus</th>
                    <th className="px-4 py-3">Last Active</th>
                    <th className="px-4 py-3">Created At</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((u: any) => {
                    const status = (u.userInfo?.status || "unknown").toLowerCase();
                    const isActive = status === "active";
                    const kyc = !!u.userInfo?.kycVerified;
                    const bonus = !!u.userInfo?.signupBonusGiven;

                    return (
                      <tr
                        key={u._id}
                        className="bg-white hover:bg-slate-50/60 transition"
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                            {u.id || "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {u.userInfo?.name || "N/A"}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {u.userInfo?.userName || "N/A"}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {u.userInfo?.contactNo || "—"}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                          {fmt(money(u.totalDeposit))}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-rose-700">
                          {fmt(money(u.totalWithdraw))}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-slate-900">
                            {fmt(money(u.currentBalance))}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right text-slate-700">
                          {u.currentCoinBalance ?? 0}
                        </td>

                        <td className="px-4 py-3 text-right text-slate-700">
                          {u.userInfo?.refferCount ?? 0}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                              isActive
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                : "bg-rose-50 text-rose-700 ring-rose-100",
                            ].join(" ")}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                              kyc
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                : "bg-slate-100 text-slate-700 ring-slate-200",
                            ].join(" ")}
                          >
                            {kyc ? "Verified" : "Not verified"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {u.userInfo?.userLevel ?? "—"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                              bonus
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                : "bg-slate-100 text-slate-700 ring-slate-200",
                            ].join(" ")}
                          >
                            {bonus ? "Given" : "Not given"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {u.userInfo?.lastActiveAt
                            ? new Date(u.userInfo.lastActiveAt).toLocaleString("en-BD")
                            : "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleString("en-BD")
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="h-2" />
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200">
          {icon}
        </div>
      </div>
      <div className="mt-2 text-base font-semibold text-slate-900">{value}</div>
    </div>
  );
}
