// app/(...)/category/[gametype]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SingleGame from "@/components/game/SingleGame";
import LoadingOverlay from "@/components/ui/Loader";
import FilterChips from "@/components/ui/FilterChips";
import { categories } from "@/constants";
import { useGameLauncher } from "@/hooks/useGameLauncher";
import {
  useGetGamesByCategoryQuery,
  GamesByCategoryArg,
} from "@/redux/api/gamesApi";
import { Gamepad } from "lucide-react";
import FullscreenLoader from "@/components/ui/FullscreenLoader";
import { skipToken } from "@reduxjs/toolkit/query";
import { useUserData } from "@/hooks/getMyInfo";
import { useNewVendorTransactions } from "@/hooks/vendorNew";
import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function CategoryPage({
  params,
}: {
  params: { gametype: string };
}) {
  const { user } = useSelector((s: RootState) => s.auth);
  const objectId = user?.objectId ?? undefined;

  // URL segment is your category (e.g., "slot", "crash", etc.)
  const category = params.gametype?.trim();

  const [limit, setLimit] = useState(12);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // ✅ Search
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const normalizedSearch = search.trim().toLowerCase();

  const { data: balanceData, refetch: refetchBalance } = useGetUserBalanceQuery(
    objectId!,
    {
      skip: !objectId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const { userData } = useUserData();
  const { records } = useNewVendorTransactions(userData?.id);

  // ✅ Build RTK query arg
  const arg = useMemo<GamesByCategoryArg | typeof skipToken>(() => {
    if (!category) return skipToken;
    return selectedProvider
      ? { category, provider: selectedProvider }
      : { category };
  }, [category, selectedProvider]);

  const { data, isLoading, error } = useGetGamesByCategoryQuery(arg);
  const { handlePlay, launching } = useGameLauncher();

  const REFRESH_FLAG = "needsBalanceRefresh";

  // ✅ Games list
  const games = useMemo(() => data?.data ?? [], [data]);

  // ✅ Filtered games (HOOK MUST BE ABOVE RETURNS)
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

  // ✅ Visible games must slice from filteredGames
  const visibleGames = useMemo(() => {
    return filteredGames.slice(0, limit);
  }, [filteredGames, limit]);

  // ✅ Reset pagination when provider/search changes
  useEffect(() => {
    setLimit(12);
  }, [selectedProvider, search]);

  // ✅ Focus search when category/provider changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [category, selectedProvider]);

  // ✅ ESC clears search
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

  // ✅ Refresh balance if flag exists
  useEffect(() => {
    if (typeof window === "undefined" || !objectId) return;
    const flag = localStorage.getItem(REFRESH_FLAG);
    if (flag) {
      localStorage.removeItem(REFRESH_FLAG);
      refetchBalance();
    }
  }, [objectId, userData, refetchBalance]);

  // ---------------------------
  // ✅ RETURNS AFTER ALL HOOKS
  // ---------------------------

  if (!category) {
    return (
      <h1 className="text-accent px-3 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        Invalid category.
      </h1>
    );
  }

  if (isLoading) return <LoadingOverlay />;

  if (error || games.length === 0) {
    return (
      <h1 className="text-accent px-3 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        No games found in this category
      </h1>
    );
  }

  return (
    <section className="py-11 px-3 mt-16">
      {launching && <FullscreenLoader message="Launching game..." />}

      {/* Provider chips */}
      <FilterChips
        items={categories.filter((c) => c.type === "provider")}
        selected={selectedProvider}
        onToggle={setSelectedProvider}
      />

      {/* Header + Search */}
      <div className="relative z-10 w-full flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Gamepad />
          <span className="text-accent uppercase">
            {category} {selectedProvider && `- ${selectedProvider}`}
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

      {/* Results */}
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
                provider={game.provider ?? ""}
                onPlay={() => handlePlay(game)}
              />
            ))}
          </div>

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
