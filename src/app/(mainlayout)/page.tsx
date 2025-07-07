import AllProiver from "@/components/home/AllProiver";
import CategorySlider from "@/components/home/CategorySlider";
import ProviderSlider from "@/components/home/ProviderSlider";
import { allProviderGames } from "@/constants";
import React from "react";


const MainPage = () => {
  return (
    <div>
      <CategorySlider/>
      <AllProiver/>
      {
        allProviderGames.map((game, index) => (
          <ProviderSlider key={index} provider={game.provider} games={game.games} />
        ))
      }
    
    </div>
  );
};

export default MainPage;
