// src/app/api/spin/route.ts
import { NextResponse } from "next/server";
import { computeSpinResult, type SpinConfig } from "@/lib/winEngine";

// -----------------------------
// Replace with real user identity:
// - from session JWT (NextAuth)
// - or your token userId
// - fallback: deviceId from client
// -----------------------------
function getUserKey(req: Request) {
  const deviceId = req.headers.get("x-device-id") || "anonymous-device";
  return `spin:${deviceId}`;
}

// -----------------------------
// ✅ PRODUCTION: use Redis/DB.
// For now: in-memory store (dev only).
// -----------------------------
type StoreValue = {
  lastSpinAt: number;     // ms epoch
  nonBigStreak: number;   // since last big win
};

const memStore = new Map<string, StoreValue>();

const config: SpinConfig = {
  bigWinEvery: 20, // ✅ you control this (attempts)
  prizes: [
    // Common (90% total)
    { value: 5,  label: "5",  weight: 22.5 },
    { value: 7,  label: "7",  weight: 22.5 },
    { value: 10, label: "10", weight: 22.5 },
    { value: 15, label: "15", weight: 22.5 },

    // Rare (10% total across 3 prizes)
    { value: 17, label: "17", weight: 4 },
    { value: 22, label: "22", weight: 3 },
    { value: 25, label: "25", weight: 3, isBig: true }, // big win
  ],
};

const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const userKey = getUserKey(req);

  const now = Date.now();
  const prev = memStore.get(userKey) || { lastSpinAt: 0, nonBigStreak: 0 };

  // ✅ enforce 24h
  if (prev.lastSpinAt && now - prev.lastSpinAt < DAY_MS) {
    const nextAllowedAt = prev.lastSpinAt + DAY_MS;
    return NextResponse.json(
      { ok: false, reason: "COOLDOWN", nextAllowedAt },
      { status: 429 }
    );
  }

  const prize = computeSpinResult({
    config,
    nonBigStreak: prev.nonBigStreak,
  });

  const isBig = !!prize.isBig;

  memStore.set(userKey, {
    lastSpinAt: now,
    nonBigStreak: isBig ? 0 : prev.nonBigStreak + 1,
  });

  // ✅ Return only the prize.
  // If you later "claim" rewards, also return a signed token/HMAC.
  return NextResponse.json({
    ok: true,
    prize,
    serverTime: now,
    cooldownMs: DAY_MS,
  });
}
