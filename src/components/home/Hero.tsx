// components/home/Hero.tsx
"use client";

import { gameData } from "@/constants";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaUser, FaUsers, FaKey, FaDollarSign } from "react-icons/fa";
import GameCards from "./GameCards";
export default function Hero() {
  const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const total = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        return total >= 0 ? formatTime(total) : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function getInitialTimeLeft() {
    return formatTime(1 * 3600 + 46 * 60 + 19); // 1hr 46min 19sec
  }

  function formatTime(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  }
  const features = [
    {
      icon: <FaUser className="text-white text-2xl" />,
      title: "Unlock 3+ memberships",
      bg: "bg-gradient-to-r from-cyan-600 to-blue-700",
    },
    {
      icon: <FaUsers className="text-white text-2xl" />,
      title: "Invite friends & earn 100 free spins",
      bg: "bg-gradient-to-r from-pink-600 to-purple-700",
    },
    {
      icon: <FaKey className="text-white text-2xl" />,
      title: "Login daily and collect reward points",
      bg: "bg-gradient-to-r from-green-600 to-green-800",
    },
    {
      icon: <FaDollarSign className="text-white text-2xl" />,
      title: "Play games and hit the jackpot",
      bg: "bg-gradient-to-r from-orange-500 to-red-600",
    },
  ];
  return (
    <section>
      <div className="w-full bg-[#0d0d0d] py-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <div className="inline-flex gap-2 px-4">
          {gameData.map((game, index) => (
            <div
              key={index}
              className="min-w-[140px] bg-black rounded-xl overflow-hidden flex flex-row justify-start items-center gap-2 text-white text-xs py-1 px-2 shadow-md border border-gray-800"
            >
              <Image
                src={game.image}
                alt="game thumbnail"
                width={40}
                height={40}
                className="rounded-md"
              />
              <div>
                <p className="mt-1 font-medium truncate w-full text-center">
                  {game.username}
                </p>
                <p className="text-yellow-400 font-bold">{game.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative h-[600px] bg-[#0d0d0d] text-white  p-6 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 overflow-hidden my-3 rounded-md">
        {/* Text Section */}
        <div className="flex flex-col gap-4  relative z-20 py-20 PX-2 sm:px-10">
          <span className="bg-green-500 text-xs font-semibold text-white w-fit px-2 py-1 rounded">
            DAILY
          </span>
          <h1 className="text-5xl font-bold leading-tight">
            Log in <br /> daily to collect <br /> your points!
          </h1>

          {/* Countdown */}
          <div className="flex items-center gap-2 text-center text-sm font-semibold">
            {["hours", "minutes", "seconds"].map((label, i) => (
              <div
                key={label}
                className="bg-graycardbg p-2 rounded-md flex flex-col items-center w-14"
              >
                <span className="text-xl">
                  {String(
                    [timeLeft.hours, timeLeft.minutes, timeLeft.seconds][i]
                  ).padStart(2, "0")}
                </span>
                <span className="text-gray-400 text-[10px] uppercase">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Button */}
          <button className="bg-blue-500 hover:bg-blue-600 transition px-6 py-2 rounded text-sm font-medium w-fit">
            Collect
          </button>
        </div>

        {/* Image Section */}

        <Image
          src="/hero.jpg" // Replace with actual image path
          alt="Daily Reward"
          fill
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-center px-2 sm:px-0 py-4 ">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 p-4 rounded-lg ${feature.bg} shadow-md w-full`}
          >
            <div className="bg-white/20 p-3 rounded-full">{feature.icon}</div>
            <p className="text-white text-sm font-medium leading-tight">
              {feature.title}
            </p>
          </div>
        ))}
      </div>
      <GameCards />
    </section>
  );
}
