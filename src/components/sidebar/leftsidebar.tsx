import {
  Clock,
  Home,
  Puzzle,
  Star,
  Music,
  Flame,
  Gamepad,
  Crown,
  Gift,
  Calendar,
  Vault,
  Search,
} from "lucide-react"; // Optional: use Heroicons or your preferred icon library
import MenuItem from "./MenuItem";
import Image from "next/image";
const cards = [
  {
    title: "Wheel",
    time: "08:43:17",
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replace with your image path
  },
  {
    title: "Tasks",
    time: "02:16:31",
    image:
      "https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replace with your image path
  },
];

export default function LeftSidebar() {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-4 bg-graycardbg">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="w-1/2 h-32 relative rounded-xl shadow-lg text-white flex flex-col justify-between items-center overflow-hidden"
          >
            {/* Background Image */}
            <Image
              src={card.image}
              alt={card.title}
              layout="fill"
              objectFit="cover"
              className="z-0"
              priority // optional: use if it's important for performance
            />

            {/* Overlay Gradient Layer */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-800 to-indigo-900 opacity-80 z-10" />

            {/* Content */}
            <div className="w-full h-full text-left absolute z-20 p-2 flex flex-col justify-start">
              <h2 className="text-sm font-semibold">{card.title}</h2>
              <div className="text-xs text-gray-300 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {card.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full  text-white py-4 space-y-6">
        {/* Search Bar */}
        <div className="relative ">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for games..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-ca text-sm placeholder-gray-400 text-white bg-graycardbg"
          />
        </div>

        {/* Top Section */}
        <div className="bg-graycardbg rounded-lg p-3 space-y-3">
          <MenuItem icon={<Home />} label="Lobby" active />
          <MenuItem icon={<Puzzle />} label="Providers" />
          <MenuItem icon={<Star />} label="Favourite" badge="16" />
          <MenuItem icon={<Clock />} label="Recent" />
        </div>

        {/* Section Label */}
        <div className="text-xs text-gray-400 font-semibold px-1">
          ALL SLOTS
        </div>

        {/* Bottom Section */}
        <div className="bg-graycardbg rounded-lg p-3 space-y-3">
          <MenuItem icon={<Music />} label="All" />
          <MenuItem icon={<Flame />} label="Popular" />
          <MenuItem icon={<Gamepad />} label="New games" />
          <MenuItem icon={<Crown />} label="VIP" />
          <MenuItem icon={<Gift />} label="Buyback Bonuses" />
          <MenuItem icon={<Calendar />} label="Events" />
          <MenuItem icon={<Vault />} label="Jackpot" />
        </div>
      </div>
    </div>
  );
}
