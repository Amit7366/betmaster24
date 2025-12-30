"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";
import { getUserInfo } from "@/services/actions/auth.services";
import { ArrowDownCircle, ArrowUpCircle, ReceiptText, ShieldCheck } from "lucide-react";

const tabs = ["All", "deposit", "withdraw"];

type Transaction = {
  userName: string;
  id: string;
  date: Date;
  invoiceId: string;
  paymentMethod: any; // keep flexible (your API can be string/number)
  amount: number;
  walletNumber: any; // keep flexible
  status: string;
  type: string;
};

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();

  const cls =
    s === "pending"
      ? "bg-yellow-400/10 text-yellow-200 ring-yellow-300/20"
      : s === "success"
      ? "bg-emerald-500/10 text-emerald-200 ring-emerald-400/20"
      : s === "failed"
      ? "bg-red-500/10 text-red-200 ring-red-400/20"
      : "bg-white/5 text-white/70 ring-white/10";

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", cls)}>
      {status?.toUpperCase()}
    </span>
  );
}

const TransactionTable = () => {
  const [filterTab, setFilterTab] = useState("All");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState({
    from: new Date("2025-03-01"),
    to: new Date("2025-12-31"),
  });

  const userInfo = getUserInfo();
  const userId = userInfo?.objectId;
  const token = getFromLocalStorage("accessToken");

  useEffect(() => {
    if (!userId || !token) return;

    const controller = new AbortController();

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/transaction/all/user?userId=${userId}`, {
          headers: { Authorization: `${token}` },
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to fetch transactions.");

        const parsedTransactions = (data?.data ?? []).map((tx: any) => ({
          userName: tx.userId?.userName || "Unknown",
          id: tx._id,
          date: new Date(tx.createdAt),
          invoiceId: tx.transactionId || "-",
          amount: tx.amount,
          paymentMethod: tx.paymentMethod,
          walletNumber: tx.walletNumber,
          status: tx.status,
          type: tx.transactionType,
        }));

        setTransactions(parsedTransactions);
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          toast.error(error?.message || "Error fetching transactions.");
        }
      }
    };

    fetchTransactions();
    return () => controller.abort();
  }, [userId, token]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const dateObj = new Date(tx.date);
      const inDateRange = dateObj >= dateRange.from && dateObj <= dateRange.to;
      const matchesTab = filterTab === "All" || tx.type === filterTab;
      return inDateRange && matchesTab;
    });
  }, [transactions, dateRange.from, dateRange.to, filterTab]);

  // UI-only stats
  const stats = useMemo(() => {
    const total = filteredTransactions.length;
    const deposits = filteredTransactions.filter((t) => t.type === "deposit").length;
    const withdraws = filteredTransactions.filter((t) => t.type === "withdraw").length;
    return { total, deposits, withdraws };
  }, [filteredTransactions]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-primary px-3 pb-24 pt-6">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Transactions
              </h1>
              <p className="mt-1 text-xs text-white/60">
                View your deposit & withdraw history with status updates.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
              <ShieldCheck className="h-4 w-4" />
              Secure records
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] text-white/55">Total</p>
              <p className="mt-1 text-base font-bold text-white">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="flex items-center gap-2 text-[11px] text-white/55">
                <ArrowDownCircle className="h-4 w-4" /> Deposits
              </p>
              <p className="mt-1 text-base font-bold text-white">{stats.deposits}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="flex items-center gap-2 text-[11px] text-white/55">
                <ArrowUpCircle className="h-4 w-4" /> Withdraws
              </p>
              <p className="mt-1 text-base font-bold text-white">{stats.withdraws}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-3xl border border-white/10 bg-secondary/70 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = filterTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-semibold capitalize transition ring-1",
                    active
                      ? "bg-accent/20 text-accent ring-accent/30"
                      : "bg-white/[0.04] text-white/70 ring-white/10 hover:bg-white/[0.06]"
                  )}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-3xl border border-white/10 bg-secondary/70 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur overflow-hidden">
          {/* table header row */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-white" />
              <p className="text-sm font-semibold text-white">History</p>
            </div>
            <p className="text-xs text-white/60">
              Showing <span className="text-white font-semibold">{filteredTransactions.length}</span>{" "}
              records
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/[0.03] text-left text-[11px] font-semibold text-white/70">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Wallet</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-sm">
                {filteredTransactions.map((tx, idx) => {
                  const isDeposit = tx.type === "deposit";
                  const isWithdraw = tx.type === "withdraw";

                  return (
                    <tr key={idx} className="hover:bg-white/[0.03] transition">
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">
                          {userInfo?.userName || tx.userName}
                        </div>
                        <div className="text-[11px] text-white/55 truncate max-w-[240px]">
                          ID: {tx.id}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-white">{format(tx.date, "dd MMM yyyy")}</div>
                        <div className="text-[11px] text-white/55">{format(tx.date, "p")}</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-accent font-semibold">{tx.invoiceId}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-white/80">{String(tx.paymentMethod ?? "-")}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-white/80">{String(tx.walletNumber ?? "-")}</span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                              isDeposit
                                ? "bg-emerald-500/10 text-emerald-200 ring-emerald-400/20"
                                : isWithdraw
                                ? "bg-red-500/10 text-red-200 ring-red-400/20"
                                : "bg-white/5 text-white/70 ring-white/10"
                            )}
                          >
                            {tx.type}
                          </span>

                          <span
                            className={cn(
                              "font-semibold",
                              isDeposit
                                ? "text-emerald-200"
                                : isWithdraw
                                ? "text-red-200"
                                : "text-white/70"
                            )}
                          >
                            {isWithdraw
                              ? `-${Math.abs(tx.amount)} BDT`
                              : `${tx.amount} BDT`}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  );
                })}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                        <p className="text-sm font-semibold text-white">
                          No transactions found
                        </p>
                        <p className="mt-1 text-xs text-white/60">
                          Try switching tabs or adjusting the date range.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;

// "use client";

// import { useEffect, useState } from "react";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import { getFromLocalStorage } from "@/utils/local-storage";
// import { getUserInfo } from "@/services/actions/auth.services";

// const tabs = ["All", "deposit", "withdraw"];

// type Transaction = {
//   userName: string;
//   id: string;
//   date: Date;
//   invoiceId: string;
//   paymentMethod: number;
//   amount: number;
//   walletNumber: number;
//   status: string;
//   type: string;
// };

// const TransactionTable = () => {
//   const [filterTab, setFilterTab] = useState("All");
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [dateRange, setDateRange] = useState({
//     from: new Date("2025-03-01"),
//     to: new Date("2025-12-31"),
//   });

//   const userInfo = getUserInfo();
//   const userId = userInfo?.objectId;
//   const token = getFromLocalStorage("accessToken");

// useEffect(() => {
//   if (!userId || !token) return;

//   const controller = new AbortController();

//   const fetchTransactions = async () => {
//     try {
//       const res = await fetch(
//         `/api/transaction/all/user?userId=${userId}`,
//         {
//           headers: { Authorization: `${token}` },
//           cache: "no-store",
//           signal: controller.signal,
//         }
//       );

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(data?.message || "Failed to fetch transactions.");

//       const parsedTransactions = (data?.data ?? []).map((tx: any) => ({
//         userName: tx.userId?.userName || "Unknown",
//         id: tx._id,
//         date: new Date(tx.createdAt),
//         invoiceId: tx.transactionId || "-",
//         amount: tx.amount,
//         paymentMethod: tx.paymentMethod,
//         walletNumber: tx.walletNumber,
//         status: tx.status,
//         type: tx.transactionType,
//       }));

//       setTransactions(parsedTransactions);
//     } catch (error: any) {
//       if (error?.name !== "AbortError") {
//         toast.error(error?.message || "Error fetching transactions.");
//       }
//     }
//   };

//   fetchTransactions();
//   return () => controller.abort();
// }, [userId, token]);



//   const filteredTransactions = transactions.filter((tx) => {
//     const dateObj = new Date(tx.date);
//     const inDateRange = dateObj >= dateRange.from && dateObj <= dateRange.to;
//     const matchesTab = filterTab === "All" || tx.type === filterTab;
//     return inDateRange && matchesTab;
//   });

//   return (
//     <div className="px-4 py-10 bg-primary">
//       {/* Tabs */}
//       <div className="flex flex-wrap gap-2 mb-4">
//         {tabs.map((tab) => (
//           <button
//             key={tab}
//             className={`px-4 py-2 rounded-full border text-sm font-medium capitalize ${
//               filterTab === tab
//                 ? "bg-accent text-navbg border-accent"
//                 : "text-textcolor bg-secondary"
//             }`}
//             onClick={() => setFilterTab(tab)}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="border rounded-xl overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-secondary text-left text-sm font-semibold text-white">
//             <tr>
//               <th className="px-4 py-3">Name/Business</th>
//               <th className="px-4 py-3">Date</th>
//               <th className="px-4 py-3">Invoice ID</th>
//               <th className="px-4 py-3">Method</th>
//               <th className="px-4 py-3">Wallet</th>
//               <th className="px-4 py-3">Amount</th>
//               <th className="px-4 py-3">Action</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 text-sm">
//             {filteredTransactions.map((tx, idx) => (
//               <tr key={idx}>
//                 <td className="px-4 py-3">
//                   <div className="font-medium text-white">{userInfo?.userName}</div>
//                   <div className="text-xs text-white">ID: {tx.id}</div>
//                 </td>
//                 <td className="px-4 py-3">
//                   <div className="text-white">{format(tx.date, "dd MMM yyyy")}</div>
//                   <div className="text-xs text-gray-500">
//                     {format(tx.date, "p")}
//                   </div>
//                 </td>
//                 <td className="px-4 py-3 text-accent">{tx.invoiceId}</td>
//                 <td className="px-4 py-3 text-accent">{tx.paymentMethod}</td>
//                 <td className="px-4 py-3 text-accent">{tx.walletNumber}</td>
//                 <td
//                   className={`px-4 py-3 font-semibold ${
//                     tx.type === "deposit"
//                       ? "text-green-600"
//                       : tx.type === "withdraw"
//                       ? "text-red-600"
//                       : "text-gray-600"
//                   }`}
//                 >
//                   {tx.type === "withdraw"
//                     ? `-${Math.abs(tx.amount)} BDT`
//                     : `${tx.amount} BDT`}
//                 </td>

//                 <td className="px-4 py-3">
//                   <span
//                     className={`text-xs font-semibold px-2 py-1 rounded-full ${
//                       tx.status === "pending"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : tx.status === "success"
//                         ? "bg-green-100 text-green-700"
//                         : tx.status === "failed"
//                         ? "bg-red-100 text-red-700"
//                         : "bg-gray-100 text-gray-700"
//                     }`}
//                   >
//                     {tx.status.toUpperCase()}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//             {filteredTransactions.length === 0 && (
//               <tr>
//                 <td colSpan={6} className="text-center text-textcolor py-8">
//                   No transactions found for the selected filters.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TransactionTable;
