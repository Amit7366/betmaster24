'use client';

import { Volume2, Trophy, Star } from 'lucide-react';
import { useEffect, useRef } from 'react';

const messages = [
  "🏆 SBM777 নববর্ষের স্বপ্ন পরিকল্পনা অনুষ্ঠানিক",
  "⭐ নতুন ইউজারদের জন্য বিশেষ বোনাস অফার",
  "🎯 প্রতিদিন লগইন করে রিওয়ার্ড জিতুন",
  "🔥 SBM777 লাকি ড্র চলছে — অংশগ্রহণ করুন এখনই!"
];

const AnnouncementTicker = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = marqueeRef.current;
    if (el) {
      el.innerHTML += el.innerHTML; // duplicate for infinite loop
    }
  }, []);

  return (
    <div className="bg-secondary text-accent py-2 px-4 flex items-center overflow-hidden rounded-lg shadow-md w-full max-w-4xl mx-auto my-3">
      <Volume2 className="text-orange-500 mr-3 animate-pulse" size={20} />
      <div className="relative w-full overflow-hidden">
        <div
          ref={marqueeRef}
          className="whitespace-nowrap animate-marquee text-sm font-medium flex gap-8"
        >
          {messages.map((msg, index) => (
            <span key={index} className="inline-flex items-center gap-2">
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementTicker;
