// src/components/game/SingleGame.tsx
"use client";

import { div } from "framer-motion/client";
import Image from "next/image";

export type Game = {
  _id?: string;
  game_code: string;
  game_name: string;
  game_name_bn?: string;
  game_image: string;
  game_type: string;
  provider?: string;
};

export interface GameCardProps {
  game: Game;
  provider?: string;
  onPlay?: () => void; // injected from parent
}

const SingleGame = ({ game, onPlay }: GameCardProps) => {
  return (
    <div>
      <div
        onClick={onPlay}
        className="relative w-full h-[160px] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-all ease-in-out duration-300"
      >
        <div className="absolute z-[5] inset-0">
          <div className="relative w-full h-full">
            <Image
              src={
                game.game_image ||
                "https://i.ibb.co.com/8DNk4BVT/sbmlogonew.png"
              }
              alt={game.game_name}
              fill
              sizes="(max-width: 768px) 50px, 100px"
              className="object-cover rounded-md"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />
        </div>

        <p className="text-xs text-white/80 bg-purple-600  absolute z-30 top-0 right-0 px-4 py-1 font-bold rounded-sm">
          {game.provider}
        </p>
      </div>
      <h3 className=" font-bold text-white my-2 text-sm">{game.game_name_bn || game.game_name}</h3>
    </div>
  );
};

export default SingleGame;
