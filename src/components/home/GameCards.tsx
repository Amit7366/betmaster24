import { games } from "@/constants";
import Image from "next/image";
import Link from "next/link";

export default function GameCards() {
  return (
    <div className="bg-[#111] text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          🎮 Originals
        </h2>
        <Link href="/games" className="text-sm text-gray-400 hover:text-white">
          View All
        </Link>
      </div>
      <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
        {games.map((game, index) => (
          <Link
            href={`/games`}
            key={index}
            className="relative min-w-[160px] h-[200px] rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all ease-in-out duration-300"
          >
            {/* Background image */}
            <div className="absolute inset-0">
              <div className="relative w-[100%] h-[200px]">
                <Image
                  src={game.image}
                  alt={game.title}
                  fill
                  //   sizes="100px"
                  sizes="(max-width: 768px) 50px, 100px"
                  className="object-cover rounded-md"
                />
              </div>
              {/* <Image
                src={game.image}
                alt={game.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 16vw"
                className="object-cover"
                priority // optional
              /> */}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />
            </div>

            {/* Text content */}
            <div className="relative z-10 flex flex-col justify-between h-full px-3 py-4 text-white">
              <h3 className="text-sm font-bold">{game.title}</h3>
              <p className="text-xs text-white/80">In-House Games</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
