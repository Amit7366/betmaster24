// components/home/Hero.tsx
"use client";

import { gameData } from "@/constants";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaUser, FaUsers, FaKey, FaDollarSign } from "react-icons/fa";

import { motion } from "framer-motion";
import WheelComponent from "./WheelComponent";
import Link from "next/link";
import VipSlider from "./VipSlider";
import HeadTail from "../inhouse/HeadTail";


const wheelValues = [
  "৳557",
  "৳77,777",
  "৳10,777",
  "৳377",
  "৳3,777",
  "৳1,577",
  "৳777",
];
const segmentColors = [
  "#b30000",
  "#cc0000",
  "#e60000",
  "#990000",
  "#cc3300",
  "#ff3300",
  "#cc0000",
];

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
      <VipSlider />
      <HeadTail 
      // forcedResult=""
      />
      <div className="w-full bg-[#0d0d0d] py-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <div className="inline-flex gap-2 px-4">
          {gameData.map((game, index) => (
            <Link
              href={"/games"}
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
            </Link>
          ))}
        </div>
      </div>
      <div className="relative h-[300px] sm:h-[600px] bg-[#0d0d0d] text-white  p-2 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 overflow-hidden my-3 rounded-md">
        {/* Text Section */}
        <div className="w-full flex flex-col gap-4  relative z-20 py-5 sm:py-20 px-2 sm:px-10">
          <span className="bg-green-500 text-xs font-semibold text-white w-fit px-2 py-1 rounded">
            DAILY
          </span>
          <h1 className="text-2xl sm:text-5xl font-bold leading-tight">
            Log in <br /> daily to collect <br /> your points!
          </h1>

          {/* Countdown */}
          <div className="flex items-center gap-2 text-center text-sm font-semibold">
            {["hours", "minutes", "seconds"].map((label, i) => (
              <div
                key={label}
                className="bg-graycardbg p-2 rounded-md flex flex-col items-center w-14"
              >
                <span className="text-sm sm:text-xl">
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
          {/* <button
            className="bg-blue-500 hover:bg-blue-600 transition px-6 py-2 rounded text-sm font-medium w-fit"
            onClick={() => setShowModal(true)}
          >
            Collect
          </button> */}
        </div>

        {/* Image Section */}

        <Image
          src="/hero.jpg" // Replace with actual image path
          alt="Daily Reward"
          fill
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        />
      </div>
      <div className="px-2 sm:px-0 py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
            🎮 All Provider
          </h2>
          {/* <Link
            href="/games"
            className="text-sm text-gray-300 hover:text-white"
          >
            View All
          </Link> */}
        </div>
        <div className="flex justify-between gap-3 items-center">
          <div className="w-3/5 h-[160px] relative min-h-[170px]">
            <Image
              src="https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1471"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
          </div>
          <div className="w-2/5 h-[160px] relative min-h-[170px]">
            <Image
              src="https://www.club99bdt.com/static/img/nextspin.913c157.webp"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
          </div>
        </div>

        <div className="grid gap-3 grid-cols-3 md:grid-cols-4 mt-3">
          <div className="rounded-xl relative w-full min-h-[170px]">
            <Image
              src="https://www.club99bdt.com/static/img/joker.a95de44.webp"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
          </div>
          <div className="rounded-xl relative w-full min-h-[170px]">
            <Image
              src="https://www.club99bdt.com/static/img/amb.61a8ae3.webp"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
          </div>
          <div className="rounded-xl relative w-full min-h-[170px]">
            <Image
              src="https://www.club99bdt.com/static/img/h5kiss.37df68a.webp"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
          </div>
          <div className="rounded-xl relative w-full min-h-[170px]">
            <Image
              src="https://www.club99bdt.com/static/img/lfc3.5f9cf6a.webp"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
          </div>
          <div className="rounded-xl relative w-full min-h-[170px]">
            <Image
              src="https://www.club99bdt.com/static/img/ace.5029035.webp"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
          </div>
          <div className="rounded-xl relative w-full min-h-[170px]">
            <Image
              src="https://www.club99bdt.com/static/img/haba.e3b2c23.webp"
              alt="Provider"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "160px" }}
              className="absolute top-0 left-0 rounded-xl"
            />
          </div>
        </div>
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

   
      {/* <WheelComponent /> */}
    </section>
  );
}
