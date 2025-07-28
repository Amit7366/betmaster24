"use client";

import { useGetUserBalanceQuery, balanceApi } from "@/redux/api/balanceApi";
import { RootState } from "@/redux/store";
import { launchGame } from "@/services/actions/launchGame";
import Image from "next/image";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

interface GameCardProps {
  game: {
    game_code: string;
    game_name: string;
    game_image: string;
    game_type: string;
  },
  provider: string; 
}

const SingleGame = ({ game,provider }: GameCardProps) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const objectId = user?.objectId;

  const {
    data: balanceData,
    error,
    isLoading,
    refetch, // optional manual refetch
  } = useGetUserBalanceQuery(objectId!, {
    skip: !objectId,
  });

  // if (!isAuthenticated) {
  //   return <div className="text-red-500">You are not logged in.</div>;
  // }

 const handlePlay = async (id: string) => {

  if (!isAuthenticated || !user) {
    toast.warning("You are not logged in.");
    return;
  }

  const toastId = toast.info("Launching game...");
  try {
    const payload = {
      user_id: balanceData?.data?.id || "test001",
      wallet_amount: balanceData?.data?.currentBalance || 100,
      game_uid: id,
      token: process.env.NEXT_PUBLIC_PLAYWIN_TOKEN,
      timestamp: Date.now(),
    };

    const res = await launchGame(payload);
    console.log("payload feedback: ", res);

    if (res?.payload) {
      toast.success("Game launched successfully!", { id: toastId });

      // ✅ Invalidate user balance
      if (objectId) {
        dispatch(
          balanceApi.util.invalidateTags([{ type: "UserBalance", id: objectId }])
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

  return (
    <div
      onClick={() => handlePlay(game?.game_code)}
      className="shine-effect relative w-full h-[130px] rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all ease-in-out duration-300"
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
