// components/modal/PromotionModal.tsx
"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PromotionModalProps {
  isOpen: boolean;
  promotion: any;
  onClose: () => void;
}

export default function PromotionModal({
  isOpen,
  promotion,
  onClose,
}: PromotionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && promotion && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Modal */}
          <motion.div
            className="w-full max-w-md bg-secondary text-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ scale: 0.92, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h2 className="text-sm font-bold">{promotion.title}</h2>
              <button onClick={onClose}>
                <X className="w-4 h-4 text-gray-300 hover:text-white" />
              </button>
            </div>

            {/* Image */}
            <div className="relative w-full h-40">
              <Image
                src={promotion.image}
                alt="promotion"
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 text-xs">
              <p className="text-gray-300">{promotion.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <InfoBox label="Minimum Deposit" value={`${promotion.minDeposit} TK`} />
                <InfoBox label="Bonus" value={promotion.bonusRate} />
                <InfoBox
                  label="Turnover"
                  value={promotion.turnover}
                  className="col-span-2"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                className="w-full bg-accent py-2 rounded-lg text-black font-bold mt-3"
              >
                Claim Now
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoBox({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`bg-black/30 p-2 rounded-lg ${className}`}>
      <p className="text-gray-400">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
