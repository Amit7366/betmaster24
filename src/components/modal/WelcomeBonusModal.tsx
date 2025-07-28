"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaTelegramPlane } from "react-icons/fa";

export default function WelcomeBonusModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem("welcome_modal_shown");

    if (!alreadyShown) {
      const timer = setTimeout(() => {
        setShow(true);
        localStorage.setItem("welcome_modal_shown", "true");
      }, 1000); // Show after 1s

      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="relative bg-gradient-to-b from-[#6c1e0d] to-[#fdba74] max-w-md w-full rounded-xl overflow-hidden shadow-xl border-4 border-yellow-400">
        {/* Close */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-2 right-2 bg-white rounded-full p-1 z-10"
        >
          <X className="w-5 h-5 text-red-500" />
        </button>

        {/* Modal Content */}
        <div className="text-center text-white p-4 space-y-3 bg-[url('/path-to-your-bg-image.png')] bg-cover bg-center">
          <h2 className="text-xl font-bold">নতুন সদস্যের সুবিধা</h2>
          <p className="text-base font-semibold text-yellow-300">
            নতুন সদস্য ৪ টি বড় সুবিধা
          </p>

          <div className="text-sm space-y-1">
            <p>
              প্রথম ডিপোজিট বোনাস:{" "}
              <span className="text-orange-400 font-bold">১০১%</span>
            </p>
            <p>
              দ্বিতীয় ডিপোজিট বোনাস:{" "}
              <span className="text-orange-400 font-bold">৪৯%</span>
            </p>
            <p>
              তৃতীয় ডিপোজিট বোনাস:{" "}
              <span className="text-orange-400 font-bold">৩৮%</span>
            </p>
          </div>

          <div className="bg-yellow-300 text-red-700 py-2 px-4 font-bold text-lg rounded-full inline-block">
            অ্যাপ ডাউনলোড করুন: ৮৮,৮৮৮
          </div>

          <div className="flex justify-center items-center gap-2 text-xs mt-2">
            <FaTelegramPlane />
            <Link
              href="https://t.me/bTkusgn2T4ZJYjU1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-200 underline"
            >
              চ্যানেল সাবস্ক্রাইব করুন পুরষ্কার পেতে
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-[#fff3cd] text-black p-3 rounded-md">
            <div className="text-center">
              <p>অ্যাপ ডাউনলোড</p>
              <p className="font-bold text-red-600">৮৮৮৮</p>
            </div>
            <div className="text-center">
              <p>প্রতিটি ডিপোজিট</p>
              <p className="font-bold text-red-600">০.৮৮%</p>
            </div>
            <div className="text-center">
              <p>বাকি কমিশন</p>
              <p className="font-bold text-red-600">০.৮৮%</p>
            </div>
            <div className="text-center">
              <p>অর্জন বোনাস</p>
              <p className="font-bold text-red-600">১,০০০৳</p>
            </div>
          </div>

          <div className="text-sm text-yellow-100 pt-2 pb-1">SBM77.COM</div>
        </div>
      </div>
    </div>
  );
}
