"use client";

import { getFromLocalStorage } from "@/utils/local-storage";
import { useState, useMemo } from "react";

export default function UserBetsPage() {
  const [sbmId, setSbmId] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ totalBets: number; totalWins: number } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const token = getFromLocalStorage("accessToken");

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbmId.trim()) return;

    setLoading(true);
    setError("");
    setSummary(null);
    setHistory([]);
    setCurrentPage(1);

    try {
      const res = await fetch(
        `/api/gameRecords-txns/gametxnrecords/user-bets?sbmId=${sbmId}`,
        {
          headers: {
            Authorization: token || "",
          },
        }
      );

      const data = await res.json();

      if (res.ok && data.history) {
        // reverse order → newest first
        const reversedHistory = [...data.history].reverse();
        setSummary({
          totalBets: data.totalBets,
          totalWins: data.totalWins,
        });
        setHistory(reversedHistory);
      } else {
        setError(data.message || "No data found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Pagination logic
  const totalPages = Math.ceil(history.length / perPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return history.slice(start, end);
  }, [history, currentPage, perPage]);

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setCurrentPage(1); // reset to first page
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">User Game Records</h1>

      {/* Search Input */}
      <form
        onSubmit={handleFetch}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <input
          type="text"
          placeholder="Enter SBM ID (e.g. sbm47874)"
          value={sbmId}
          onChange={(e) => setSbmId(e.target.value.toLowerCase())}
          className="min-w-52 text-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-all"
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px] bg-green-50 border border-green-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-sm text-gray-600">Total Bets</p>
            <p className="text-xl font-bold text-green-700">{summary.totalBets}</p>
          </div>
          <div className="flex-1 min-w-[200px] bg-blue-50 border border-blue-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-sm text-gray-600">Total Wins</p>
            <p className="text-xl font-bold text-blue-700">{summary.totalWins}</p>
          </div>
        </div>
      )}

      {/* Table */}
      {history.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-600">
              Showing {paginatedData.length} of {history.length} records
            </p>
            <select
              value={perPage}
              onChange={handlePerPageChange}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none"
            >
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl shadow-md">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 border">SL.</th>
                  <th className="px-4 py-3 border">Game</th>
                  <th className="px-4 py-3 border">Provider</th>
                  <th className="px-4 py-3 border">Type</th>
                  <th className="px-4 py-3 border">Bet</th>
                  <th className="px-4 py-3 border">Win</th>
                  <th className="px-4 py-3 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border">
                      {(currentPage - 1) * perPage + i + 1}
                    </td>
                    <td className="px-4 py-3 border">{item.game?.name}</td>
                    <td className="px-4 py-3 border capitalize">{item.game?.provider}</td>
                    <td className="px-4 py-3 border capitalize">{item.game?.type}</td>
                    <td className="px-4 py-3 border font-semibold text-gray-700">{item.bet}</td>
                    <td
                      className={`px-4 py-3 border font-semibold ${
                        item.win > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {item.win}
                    </td>
                    <td className="px-4 py-3 border">
                      {new Date(item.providerTsUtc).toLocaleString("en-BD")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && summary && history.length === 0 && (
        <p className="text-gray-500 mt-6">No game records found for this user.</p>
      )}
    </div>
  );
}


// "use client";

// import { getFromLocalStorage } from "@/utils/local-storage";
// import { useState } from "react";

// export default function UserBetsPage() {
//   const [sbmId, setSbmId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [summary, setSummary] = useState<{ totalBets: number; totalWins: number } | null>(null);
//   const [history, setHistory] = useState<any[]>([]);
//   const [error, setError] = useState("");
//   const token = getFromLocalStorage("accessToken");
  

//   const handleFetch = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!sbmId.trim()) return;

//     setLoading(true);
//     setError("");
//     setSummary(null);
//     setHistory([]);

//     try {
//       const res = await fetch(
//         `/api/gameRecords-txns/gametxnrecords/user-bets?sbmId=${sbmId}`,
//         {
//           headers: {
//             Authorization: token || "",
//           },
//         }
//       );

//       const data = await res.json();

//       if (res.ok && data.history) {
//         setSummary({
//           totalBets: data.totalBets,
//           totalWins: data.totalWins,
//         });
//         setHistory(data.history);
//       } else {
//         setError(data.message || "No data found.");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch data. Try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold mb-6 text-gray-800">User Game Records</h1>

//       {/* Search Input */}
//       <form
//         onSubmit={handleFetch}
//         className="flex flex-col sm:flex-row gap-3 mb-6"
//       >
//         <input
//           type="text"
//           placeholder="Enter SBM ID (e.g. sbm47874)"
//           value={sbmId}
//           onChange={(e) => setSbmId(e.target.value.toLowerCase())}
//           className="min-w-52 text-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-all"
//         >
//           {loading ? "Loading..." : "Search"}
//         </button>
//       </form>

//       {/* Error */}
//       {error && (
//         <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
//           {error}
//         </div>
//       )}

//       {/* Summary */}
//       {summary && (
//         <div className="flex flex-wrap gap-4 mb-6">
//           <div className="flex-1 min-w-[200px] bg-green-50 border border-green-200 rounded-xl p-4 text-center shadow-sm">
//             <p className="text-sm text-gray-600">Total Bets</p>
//             <p className="text-xl font-bold text-green-700">{summary.totalBets}</p>
//           </div>
//           <div className="flex-1 min-w-[200px] bg-blue-50 border border-blue-200 rounded-xl p-4 text-center shadow-sm">
//             <p className="text-sm text-gray-600">Total Wins</p>
//             <p className="text-xl font-bold text-blue-700">{summary.totalWins}</p>
//           </div>
//         </div>
//       )}

//       {/* Table */}
//       {history.length > 0 && (
//         <div className="overflow-x-auto bg-white rounded-xl shadow-md">
//           <table className="min-w-full text-sm text-left border-collapse">
//             <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
//               <tr>
//                 <th className="px-4 py-3 border">SL.</th>
//                 <th className="px-4 py-3 border">Game</th>
//                 <th className="px-4 py-3 border">Provider</th>
//                 <th className="px-4 py-3 border">Type</th>
//                 <th className="px-4 py-3 border">Bet</th>
//                 <th className="px-4 py-3 border">Win</th>
//                 <th className="px-4 py-3 border">Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {history.map((item, i) => (
//                 <tr key={i} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-4 py-3 border">{i+1}</td>
//                   <td className="px-4 py-3 border">{item.game?.name}</td>
//                   <td className="px-4 py-3 border capitalize">{item.game?.provider}</td>
//                   <td className="px-4 py-3 border capitalize">{item.game?.type}</td>
//                   <td className="px-4 py-3 border font-semibold text-gray-700">{item.bet}</td>
//                   <td
//                     className={`px-4 py-3 border font-semibold ${
//                       item.win > 0 ? "text-green-600" : "text-red-500"
//                     }`}
//                   >
//                     {item.win}
//                   </td>
//                   <td className="px-4 py-3 border">
//                     {new Date(item.providerTsUtc).toLocaleString("en-BD")}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Empty State */}
//       {!loading && !error && summary && history.length === 0 && (
//         <p className="text-gray-500 mt-6">No game records found for this user.</p>
//       )}
//     </div>
//   );
// }
