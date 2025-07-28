'use client';

import PromotionModal from '@/components/modal/PromotionModal';
import { PROMOTION_LIST } from '@/constants/promotions';
import { BadgePercent, Gift } from 'lucide-react';
import React, { useState } from 'react';
const PromotionPage = () => {
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (promotion: any) => {
    setSelectedPromotion(promotion);
    setModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen px-4 py-20 bg-primary text-white">
      <h1 className="text-2xl font-bold text-accent mb-6 flex items-center gap-2">
        <Gift className="w-6 h-6" /> Active Promotions
      </h1>

      <div className="grid grid-cols-1 gap-6">
        {PROMOTION_LIST.filter((promo) => promo.code !== 'NO_PROMO').map((promo) => (
          <div
            key={promo.code}
            className="bg-secondary rounded-xl p-5 border border-accent shadow hover:shadow-xl transition duration-300"
          >
            <h2 className="text-lg font-bold text-accent mb-2 flex items-center gap-1">
              <BadgePercent className="w-5 h-5 text-accent" /> {promo.title}
            </h2>

            <ul className="text-sm space-y-1 mb-3">
              <li>
                <span className="text-gray-300">Minimum Deposit:</span>{' '}
                <span className="text-white font-semibold">{promo.minDeposit} TK</span>
              </li>
              {promo.fixedBonus !== undefined ? (
                <li>
                  <span className="text-gray-300">Fixed Bonus:</span>{' '}
                  <span className="text-white font-semibold">{promo.fixedBonus} TK</span>
                </li>
              ) : (
                <li>
                  <span className="text-gray-300">Bonus Rate:</span>{' '}
                  <span className="text-white font-semibold">{promo.bonusRate * 100}%</span>
                </li>
              )}
              <li>
                <span className="text-gray-300">Turnover Requirement:</span>{' '}
                <span className="text-white font-semibold">{promo.turnoverX}x</span>
              </li>
            </ul>

            <button
              onClick={() => openModal(promo)}
              className="mt-2 text-sm text-accent hover:underline"
            >
              Read More →
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      <PromotionModal
        promotion={selectedPromotion}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default PromotionPage;
