"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

interface Winner {
  id: string;
  game: string;
  img: string;
  username: string;
  amount: number;
  date: string;
}

export default function WinnerList({ data }: { data: Winner[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(12); // seconds (auto-calculated after measure)

  // render two copies (classic marquee loop)
  const doubled = useMemo(() => [...data, ...data], [data]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // measure how tall the content is and convert to a smooth speed
    const height = el.getBoundingClientRect().height / 2; // one copy height (because we doubled)
    const pxPerSecond = 38; // tweak: bigger = faster
    const d = Math.max(8, height / pxPerSecond);
    setDuration(d);
  }, [data]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    let resumeTimer: NodeJS.Timeout | null = null;

    const pause = () => {
      setPaused(true);
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => setPaused(false), 1200); // resume after 1.2s idle
    };

    // any user interaction -> pause and allow manual scrolling
    root.addEventListener("wheel", pause, { passive: true });
    root.addEventListener("touchstart", pause, { passive: true });
    root.addEventListener("scroll", pause, { passive: true });

    return () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      root.removeEventListener("wheel", pause);
      root.removeEventListener("touchstart", pause);
      root.removeEventListener("scroll", pause);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={[
        "relative h-[420px] rounded-2xl",
        paused ? "overflow-y-auto" : "overflow-hidden", // marquee needs hidden while running
        "bg-[#1b1630]"
      ].join(" ")}
    >
      {/* marquee track */}
      <div
        ref={contentRef}
        className="will-change-transform"
        style={{
          animation: paused ? "none" : `winnerMarquee ${duration}s linear infinite`,
        }}
      >
        {doubled.map((item) => (
          <div
            key={`${item.id}-${item.game}-${item.date}`} // stable enough for duplicates
            className="flex bg-[#2A1F40] rounded-xl overflow-hidden mt-3 shadow-md"
          >
            <Image
              src={item.img}
              alt={item.game}
              width={60}
              height={20}
              className="object-cover w-[80px]"
              unoptimized
            />

            <div className="flex-1 p-2 text-white">
              <h3 className="text-sm font-bold text-purple-400">{item.game}</h3>
              <p className="text-[11px] leading-snug">ব্যবহারকারী: {item.username}</p>
              <p className="text-[11px] mt-0.5 text-purple-300 leading-snug">
                জ্যাকপটঃ ৳{item.amount.toLocaleString()}
              </p>
              <p className="text-[9px] mt-0.5 opacity-60 leading-snug">{item.date}</p>
            </div>

            <div className="bg-purple-500 text-white w-16 flex items-center justify-center font-bold text-[10px]">
              খেলুন
            </div>
          </div>
        ))}
      </div>

      {/* keyframes (in-component; no extra CSS file needed) */}
      <style jsx>{`
        @keyframes winnerMarquee {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
}
