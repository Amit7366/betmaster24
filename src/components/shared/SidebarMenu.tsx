"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface MenuItem {
  name: string;
  icon?: string;
  link?: string;
  children?: MenuItem[];
}

interface Props {
  items: MenuItem[];
  onClick?: () => void; // sidebar close toggle
}

export default function SidebarMenu({ items, onClick }: Props) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <MenuNode key={index} item={item} onClick={onClick} />
      ))}
    </div>
  );
}

function MenuNode({ item, onClick }: { item: MenuItem; onClick?: () => void }) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) setOpen(!open);  // dropdown expand collapse
    if (!hasChildren && onClick) onClick(); // click only when child item
  };

  const Wrapper: any = item.link ? Link : "button";

  return (
    <div className="w-full">
      <Wrapper
        {...(item.link && { href: item.link })}
        onClick={handleClick}
        className="flex items-center justify-between px-4 py-2 bg-[#351961] rounded-md border border-purple-600 w-full text-white text-lg transition-all"
      >
        <div className="flex items-center gap-3">
          <span>{item.icon || "📦"}</span>
          <span className="text-xs">{item.name}</span>
        </div>

        {hasChildren && (
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        )}
      </Wrapper>

      {/* CHILD DROPDOWN */}
      {hasChildren && (
        <ul
          className={`grid overflow-hidden transition-all duration-300 ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden ml-4">
            {item.children!.map((child, i) => (
              <li
                key={i}
                className="flex items-center gap-3 px-2 py-1 text-white bg-[#351961] border border-purple-600 rounded-xl mt-2 hover:bg-purple-700 transition-all cursor-pointer"
              >
                {child.link ? (
                  <Link
                    href={child.link}
                    onClick={onClick} // <<< sidebar closes
                    className="flex items-center gap-3 w-full"
                  >
                    <span>{child.icon}</span>
                    <span className="text-sm">{child.name}</span>
                  </Link>
                ) : (
                  <MenuNode item={child} onClick={onClick} />
                )}
              </li>
            ))}
          </div>
        </ul>
      )}
    </div>
  );
}
