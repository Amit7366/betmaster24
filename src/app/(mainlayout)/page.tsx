"use client";

import AllProiver from "@/components/home/AllProiver";
import AnnouncementTicker from "@/components/home/AnnouncementTicker";
import CategorySlider from "@/components/home/CategorySlider";
import ProviderSlider from "@/components/home/ProviderSlider";
import VipSlider from "@/components/home/VipSlider";
import { useAuth } from "@/redux/hook/useAuth";
import { useGetGroupedGamesQuery } from "@/redux/api/gamesApi";
import React, { useState } from "react";
import { Loader } from "lucide-react";
import LoadingOverlay from "@/components/ui/Loader";
import { set } from "date-fns";
import MainCaterory from "@/components/home/MainCaterory";
import Hotgames from "@/components/home/Hotgames";
import { Footer } from "@/components/shared/Footer";
import LastWinner from "@/components/home/LastWinner";
import SportsGames from "@/components/home/Sports";

const MainPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { data, isLoading, error } = useGetGroupedGamesQuery();
  const [loading, setLoading] = useState(false);

  // console.log(data);

  return (
    <div className={`${isAuthenticated ? "py-[70px]" : "py-14"} `}>
      <VipSlider />
      <AnnouncementTicker />
      {/* <MainCaterory/> */}
      <CategorySlider />
      <Hotgames/>
      <SportsGames/>
      <LastWinner/>
      <Footer/>
      {/* <AllProiver /> */}

      {/* {(isLoading || loading) ? (
        <LoadingOverlay />
      ) : error ? (
        <div className="text-red-500 text-center py-10">
          Failed to load games
        </div>
      ) : (
        data?.data
          ?.filter((group) => Array.isArray(group?.games?.slot))
          .map((group, index) => (
            <ProviderSlider
              key={index}
              provider={group?.provider}
              games={group?.games?.slot}
              setLoading={setLoading}
            />
          ))
      )} */}
    </div>
  );
};

export default MainPage;
