"use client";

import { categories } from "@/constants";
import Image from "next/image";
import Link from "next/link";

export default function CategorySlider() {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar">
      <div className="flex justify-start gap-3 items-center">
        {categories.map((cat, index) => (
          <Link
          href={`/${cat.type}/` + cat.name.toLowerCase()}
            key={index}
            className="flex flex-col items-center justify-center px-3 py-2 "
          >
            <div className="relative w-[30px] h-[30px] mb-2 text-center">
              <Image
                src={cat.icon}
                alt={cat.name}
                fill
                className="object-contain relative z-20 mx-auto"
              />
              <div className="absolute w-9 h-5 border border-purple-500 top-4 z-10 rounded-t-lg  rounded-b-xl"></div>
            </div>
            <span className="text-[12px] text-white text-center whitespace-nowrap">
              {cat?.bnName ? cat?.bnName : cat?.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
