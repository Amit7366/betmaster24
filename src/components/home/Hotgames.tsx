import React, { useEffect } from "react";
import SingleGame from "../game/SingleGame";
import { useGameLauncher } from "@/hooks/useGameLauncher";
import { div } from "framer-motion/client";
import { Flame, Sparkles, Star } from "lucide-react";
import FullscreenLoader from "../ui/FullscreenLoader";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useUserData } from "@/hooks/getMyInfo";
import { useNewVendorTransactions } from "@/hooks/vendorNew";
import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";

const Hotgames = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const objectId = user?.objectId ?? undefined;
  const { data: balanceData, refetch: refetchBalance } = useGetUserBalanceQuery(
    objectId!,
    {
      skip: !objectId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const { userData, loading: userDataLoading } = useUserData();
  const {
    records,
    loading,
    error: Vendorerror,
  } = useNewVendorTransactions(userData?.id);
  const REFRESH_FLAG = "needsBalanceRefresh";
  useEffect(() => {
    if (typeof window === "undefined" || !objectId) return;
    const flag = localStorage.getItem(REFRESH_FLAG);
    if (flag) {
      localStorage.removeItem(REFRESH_FLAG);
      refetchBalance();
    }
  }, [objectId, userData, refetchBalance]);
  const sections = [
    {
      title: "গরম খেলা",
      icon: Flame,
      games: [
        {
          _id: "68f3af742660fb6a568b52c6",
          game_code: "a04d1f3eb8ccec8a4823bdf18e3f0e84",
          __v: 0,
          createdAt: "2025-10-18T16:17:10.468Z",
          game_image:
            "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/spribe/Aviator.png",
          game_name: "Aviator",
          game_name_bn: "এভিয়েটর",
          game_type: "slot",
          platform: "digital",
          provider: "spribe",
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
      ],
    },
    {
      title: "JIlli",
      icon: Star,
      games: [
        {
          _id: "69501de91d277a54b2646d43",
          game_code: "69c1b4586b5060eefcb45bb479f03437",
          game_image:
            "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/3%20Coin%20Treasures.png",
          game_name: "3 Coin Treasures",
          game_type: "slot",
          platform: "digital",
          provider: "jilli",
        },
        {
          _id: "69501de91d277a54b2646d42",
          game_code: "80aad2a10ae6a95068b50160d6c78897",
          game_image:
            "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Super%20Ace%20Deluxe.jpg",
          game_name: "Super Ace Deluxe",
          game_type: "slot",
          platform: "digital",
          provider: "jilli",
        },
        {
          _id: "69501de91d277a54b2646d41",
          game_code: "63927e939636f45e9d6d0b3717b3b1c1",
          game_image:
            "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Fortune%20Gems%203.jpg",
          game_name: "Fortune Gems 3",
          game_type: "slot",
          platform: "digital",
          provider: "jilli",
        },
        {
          _id: "69501de91d277a54b2646d40",
          game_code: "82c5c404cf4c0790deb42a2b5653533c",
          game_image:
            "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Witches-Night.png",
          game_name: "Witches Night",
          game_type: "slot",
          platform: "digital",
          provider: "jilli",
        },
        {
          _id: "69501de81d277a54b2646d3f",
          game_code: "28bc4a33c985ddce6acd92422626b76f",
          game_image:
            "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Charge-Buffalo-Ascent.png",
          game_name: "Charge Buffalo Ascent",
          game_type: "slot",
          platform: "digital",
          provider: "jilli",
        },
        {
          _id: "69501de81d277a54b2646d3e",
          game_code: "fafab1a17a237d0fc0e50c20d2c2bf4c",
          game_image:
            "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/King-Arthur.png",
          game_name: "King Arthur",
          game_type: "slot",
          platform: "digital",
          provider: "jilli",
        },
      ],
    },
    // {
    //   title: "JDB",
    //   icon: Sparkles,
    //   games: [
    //     {
    //       _id: "69501e0f1d277a54b2646ecd",
    //       game_code: "5aa01f1fb8c92635c69d399deda516b2",
    //       game_image:
    //         "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Xmas-Tales.png",
    //       game_name: "Xmas Tales",
    //       game_type: "slot",
    //       platform: "digital",
    //       provider: "cq9",
    //     },
    //     {
    //       _id: "69501e0f1d277a54b2646ecc",
    //       game_code: "bc6315b1d328ba2a6719d3ce54ecfc6d",
    //       game_image:
    //         "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Beanstalk.png",
    //       game_name: "Beanstalk",
    //       game_type: "slot",
    //       platform: "digital",
    //       provider: "cq9",
    //     },
    //     {
    //       _id: "69501e0f1d277a54b2646ecb",
    //       game_code: "32b8e2de14d2dc9fa7de9e60c39181e2",
    //       game_image:
    //         "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Hong-Kong-Flavor.png",
    //       game_name: "Hong Kong Flavor",
    //       game_type: "slot",
    //       platform: "digital",
    //       provider: "cq9",
    //     },
    //     {
    //       _id: "69501e0f1d277a54b2646eca",
    //       game_code: "8797a9b3500b2cc510aab54f8f65c9b0",
    //       game_image:
    //         "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/JUNGLE-ISLAND.png",
    //       game_name: "JUNGLE ISLAND",
    //       game_type: "slot",
    //       platform: "digital",
    //       provider: "cq9",
    //     },
    //     {
    //       _id: "69501e0f1d277a54b2646ec9",
    //       game_code: "d9d86e86284357426995e080250e2662",
    //       game_image:
    //         "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Cirque-de-fous.png",
    //       game_name: "Cirque de fous",
    //       game_type: "slot",
    //       platform: "digital",
    //       provider: "cq9",
    //     },
    //     {
    //       _id: "69501e0f1d277a54b2646ec8",
    //       game_code: "7e64a66d0d74af9f173ab913576b61ce",
    //       game_image:
    //         "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/HAPPY-BUDDHA.png",
    //       game_name: "HAPPY BUDDHA",
    //       game_type: "slot",
    //       platform: "digital",
    //       provider: "cq9",
    //     },
    //   ],
    // },
  ];

  const { handlePlay, launching } = useGameLauncher();
  return (
    <>
      {sections.map((section) => (
        <div
          key={section.title}
          className="my-3 bg-[#241A3E] py-3 px-2 relative"
        >
          {launching && <FullscreenLoader message="Launching game..." />}

          {/* Top bar */}
          <div className="absolute right-0 top-0 w-full h-10 bg-primary z-10"></div>

          {/* Curve */}
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

          {/* Header */}
          <h3 className="flex gap-3 justify-start items-center mb-3 relative z-30 -translate-y-[2px]">
            {React.createElement(section.icon, {
              className: "text-yellow-400",
            })}
            <span className="text-white">{section.title}</span>
          </h3>

          {/* Games */}
          <div className="grid grid-cols-3 gap-2">
            {section.games.map((game: any) => (
              <SingleGame
                key={game._id}
                game={game}
                provider={game.provider}
                onPlay={() => handlePlay(game)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default Hotgames;

// import React from "react";
// import SingleGame from "../game/SingleGame";
// import { useGameLauncher } from "@/hooks/useGameLauncher";
// import { div } from "framer-motion/client";
// import { Flame, Sparkles, Star } from "lucide-react";
// import FullscreenLoader from "../ui/FullscreenLoader";

// const Hotgames = () => {
//   const sections = [
//     {
//       title: "গরম খেলা",
//       icon: Flame,
//       games: [
//         {
//           _id: "68f3af742660fb6a568b52c6",
//           game_code: "a04d1f3eb8ccec8a4823bdf18e3f0e84",
//           __v: 0,
//           createdAt: "2025-10-18T16:17:10.468Z",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/spribe/Aviator.png",
//           game_name: "Aviator",
//           game_name_bn: "এভিয়েটর",
//           game_type: "slot",
//           platform: "digital",
//           provider: "spribe",
//           updatedAt: "2025-10-18T16:17:10.468Z",
//         },
//         {
//           _id: "68f3af742660fb6a568b52c5",
//           game_code: "9ec2a18752f83e45ccedde8dfeb0f6a7",
//           __v: 0,
//           createdAt: "2025-10-18T16:17:10.384Z",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/All-star-Fishing.png",
//           game_name: "All-star Fishing",
//           game_name_bn: " অল স্টার ফিশিং",
//           game_type: "fishing",
//           platform: "digital",
//           provider: "jilli",
//           updatedAt: "2025-10-18T16:17:10.384Z",
//         },
//         {
//           _id: "68f3af742660fb6a568b52c4",
//           game_code: "71c68a4ddb63bdc8488114a08e603f1c",
//           __v: 0,
//           createdAt: "2025-10-18T16:17:10.296Z",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Happy-Fishing.png",
//           game_name: "Happy Fishing",
//           game_name_bn: " হ্যাপি  ফিশিং",
//           game_type: "fishing",
//           platform: "digital",
//           provider: "jilli",
//           updatedAt: "2025-10-18T16:17:10.296Z",
//         },
//         {
//           _id: "68f3af742660fb6a568b52c3",
//           game_code: "f02ede19c5953fce22c6098d860dadf4",
//           __v: 0,
//           createdAt: "2025-10-18T16:17:10.170Z",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Boom-Legend.png",
//           game_name: "Boom Legend",
//           game_name_bn: "বুম লেজেন্ড",
//           game_type: "fishing",
//           platform: "digital",
//           provider: "jilli",
//           updatedAt: "2025-10-18T16:17:10.170Z",
//         },
//         {
//           _id: "68f3af742660fb6a568b52c2",
//           game_code: "caacafe3f64a6279e10a378ede09ff38",
//           __v: 0,
//           createdAt: "2025-10-18T16:17:10.016Z",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Mega-Fishing.png",
//           game_name: "Mega Fishing",
//           game_name_bn: "মেগা ফিশিং",
//           game_type: "fishing",
//           platform: "digital",
//           provider: "jilli",
//           updatedAt: "2025-10-18T16:17:10.016Z",
//         },
//         {
//           _id: "68f3af742660fb6a568b52c1",
//           game_code: "1200b82493e4788d038849bca884d773",
//           __v: 0,
//           createdAt: "2025-10-18T16:17:09.906Z",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Dragon-Fortune.png",
//           game_name: "Dragon Fortune",
//           game_name_bn: " ড্রাগন ফরচুন",
//           game_type: "fishing",
//           platform: "digital",
//           provider: "jilli",
//           updatedAt: "2025-10-18T16:17:09.906Z",
//         },
//       ],
//     },
//     {
//       title: "JIlli",
//       icon: Star,
//       games: [
//         {
//           _id: "69501de91d277a54b2646d43",
//           game_code: "69c1b4586b5060eefcb45bb479f03437",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/3%20Coin%20Treasures.png",
//           game_name: "3 Coin Treasures",
//           game_type: "slot",
//           platform: "digital",
//           provider: "jilli",
//         },
//         {
//           _id: "69501de91d277a54b2646d42",
//           game_code: "80aad2a10ae6a95068b50160d6c78897",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Super%20Ace%20Deluxe.jpg",
//           game_name: "Super Ace Deluxe",
//           game_type: "slot",
//           platform: "digital",
//           provider: "jilli",
//         },
//         {
//           _id: "69501de91d277a54b2646d41",
//           game_code: "63927e939636f45e9d6d0b3717b3b1c1",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Fortune%20Gems%203.jpg",
//           game_name: "Fortune Gems 3",
//           game_type: "slot",
//           platform: "digital",
//           provider: "jilli",
//         },
//         {
//           _id: "69501de91d277a54b2646d40",
//           game_code: "82c5c404cf4c0790deb42a2b5653533c",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Witches-Night.png",
//           game_name: "Witches Night",
//           game_type: "slot",
//           platform: "digital",
//           provider: "jilli",
//         },
//         {
//           _id: "69501de81d277a54b2646d3f",
//           game_code: "28bc4a33c985ddce6acd92422626b76f",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Charge-Buffalo-Ascent.png",
//           game_name: "Charge Buffalo Ascent",
//           game_type: "slot",
//           platform: "digital",
//           provider: "jilli",
//         },
//         {
//           _id: "69501de81d277a54b2646d3e",
//           game_code: "fafab1a17a237d0fc0e50c20d2c2bf4c",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/King-Arthur.png",
//           game_name: "King Arthur",
//           game_type: "slot",
//           platform: "digital",
//           provider: "jilli",
//         },
//       ],
//     },
//     {
//       title: "JDB",
//       icon: Sparkles,
//       games: [
//         {
//           _id: "69501e0f1d277a54b2646ecd",
//           game_code: "5aa01f1fb8c92635c69d399deda516b2",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Xmas-Tales.png",
//           game_name: "Xmas Tales",
//           game_type: "slot",
//           platform: "digital",
//           provider: "cq9",
//         },
//         {
//           _id: "69501e0f1d277a54b2646ecc",
//           game_code: "bc6315b1d328ba2a6719d3ce54ecfc6d",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Beanstalk.png",
//           game_name: "Beanstalk",
//           game_type: "slot",
//           platform: "digital",
//           provider: "cq9",
//         },
//         {
//           _id: "69501e0f1d277a54b2646ecb",
//           game_code: "32b8e2de14d2dc9fa7de9e60c39181e2",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Hong-Kong-Flavor.png",
//           game_name: "Hong Kong Flavor",
//           game_type: "slot",
//           platform: "digital",
//           provider: "cq9",
//         },
//         {
//           _id: "69501e0f1d277a54b2646eca",
//           game_code: "8797a9b3500b2cc510aab54f8f65c9b0",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/JUNGLE-ISLAND.png",
//           game_name: "JUNGLE ISLAND",
//           game_type: "slot",
//           platform: "digital",
//           provider: "cq9",
//         },
//         {
//           _id: "69501e0f1d277a54b2646ec9",
//           game_code: "d9d86e86284357426995e080250e2662",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Cirque-de-fous.png",
//           game_name: "Cirque de fous",
//           game_type: "slot",
//           platform: "digital",
//           provider: "cq9",
//         },
//         {
//           _id: "69501e0f1d277a54b2646ec8",
//           game_code: "7e64a66d0d74af9f173ab913576b61ce",
//           game_image:
//             "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/HAPPY-BUDDHA.png",
//           game_name: "HAPPY BUDDHA",
//           game_type: "slot",
//           platform: "digital",
//           provider: "cq9",
//         },
//       ],
//     }
//   ];

//   const { handlePlay, launching } = useGameLauncher();
//   return (
//     <>
//       {sections.map((section) => (
//         <div
//           key={section.title}
//           className="my-3 bg-[#241A3E] py-3 px-2 relative"
//         >
//           {launching && <FullscreenLoader message="Launching game..." />}

//           {/* Top bar */}
//           <div className="absolute right-0 top-0 w-full h-10 bg-primary z-10"></div>

//           {/* Curve */}
//           <svg
//             className="absolute top-0 left-0 min-w-[180px] h-10 text-[#241A3E] z-20"
//             viewBox="0 0 300 100"
//             preserveAspectRatio="none"
//           >
//             <path
//               d="M0 0 
//                H180 
//                C220 0 240 10 240 70 
//                C240 90 250 100 300 100 
//                H0 
//                Z"
//               fill="currentColor"
//             />
//           </svg>

//           {/* Header */}
//           <h3 className="flex gap-3 justify-start items-center mb-3 relative z-30 -translate-y-[2px]">
//             {React.createElement(section.icon, {
//               className: "text-yellow-400",
//             })}
//             <span className="text-white">{section.title}</span>
//           </h3>

//           {/* Games */}
//           <div className="grid grid-cols-3 gap-2">
//             {section.games.map((game: any) => (
//               <SingleGame
//                 key={game._id}
//                 game={game}
//                 provider={game.provider}
//                 onPlay={() => handlePlay(game)}
//               />
//             ))}
//           </div>
//         </div>
//       ))}
//     </>
//   );
// };

// export default Hotgames;
