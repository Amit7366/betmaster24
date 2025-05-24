import Image from "next/image";

const games = [
  {
    title: "CASES",
    image:
      "https://images.unsplash.com/photo-1636583134257-b8a45fe61a83?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "bg-gradient-to-br from-pink-600 to-red-500",
  },
  {
    title: "SLOTS",
    image:
      "https://images.unsplash.com/photo-1726003906867-081fc895ce5d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "bg-gradient-to-br from-green-400 to-teal-500",
  },
  {
    title: "CRASH",
    image:
      "https://images.unsplash.com/photo-1604028296525-8304e1a4969f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "bg-gradient-to-br from-purple-600 to-violet-500",
  },
  {
    title: "COINFLIP",
    image:
      "https://images.unsplash.com/photo-1522069213448-443a614da9b6?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "bg-gradient-to-br from-rose-500 to-pink-500",
  },
  {
    title: "MINES",
    image:
      "https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "bg-gradient-to-br from-sky-500 to-blue-600",
  },
];

export default function GameCards() {
  return (
    <div className="bg-[#111] text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          🎮 Originals
        </h2>
        <button className="text-sm text-gray-400 hover:text-white">
          View All
        </button>
      </div>
      <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
        {games.map((game, index) => (
          <div
            key={index}
            className="relative min-w-[160px] h-[200px] rounded-xl overflow-hidden"
          >
            {/* Background image */}
            <div className="absolute inset-0">
              <Image
                src={game.image}
                alt={game.title}
                fill
                className="object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />
            </div>

            {/* Text content */}
            <div className="relative z-10 flex flex-col justify-between h-full px-3 py-4 text-white">
              <h3 className="text-sm font-bold">{game.title}</h3>
              <p className="text-xs text-white/80">In-House Games</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
