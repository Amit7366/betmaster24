"use client";

import { useState } from "react";
import PromoCard from "@/components/ui/PromoCard";
import PromotionModal from "@/components/modal/PromotionModal";
import { promotions } from "@/constants/promotions";
import { Gift } from "lucide-react";

export default function PromotionPage() {
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);

  return (
    <div className="w-full min-h-screen px-4 py-20 bg-primary text-white">
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Gift className="w-4 h-4" /> প্রমোশন
      </h1>

      <div className="grid grid-cols-1 gap-2">
        {promotions.map((promo) => (
          <PromoCard
            key={promo.id}
            image={promo.image}
            title={promo.title}
            buttonText={promo.buttonText}
            onClick={() => setSelectedPromotion(promo)}
          />
        ))}
      </div>

      <PromotionModal
        isOpen={!!selectedPromotion}
        promotion={selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
      />
    </div>
  );
}
