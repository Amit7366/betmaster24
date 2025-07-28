"use client";

import AllProiver from "@/components/home/AllProiver";
import AnnouncementTicker from "@/components/home/AnnouncementTicker";
import CategorySlider from "@/components/home/CategorySlider";
import ProviderSlider from "@/components/home/ProviderSlider";
import VipSlider from "@/components/home/VipSlider";
import { useAuth } from "@/redux/hook/useAuth";
import { useGetGroupedGamesQuery } from "@/redux/api/gamesApi";
import React from "react";
import { Loader } from "lucide-react";
import LoadingOverlay from "@/components/ui/Loader";

const MainPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { data, isLoading, error } = useGetGroupedGamesQuery();
  console.log(data);

  return (
    <div className={`px-2 ${isAuthenticated ? "py-10" : "py-0"} `}>
      <AnnouncementTicker />
      <VipSlider />
      <CategorySlider />
      <AllProiver />

      {isLoading ? (
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
            />
          ))
      )}
    </div>
  );
};

export default MainPage;
