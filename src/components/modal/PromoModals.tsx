"use client";

import { useEffect, useRef, useState } from "react";
import WelcomeBonusModal from "./WelcomeBonusModal";
import { SecondPromoModal } from "./SecondPromoModal";

export default function PromoModals() {
  const [openFirst, setOpenFirst] = useState(false);
  const [openSecond, setOpenSecond] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // clear all timers on unmount
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    const firstAlreadyShown =
      localStorage.getItem("welcome_modal_shown") === "true";

    // If first already shown => show second after 2s (every time)
    if (firstAlreadyShown) {
      const t = setTimeout(() => setOpenSecond(true), 2000);
      timers.current.push(t);
      return;
    }

    // else: show first after 1s
    const t1 = setTimeout(() => {
      setOpenFirst(true);
      localStorage.setItem("welcome_modal_shown", "true"); // mark as shown
    }, 1000);
    timers.current.push(t1);
  }, []);

  // When first opens => auto close after 3s, then open second
  useEffect(() => {
    if (!openFirst) return;

    const t = setTimeout(() => {
      setOpenFirst(false);

      // open second AFTER first closes (small gap for smoothness)
      const t2 = setTimeout(() => setOpenSecond(true), 150);
      timers.current.push(t2);
    }, 3000);

    timers.current.push(t);

    return () => clearTimeout(t);
  }, [openFirst]);

  return (
    <>
      <WelcomeBonusModal open={openFirst} onClose={() => setOpenFirst(false)} />

      <SecondPromoModal
        open={openSecond}
        onClose={() => setOpenSecond(false)}
      />
    </>
  );
}
