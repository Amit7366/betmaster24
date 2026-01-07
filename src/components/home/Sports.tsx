import React from "react";
import SingleGame from "../game/SingleGame";
import { useGameLauncher } from "@/hooks/useGameLauncher";
import { div } from "framer-motion/client";
import { Flame } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SportsGames = () => {
  const games = [
    {
      _id: "68f3af742660fb6a568b52c6",
      game_code: "bbae6016f79f3df74e453eda164c08a4",
      __v: 0,
      createdAt: "2025-10-18T16:17:10.468Z",
      game_image:
        "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Dinosaur-Tycoon-II.png",
      game_name: "Dinosaur Tycoon II",
      game_name_bn: "ডাইনোসর তাইকুন",
      game_type: "fishing",
      platform: "digital",
      provider: "jilli",
      updatedAt: "2025-10-18T16:17:10.468Z",
    },
    {
      _id: "68f3af742660fb6a568b52c5",
      game_code: "9ec2a18752f83e45ccedde8dfeb0f6a7",
      __v: 0,
      createdAt: "2025-10-18T16:17:10.384Z",
      game_image:
        "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/All-star-Fishing.png",
      game_name: "All-star Fishing",
      game_name_bn: " অল স্টার ফিশিং",
      game_type: "fishing",
      platform: "digital",
      provider: "jilli",
      updatedAt: "2025-10-18T16:17:10.384Z",
    },
    {
      _id: "68f3af742660fb6a568b52c4",
      game_code: "71c68a4ddb63bdc8488114a08e603f1c",
      __v: 0,
      createdAt: "2025-10-18T16:17:10.296Z",
      game_image:
        "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Happy-Fishing.png",
      game_name: "Happy Fishing",
      game_name_bn: " হ্যাপি  ফিশিং",
      game_type: "fishing",
      platform: "digital",
      provider: "jilli",
      updatedAt: "2025-10-18T16:17:10.296Z",
    },
    {
      _id: "68f3af742660fb6a568b52c3",
      game_code: "f02ede19c5953fce22c6098d860dadf4",
      __v: 0,
      createdAt: "2025-10-18T16:17:10.170Z",
      game_image:
        "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Boom-Legend.png",
      game_name: "Boom Legend",
      game_name_bn: "বুম লেজেন্ড",
      game_type: "fishing",
      platform: "digital",
      provider: "jilli",
      updatedAt: "2025-10-18T16:17:10.170Z",
    },
    {
      _id: "68f3af742660fb6a568b52c2",
      game_code: "caacafe3f64a6279e10a378ede09ff38",
      __v: 0,
      createdAt: "2025-10-18T16:17:10.016Z",
      game_image:
        "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Mega-Fishing.png",
      game_name: "Mega Fishing",
      game_name_bn: "মেগা ফিশিং",
      game_type: "fishing",
      platform: "digital",
      provider: "jilli",
      updatedAt: "2025-10-18T16:17:10.016Z",
    },
    {
      _id: "68f3af742660fb6a568b52c1",
      game_code: "1200b82493e4788d038849bca884d773",
      __v: 0,
      createdAt: "2025-10-18T16:17:09.906Z",
      game_image:
        "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Dragon-Fortune.png",
      game_name: "Dragon Fortune",
      game_name_bn: " ড্রাগন ফরচুন",
      game_type: "fishing",
      platform: "digital",
      provider: "jilli",
      updatedAt: "2025-10-18T16:17:09.906Z",
    },
  ];
  const { handlePlay, launching } = useGameLauncher();
  return (
    <div className="my-3 bg-[#241A3E] py-3 px-2 relative">
      <div className="absolute right-0 top-0 w-full h-10 bg-primary z-10"></div>
      {/* Smooth downward curve bar */}
      <svg
        className="absolute top-0 left-0 min-w-[180px] h-10 text-[#241A3E] z-20"
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0 0 
         H180 
         C220 0 240 10 240 70 
         C240 90 250 100 300 100 
         H0 
         Z"
          fill="currentColor"
        />
      </svg>

      <h3 className="flex gap-3 justify-start items-center mb-3 relative z-30 -translate-y-[2px]">
        <Flame className="text-yellow-400" />
        <span className="text-white">খেলাধুলা</span>
      </h3>

      <Link href={'/category/sports'} className="relative">
        <Image
          src={
            "/sports.jpg"
          }
          alt="Sports"
          width={0}
          height={0}
          className="w-full object-cover"
          unoptimized
        />
        
      </Link>
    </div>
  );
};

export default SportsGames;
