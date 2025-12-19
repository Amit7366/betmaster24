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
  paymentMethod: string;
  walletNumber: string;
  invoiceId: string;
  amount: number;
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

  // 🔹 New filters
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const userInfo = getUserInfo();
  const userId = userInfo?.objectId;
  const token = getFromLocalStorage("accessToken");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId || !token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/all`,
          {
            headers: { Authorization: `${token}` },
          }
        );
        const data = await res.json();
        if (res.ok) {
          const parsed = data?.data.map((tx: any) => ({
            userName: tx.userId?.userName || "Unknown",
            id: tx._id,
            date: new Date(tx.createdAt),
            invoiceId: tx.transactionId || "-",
            paymentMethod: tx.paymentMethod || "unknown",
            walletNumber: tx.walletNumber,
            amount: tx.amount,
            status: tx.status,
            type: tx.transactionType,
          }));
          setTransactions(parsed);
        } else {
          toast.error(data?.message || "Failed to fetch transactions.");
        }
      } catch {
        toast.error("Error fetching transactions.");
      }
    };

    fetchTransactions();
  }, [userId, token]);

  const handleStatusChange = async (
    index: number,
    newStatus: string,
    _id: string
  ) => {
    const selectedTx = transactions[index];
    const { id, type } = selectedTx;

    let patchUrl = "";

    if (newStatus === "success") {
      patchUrl =
        type === "withdraw"
          ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/withdraw/approve/${id}`
          : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/deposit/approve/${id}`;
    } else if (newStatus === "failed") {
      patchUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/reject/${_id}`;
    }

    if (!patchUrl) return;

    const promise = fetch(patchUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update status");
        const updated = [...transactions];
        updated[index].status = newStatus;
        setTransactions(updated);
        return res.json();
      });

    toast.promise(promise, {
      loading: "Updating status...",
      success: `Transaction ${
        newStatus === "failed" ? "rejected" : "approved"
      } successfully!`,
      error: (err) => `Error: ${err.message}`,
    });
  };

  // 🔹 Extended filtering
  const filteredTransactions = transactions.filter((tx) => {
    const inRange =
      new Date(tx.date) >= dateRange.from && new Date(tx.date) <= dateRange.to;
    const matchesType = filterTab === "All" || tx.type === filterTab;
    const matchesMethod =
      methodFilter === "All" || tx.paymentMethod === methodFilter;
    const matchesStatus =
      statusFilter === "All" || tx.status === statusFilter;
    return inRange && matchesType && matchesMethod && matchesStatus;
  });

  return (
    <div className="p-4 bg-white mt-12">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-2 rounded-full border text-sm font-medium capitalize ${
              filterTab === tab
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}

        {/* 🔹 Payment Method Filter */}
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="ml-4 border px-3 py-2 rounded text-sm"
        >
          <option value="All">All Methods</option>
          <option value="bkash">Bkash</option>
          <option value="nagad">Nagad</option>
          <option value="unknown">Other</option>
        </select>

        {/* 🔹 Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-left text-sm font-semibold text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Invoice ID</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Wallet</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredTransactions.map((tx, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{tx.userName}</div>
                  <div className="text-xs text-gray-500">ID: {tx.id}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{format(tx.date, "dd MMM yyyy")}</div>
                  <div className="text-xs text-gray-500">
                    {format(tx.date, "p")}
                  </div>
                </td>
                <td className="px-4 py-3">{tx.invoiceId}</td>
                <td className="px-4 py-3 capitalize">{tx?.paymentMethod}</td>
                <td className="px-4 py-3">{tx?.walletNumber}</td>
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
                  <select
                    className="text-xs font-medium rounded px-2 py-1 border"
                    value={tx.status}
                    onChange={(e) =>
                      handleStatusChange(idx, e.target.value, tx.id)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="success">Approved</option>
                    <option value="failed">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8">
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
//   paymentMethod: string;
//   walletNumber: string;
//   invoiceId: string;
//   amount: number;
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

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       if (!userId || !token) return;
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/all`,
//           {
//             headers: { Authorization: `${token}` },
//           }
//         );
//         const data = await res.json();
//         if (res.ok) {
//           const parsed = data?.data.map((tx: any) => ({
//             userName: tx.userId?.userName || "Unknown",
//             id: tx._id,
//             date: new Date(tx.createdAt),
//             invoiceId: tx.transactionId || "-",
//             paymentMethod: tx.paymentMethod,
//             walletNumber: tx.walletNumber,
//             amount: tx.amount,
//             status: tx.status,
//             type: tx.transactionType,
//           }));
//           setTransactions(parsed);
//         } else {
//           toast.error(data?.message || "Failed to fetch transactions.");
//         }
//       } catch {
//         toast.error("Error fetching transactions.");
//       }
//     };

//     fetchTransactions();
//   }, [userId, token]);

//   // const handleStatusChange = async (index: number, newStatus: string) => {
//   //   const selectedTx = transactions[index];
//   //   const { id, type } = selectedTx;

//   //   const isApproving = newStatus === "success";
//   //   const patchUrl =
//   //     type === "withdraw"
//   //       ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/withdraw/approve/${id}`
//   //       : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/deposit/approve/${id}`;

//   //   const promise = isApproving
//   //     ? fetch(patchUrl, {
//   //         method: "PATCH",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //           Authorization: `${token}`,
//   //         },
//   //         body: JSON.stringify({ status: "success" }),
//   //       }).then((res) => {
//   //         if (!res.ok) throw new Error("Failed to update status");
//   //         const updated = [...transactions];
//   //         updated[index].status = newStatus;
//   //         setTransactions(updated);
//   //         return res.json();
//   //       })
//   //     : Promise.resolve(); // Do nothing for non-approved statuses

//   //   toast.promise(promise, {
//   //     loading: "Updating status...",
//   //     success: "Status updated successfully!",
//   //     error: (err) => `Error: ${err.message}`,
//   //   });
//   // };

//   const handleStatusChange = async (index: number, newStatus: string,_id: string) => {
//   const selectedTx = transactions[index];
//   const { id, type } = selectedTx;
//   // console.log(_id)

//   let patchUrl = "";

//   if (newStatus === "success") {
//     patchUrl =
//       type === "withdraw"
//         ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/withdraw/approve/${id}`
//         : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/deposit/approve/${id}`;
//   } else if (newStatus === "failed") {
//     patchUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/reject/${_id}`;
//   }

//   // Skip if status is pending (no API call needed)
//   if (!patchUrl) return;

//   const promise = fetch(patchUrl, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `${token}`,
//     },
//     body: JSON.stringify({ status: newStatus }),
//   })
//     .then((res) => {
//       if (!res.ok) throw new Error("Failed to update status");
//       const updated = [...transactions];
//       updated[index].status = newStatus;
//       setTransactions(updated);
//       return res.json();
//     });

//   toast.promise(promise, {
//     loading: "Updating status...",
//     success: `Transaction ${newStatus === "failed" ? "rejected" : "approved"} successfully!`,
//     error: (err) => `Error: ${err.message}`,
//   });
// };

//   const filteredTransactions = transactions.filter((tx) => {
//     const inRange =
//       new Date(tx.date) >= dateRange.from && new Date(tx.date) <= dateRange.to;
//     const matchesType = filterTab === "All" || tx.type === filterTab;
//     return inRange && matchesType;
//   });

//   return (
//     <div className="p-4 bg-white mt-12">
//       {/* Tabs */}
//       <div className="flex flex-wrap gap-2 mb-4">
//         {tabs.map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setFilterTab(tab)}
//             className={`px-4 py-2 rounded-full border text-sm font-medium capitalize ${
//               filterTab === tab
//                 ? "bg-purple-600 text-white"
//                 : "bg-gray-100 text-gray-700"
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="border rounded-xl overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50 text-left text-sm font-semibold text-gray-600">
//             <tr>
//               <th className="px-4 py-3">Name</th>
//               <th className="px-4 py-3">Date</th>
//               <th className="px-4 py-3">Invoice ID</th>
//               <th className="px-4 py-3">Method</th>
//               <th className="px-4 py-3">Wallet</th>
//               <th className="px-4 py-3">Amount</th>
//               <th className="px-4 py-3">Status</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 text-sm">
//             {filteredTransactions.map((tx, idx) => (
//               <tr key={idx}>
//                 <td className="px-4 py-3">
//                   <div className="font-medium text-gray-900">{tx.userName}</div>
//                   <div className="text-xs text-gray-500">ID: {tx.id}</div>
//                 </td>
//                 <td className="px-4 py-3">
//                   <div>{format(tx.date, "dd MMM yyyy")}</div>
//                   <div className="text-xs text-gray-500">
//                     {format(tx.date, "p")}
//                   </div>
//                 </td>
//                 <td className="px-4 py-3">{tx.invoiceId}</td>
//                 <td className="px-4 py-3">{tx?.paymentMethod}</td>
//                 <td className="px-4 py-3">{tx?.walletNumber}</td>
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
//                   <select
//                     className="text-xs font-medium rounded px-2 py-1 border"
//                     value={tx.status}
//                     onChange={(e) => handleStatusChange(idx, e.target.value,tx.id)}
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="success">Approved</option>
//                     <option value="failed">Rejected</option>
//                   </select>
//                 </td>
//               </tr>
//             ))}
//             {filteredTransactions.length === 0 && (
//               <tr>
//                 <td colSpan={5} className="text-center text-gray-400 py-8">
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
