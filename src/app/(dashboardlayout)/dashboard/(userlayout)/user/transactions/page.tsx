"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";
import { getUserInfo } from "@/services/actions/auth.services";

const tabs = ["All", "deposit", "withdraw"];

type Transaction = {
  userName: string;
  id: string;
  date: Date;
  invoiceId: string;
  paymentMethod: number;
  amount: number;
  walletNumber: number;
  status: string;
  type: string;
};

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
      const res = await fetch(
        `/api/transaction/all/user?userId=${userId}`,
        {
          headers: { Authorization: `${token}` },
          cache: "no-store",
          signal: controller.signal,
        }
      );

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



  const filteredTransactions = transactions.filter((tx) => {
    const dateObj = new Date(tx.date);
    const inDateRange = dateObj >= dateRange.from && dateObj <= dateRange.to;
    const matchesTab = filterTab === "All" || tx.type === filterTab;
    return inDateRange && matchesTab;
  });

  return (
    <div className="px-4 py-10 bg-primary">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full border text-sm font-medium capitalize ${
              filterTab === tab
                ? "bg-accent text-navbg border-accent"
                : "text-textcolor bg-secondary"
            }`}
            onClick={() => setFilterTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-secondary text-left text-sm font-semibold text-white">
            <tr>
              <th className="px-4 py-3">Name/Business</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Invoice ID</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Wallet</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredTransactions.map((tx, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{userInfo?.userName}</div>
                  <div className="text-xs text-white">ID: {tx.id}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-white">{format(tx.date, "dd MMM yyyy")}</div>
                  <div className="text-xs text-gray-500">
                    {format(tx.date, "p")}
                  </div>
                </td>
                <td className="px-4 py-3 text-accent">{tx.invoiceId}</td>
                <td className="px-4 py-3 text-accent">{tx.paymentMethod}</td>
                <td className="px-4 py-3 text-accent">{tx.walletNumber}</td>
                <td
                  className={`px-4 py-3 font-semibold ${
                    tx.type === "deposit"
                      ? "text-green-600"
                      : tx.type === "withdraw"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {tx.type === "withdraw"
                    ? `-${Math.abs(tx.amount)} BDT`
                    : `${tx.amount} BDT`}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      tx.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : tx.status === "success"
                        ? "bg-green-100 text-green-700"
                        : tx.status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {tx.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-textcolor py-8">
                  No transactions found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
