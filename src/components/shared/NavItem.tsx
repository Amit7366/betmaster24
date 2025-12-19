import Image from "next/image";
import Link from "next/link";

type Props = {
  icon: string;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

function NavItem({ icon, label, href, isActive, onClick }: Props) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative w-[100px] h-[70px] flex flex-col items-center justify-center z-10 ${label === "শেয়ার" ? 'animate-doubleBounceGap' : ''}`}
    >
      <Image
        src={icon}
        alt={label}
        width={28}
        height={28}
        className={`transition-transform duration-500 ${
          isActive ? "-translate-y-7" : ""
        }`}
      />

      <span
        className={`
    absolute bottom-2
    text-xs text-white text-center
    transition-all duration-500
    ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
  `}
      >
        {label}
      </span>
    </Link>
  );
}

export default NavItem;
