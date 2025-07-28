"use client";

import SingleGame from "@/components/game/SingleGame";
import { Gamepad } from "lucide-react";
import { useState } from "react";
import { useGetGamesByCategoryQuery } from "@/redux/api/gamesApi";
import { categories } from "@/constants";
import Link from "next/link";
import Image from "next/image";
import LoadingOverlay from "@/components/ui/Loader";

interface PageProps {
  params: { gametype: string };
}

export default function CategoryPage({ params }: PageProps) {
  const category = params.gametype;
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Build query string dynamically
  const queryKey = selectedProvider
    ? `${category}&provider=${selectedProvider}`
    : category;

  const { data, isLoading, error } = useGetGamesByCategoryQuery(queryKey);

  if (isLoading) {
    return (
      <LoadingOverlay/>
    );
  }

  if (error || !data?.data?.length) {
    return (
      <h1 className="text-accent px-3 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        No games found in this category
      </h1>
    );
  }

  const games = data.data;

  return (
    <section className="py-11 px-3">
      <div className="w-full overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 px-4 pt-9 pb-3">
          {categories
            .filter((cat) => cat.type === "provider")
            .map((cat, index) => {
              const isActive = selectedProvider === cat.name.toLowerCase();
              return (
                <button
                  key={index}
                  onClick={() =>
                    setSelectedProvider((prev) =>
                      prev === cat.name.toLowerCase() ? null : cat.name.toLowerCase()
                    )
                  }
                  className={`flex flex-col items-center justify-center px-3 py-2 min-w-[70px] transition-all rounded-tl-3xl rounded-bl-3xl rounded-tr-2xl ${
                    isActive
                      ? "bg-accent text-white"
                      : "bg-secondary hover:bg-[#1b4c5c]"
                  }`}
                >
                  <div className="relative w-8 h-8 mb-1">
                    <Image
                      src={cat.icon}
                      alt={cat.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-textcolor text-center whitespace-nowrap">
                    {cat.name}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      <div className="relative text-white font-semibold py-2 z-10 w-full flex items-center justify-start gap-2">
        <Gamepad />
        <span className="text-accent uppercase">
          {category} {selectedProvider && `- ${selectedProvider}`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {games.map((game) => (
          <SingleGame key={game._id} game={game} provider={game.provider} />
        ))}
      </div>
    </section>
  );
}
