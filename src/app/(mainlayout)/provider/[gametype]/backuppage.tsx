// app/(...)/provider/[gametype]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import SingleGame from "@/components/game/SingleGame";
import LoadingOverlay from "@/components/ui/Loader";
import FilterChips from "@/components/ui/FilterChips";
import { categories } from "@/constants";
import { useGetGamesByProviderQuery } from "@/redux/api/gamesApi";
import { useGameLauncher } from "@/hooks/useGameLauncher"; // from previous message
import { Gamepad } from "lucide-react";
import FullscreenLoader from "@/components/ui/FullscreenLoader";
import { useVendorTransactions } from "@/hooks/useVendorTransactions";
import { useNewVendorTransactions } from "@/hooks/vendorNew";
import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function ProviderPage({
  params,
}: {
  params: { gametype: string };
}) {
      const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
    const objectId = user?.objectId ?? undefined;

  const { data: balanceData, refetch: refetchBalance } = useGetUserBalanceQuery(
    objectId!,
    {
      skip: !objectId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  
    const { records, loading, error: Vendorerror } = useNewVendorTransactions();
  const provider = params.gametype; // URL represents provider
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // const { refetch: refetchVendorTxns } = useVendorTransactions();


  // Build query key: provider + optional category
  const queryKey = selectedCategory
    ? `${provider}&category=${selectedCategory}`
    : provider;

  const { data, isLoading, error } = useGetGamesByProviderQuery(queryKey);
  const { handlePlay, launching } = useGameLauncher();
   const REFRESH_FLAG = "needsBalanceRefresh";



  console.log('provider page:',records.length);

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
      // refetchVendor, 
      refetchBalance]);

  // useEffect(() => {
  //   const handleFocus = () => refetch();
  //   window.addEventListener("focus", handleFocus);
  //   return () => window.removeEventListener("focus", handleFocus);
  // }, [refetch]);

  // ✅ Automatically refetch vendor transactions
  // useEffect(() => {
  //   // Run once on page load
  //   refetchVendorTxns();

  //   // Run again whenever tab regains focus
  //   const handleFocus = () => {
  //     refetchVendorTxns();
  //   };
  //   window.addEventListener("focus", handleFocus);
  //   return () => window.removeEventListener("focus", handleFocus);
  // }, [refetchVendorTxns]);

  // Optional: if you want also refresh when category/provider changes
  // useEffect(() => {
  //   refetchVendorTxns();
  // }, [provider, selectedCategory, refetchVendorTxns]);

  if (isLoading ) return <LoadingOverlay />;
  if (error || !data?.data?.length) {
    return (
      <h1 className="text-accent px-3 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        No games found in this provider
      </h1>
    );
  }

  const games = data.data;

  return (
    <section className="py-11 px-3">
      {launching && <FullscreenLoader message="Launching game..." />}
      {/* Category chips */}
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
        {games.map((game: any) => (
          <SingleGame
            key={game._id}
            game={game}
            provider={game.provider ?? provider}
            onPlay={() => handlePlay(game)}
          />
        ))}
      </div>
    </section>
  );
}
