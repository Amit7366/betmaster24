// components/promotions/PromotionModal.tsx
import { Promotion } from "@/types";
import { X } from "lucide-react"; // Assuming you have a type. Else, define it below.
import React from "react";

interface PromotionModalProps {
  promotion: Promotion | null;
  onClose: () => void;
  isOpen: boolean;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ promotion, onClose, isOpen }) => {
  if (!isOpen || !promotion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-secondary border border-accent rounded-xl p-6 max-w-[400px] w-full relative text-white shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
          <span>{promotion.title}</span>
        </h2>

        <ul className="space-y-2 text-sm">
          <li>
            <span className="text-gray-300">Minimum Deposit:</span>{" "}
            <span className="font-semibold">{promotion.minDeposit} TK</span>
          </li>
          {promotion.fixedBonus !== undefined ? (
            <li>
              <span className="text-gray-300">Fixed Bonus:</span>{" "}
              <span className="font-semibold">{promotion.fixedBonus} TK</span>
            </li>
          ) : (
            <li>
              <span className="text-gray-300">Bonus Rate:</span>{" "}
              <span className="font-semibold">{promotion?.bonusRate as number * 100}%</span>
            </li>
          )}
          <li>
            <span className="text-gray-300">Turnover Requirement:</span>{" "}
            <span className="font-semibold">{promotion.turnoverX}x</span>
          </li>
          <li>
            <span className="text-gray-300">Eligible Games:</span>{" "}
            <span className="font-semibold">
              {promotion.eligibleGames.join(", ")}
            </span>
          </li>
          {promotion.maxWithdrawLimit && (
            <li>
              <span className="text-gray-300">Max Withdrawal:</span>{" "}
              <span className="font-semibold">{promotion.maxWithdrawLimit} TK</span>
            </li>
          )}
          <li>
            <span className="text-gray-300">Usage Type:</span>{" "}
            <span className="font-semibold capitalize">{promotion.usageType}</span>
          </li>
          <li>
            <span className="text-gray-300">Promo Code:</span>{" "}
            <span className="font-semibold">{promotion.code}</span>
          </li>
          {promotion.description && (
            <li>
              <span className="text-gray-300">Description:</span>{" "}
              <span className="font-semibold">{promotion.description}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PromotionModal;
