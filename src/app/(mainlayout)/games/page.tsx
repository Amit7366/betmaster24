"use client";
import { games } from "@/constants";
import { launchGame } from "@/services/actions/launchGame";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaHeart } from "react-icons/fa";
import { aes256EncryptBrowser } from "@/utils/encrypt";
import axios from "axios";

type Game = {
  game_code: string;
  game_image: string;
  game_name: string;
  // add any other properties here
};

const GamePage = () => {
  const [games, setGames] = useState([]);
  const [gameUrl, setGameUrl] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(
          "https://playwin6.com/providerGame?provider=JiliGaming&count=50&type=Slot Game"
        );
        const data = await res.json();
        // console.log(data);
        setGames(data); // or setGames(data.games), depending on API response
      } catch (error) {
        console.error("Failed to fetch games:", error);
        toast.error("Failed to load games");
      }
    };

    fetchGames();
  }, []);
  const handlePlay = async (id: string) => {
    // Show loading toast
    const toastId = toast.info("Launching game...");
    // const launchUrl = `https://playwin6.com/launchGame?user_id=683c6266afc69b8d7a13a31fv&wallet_amount=1000&game_uid=${id}&token=e5b39777-8cfc-447b-bdee-2a827dba3aed&timestamp=${payload.timestamp}&payload=${payload}`;
    // window.location.href = launchUrl;

    try {
      const payload = {
        user_id: "0123456789",
        wallet_amount: 100,
        game_uid: id,
        token: process.env.NEXT_PUBLIC_PLAYWIN_TOKEN,
        timestamp: Date.now(),
      };

      const secretKey = process.env.NEXT_PUBLIC_PLAYWIN_SECRET;
      const encryptedPayload = aes256EncryptBrowser(
        '3808d1c3365ea280363fd6dbf603d712',
        JSON.stringify(payload)
      );

      const playwinUrl = `${process.env.NEXT_PUBLIC_PLAYWIN_URL}/launchGame`;
      const response = await axios.get(playwinUrl, {
        params: {
          ...payload,
          payload: encryptedPayload,
        },
      });
      console.log(response);
      // const res = await launchGame(payload);

      // if (res?.url) {
      //   // console.log(res.url);
      //   setGameUrl(res.url);

      //   // Update the same toast to success with rich color
      //   toast.success("Game launched successfully!", {
      //     id: toastId,
      //     style: {
      //       background: "#22c55e", // Greenish rich tone
      //       color: "#fff",
      //     },
      //   });
      //   window.location.href = res.url;
      // } else {
      //   // Handle case when URL not returned
      //   toast.error("Failed to get game URL.", { id: toastId });
      // }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!", { id: toastId });
    }
  };

  return (
    <>
      <section className="bg-[#2c0b4d] py-6 px-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="text-yellow-400">🔸</span>
            <span>SLOTS</span>
          </div>
          <button className="bg-purple-700 text-white text-sm px-3 py-1 rounded-full hover:bg-purple-800 transition">
            View all
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 overflow-x-auto sm:overflow-visible">
          {games?.map((game: Game, i) => (
            <div
              onClick={() => handlePlay(game?.game_code)}
              key={i}
              className="cursor-pointer bg-gradient-to-b from-[#3c0b6d] to-[#270a47] rounded-xl p-2 hover:scale-105 transition-transform duration-300"
            >
              <div className="relative w-[100%] h-[200px]">
                <Image
                  src={game?.game_image}
                  alt={game?.game_name}
                  fill
                  //   sizes="100px"
                  sizes="(max-width: 768px) 50px, 100px"
                  className="object-cover rounded-md"
                />
              </div>

              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-sm font-semibold">{game.game_name}</p>
                  <p className="text-xs text-gray-300">{"Jilli Gaming"}</p>
                </div>
                <FaHeart className="text-purple-300 hover:text-pink-500 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default GamePage;
