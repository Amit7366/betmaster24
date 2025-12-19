"use client";

import Link from "next/link";
import {
  FaWhatsapp,
  FaFacebookF,
  FaTelegramPlane,
  FaHeadset,
} from "react-icons/fa";

export default function SocialFloatingBar() {
  return (
    <div className="fixed right-4 sm:right-[calc(50%-200px)]   bottom-32 flex flex-col items-center gap-4 z-[9999]">
      {/* WhatsApp */}
      <Link
        href="https://wa.me/+60176165075"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] p-2 rounded-full shadow-md hover:scale-105 transition-transform"
      >
        <FaWhatsapp className="text-white text-xl" />
      </Link>

      {/* Facebook */}
      {/* <Link
        href="https://facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#1877F2] p-2 rounded-full shadow-md hover:scale-105 transition-transform relative"
      >
        <FaFacebookF className="text-white text-xl" />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white bg-[#E4A627] px-1 rounded-full">
          Support
        </div>
      </Link> */}

      {/* Telegram */}
      <Link
        href="https://t.me/+601128369640"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#0088cc] p-2 rounded-full shadow-md hover:scale-105 transition-transform relative"
      >
        <FaTelegramPlane className="text-white text-xl" />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white bg-[#E4A627] px-1 rounded-full">
          Support
        </div>
      </Link>

      {/* Headset */}
      {/* <a
        href="#"
        className="bg-[#17a2b8] p-2 rounded-full shadow-md hover:scale-105 transition-transform"
      >
        <FaHeadset className="text-white text-xl" />
      </a> */}
    </div>
  );
}
