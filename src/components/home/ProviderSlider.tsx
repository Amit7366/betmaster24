// src/components/home/ProviderSlider.tsx
"use client";

import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, Gamepad } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import SingleGame, { Game } from "../game/SingleGame";
import { useGameLauncher } from "@/hooks/useGameLauncher";
import FullscreenLoader from "../ui/FullscreenLoader";

interface ProviderSliderProps {
  provider: string;
  games: Game[];
  // setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const chunk = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

const ProviderSlider = ({ provider, games }: ProviderSliderProps) => {
const { handlePlay, launching } = useGameLauncher();
  const gameChunks = chunk(games, 6);

  const uniqueId = useMemo(
    () => Math.random().toString(36).substring(2, 9),
    []
  );
  const prevClass = `swiper-button-prev-${uniqueId}`;
  const nextClass = `swiper-button-next-${uniqueId}`;

  return (
    <div className="relative bg-secondary rounded-xl p-4 my-3">
      {launching && <FullscreenLoader message="Launching game..." />}
      {/* header & arrows... */}
      <Swiper
        modules={[Navigation]}
        navigation={{ prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }}
        className="mt-4"
      >
        {gameChunks.map((group, idx) => (
          <SwiperSlide key={idx}>
            <div className="grid grid-cols-3 gap-2">
              {group.map((game, index) => (
                <SingleGame
                  key={index}
                  game={game}
                  provider={provider}
                  onPlay={() => handlePlay(game)}
                />
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProviderSlider;
