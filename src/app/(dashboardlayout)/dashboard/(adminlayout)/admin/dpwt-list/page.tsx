"use client";

import { getFromLocalStorage } from "@/utils/local-storage";
import { useEffect, useState } from "react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const token = getFromLocalStorage("accessToken");

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
  }, [activeTab]);

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Successful Transactions
      </h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {["deposit", "withdraw"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "deposit" | "withdraw")}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 
              ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table or Loader */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500">No {activeTab} transactions found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 border">SL.</th>
                <th className="px-4 py-3 border">User</th>
                 <th className="px-4 py-3 border">User ID</th>
                <th className="px-4 py-3 border">Contact Number</th>
                <th className="px-4 py-3 border">Transaction ID</th>
                <th className="px-4 py-3 border">Amount</th>
                <th className="px-4 py-3 border">Payment Method</th>
                <th className="px-4 py-3 border">Wallet Number</th>
                <th className="px-4 py-3 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t,idx) => (
                <tr
                  key={t._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 border font-medium">
                    {idx+1 || "N/A"}
                  </td>
                  <td className="px-4 py-3 border font-medium">
                    {t.userInfo?.name || "N/A"}
                  </td>
                     <td className="px-4 py-3 border font-medium">{t.userInfo?.id+' / '+t.userInfo?.userName || "N/A"}</td>
                  <td className="px-4 py-3 border font-medium">{t.userInfo?.contactNo || "N/A"}</td>
                  <td className="px-4 py-3 border">{t.transactionId}</td>
                  <td
                    className={`px-4 py-3 border font-semibold ${
                      activeTab === "deposit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ৳{t.amount}
                  </td>
                  <td className="px-4 py-3 border capitalize">
                    {t.paymentMethod}
                  </td>
                  <td className="px-4 py-3 border">{t.walletNumber}</td>
                  <td className="px-4 py-3 border">
                    {new Date(t.createdAt).toLocaleString("en-BD")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
