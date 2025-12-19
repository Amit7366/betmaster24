// app/(...)/category/[gametype]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
import FullScreenLoader from "@/components/shared/FullScreenLoader";

export default function CategoryPage({
  params,
}: {
  params: { gametype: string };
}) {
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
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
  const { records, loading, error: Vendorerror } = useNewVendorTransactions(userData?.id);
  // URL segment is your category (e.g., "slot", "crash", etc.)
  const category = params.gametype?.trim();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Build the arg object expected by the hook (or skip if no category)
  const arg = useMemo<GamesByCategoryArg | typeof skipToken>(() => {
    if (!category) return skipToken;
    return selectedProvider
      ? { category, provider: selectedProvider }
      : { category };
  }, [category, selectedProvider]);

  const { data, isLoading, error } = useGetGamesByCategoryQuery(arg);
  const { handlePlay, launching } = useGameLauncher();
  const REFRESH_FLAG = "needsBalanceRefresh";



  console.log('provider page:', records.length);

  useEffect(() => {
    if (typeof window === "undefined" || !objectId) return;
    const flag = localStorage.getItem(REFRESH_FLAG);
    if (flag) {
      localStorage.removeItem(REFRESH_FLAG);
      //txn chk insert
      //  (async () => {
      //   await refetchVendor();

      // })();
      refetchBalance();

    }
  }, [
    objectId,
    userData,
    // refetchVendor, 
    refetchBalance]);


  if (!category) {
    return (
      <h1 className="text-accent px-3 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        Invalid category.
      </h1>
    );
  }

  if (isLoading) return <LoadingOverlay />;

  const games = data?.data ?? [];


  const visibleGames = games.slice(0, limit);

  if (error || games.length === 0) {
    return (
      <h1 className="text-accent px-3 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        No games found in this category
      </h1>
    );
  }

  return (
    <section className="py-11 px-3">
      {launching && <FullscreenLoader message="Launching game..." />}

      {/* Provider chips */}
      <FilterChips
        items={categories.filter((c) => c.type === "provider")}
        selected={selectedProvider}
        onToggle={setSelectedProvider}
      />

      <div className="relative text-white font-semibold py-2 z-10 w-full flex items-center gap-2">
        <Gamepad />
        <span className="text-accent uppercase">
          {category} {selectedProvider && `- ${selectedProvider}`}
        </span>
      </div>

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
      {limit < games.length && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setLimit((p) => p + 12)}
            className="px-4 py-2 rounded bg-accent text-white"
          >
            Show More
          </button>
        </div>
      )}

    </section>
    // <FullScreenLoader/>
  );
}
