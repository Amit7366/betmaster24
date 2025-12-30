// app/(...)/provider/[gametype]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import useStoreUserBalance from "@/hooks/storeUserBalance";
import { useNewVendorTransactions } from "@/hooks/vendorNew";
import FullScreenLoader from "@/components/shared/FullScreenLoader";

// vendorNew.ts

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
  // console.log(userData);
  const provider = params.gametype;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const queryKey = selectedCategory
    ? `${provider}&category=${selectedCategory}`
    : provider;

  const { data, isLoading, error } = useGetGamesByProviderQuery(queryKey);
  const { handlePlay, launching } = useGameLauncher();

  const REFRESH_FLAG = "needsBalanceRefresh";

  // ✅ Use your local storage hook here
  // const localData = useStoreUserBalance(userData, balanceData, records || []);

  // ✅ Log stored data whenever it updates
  // useEffect(() => {
  //   if (localData) {
  //     console.log("🧠 Local Storage Data:", localData);
  //   }
  // }, [localData]);

  useEffect(() => {
    if (typeof window === "undefined" || !objectId) return;
    const flag = localStorage.getItem(REFRESH_FLAG);
    if (flag) {
      localStorage.removeItem(REFRESH_FLAG);
      refetchBalance();
    }
  }, [objectId, userData, refetchBalance]);

  if (isLoading) return <LoadingOverlay />;

  if (error || !data?.data?.length) {
    return (
      <h1 className="text-accent px-3 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        No games found in this provider
      </h1>
    );
  }

  const games = data.data;
  const visibleGames = games.slice(0, limit);


  return (
    <section className="py-11 px-3 mt-16">
      {launching && <FullscreenLoader message="Launching game..." />}

      <FilterChips
        items={categories.filter((c) => c.type === "category")}
        selected={selectedCategory}
        onToggle={setSelectedCategory}
      />

      <div className="relative text-white font-semibold py-2 z-10 w-full flex items-center gap-2">
        <Gamepad />
        <span className="text-accent uppercase">
          {provider} {selectedCategory && `- ${selectedCategory}`}
        </span>
      </div>

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
