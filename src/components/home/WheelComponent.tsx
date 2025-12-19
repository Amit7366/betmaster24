"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

interface SpinWheelProps {
  prizes?: string[];
  maxSpins?: number;
  cooldownSeconds?: number;
}

export default function SpinWheel({
  prizes = [
    "Prize 1",
    "Prize 2",
    "Prize 3",
    "Prize 4",
    "Prize 5",
    "Prize 6",
    "Prize 7",
    "Prize 8",
    "Prize 9",
    "Prize 10",
    "Prize 11",
    "Prize 12",
    "Prize 13",
    "Prize 14",
    "Prize 15",
    "Prize 16",
    "Prize 17",
    "Prize 18",
    "Prize 19",
    "Prize 20",
  ],
  maxSpins = 5,
  cooldownSeconds = 5,
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const spinningRef = useRef(false);

  const spinAudio = useRef<HTMLAudioElement | null>(null);
  const winAudio = useRef<HTMLAudioElement | null>(null);

  const [result, setResult] = useState<string | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(maxSpins);
  const [coolingDown, setCoolingDown] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const sliceAngle = 360 / prizes.length;

  useEffect(() => {
    spinAudio.current = new Audio("/spin.mp3");
    spinAudio.current.loop = true;
    winAudio.current = new Audio("/win.mp3");
  }, []);

  const draw = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = w / 2 - 10;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((angle * Math.PI) / 180);

    for (let i = 0; i < prizes.length; i++) {
      const start = (i * sliceAngle * Math.PI) / 180;
      const end = ((i + 1) * sliceAngle * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.fillStyle = i % 2 === 0 ? "#f39c12" : "#e74c3c";
      ctx.fill();

      ctx.save();
      ctx.rotate((start + end) / 2);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(prizes[i], radius - 10, 5);
      ctx.restore();
    }

    ctx.restore();

    // Draw the right-upper indicator (slightly upward from 3 o'clock)
    const indicatorAngle = -5 * (Math.PI / 180); // 3 o'clock position (pointing to the left into the wheel)

    const tipRadius = radius - 12; // tip deeper inside the wheel
    const baseRadius = radius + 10; // base outside the wheel
    const wingOffset = Math.PI / 18; // wing angle

    const tipX = centerX + Math.cos(indicatorAngle) * tipRadius;
    const tipY = centerY + Math.sin(indicatorAngle) * tipRadius;

    const leftX = centerX + Math.cos(indicatorAngle + wingOffset) * baseRadius;
    const leftY = centerY + Math.sin(indicatorAngle + wingOffset) * baseRadius;

    const rightX = centerX + Math.cos(indicatorAngle - wingOffset) * baseRadius;
    const rightY = centerY + Math.sin(indicatorAngle - wingOffset) * baseRadius;

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ff9800";
    ctx.shadowBlur = 2;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const animate = () => {
    if (!spinningRef.current) return;

    angleRef.current = (angleRef.current + velocityRef.current) % 360;
    draw(angleRef.current);

    velocityRef.current *= 0.98;

    if (velocityRef.current < 0.2) {
      spinningRef.current = false;
      spinAudio.current?.pause();
      spinAudio.current!.currentTime = 0;

      // Determine winning prize
      const adjustedAngle = (angleRef.current + sliceAngle / 2) % 360; // shift to align center of slice with indicator
      const winningIndex = Math.floor(
        ((360 - adjustedAngle) % 360) / sliceAngle
      );
      const winningPrize = prizes[winningIndex];

      setResult(winningPrize);
      setHistory((prev) => [winningPrize, ...prev]);

      winAudio.current?.play();
      // confetti({
      //   particleCount: 100,
      //   spread: 70,
      //   origin: { y: 0.4 },
      // });
      toast('You have won ' + winningPrize + '!', { icon: '🎉' });
      console.log({
        angle: angleRef.current,
        adjustedAngle,
        winningIndex,
        prize: prizes[winningIndex],
      });

      setCoolingDown(true);
      setTimeout(() => setCoolingDown(false), cooldownSeconds * 1000);
    } else {
      requestAnimationFrame(animate);
    }
  };

  const handleSpin = () => {
    if (spinningRef.current || spinsLeft <= 0 || coolingDown) return;

    setResult(null);
    velocityRef.current = 15 + Math.random() * 10;
    spinningRef.current = true;
    spinAudio.current?.play();
    setSpinsLeft((s) => s - 1);
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    draw(angleRef.current);
  }, [prizes]);

  return (
    <div className="flex flex-col items-center justify-center py-10 text-white bg-gradient-to-b from-gray-900 to-black">
      <h1 className="text-3xl font-bold mb-6">🎯 Spin the Wheel</h1>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="rounded-full bg-white shadow-lg"
      />
      <button
        onClick={handleSpin}
        className="mt-6 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-6 rounded-full disabled:opacity-50"
        disabled={spinningRef.current || spinsLeft <= 0 || coolingDown}
      >
        {spinningRef.current
          ? "Spinning..."
          : coolingDown
          ? `Cooldown...`
          : spinsLeft <= 0
          ? "No Spins Left"
          : "Spin"}
      </button>

      {result && (
        <div className="mt-4 text-xl font-semibold text-green-400">
          🎉 You won: {result}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <h2 className="text-lg font-bold mb-2">🏅 Winning History:</h2>
          <ul className="list-disc list-inside text-sm text-gray-300">
            {history.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
