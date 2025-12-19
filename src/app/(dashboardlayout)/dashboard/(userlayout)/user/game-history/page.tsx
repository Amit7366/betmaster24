"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";
import { getUserInfo } from "@/services/actions/auth.services";
import { useGetDashboardQuery } from "@/redux/api/baseApi";

const tabs = ["All", "win", "lose"];

type GameRecord = {
    txnId: string;
    gameRound: string;
    bet: number;
    win: number;
    currencyCode: string;
    providerTsUtc: string; // keep as string (API gives ISO string)
    game: {
        name: string;
        code: string;
        provider: string;
        type: string;
    };
};


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

    const sbmId = dashboard?.data?.user?.id; // ✅ correct nested structure

    useEffect(() => {
        if (!sbmId || !token) return; // wait until both are defined

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

                // ✅ Assuming your API returns an array under `data`
                const recordsData = data?.history || [];

                setRecords(recordsData);

                // Calculate totals
                const bets = recordsData.reduce((acc: number, r: any) => acc + (r.bet || 0), 0);
                const wins = recordsData.reduce((acc: number, r: any) => acc + (r.win || 0), 0);
                setTotalBets(bets);
                setTotalWins(wins);

            } catch (error: any) {
                if (error.name !== "AbortError") {
                    toast.error(error?.message || "Error fetching game records.");
                }
            } finally {
                setIsLoading(false); // ✅ stop loader
            }
        };

        fetchGameHistory();

        return () => controller.abort();
    }, [sbmId, token]); // ✅ only rerun when sbmId or token changes

    const filteredRecords = records.filter((rec) => {
        if (filterTab === "All") return true;
        if (filterTab === "win") return rec.win > 0;
        if (filterTab === "lose") return rec.win <= 0;
        return true;
    });

    return (
        <div className="px-4 py-10 bg-primary min-h-screen">
            {/* Header Stats */}
            <div className="mb-6 flex flex-wrap gap-4 text-white">
                <div className="bg-secondary rounded-xl px-4 py-3">
                    <p className="text-sm text-gray-400">Total Bets</p>
                    <p className="text-lg font-semibold">{totalBets.toFixed(2)} BDT</p>
                </div>
                <div className="bg-secondary rounded-xl px-4 py-3">
                    <p className="text-sm text-gray-400">Total Wins</p>
                    <p className="text-lg font-semibold text-green-400">{totalWins.toFixed(2)} BDT</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 rounded-full border text-sm font-medium capitalize ${filterTab === tab
                            ? "bg-accent text-navbg border-accent"
                            : "text-textcolor bg-secondary"
                            }`}
                        onClick={() => setFilterTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-60">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-accent rounded-full animate-spin"></div>
                    <p className="ml-3 text-textcolor">Loading game records...</p>
                </div>
            ) : (
                <div className="border rounded-xl overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-secondary text-left text-sm font-semibold text-white">
                            <tr>
                                <th className="px-4 py-2 text-xs">Game Name</th>
                                <th className="px-4 py-2 text-xs">Provider</th>
                                <th className="px-4 py-2 text-xs">Bet</th>
                                <th className="px-4 py-2 text-xs">Win</th>
                                {/* <th className="px-4 py-2 text-xs">Currency</th> */}
                                <th className="px-4 py-2 text-xs">Time</th>
                                <th className="px-4 py-2 text-xs">Round ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredRecords.map((rec, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-1 text-xs text-white font-medium">{rec?.game?.name}</td>
                                    <td className="px-4 py-1 text-xs text-accent capitalize">{rec?.game?.provider}</td>
                                    <td className="px-4 py-1 text-xs text-yellow-400 font-semibold">{rec.bet}</td>
                                    <td
                                        className={`px-4 py-3 font-semibold ${rec.win > 0 ? "text-green-500" : "text-red-500"
                                            }`}
                                    >
                                        {rec.win > 0 ? `+${rec.win}` : rec.win}
                                    </td>
                                    {/* <td className="px-4 py-1 text-xs text-gray-300">{rec.currencyCode}</td> */}
                                    <td className="px-4 py-1 text-xs text-gray-400">
                                        {format(new Date(rec.providerTsUtc), "dd MMM yyyy, p")}
                                    </td>
                                    <td className="px-4 py-1 text-xs text-gray-300">{rec.gameRound}</td>
                                </tr>
                            ))}

                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center text-textcolor py-8">
                                        No game records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}



        </div>
    );
};

export default GameHistoryTable;
