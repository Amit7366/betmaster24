// components/ui/PromoCard.tsx
import Image from "next/image";
import { motion } from "framer-motion";


interface PromoCardProps {
  image: string;
  title: string;
  buttonText: string;
  onClick: () => void;
}

export default function PromoCard({
  image,
  title,
  buttonText,
  onClick,
}: PromoCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className="w-full max-w-[450px] mx-auto py-1 rounded-2xl cursor-pointer"
      onClick={onClick}
      // className="w-full max-w-[450px] mx-auto py-1 rounded-2xl cursor-pointer group"
    >
      {/* Image */}
      <div className="rounded-xl overflow-hidden bg-[#f35642]">
        <Image
          src={image}
          alt={title}
          width={500}
          height={200}
          className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-center border border-purple-600 mt-1 rounded-md">
        <p className="text-white text-xs truncate pl-3">{title}</p>

        <span className="bg-[#e94d5c] px-4 py-1 text-xs text-white font-bold rounded-tr-md rounded-br-md">
          {buttonText}
        </span>
      </div>
    </motion.div>
  );
}

// import Image from "next/image";

// interface PromoCardProps {
//   image: string;
//   title: string;
//   buttonText: string;
// }

// export default function PromoCard({ image, title, buttonText }: PromoCardProps) {
//   return (
//     <div className="w-full max-w-[450px] mx-auto py-1 rounded-2xl">

//       {/* Image */}
//       <div className="rounded-xl overflow-hidden bg-[#f35642]">
//         <Image
//           src={image}
//           alt="promo"
//           width={500}
//           height={200}
//           className="w-full h-auto object-cover"
//         />
//       </div>

//       {/* Bottom Bar */}
//       <div className="flex justify-between items-center border rounded-tr-md rounded-br-md border-purple-600 mt-1">
//         <p className="text-white text-xs truncate pl-3">
//           {title}
//         </p>

//         <button className="bg-[#e94d5c] px-4 py-1 rounded-tr-md rounded-br-md text-xs rounded-tl-lg text-white font-bold shadow">
//           {buttonText}
//         </button>
//       </div>

//     </div>
//   );
// }
