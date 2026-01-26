// app/(...)/provider/[gametype]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SingleGame from "@/components/game/SingleGame";
import LoadingOverlay from "@/components/ui/Loader";
import FilterChips from "@/components/ui/FilterChips";
import { categories } from "@/constants";
import { useGetGamesByProviderQuery } from "@/redux/api/gamesApi";
import { useGameLauncher } from "@/hooks/useGameLauncher";
import FullscreenLoader from "@/components/ui/FullscreenLoader";
import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useUserData } from "@/hooks/getMyInfo";
import { Gamepad } from "lucide-react";
import { useNewVendorTransactions } from "@/hooks/vendorNew";

// vendorNew.ts types (kept as you had)
export interface RecordItem {
  agency_uid: string;
  serial_number: string;
  currency_code: string;
  game_uid: string;
  member_account: string;
  bet_amount: string;
  win_amount: string;
  timestamp: string;
  game_round: string;
}

interface VendorResponse {
  data?: {
    payload?: {
      records?: RecordItem[];
      total_count?: number;
    };
  };
}

export default function ProviderPage({
  params,
}: {
  params: { gametype: string };
}) {
  const { user } = useSelector((s: RootState) => s.auth);
  const objectId = user?.objectId ?? undefined;

  const [limit, setLimit] = useState(12);

  const { data: balanceData, refetch: refetchBalance } = useGetUserBalanceQuery(
    objectId!,
    {
      skip: !objectId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const { userData, loading: userDataLoading } = useUserData();
  const { records, loading, error: Vendorerror } = useNewVendorTransactions(
    userData?.id
  );

  const provider = params.gametype;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const queryKey = selectedCategory
    ? `${provider}&category=${selectedCategory}`
    : provider;

  const { data, isLoading, error } = useGetGamesByProviderQuery(queryKey);
  const { handlePlay, launching } = useGameLauncher();

  const REFRESH_FLAG = "needsBalanceRefresh";

  // ✅ Search
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const normalizedSearch = search.trim().toLowerCase();

  // ✅ Games
  const games = data?.data || [];

  // ✅ Filtered games (THIS is what should drive the grid)
  const filteredGames = useMemo(() => {
    if (!normalizedSearch) return games;

    return games.filter((g: any) => {
      const name = (
        g?.name ??
        g?.title ??
        g?.gameName ??
        g?.gameNameEn ??
        g?.game_name ??
        ""
      )
        .toString()
        .toLowerCase();

      const providerName = (g?.provider ?? "").toString().toLowerCase();

      return (
        name.includes(normalizedSearch) ||
        providerName.includes(normalizedSearch)
      );
    });
  }, [games, normalizedSearch]);

  // ✅ Visible games must slice from filteredGames (NOT games)
  const visibleGames = useMemo(() => {
    return filteredGames.slice(0, limit);
  }, [filteredGames, limit]);

  // ✅ Refresh balance flag logic (unchanged)
  useEffect(() => {
    if (typeof window === "undefined" || !objectId) return;
    const flag = localStorage.getItem(REFRESH_FLAG);
    if (flag) {
      localStorage.removeItem(REFRESH_FLAG);
      refetchBalance();
    }
  }, [objectId, userData, refetchBalance]);

  // ✅ Reset pagination when filters/search changes
  useEffect(() => {
    setLimit(12);
  }, [selectedCategory, search]);

  useEffect(() => {
  inputRef.current?.focus();
}, [provider]);

useEffect(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearch("");
      inputRef.current?.focus();
    }
  };

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, []);

  if (isLoading) return <LoadingOverlay />;

  // if provider has no games at all
  if (error || games.length === 0) {
    return (
      <h1 className="text-accent px-3 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        No games found in this provider
      </h1>
    );
  }

  return (
    <section className="py-11 px-3 mt-16">
      {launching && <FullscreenLoader message="Launching game..." />}

      <FilterChips
        items={categories.filter((c) => c.type === "category")}
        selected={selectedCategory}
        onToggle={setSelectedCategory}
      />

      <div className="relative z-10 w-full flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Gamepad />
          <span className="text-accent uppercase">
            {provider} {selectedCategory && `- ${selectedCategory}`}
          </span>
        </div>

        <input
         ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH GAME..."
          className="w-full sm:w-[150px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold tracking-widest text-white placeholder:text-white/60 outline-none focus:border-accent"
        />
      </div>

      {/* ✅ If search gives no results */}
      {filteredGames.length === 0 ? (
        <div className="mt-10 text-center text-accent font-semibold">
          No games match your search.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {visibleGames.map((game: any) => (
              <SingleGame
                key={game._id}
                game={game}
                provider={game.provider ?? provider}
                onPlay={() => handlePlay(game)}
              />
            ))}
          </div>

          {/* ✅ Show More must use filteredGames.length */}
          {limit < filteredGames.length && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setLimit((p) => p + 12)}
                className="px-4 py-2 rounded bg-accent text-white"
              >
                Show More
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
