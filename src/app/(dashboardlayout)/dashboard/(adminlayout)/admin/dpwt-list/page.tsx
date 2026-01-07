"use client";

import { getFromLocalStorage } from "@/utils/local-storage";
import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Search, X } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const token = getFromLocalStorage("accessToken");

  // (UI only) optional search by name/id/txn/wallet
  const [q, setQ] = useState("");

  const fetchTransactions = async (type: "deposit" | "withdraw") => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admins/user/successful-transaction/record/allusers?type=success&transactionType=${type}`,
        {
          headers: {
            Authorization: token || "",
          },
        }
      );
      const data = await res.json();
      if (data.success) setTransactions(data.data);
      else setTransactions([]);
    } catch (err) {
      console.error("Error:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // UI-only filter (keeps original data intact)
  const filtered = transactions.filter((t) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    const name = (t.userInfo?.name || "").toLowerCase();
    const id = (t.userInfo?.id || "").toLowerCase();
    const userName = (t.userInfo?.userName || "").toLowerCase();
    const contact = (t.userInfo?.contactNo || "").toLowerCase();
    const txn = (t.transactionId || "").toLowerCase();
    const wallet = (t.walletNumber || "").toLowerCase();
    const method = (t.paymentMethod || "").toLowerCase();
    return (
      name.includes(s) ||
      id.includes(s) ||
      userName.includes(s) ||
      contact.includes(s) ||
      txn.includes(s) ||
      wallet.includes(s) ||
      method.includes(s)
    );
  });

  return (
    <section className="min-h-screen bg-slate-50/70 py-8">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-slate-900">
            Successful Transactions
          </h1>
          <p className="text-sm text-slate-500">
            View approved deposit/withdraw records across all users.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {(["deposit", "withdraw"] as const).map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={[
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                      "ring-1 ring-inset",
                      active
                        ? "bg-slate-900 text-white ring-slate-900"
                        : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {tab === "deposit" ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                    <span className="capitalize">{tab}</span>
                  </button>
                );
              })}
            </div>

            {/* Search (UI only) */}
            <div className="relative w-full sm:w-[360px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name / userId / txn / wallet..."
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

          {/* Count */}
          <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:px-5">
            Showing{" "}
            <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
            result(s)
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
              <p className="mt-4 text-sm font-medium text-slate-700">
                Loading transactions...
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Please wait while we fetch records.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-slate-800">
                No {activeTab} transactions found
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try switching tabs or changing your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="sticky top-0 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Wallet</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((t, idx) => (
                    <tr
                      key={t._id}
                      className="bg-white hover:bg-slate-50/60 transition"
                    >
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {t.userInfo?.name || "N/A"}
                        </div>
                        <div className="text-xs text-slate-500">
                          @{t.userInfo?.userName || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                          {t.userInfo?.id || "N/A"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {t.userInfo?.contactNo || "N/A"}
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-800">
                        {t.transactionId || "—"}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span
                          className={[
                            "font-semibold",
                            activeTab === "deposit"
                              ? "text-emerald-700"
                              : "text-rose-700",
                          ].join(" ")}
                        >
                          ৳{t.amount}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 capitalize">
                          {t.paymentMethod || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {t.walletNumber || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString("en-BD")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="h-2" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
