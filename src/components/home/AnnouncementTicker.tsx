'use client';

import { Volume2, Trophy, Star, Mic2, Bell } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';

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
    <div className="relative bg-[#241A3E] text-white py-2 px-4 flex items-center overflow-hidden rounded-full shadow-md w-full max-w-4xl mx-auto my-1">
      <div className='w-3  h-3 rounded-full bg-accent absolute left-6 top-[6px] border border-primary'></div>
      <FaBell className="text-purple-600 mr-3 " size={20} />
      <div className="relative w-full overflow-hidden">
        <div
          ref={marqueeRef}
          className="whitespace-nowrap animate-marquee text-xs font-normal flex gap-8"
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
