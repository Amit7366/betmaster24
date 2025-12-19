"use client";

import { useUserData } from "@/hooks/getMyInfo";
import { useGetAdminPromotionSummaryQuery } from "@/redux/api/adminApi";
import { useGetUserBalanceQuery, balanceApi } from "@/redux/api/balanceApi";
import { RootState } from "@/redux/store";
import { launchGame } from "@/services/actions/launchGame";
import { useLiveBalance } from "@/services/balance/userBalance";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

interface GameCardProps {
  game: Game;
  provider: string;
  setLoading?: (loading: boolean) => void;
}
type Game = {
  game_code: string;
  game_name: string;
  game_image: string;
  game_type: string;
};

const SingleGame = ({ game, provider, setLoading }: GameCardProps) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [socketliveBalance, setSocketLiveBalance] = useState(0);
  // console.log(user)
  const objectId = user?.objectId;
  const adminId = user?.objectId;
  // const balance = useLiveBalance(objectId);
  // console.log(balance);
  const { userData, loading } = useUserData();
  // console.log(userData?.promotion?.eligibleGames);
  const {
    data: balanceData,
    error,
    isLoading,
    refetch, // optional manual refetch
  } = useGetUserBalanceQuery(objectId!, {
    skip: !objectId,
  });

  const {
    data: promoSummary,
    isLoading: promoLoading,
    error: promoError,
  } = useGetAdminPromotionSummaryQuery(adminId);

  const requiredTurnover = Number(promoSummary?.data?.totalTurnoverRequired);

  // console.log(promoSummary)

  // if (!isAuthenticated) {
  //   return <div className="text-red-500">You are not logged in.</div>;
  // }
  const availableGames = userData?.promotion?.eligibleGames || [];
  const getPromoCode = userData?.promotion?.selectedPromoCode;
  const token = localStorage.getItem("accessToken") ?? "";
  // console.log(availableGames, userData?.promotion);
  const liveBalance = useLiveBalance(
    objectId,
    balanceData?.data?.currentBalance ?? 0,
    token
  );
  const handlePlay = async (game: Game) => {
    console.log(socketliveBalance);
    // const isAvailableGames =
    //   availableGames.length > 0 && availableGames.includes(game.game_type);
    // if (!isAvailableGames) {
    //   toast.warning("Game is not available in your promotion");
    //   return;
    // }
    const totalBalance = balanceData?.data?.currentBalance || 0;
    const bonusBalance =
      promoSummary?.data?.depositBonuses[0]?.bonusAmount || 0;
    const mainBalance = totalBalance - bonusBalance || 0;
    // const availableGames = userData?.promotion?.eligibleGames || [];

    // console.log(
    //   totalBalance,
    //   mainBalance,
    //   bonusBalance,
    //   availableGames,
    //   game.game_type
    // );

    if (!isAuthenticated || !user) {
      toast.warning("You are not logged in.");
      return;
    }
    if (socketliveBalance === 0) {
      toast.warning("Deposit Please...");
      return;
    }

    // ✅ Extract the repeated try/catch into a helper function
    const launchSelectedGame = async () => {
      const toastId = toast.info("Launching game...");
      try {
        const walletAmount = Number(socketliveBalance).toFixed(2); // or +liveBalance
        const payload = {
          user_id: balanceData?.data?.id || "test001",
          // wallet_amount: totalBalance || 0,
          wallet_amount: walletAmount,
          game_uid: game.game_code,
          token: process.env.NEXT_PUBLIC_PLAYWIN_TOKEN,
          timestamp: Date.now(),
        };

        const res = await launchGame(payload);

        if (res?.payload) {
          console.log(res?.payload);
          toast.success("Game launched successfully!", { id: toastId });

          // ✅ Invalidate user balance
          if (objectId) {
            dispatch(
              balanceApi.util.invalidateTags([
                { type: "UserBalance", id: objectId },
              ])
            );
            await refetch();
          }

          const launchURL = `https://playwin6.com/launchGame?user_id=${
            res.payload.user_id
          }&wallet_amount=${res.payload.wallet_amount}&game_uid=${
            res.payload.game_uid
          }&token=${res.payload.token}&timestamp=${
            res.payload.timestamp
          }&&payload=${encodeURIComponent(res.encyption)}`;

          window.location.href = launchURL;
        } else {
          toast.error("Failed to get game URL.", { id: toastId });
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong!", { id: toastId });
      }
    };
    await launchSelectedGame();
    // if (getPromoCode === "NO_PROMO") {
    //   await launchSelectedGame();
    // } else {
    //   // const isAvailableGames = availableGames.includes(game.game_type);
    //   // if (!isAvailableGames) {
    //   //   toast.warning("This game is not avaialble in your promotion...");
    //   //   return;
    //   // }
    //   await launchSelectedGame();
    // }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab is back in focus, refetching balance...");
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);
  type BalanceResponse = {
    data?: { currentBalance?: number };
  };
  useEffect(() => {
    if (!objectId || !token) return;

    const fetchBalance = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/balance/${objectId}`,
          {
            headers: {
              Authorization: `${token}`,
            },
            cache: "no-store",
          }
        );
        if (!res.ok) return;

        const result: BalanceResponse = await res.json();
        const next = result?.data?.currentBalance;
        if (typeof next === "number") setSocketLiveBalance(next); // keep as number
      } catch {
        // ignore errors; keep last known value
      }
    };

    // Run when tab becomes visible
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchBalance();
    };

    // Also refresh on window focus (covers some cases where visibility doesn't fire)
    window.addEventListener("focus", fetchBalance);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // optional: do an initial refresh on mount
    fetchBalance();

    return () => {
      window.removeEventListener("focus", fetchBalance);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [objectId, token]);

  return (
    <div
      onClick={() => handlePlay(game)}
      className="relative w-full h-[130px] rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all ease-in-out duration-300"
    >
      {/* Background image */}
      <div className="absolute z-[5] inset-0">
        <div className="relative w-full h-full">
          <Image
            src={game.game_image}
            alt={game.game_name}
            fill
            sizes="(max-width: 768px) 50px, 100px"
            className="object-cover rounded-md"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />
      </div>

      {/* Text content */}
      <div className="relative z-20 flex flex-col justify-between h-full px-3 py-4 text-white">
        <h3 className="text-xs font-bold">{game.game_name}</h3>
        <p className="text-xs text-white/80">{game.game_type}</p>
      </div>
    </div>
  );
};

export default SingleGame;
