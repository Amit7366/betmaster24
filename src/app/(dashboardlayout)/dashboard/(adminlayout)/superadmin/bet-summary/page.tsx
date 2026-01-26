"use client";

import { getFromLocalStorage } from "@/utils/local-storage";
import React, { useMemo, useState } from "react";
import { Search, X, Gamepad2, Trophy, Coins, ChevronLeft, ChevronRight } from "lucide-react";

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
        { headers: { Authorization: token || "" } }
      );

      const data = await res.json();

      if (res.ok && data.history) {
        const reversedHistory = [...data.history].reverse(); // newest first
        setSummary({ totalBets: data.totalBets, totalWins: data.totalWins });
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

  const totalPages = Math.ceil(history.length / perPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return history.slice(start, end);
  }, [history, currentPage, perPage]);

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const money = (n: any) => {
    const num = Number(n || 0);
    return Number.isFinite(num) ? num : 0;
  };

  return (
    <section className="min-h-screen bg-slate-50/70 py-8">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-slate-900">User Game Records</h1>
          <p className="text-sm text-slate-500">
            Search by SBM ID and review bet history, wins, and timestamps.
          </p>
        </div>

        {/* Search Card */}
        <div className="mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <form onSubmit={handleFetch} className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter SBM ID (e.g. sbm47874)"
                  value={sbmId}
                  onChange={(e) => setSbmId(e.target.value.toLowerCase())}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                />
                {!!sbmId && (
                  <button
                    type="button"
                    onClick={() => setSbmId("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                    aria-label="Clear"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Loading..." : "Search"}
              </button>

              {/* Small helper */}
              <div className="text-xs text-slate-500 sm:ml-auto">
                Tip: ID must be like <span className="font-semibold text-slate-800">sbmXXXX</span>
              </div>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="border-t border-slate-200 px-4 py-3 sm:px-5">
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <div className="font-semibold">Error</div>
                <div className="text-xs mt-0.5">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Gamepad2 className="h-4 w-4" />}
              label="Total Bets"
              value={summary.totalBets.toLocaleString("en-BD")}
            />
            <StatCard
              icon={<Trophy className="h-4 w-4" />}
              label="Total Wins"
              value={summary.totalWins.toLocaleString("en-BD")}
            />
            <StatCard
              icon={<Coins className="h-4 w-4" />}
              label="Records"
              value={history.length.toLocaleString("en-BD")}
            />
            <StatCard
              icon={<Coins className="h-4 w-4" />}
              label="Win Rate"
              value={
                summary.totalBets > 0
                  ? `${Math.round((summary.totalWins / summary.totalBets) * 100)}%`
                  : "0%"
              }
            />
          </div>
        )}

        {/* Table */}
        {history.length > 0 && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {/* Table Toolbar */}
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-900">{paginatedData.length}</span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">{history.length}</span>{" "}
                records
              </p>

              <select
                value={perPage}
                onChange={handlePerPageChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100 sm:w-auto"
              >
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="sticky top-0 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">Game</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Bet</th>
                    <th className="px-4 py-3 text-right">Win</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedData.map((item, i) => {
                    const win = money(item.win);
                    const bet = money(item.bet);

                    return (
                      <tr key={i} className="bg-white hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {(currentPage - 1) * perPage + i + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {item.game?.name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 capitalize">
                            {item.game?.provider || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 capitalize text-slate-700">
                          {item.game?.type || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          {bet}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={[
                              "font-semibold",
                              win > 0 ? "text-emerald-700" : "text-rose-700",
                            ].join(" ")}
                          >
                            {win}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {item.providerTsUtc
                            ? new Date(item.providerTsUtc).toLocaleString("en-BD")
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-4 sm:px-5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>

                <div className="text-sm text-slate-600">
                  Page{" "}
                  <span className="font-semibold text-slate-900">{currentPage}</span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">{totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && summary && history.length === 0 && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-10 text-center">
            <p className="text-sm font-semibold text-slate-800">
              No game records found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              This user has no bet history in the record system.
            </p>
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
