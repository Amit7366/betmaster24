"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { coinFaces } from "@/constants";
import { toast } from "sonner";

type CoinResult = "heads" | "tails";
type PlayerChoice = CoinResult | "";

const HeadTail = ({ forcedResult }: { forcedResult?: CoinResult }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<CoinResult | null>(null);
  const [initialFace, setInitialFace] = useState<CoinResult>("heads");
  const [playerChoice, setPlayerChoice] = useState<PlayerChoice>("");
  const [displayWins, setDisplayWins] = useState(0);
  const [displayGames, setDisplayGames] = useState(0);
  const winIndices = useRef<number[]>([]);
  const totalGames = useRef(0);
  const winCount = useRef(0);
  const spinAudio = useRef<HTMLAudioElement | null>(null);
  const winAudio = useRef<HTMLAudioElement | null>(null);
  const loseAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.removeItem("coinGameWins");
    localStorage.removeItem("coinGameTotal");
    const storedWins = localStorage.getItem("coinGameWins");
    const storedTotal = localStorage.getItem("coinGameTotal");

    winCount.current = storedWins ? parseInt(storedWins) : 0;
    totalGames.current = storedTotal ? parseInt(storedTotal) : 0;

    const face: CoinResult = Math.random() < 0.5 ? "heads" : "tails";
    setInitialFace(face);
    setResult(face);
    setDisplayWins(winCount.current);
    setDisplayGames(totalGames.current);

    spinAudio.current = new Audio("/coin-flip.mp3");
    winAudio.current = new Audio("/game-win.mp3");
    loseAudio.current = new Audio("/game-lose.mp3");
  }, []);

  const saveStats = () => {
    localStorage.setItem("coinGameWins", winCount.current.toString());
    localStorage.setItem("coinGameTotal", totalGames.current.toString());
  };

  const getControlledResult = (choice: CoinResult): CoinResult => {
    const currentGameIndex = totalGames.current % 10;

    // If new batch (start of 10-game cycle)
    if (currentGameIndex === 0) {
      const winsThisBatch = new Set<number>();
      while (winsThisBatch.size < 2) {
        winsThisBatch.add(Math.floor(Math.random() * 10));
      }
      winIndices.current = Array.from(winsThisBatch);
    }

    const shouldWin = winIndices.current.includes(currentGameIndex);

    totalGames.current++;

    if (shouldWin) {
      winCount.current++;
      saveStats();
      return choice;
    } else {
      saveStats();
      return choice === "heads" ? "tails" : "heads";
    }
  };

  const startSpin = (choice: CoinResult) => {
    if (isSpinning) return;

    setPlayerChoice(choice);
    setIsSpinning(true);
    setResult(null);
    spinAudio.current?.play();

    const spinDuration = 3000;

    const newResult: CoinResult = forcedResult || getControlledResult(choice);

    setTimeout(() => {
      if (spinAudio.current) {
        spinAudio.current.pause();
        spinAudio.current.currentTime = 0;
      }

      setIsSpinning(false);
      setResult(newResult);

      const won = newResult === choice;

      if (won) {
        toast.success(`You Won! Result: ${newResult}`);
        if (winAudio.current) {
          winAudio.current.currentTime = 0;
          winAudio.current.play();
        }
      } else {
        toast.error(`You Lost! Result: ${newResult}`);
        if (loseAudio.current) {
          loseAudio.current.currentTime = 0;
          loseAudio.current.play();
        }
      }

      // Update UI
      setDisplayWins(winCount.current);
      setDisplayGames(totalGames.current);
    }, spinDuration);
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-10">
      {/* Coin */}
      <div className="w-32 h-32 relative perspective">
        {isSpinning && (
          <div
            className="w-full h-full relative rounded-full border-4 border-yellow-600 animate-coin-flip-realistic"
            style={{ transformStyle: "preserve-3d", animationDuration: "3s" }}
          >
            <Image
              src={coinFaces.heads}
              alt="Heads"
              fill
              className="absolute rounded-full backface-hidden"
              style={{ transform: "rotateX(180deg)" }}
            />
            <Image
              src={coinFaces.tails}
              alt="Tails"
              fill
              className="absolute rounded-full backface-hidden"
              style={{ transform: "rotateX(0deg)" }}
            />
          </div>
        )}

        {!isSpinning && result && (
          <div className="w-full h-full relative rounded-full overflow-hidden border-4 border-yellow-600">
            <Image
              src={result === "heads" ? coinFaces.heads : coinFaces.tails}
              alt={result}
              fill
              className="rounded-full"
            />
          </div>
        )}
      </div>

      {/* Choice Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => startSpin("heads")}
          disabled={isSpinning}
          className={`px-4 py-2 rounded-full text-white transition font-semibold shadow-md ${
            playerChoice === "heads"
              ? "bg-green-600 scale-110"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          Heads
        </button>
        <button
          onClick={() => startSpin("tails")}
          disabled={isSpinning}
          className={`px-4 py-2 rounded-full text-white transition font-semibold shadow-md ${
            playerChoice === "tails"
              ? "bg-green-600 scale-110"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          Tails
        </button>
      </div>

      {/* Score */}
      <div className="text-sm text-gray-500 mt-2">
        Wins: {displayWins} / Games Played: {displayGames}
      </div>
    </div>
  );
};

export default HeadTail;
