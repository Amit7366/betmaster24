"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";
import { getUserInfo } from "@/services/actions/auth.services";
import { useGetDashboardQuery } from "@/redux/api/baseApi";
import {
  ShieldCheck,
  Gamepad2,
  TrendingUp,
  TrendingDown,
  Coins,
} from "lucide-react";

const tabs = ["All", "win", "lose"];

type GameRecord = {
  txnId: string;
  gameRound: string;
  bet: number;
  win: number;
  currencyCode: string;
  providerTsUtc: string;
  game: {
    name: string;
    code: string;
    provider: string;
    type: string;
  };
};

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "neutral" | "green" | "red";
}) {
  const toneCls =
    tone === "green"
      ? "bg-emerald-500/10 text-emerald-200 ring-emerald-400/20"
      : tone === "red"
      ? "bg-red-500/10 text-red-200 ring-red-400/20"
      : "bg-white/[0.04] text-white ring-white/10";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-[11px] text-white/55">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-base font-bold text-white">{value}</p>
        <span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold ring-1", toneCls)}>
          {tone === "green" ? "Positive" : tone === "red" ? "Negative" : "Summary"}
        </span>
      </div>
    </div>
  );
}

function OutcomePill({ win }: { win: number }) {
  const isWin = win > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
        isWin
          ? "bg-emerald-500/10 text-emerald-200 ring-emerald-400/20"
          : "bg-red-500/10 text-red-200 ring-red-400/20"
      )}
    >
      {isWin ? "WIN" : "LOSE"}
    </span>
  );
}

const GameHistoryTable = () => {
  const [filterTab, setFilterTab] = useState("All");
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [totalBets, setTotalBets] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const userInfo = getUserInfo();
  const objectId = userInfo?.objectId;
  const token = getFromLocalStorage("accessToken");

  // Redux dashboard data
  const { data: dashboard, isFetching: dashboardLoading } = useGetDashboardQuery(objectId, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const sbmId = dashboard?.data?.user?.id;

  useEffect(() => {
    if (!sbmId || !token) return;

    const controller = new AbortController();

    const fetchGameHistory = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/gameRecords-txns/gametxnrecords/user-bets?sbmId=${sbmId}`,
          {
            headers: { Authorization: `${token}` },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!res.ok) throw new Error("Failed to fetch game history");
        const data = await res.json();

        const recordsData = data?.history || [];
        setRecords(recordsData);

        const bets = recordsData.reduce((acc: number, r: any) => acc + (r.bet || 0), 0);
        const wins = recordsData.reduce((acc: number, r: any) => acc + (r.win || 0), 0);
        setTotalBets(bets);
        setTotalWins(wins);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          toast.error(error?.message || "Error fetching game records.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameHistory();
    return () => controller.abort();
  }, [sbmId, token]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (filterTab === "All") return true;
      if (filterTab === "win") return rec.win > 0;
      if (filterTab === "lose") return rec.win <= 0;
      return true;
    });
  }, [records, filterTab]);

  const net = useMemo(() => totalWins - totalBets, [totalWins, totalBets]);
  const netTone = net > 0 ? "green" : net < 0 ? "red" : "neutral";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-primary px-3 pb-24 pt-6">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Game History</h1>
              <p className="mt-1 text-xs text-white/60">
                Track your bets and outcomes (win/lose) in one place.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
              <ShieldCheck className="h-4 w-4" />
              Records synced
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              icon={<Coins className="h-4 w-4 text-white" />}
              label="Total Bets"
              value={`${totalBets.toFixed(2)} BDT`}
              tone="neutral"
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4 text-white" />}
              label="Total Wins"
              value={`${totalWins.toFixed(2)} BDT`}
              tone="green"
            />
            <StatCard
              icon={<TrendingDown className="h-4 w-4 text-white" />}
              label="Net"
              value={`${net.toFixed(2)} BDT`}
              tone={netTone as any}
            />
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
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-semibold capitalize transition ring-1",
                    active
                      ? "bg-accent/20 text-accent ring-accent/30"
                      : "bg-white/[0.04] text-white/70 ring-white/10 hover:bg-white/[0.06]"
                  )}
                  onClick={() => setFilterTab(tab)}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="rounded-3xl border border-white/10 bg-secondary/70 p-10 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="flex items-center justify-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
              <p className="text-sm text-white/70">Loading game records...</p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-secondary/70 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur overflow-hidden">
            {/* table header row */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-white" />
                <p className="text-sm font-semibold text-white">Bets & Outcomes</p>
              </div>
              <p className="text-xs text-white/60">
                Showing <span className="text-white font-semibold">{filteredRecords.length}</span>{" "}
                records
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/[0.03] text-left text-[11px] font-semibold text-white/70">
                  <tr>
                    <th className="px-5 py-3">Game</th>
                    <th className="px-5 py-3">Provider</th>
                    <th className="px-5 py-3">Bet</th>
                    <th className="px-5 py-3">Win</th>
                    <th className="px-5 py-3">Time</th>
                    <th className="px-5 py-3">Round ID</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredRecords.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition">
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{rec?.game?.name || "—"}</div>
                        <div className="mt-1 text-[11px] text-white/55">
                          Type: {rec?.game?.type || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-white/75 ring-1 ring-white/10 capitalize">
                          {rec?.game?.provider || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-yellow-200">{rec.bet}</span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <OutcomePill win={rec.win} />
                          <span
                            className={cn(
                              "font-semibold",
                              rec.win > 0 ? "text-emerald-200" : "text-red-200"
                            )}
                          >
                            {rec.win > 0 ? `+${rec.win}` : rec.win}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-[12px] text-white/60">
                        {format(new Date(rec.providerTsUtc), "dd MMM yyyy, p")}
                      </td>

                      <td className="px-5 py-4 text-[12px] text-white/70">
                        {rec.gameRound}
                      </td>
                    </tr>
                  ))}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                          <p className="text-sm font-semibold text-white">No game records found</p>
                          <p className="mt-1 text-xs text-white/60">
                            Try switching tabs to view wins or losses.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistoryTable;

// "use client";

// import { useEffect, useState } from "react";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import { getFromLocalStorage } from "@/utils/local-storage";
// import { getUserInfo } from "@/services/actions/auth.services";
// import { useGetDashboardQuery } from "@/redux/api/baseApi";

// const tabs = ["All", "win", "lose"];

// type GameRecord = {
//     txnId: string;
//     gameRound: string;
//     bet: number;
//     win: number;
//     currencyCode: string;
//     providerTsUtc: string; // keep as string (API gives ISO string)
//     game: {
//         name: string;
//         code: string;
//         provider: string;
//         type: string;
//     };
// };


// const GameHistoryTable = () => {
//     const [filterTab, setFilterTab] = useState("All");
//     const [records, setRecords] = useState<GameRecord[]>([]);
//     const [totalBets, setTotalBets] = useState(0);
//     const [totalWins, setTotalWins] = useState(0);
//     const [isLoading, setIsLoading] = useState(false);
//     const userInfo = getUserInfo();
//     const objectId = userInfo?.objectId;
//     const token = getFromLocalStorage("accessToken");

//     // Redux dashboard data
//     const { data: dashboard, isFetching: dashboardLoading } = useGetDashboardQuery(objectId, {
//         refetchOnFocus: true,
//         refetchOnReconnect: true,
//     });

//     const sbmId = dashboard?.data?.user?.id; // ✅ correct nested structure

//     useEffect(() => {
//         if (!sbmId || !token) return; // wait until both are defined

//         const controller = new AbortController();

//         const fetchGameHistory = async () => {
//             setIsLoading(true);
//             try {
//                 const res = await fetch(
//                     `/api/gameRecords-txns/gametxnrecords/user-bets?sbmId=${sbmId}`,
//                     {
//                         headers: { Authorization: `${token}` },
//                         cache: "no-store",
//                         signal: controller.signal,
//                     }
//                 );

//                 if (!res.ok) throw new Error("Failed to fetch game history");
//                 const data = await res.json();

//                 // ✅ Assuming your API returns an array under `data`
//                 const recordsData = data?.history || [];

//                 setRecords(recordsData);

//                 // Calculate totals
//                 const bets = recordsData.reduce((acc: number, r: any) => acc + (r.bet || 0), 0);
//                 const wins = recordsData.reduce((acc: number, r: any) => acc + (r.win || 0), 0);
//                 setTotalBets(bets);
//                 setTotalWins(wins);

//             } catch (error: any) {
//                 if (error.name !== "AbortError") {
//                     toast.error(error?.message || "Error fetching game records.");
//                 }
//             } finally {
//                 setIsLoading(false); // ✅ stop loader
//             }
//         };

//         fetchGameHistory();

//         return () => controller.abort();
//     }, [sbmId, token]); // ✅ only rerun when sbmId or token changes

//     const filteredRecords = records.filter((rec) => {
//         if (filterTab === "All") return true;
//         if (filterTab === "win") return rec.win > 0;
//         if (filterTab === "lose") return rec.win <= 0;
//         return true;
//     });

//     return (
//         <div className="px-4 py-10 bg-primary min-h-screen">
//             {/* Header Stats */}
//             <div className="mb-6 flex flex-wrap gap-4 text-white">
//                 <div className="bg-secondary rounded-xl px-4 py-3">
//                     <p className="text-sm text-gray-400">Total Bets</p>
//                     <p className="text-lg font-semibold">{totalBets.toFixed(2)} BDT</p>
//                 </div>
//                 <div className="bg-secondary rounded-xl px-4 py-3">
//                     <p className="text-sm text-gray-400">Total Wins</p>
//                     <p className="text-lg font-semibold text-green-400">{totalWins.toFixed(2)} BDT</p>
//                 </div>
//             </div>

//             {/* Tabs */}
//             <div className="flex flex-wrap gap-2 mb-4">
//                 {tabs.map((tab) => (
//                     <button
//                         key={tab}
//                         className={`px-4 py-2 rounded-full border text-sm font-medium capitalize ${filterTab === tab
//                             ? "bg-accent text-navbg border-accent"
//                             : "text-textcolor bg-secondary"
//                             }`}
//                         onClick={() => setFilterTab(tab)}
//                     >
//                         {tab}
//                     </button>
//                 ))}
//             </div>

//             {isLoading ? (
//                 <div className="flex justify-center items-center h-60">
//                     <div className="w-10 h-10 border-4 border-gray-300 border-t-accent rounded-full animate-spin"></div>
//                     <p className="ml-3 text-textcolor">Loading game records...</p>
//                 </div>
//             ) : (
//                 <div className="border rounded-xl overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-secondary text-left text-sm font-semibold text-white">
//                             <tr>
//                                 <th className="px-4 py-2 text-xs">Game Name</th>
//                                 <th className="px-4 py-2 text-xs">Provider</th>
//                                 <th className="px-4 py-2 text-xs">Bet</th>
//                                 <th className="px-4 py-2 text-xs">Win</th>
//                                 {/* <th className="px-4 py-2 text-xs">Currency</th> */}
//                                 <th className="px-4 py-2 text-xs">Time</th>
//                                 <th className="px-4 py-2 text-xs">Round ID</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100 text-sm">
//                             {filteredRecords.map((rec, idx) => (
//                                 <tr key={idx}>
//                                     <td className="px-4 py-1 text-xs text-white font-medium">{rec?.game?.name}</td>
//                                     <td className="px-4 py-1 text-xs text-accent capitalize">{rec?.game?.provider}</td>
//                                     <td className="px-4 py-1 text-xs text-yellow-400 font-semibold">{rec.bet}</td>
//                                     <td
//                                         className={`px-4 py-3 font-semibold ${rec.win > 0 ? "text-green-500" : "text-red-500"
//                                             }`}
//                                     >
//                                         {rec.win > 0 ? `+${rec.win}` : rec.win}
//                                     </td>
//                                     {/* <td className="px-4 py-1 text-xs text-gray-300">{rec.currencyCode}</td> */}
//                                     <td className="px-4 py-1 text-xs text-gray-400">
//                                         {format(new Date(rec.providerTsUtc), "dd MMM yyyy, p")}
//                                     </td>
//                                     <td className="px-4 py-1 text-xs text-gray-300">{rec.gameRound}</td>
//                                 </tr>
//                             ))}

//                             {filteredRecords.length === 0 && (
//                                 <tr>
//                                     <td colSpan={7} className="text-center text-textcolor py-8">
//                                         No game records found.
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             )}



//         </div>
//     );
// };

// export default GameHistoryTable;
