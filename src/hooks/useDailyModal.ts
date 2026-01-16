// src/hooks/useDailyModal.ts
"use client";

import { useEffect, useState } from "react";

const KEY = "spin_modal_last_shown_at";
const DAY_MS = 24 * 60 * 60 * 1000;

export function useDailyModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    const last = raw ? Number(raw) : 0;
    const now = Date.now();

    if (!last || now - last >= DAY_MS) {
      setOpen(true);
      localStorage.setItem(KEY, String(now));
    }
  }, []);

  return { open, setOpen };
}
