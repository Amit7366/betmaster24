"use client";

import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import SingleGame from "../game/SingleGame";

interface Game {
  game_name: string;
  game_code: string;
  game_type: string;
  game_image: string;
}

interface ProviderSliderProps {
  provider: string;
  games: Game[];
}

const chunk = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

const ProviderSlider = ({ provider, games }: ProviderSliderProps) => {
  const gameChunks = chunk(games, 6);

  // ✅ Create a CSS-safe unique ID
  const uniqueId = useMemo(
    () => Math.random().toString(36).substring(2, 9),
    []
  );

  const prevClass = `swiper-button-prev-${uniqueId}`;
  const nextClass = `swiper-button-next-${uniqueId}`;

  return (
    <div className="relative bg-[#092731] rounded-xl p-4 my-3">
      {/* Top Row: Title + Arrows */}
      <div className="flex items-center justify-between">
        <div className="relative bg-[#0e3d48] text-white font-bold px-4 py-2 rounded-t-xl -mt-6 z-10 w-fit">
          <span className="text-yellow-400">{provider}({games.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`${prevClass} w-8 h-8 bg-[#0e3d48] text-white rounded-full flex items-center justify-center`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className={`${nextClass} w-8 h-8 bg-[#0e3d48] text-white rounded-full flex items-center justify-center`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Swiper Slider */}
      <Swiper
        modules={[Navigation]}
        navigation={{
          prevEl: `.${prevClass}`,
          nextEl: `.${nextClass}`,
        }}
        className="mt-4"
      >
        {gameChunks.map((group, idx) => (
          <SwiperSlide key={idx}>
            <div className="grid grid-cols-3 gap-2">
              {group.map((game, index) => (
                <SingleGame key={index} game={game} provider={provider} />
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProviderSlider;
