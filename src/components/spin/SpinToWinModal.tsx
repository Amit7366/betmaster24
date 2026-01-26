"use client";

import { useAuth } from "@/redux/hook/useAuth";
import { useEffect, useMemo, useRef, useState } from "react";

// -------------------- Types --------------------
type Prize = { value: number; label: string; isBig?: boolean };

// -------------------- Client-only stable device id --------------------
function getDeviceId() {
  const k = "spin_device_id";
  let v = localStorage.getItem(k);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(k, v);
  }
  return v;
}

// -------------------- Wheel background --------------------
function buildWheelBackground(slices: number) {
  // closer to the reference wheel colors
  const colors = [
    "#16a34a", // green
    "#3b82f6", // blue
    "#ef4444", // red
    "#f59e0b", // orange
    "#0ea5e9", // sky
    "#a855f7", // purple
    "#22c55e", // green2
  ];

  const step = 360 / slices;
  const parts: string[] = [];
  for (let i = 0; i < slices; i++) {
    const c = colors[i % colors.length];
    const from = i * step;
    const to = (i + 1) * step;
    parts.push(`${c} ${from}deg ${to}deg`);
  }

  // add subtle “slice shine”
  return `conic-gradient(${parts.join(
    ",",
  )}), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)`;
}

// -------------------- Daily modal gate --------------------
const MODAL_KEY = "spin_modal_last_shown_at";
const DAY_MS = 24 * 60 * 60 * 1000;

function useDailyModal() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  // console.log(user);
  // useEffect(() => {
  //   if (!user) return;
  //   const raw = localStorage.getItem(MODAL_KEY);
  //   const last = raw ? Number(raw) : 0;
  //   const now = Date.now();

  //   if (!last || now - last >= DAY_MS) {
  //     setOpen(true);
  //     localStorage.setItem(MODAL_KEY, String(now));
  //   }
  // }, []);
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const controller = new AbortController();

    const run = async () => {
      try {
        // ✅ get token (use your real token source)
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          "";

        if (!token) return;

        const userId = user?.id; // ✅ adjust based on your auth user shape
        if (!userId) return;

        const res = await fetch(`/api/spin/status/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `${token}`,
          },
          signal: controller.signal,
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok || !json?.success) return;

        // ✅ server decides if user can spin
        if (json?.data?.canSpin) {
          console.log(json?.data);
          setOpen(true);
        } else {
          setOpen(false);
        }

        // optional: you can store status if you want
        // setStatus(json.data)
      } catch (err) {
        // ignore abort errors
        if ((err as any)?.name !== "AbortError") console.error(err);
      }
    };

    run();

    return () => controller.abort();
  }, [isAuthenticated, user, setOpen]);
  return { open, setOpen, user };
}

// -------------------- Main Component --------------------
export default function SpinToWinModal() {
  const { open, setOpen } = useDailyModal();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  // ✅ Put your wheel values here (same order as you want on wheel)
  const PRIZES: Prize[] = useMemo(
    () => [
      { value: 5, label: "05" },
      { value: 7, label: "07" },
      { value: 10, label: "10" },
      { value: 15, label: "15" },
      { value: 17, label: "17" },
      { value: 22, label: "22" },
      { value: 25, label: "25", isBig: true },
    ],
    [],
  );

  const slices = PRIZES.length;
  const sliceAngle = 360 / slices;

  // ✅ Rotating container ref (background + labels together)
  const wheelSpinRef = useRef<HTMLDivElement | null>(null);

  // ✅ Rotation persistence so it doesn't snap back each spin
  const baseRotationRef = useRef(0);
  const spinIdRef = useRef(0);

  // ✅ Sounds
  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const stopAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    spinAudioRef.current = new Audio("/spin.mp3");
    stopAudioRef.current = new Audio("/win.mp3");
    spinAudioRef.current.preload = "auto";
    stopAudioRef.current.preload = "auto";
  }, []);

  const close = () => {
    if (spinning) return;
    setOpen(false);
  };

  const spin = async () => {
    if (spinning) return;

    setError(null);
    setResult(null);
    setSpinning(true);

    // start sound
    try {
      if (spinAudioRef.current) {
        spinAudioRef.current.currentTime = 0;
        void spinAudioRef.current.play();
      }
    } catch {}

    try {
      const deviceId = getDeviceId();

      // ✅ server-controlled result
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId,
        },
      });

      const data = await res.json();
      data.userId = user?.id;

      // console.log(data);
      if (!res.ok || !data.ok) {
        if (data?.reason === "COOLDOWN") {
          const when = new Date(data.nextAllowedAt).toLocaleString();
          throw new Error(`Already spun. Next spin: ${when}`);
        }
        throw new Error(data?.reason || "Spin failed");
      }

      const prize: Prize = data.prize;

      // 2) CLIENT: call the proxy claim API right after spin result
      // Put this AFTER your cooldown checks pass and AFTER `const prize: Prize = data.prize;`

      // ✅ attach userId for claim
      const userId = user?.id || user?._id;
      if (!userId) throw new Error("User not found");

      // ✅ token (use your real source)
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        "";
      if (!token) throw new Error("Missing token");

      // ✅ spinWinAmount: if your spin api returns `data.prize` as object -> use data.prize.value
      // if it's already a number -> use data.prize
      const spinWinAmount =
        typeof data?.prize === "number" ? data.prize : data?.prize?.value;

      if (!spinWinAmount) throw new Error("Spin amount missing");

      // ✅ hit CLAIM (your proxy route)
      const claimRes = await fetch("/api/spin/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          id: userId,
          spinWinAmount,
        }),
      });

      const claimJson = await claimRes.json();
      if (!claimRes.ok || claimJson?.success === false) {
        throw new Error(claimJson?.message || "Claim failed");
      }

      // ✅ optional: log / store claim response
      console.log("✅ Spin claimed:", claimJson);

      // -------------------------------
      // ✅ Accurate landing math
      // Pointer is at TOP (like your image)
      // In CSS rotate(), 0deg points RIGHT (3 o'clock)
      // TOP corresponds to 270deg
      // We want: (sliceCenter + rotation) % 360 == pointerAngle
      // -------------------------------
      const targetIndex = PRIZES.findIndex((p) => p.value === prize.value);
      const idx = targetIndex >= 0 ? targetIndex : 0;

      const pointerAngle = 270; // TOP
      const sliceCenter = idx * sliceAngle + sliceAngle / 2;

      let landingRotation = pointerAngle - sliceCenter;
      landingRotation = ((landingRotation % 360) + 360) % 360;

      const extraTurns = 6 * 360;

      // keep continuity (no snap back)
      const startBase = ((baseRotationRef.current % 360) + 360) % 360;
      const finalRotation =
        baseRotationRef.current + extraTurns + landingRotation - startBase;

      if (!wheelSpinRef.current) throw new Error("Wheel not mounted");

      // animate
      spinIdRef.current += 1;
      const mySpinId = spinIdRef.current;

      wheelSpinRef.current.style.transition =
        "transform 5.2s cubic-bezier(0.12, 0.9, 0.12, 1)";
      wheelSpinRef.current.style.transform = `rotate(${finalRotation}deg)`;

      // stop sound near end
      window.setTimeout(() => {
        try {
          spinAudioRef.current?.pause();
          if (stopAudioRef.current) {
            stopAudioRef.current.currentTime = 0;
            void stopAudioRef.current.play();
          }
        } catch {}
      }, 4800);

      // finish
      window.setTimeout(() => {
        if (mySpinId !== spinIdRef.current) return;

        baseRotationRef.current = finalRotation;
        setResult(prize);
        setSpinning(false);
      }, 5200);
    } catch (e: any) {
      spinAudioRef.current?.pause();
      setSpinning(false);
      setError(e?.message || "Something went wrong");
    }
  };

  // ensure wheel starts at base rotation
  useEffect(() => {
    if (wheelSpinRef.current) {
      wheelSpinRef.current.style.transform = `rotate(${baseRotationRef.current}deg)`;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      {/* back glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-60"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,215,0,0.35), rgba(255,0,0,0.18), rgba(0,0,0,0) 60%)",
          }}
        />
      </div>

      <div className="relative w-[92%] max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
        {/* header */}
        <div className="relative border-b border-white/10 px-5 py-4">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,215,0,0.18), rgba(255,0,0,0.12), rgba(59,130,246,0.10))",
            }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.9)]" />
                <span className="text-xs font-semibold text-white/90">
                  Daily Reward
                </span>
              </div>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight text-white">
                Spin &amp; Win{" "}
                
              </h2>
              <p className="mt-1 text-sm text-white/70">
                One spin every 24 hours. Good luck!{" "}
                
              </p>
            </div>

            <button
              onClick={close}
              disabled={spinning}
              className="relative rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-6 pb-7 pt-6">
          {/* Wheel + stand like the image */}
          <div className="mx-auto w-full max-w-[340px]">
            <div className="relative mx-auto h-[320px] w-[320px]">
              {/* TOP pointer (like the reference image) */}
              <div className="absolute -left-5 bottom-[45%] z-30 rotate-90">
                <div className="relative">
                  <div className="h-0 w-0 border-b-[26px] border-l-[16px] border-r-[16px] border-b-white border-l-transparent border-r-transparent drop-shadow-[0_10px_10px_rgba(0,0,0,0.55)]" />
                  <div className="absolute left-1/2 top-[8px] h-2 w-2 -translate-x-1/2 rounded-full bg-yellow-300 shadow-[0_0_18px_rgba(253,224,71,0.95)]" />
                </div>
              </div>

              {/* Red rim ring */}
              <div
                className="absolute inset-0 rounded-full p-[14px] shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55), rgba(255,255,255,0) 35%), linear-gradient(180deg, #ff4d4d, #b00000)",
                }}
              >
                {/* Rim bolts (lights) */}
                <div className="absolute inset-[10px] rounded-full">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const a = (i * 360) / 10;
                    return (
                      <div
                        key={i}
                        className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full animate-pulse"
                        style={{
                          transform: `rotate(${a}deg) translateY(-146px)`,
                          background:
                            "radial-gradient(circle at 30% 30%, #fff7cc, #f59e0b 60%, #b45309)",
                          boxShadow:
                            "0 0 18px rgba(245,158,11,0.65), 0 6px 10px rgba(0,0,0,0.35)",
                        }}
                      />
                    );
                  })}
                </div>

                {/* Inner chrome ring */}
                <div
                  className="relative h-full w-full rounded-full p-[10px]"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0.08) 55%), linear-gradient(180deg, rgba(240,240,240,0.85), rgba(120,120,120,0.35))",
                  }}
                >
                  {/* ✅ Rotating wheel wrapper */}
                  <div
                    ref={wheelSpinRef}
                    className="relative h-full w-full rounded-full overflow-hidden"
                    style={{
                      background: buildWheelBackground(PRIZES.length),
                      boxShadow:
                        "inset 0 0 0 10px rgba(255,255,255,0.22), inset 0 0 30px rgba(0,0,0,0.35)",
                    }}
                  >
                    {/* slice separators */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.55) 0deg 1deg, rgba(255,255,255,0) 1deg calc(360deg / 7))",
                        opacity: 0.35,
                        mixBlendMode: "overlay",
                      }}
                    />

                    {/* Labels (rotate with wheel, stay upright) */}
                    {PRIZES.map((p, i) => {
                      const angle = i * sliceAngle + sliceAngle / 2;

                      // ✅ bring labels closer to center (reduce this if still far)
                      const radius = 96; // try 90-102

                      return (
                        <div
                          key={p.value}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                          style={{
                            // ✅ now perfectly centered BEFORE rotating/translating
                            transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`,
                            transformOrigin: "center",
                          }}
                        >
                          <div
                            className="text-center font-black tracking-tight"
                            style={{
                              // ✅ tangent-like direction (same as screenshot)
                              transform: "rotate(90deg)",

                              width: 76,
                              fontSize: 18,
                              lineHeight: "20px",

                              color: "#fff",
                              WebkitTextStroke: "1.2px rgba(0,0,0,0.35)",
                              textShadow:
                                "0 3px 0 rgba(0,0,0,0.40), 0 10px 18px rgba(0,0,0,0.45)",
                            }}
                          >
                            {p.value}{" "}
                            <span style={{ fontSize: 14, opacity: 0.95 }}>
                              TK
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Gold hub (center) */}
                  <div
                    className="absolute left-1/2 top-1/2 z-20 h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 rounded-full p-[10px]"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.65), rgba(255,255,255,0) 45%), linear-gradient(180deg, #ffd36e, #b97a00)",
                      boxShadow:
                        "0 18px 30px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(255,255,255,0.35)",
                    }}
                  >
                    <div
                      className="h-full w-full rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 30% 30%, #fff2c6, #ffcc4d 55%, #8a5a00)",
                        boxShadow: "inset 0 8px 14px rgba(0,0,0,0.22)",
                      }}
                    />
                  </div>

                  {/* Spin button (on top of hub) */}
                  <button
                    onClick={spin}
                    disabled={spinning}
                    className="absolute left-1/2 top-1/2 z-30 h-[88px] w-[88px] -translate-x-1/2 -translate-y-1/2 rounded-full font-black text-white disabled:opacity-50"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), rgba(255,255,255,0) 55%), linear-gradient(180deg, #111827, #000)",
                      boxShadow:
                        "0 14px 26px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.12)",
                    }}
                  >
                    <span className="block text-[14px] tracking-widest">
                      {spinning ? "..." : "SPIN"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Stand base */}
              {/* <div className="absolute left-1/2 bottom-[-42px] -translate-x-1/2">
                <div
                  className="h-[58px] w-[220px] rounded-b-[60px] rounded-t-[18px]"
                  style={{
                    background:
                      "linear-gradient(180deg, #ff4d4d, #980000)",
                    boxShadow: "0 18px 30px rgba(0,0,0,0.45)",
                  }}
                />
                <div
                  className="mx-auto -mt-2 h-3 w-[170px] rounded-full opacity-60"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.45), rgba(255,255,255,0))",
                  }}
                />
              </div> */}
            </div>

            {/* Result / Error */}
            <div className="mt-8">
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              {result && (
                <div
                  className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-center text-sm text-emerald-100"
                  style={{
                    boxShadow: result.isBig
                      ? "0 0 40px rgba(34,197,94,0.35)"
                      : "none",
                  }}
                >
                  🎉 You won{" "}
                  <span className="text-base font-black text-white">
                    {result.value}
                  </span>
                  {result.isBig ? (
                    <span className="ml-2 inline-flex items-center rounded-full border border-yellow-300/30 bg-yellow-300/10 px-2 py-0.5 text-xs font-bold text-yellow-100">
                      BIG WIN
                    </span>
                  ) : null}
                </div>
              )}

              {/* Buttons (optional) */}
              {/* <div className="mt-4 flex gap-3">
                <button
                  onClick={close}
                  disabled={spinning}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/15 disabled:opacity-50"
                >
                  Close
                </button>
                <button
                  onClick={spin}
                  disabled={spinning}
                  className="flex-1 rounded-2xl px-4 py-2 font-extrabold text-white disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(180deg, #ff4d4d, #b00000)",
                    boxShadow:
                      "0 14px 26px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(255,255,255,0.14)",
                  }}
                >
                  {spinning ? "Spinning..." : "Spin now"}
                </button>
              </div> */}
            </div>
          </div>
        </div>

        {/* tiny footer gloss */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 opacity-40"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.20))",
          }}
        />
      </div>
    </div>
  );
}
