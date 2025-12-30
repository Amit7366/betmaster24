"use client";

import LoadingOverlay from "@/components/ui/Loader";
import { PROMOTION_LIST } from "@/constants/promotions";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getUserInfo } from "@/services/actions/auth.services";
import { PromoSummary } from "@/types";
import {
  Copy,
  ArrowRight,
  Wallet,
  ShieldCheck,
  Image as ImageIcon,
  BadgePercent,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const walletOptions = [
  { method: "bKash", number: "01781786210", logo: "/bkash-logo.jpg" },
  { method: "Nagad", number: "01781786210", logo: "/nagad-logo.png" },
];

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-xs text-white/60">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function DepositPage() {
  const router = useRouter();
  const userInfo = getUserInfo();
  const authToken =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ?? undefined
      : undefined;

  const [selectedMethod, setSelectedMethod] = useState(walletOptions[0]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    amount: 0,
    transactionId: "",
    proofImage: "",
    walletNumber: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPromoCode, setSelectedPromoCode] = useState("NO_PROMO");

  const adminId = userInfo?.objectId;
  const { data: dashboard } = useDashboardData(adminId, authToken);

  const summary: PromoSummary | null | undefined = dashboard?.promoSummary;

  const checkPromo = useMemo(() => {
    const bonuses = summary?.depositBonuses ?? [];
    return bonuses.length === 0 || bonuses[0]?.promoCode === "NO_PROMO";
  }, [summary]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? value.replace(/[^0-9.]/g, "") : value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // ✅ Thumbnail preview URL (UI only)
  const previewUrl = useMemo(() => {
    if (!selectedFile) return "";
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const amountNumber = useMemo(
    () => parseFloat(Number(form.amount).toFixed(2)),
    [form.amount]
  );

  const selectedPromo = useMemo(() => {
    return PROMOTION_LIST.find((p) => p.code === selectedPromoCode);
  }, [selectedPromoCode]);

  const promoEligible = useMemo(() => {
    if (!selectedPromo) return true;
    if (selectedPromo.code === "NO_PROMO") return true;
    return amountNumber >= selectedPromo.minDeposit;
  }, [selectedPromo, amountNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amountNumber < 200) {
      toast.error("Minimum deposit amount is 200 TK.");
      return;
    }

    setSubmitting(true);

    let imageUrl = "";

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", "clicktoearn");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dsekhxz2h/image/upload",
          { method: "POST", body: formData }
        );

        const data = await res.json();
        if (data.secure_url) {
          imageUrl = data.secure_url;
          toast.success("Image uploaded successfully");
        } else {
          throw new Error("Upload failed");
        }
      } catch (err: any) {
        toast.error("Image upload failed: " + err.message);
        setSubmitting(false);
        return;
      }
    }

    const payload = {
      userId: userInfo.objectId,
      id: dashboard?.user?.id,
      transactionType: "deposit",
      paymentMethod: selectedMethod.method.toLowerCase(),
      status: "pending",
      amount: amountNumber,
      transactionId: form.transactionId,
      walletNumber: form.walletNumber,
      agentNumber: selectedMethod.number,
      proofImage: imageUrl,
      promoCode: selectedPromoCode,
    };

    const promise = fetch(`/api/transaction/deposit/manual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${authToken}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to deposit");
        setTimeout(() => router.push("/dashboard/user"), 1000);
        return res.json();
      })
      .finally(() => setSubmitting(false));

    toast.promise(promise, {
      loading: "Submitting deposit...",
      success: (data) => `Deposit successful: ${data?.message || "Success"}`,
      error: (err) => `Error: ${err.message}`,
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-primary px-3 pb-24 pt-6">
      {submitting && <LoadingOverlay />}

      <div className="mx-auto w-full max-w-4xl space-y-4">
        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Deposit
              </h1>
              <p className="mt-1 text-xs text-white/60">
                Choose wallet, submit payment info, and upload proof.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
              <ShieldCheck className="h-4 w-4" />
              Secure manual verification
            </div>
          </div>
        </div>

        {/* Wallet card */}
        <div className="rounded-3xl border border-white/10 bg-secondary/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <SectionTitle
            icon={<Wallet className="h-5 w-5 text-white" />}
            title="Mobile Wallet Address"
            subtitle="Select a wallet method and copy the agent number."
          />

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {walletOptions.map((wallet) => {
              const active = selectedMethod.method === wallet.method;
              return (
                <button
                  type="button"
                  key={wallet.method}
                  onClick={() => setSelectedMethod(wallet)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl border p-3 text-left transition",
                    "bg-primary/40 border-white/10 hover:border-white/20 hover:bg-primary/60",
                    active &&
                      "border-accent/60 bg-accent/15 ring-1 ring-accent/30"
                  )}
                >
                  <div
                    className={cn(
                      "grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10",
                      active && "ring-accent/30"
                    )}
                  >
                    <Image
                      src={wallet.logo}
                      alt={wallet.method}
                      width={40}
                      height={40}
                      className="h-10 w-10 object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white">
                        {wallet.method}
                      </span>
                      {active ? (
                        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] text-accent ring-1 ring-accent/30">
                          Selected
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-white/60">
                      Tap to use this method
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Copy row */}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(selectedMethod.number);
              toast.success("Wallet number copied to clipboard!");
            }}
            className="mt-5 flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-primary/40 px-4 py-3 text-left transition hover:border-white/20 hover:bg-primary/60"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
                <Copy className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/60">Cashout to agent number</p>
                <p className="text-base font-bold text-white">
                  {selectedMethod.number}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white ring-1 ring-white/10">
              Copy
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>

        {/* ✅ Summary card (UX only) */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <SectionTitle
              icon={<CheckCircle2 className="h-5 w-5 text-white" />}
              title="Deposit Summary"
              subtitle="Quick review before submitting."
            />

            <div
              className={cn(
                "rounded-full px-3 py-1.5 text-xs ring-1",
                amountNumber >= 200
                  ? "bg-emerald-500/10 text-emerald-200 ring-emerald-400/20"
                  : "bg-red-500/10 text-red-200 ring-red-400/20"
              )}
            >
              {amountNumber >= 200 ? "Ready" : "Min 200 TK required"}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-primary/35 p-4">
              <p className="text-xs text-white/55">Amount</p>
              <p className="mt-1 text-lg font-bold text-white">
                {Number.isFinite(amountNumber) ? amountNumber : 0} TK
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-primary/35 p-4">
              <p className="text-xs text-white/55">Payment Method</p>
              <p className="mt-1 text-lg font-bold text-white">
                {selectedMethod.method}
              </p>
              <p className="mt-1 text-xs text-white/55">
                Agent: <span className="text-white/80">{selectedMethod.number}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-primary/35 p-4">
              <p className="text-xs text-white/55">Promotion</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {selectedPromo?.title ?? "No Promotion Selected"}
              </p>

              {checkPromo ? (
                <div className="mt-2 flex items-center gap-2">
                  {promoEligible ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      <p className="text-xs text-emerald-200">Eligible</p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-300" />
                      <p className="text-xs text-yellow-200">
                        Need {selectedPromo?.minDeposit} TK min
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs text-white/60">
                  You already have a promotion.
                </p>
              )}
            </div>
          </div>

          {/* small warning if fields missing (UX only) */}
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
            Tip: Make sure <span className="text-white">Transaction ID</span> and{" "}
            <span className="text-white">Wallet Number</span> are correct to speed up approval.
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-3xl border border-white/10 bg-secondary/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <SectionTitle
            icon={<ShieldCheck className="h-5 w-5 text-white" />}
            title="Deposit Details"
            subtitle="Fill in details carefully to avoid approval delays."
          />

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Inputs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Amount (TK)
                </label>
                <div className="relative">
                  <input
                    name="amount"
                    type="number"
                    placeholder="e.g. 200"
                    value={(form as any).amount}
                    onChange={handleChange}
                    required
                    className={cn(
                      "h-12 w-full rounded-2xl border bg-primary/40 px-4 text-sm text-white placeholder:text-white/35 outline-none transition",
                      "border-white/10 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                    )}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/70 ring-1 ring-white/10">
                    Min 200
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Your Wallet Number (paid from)
                </label>
                <input
                  name="walletNumber"
                  type="text"
                  placeholder="e.g. 017xxxxxxxx"
                  value={(form as any).walletNumber}
                  onChange={handleChange}
                  required
                  className={cn(
                    "h-12 w-full rounded-2xl border bg-primary/40 px-4 text-sm text-white placeholder:text-white/35 outline-none transition",
                    "border-white/10 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                  )}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Transaction ID
                </label>
                <input
                  name="transactionId"
                  type="text"
                  placeholder="e.g. TXNREF123456"
                  value={(form as any).transactionId}
                  onChange={handleChange}
                  required
                  className={cn(
                    "h-12 w-full rounded-2xl border bg-primary/40 px-4 text-sm text-white placeholder:text-white/35 outline-none transition",
                    "border-white/10 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                  )}
                />
              </div>
            </div>

            {/* ✅ Upload + Preview */}
            <div className="rounded-2xl border border-white/10 bg-primary/35 p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
                  <ImageIcon className="h-4 w-4 text-white" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    Upload Payment Image
                  </p>
                  <p className="mt-0.5 text-xs text-white/60">
                    Add a clear screenshot of the confirmation.
                  </p>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className="w-full text-xs text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-accent/90 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cardbg hover:file:bg-accent"
                    />

                    {selectedFile ? (
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                          {previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={previewUrl}
                              alt="Payment proof preview"
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-xs text-white/70">
                            {selectedFile.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70 ring-1 ring-white/10 hover:bg-white/15"
                          >
                            <X className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-white/40">
                        No file selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Promo + Instructions */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-black/40 to-black/20 p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400/15 text-yellow-300 ring-1 ring-yellow-300/20">
                  <BadgePercent className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Important Instructions
                  </h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-white/70">
                    <li>You can choose one promotion once in a lifetime.</li>
                    <li>Incorrect transaction IDs will delay approval.</li>
                    <li>Upload a clear screenshot of payment confirmation.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-5">
                <h4 className="mb-3 text-sm font-semibold text-yellow-300">
                  Select a Promotion
                </h4>

                {checkPromo ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                    {PROMOTION_LIST.map((promo) => {
                      const isActive = selectedPromoCode === promo.code;
                      const blocked =
                        promo.code !== "NO_PROMO" &&
                        amountNumber < promo.minDeposit;

                      return (
                        <label
                          key={promo.code}
                          className={cn(
                            "relative rounded-2xl border p-4 text-left transition",
                            "border-white/10 bg-white/[0.04] hover:border-white/20",
                            isActive &&
                              "border-accent/60 bg-accent/15 ring-1 ring-accent/25",
                            blocked &&
                              "opacity-60 cursor-not-allowed hover:border-white/10"
                          )}
                        >
                          <input
                            type="radio"
                            name="promotion"
                            value={promo.code}
                            checked={isActive}
                            onChange={() => {
                              if (
                                promo.code === "NO_PROMO" ||
                                amountNumber >= promo.minDeposit
                              ) {
                                setSelectedPromoCode(promo.code);
                              } else {
                                toast.error(
                                  `Minimum deposit for this promo is ${promo.minDeposit} TK.`
                                );
                              }
                            }}
                            disabled={blocked}
                            className="hidden"
                          />

                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-white">
                                {promo.title}
                              </p>
                              <p className="mt-1 text-xs text-white/65">
                                Min Deposit:{" "}
                                <span className="font-semibold text-white">
                                  {promo.minDeposit === 0
                                    ? "Any Amount"
                                    : `${promo.minDeposit} TK`}
                                </span>
                              </p>
                            </div>

                            <div
                              className={cn(
                                "rounded-full px-2 py-1 text-[10px] ring-1",
                                isActive
                                  ? "bg-accent/20 text-accent ring-accent/30"
                                  : blocked
                                  ? "bg-white/5 text-white/50 ring-white/10"
                                  : "bg-white/5 text-white/70 ring-white/10"
                              )}
                            >
                              {promo.usageType.charAt(0).toUpperCase() +
                                promo.usageType.slice(1)}
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/70">
                            <div className="rounded-xl bg-white/[0.03] p-2 ring-1 ring-white/10">
                              <p className="text-white/50">Bonus</p>
                              <p className="mt-0.5 font-semibold text-white">
                                {promo.fixedBonus !== undefined
                                  ? `${promo.fixedBonus} TK`
                                  : `${promo.bonusRate * 100}%`}
                              </p>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] p-2 ring-1 ring-white/10">
                              <p className="text-white/50">Turnover</p>
                              <p className="mt-0.5 font-semibold text-white">
                                {promo.turnoverX}x
                              </p>
                            </div>

                            <div className="col-span-2 rounded-xl bg-white/[0.03] p-2 ring-1 ring-white/10">
                              <p className="text-white/50">Eligible Games</p>
                              <p className="mt-0.5 font-semibold text-white">
                                {promo.eligibleGames.join(", ")}
                              </p>
                            </div>

                            {promo.maxWithdrawLimit ? (
                              <div className="col-span-2 rounded-xl bg-white/[0.03] p-2 ring-1 ring-white/10">
                                <p className="text-white/50">Max Withdrawal</p>
                                <p className="mt-0.5 font-semibold text-white">
                                  {promo.maxWithdrawLimit} TK
                                </p>
                              </div>
                            ) : null}
                          </div>

                          {blocked ? (
                            <p className="mt-3 text-[11px] text-red-300">
                              Requires minimum {promo.minDeposit} TK deposit.
                            </p>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/80">
                    You already have a promotion.
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "mt-2 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
                "flex items-center justify-between",
                submitting
                  ? "cursor-not-allowed bg-white/10 text-white/50 ring-1 ring-white/10"
                  : "bg-accent text-cardbg hover:brightness-110 ring-1 ring-accent/30"
              )}
            >
              <span>{submitting ? "Submitting..." : "Submit Deposit"}</span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/40 ring-1 ring-white/10">
                <ArrowRight className="h-4 w-4 text-white" />
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


// "use client";

// import LoadingOverlay from "@/components/ui/Loader";
// import { PROMOTION_LIST } from "@/constants/promotions";
// import { useDashboardData } from "@/hooks/useDashboardData";
// import { useGetAdminPromotionSummaryQuery } from "@/redux/api/adminApi";
// import { getUserInfo } from "@/services/actions/auth.services";
// import { PromoSummary } from "@/types";
// import { getFromLocalStorage } from "@/utils/local-storage";
// import { ArrowBigRight, Copy } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useEffect, useMemo, useState } from "react";
// import { toast } from "sonner";

// const walletOptions = [
//   {
//     method: "bKash",
//     number: "01781786210",
//     logo: "/bkash-logo.jpg",
//   },
//   {
//     method: "Nagad",
//     number: "01781786210",
//     logo: "/nagad-logo.png",
//   },
//   // {
//   //   method: "Rocket",
//   //   number: "01792915347",
//   //   logo: "/rocket-logo.jpeg",
//   // },
// ];

// export default function DepositPage() {
//   const router = useRouter();
//   const userInfo = getUserInfo();
//   const authToken =
//     typeof window !== "undefined"
//       ? localStorage.getItem("accessToken") ?? undefined
//       : undefined;
//   const [selectedMethod, setSelectedMethod] = useState(walletOptions[0]); // ... your existing state
//   const [submitting, setSubmitting] = useState(false);
//   const [form, setForm] = useState({
//     userId: "",
//     amount: 0,
//     transactionId: "",
//     proofImage: "",
//     walletNumber: "",
//   });
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [transferInfo, setTransferInfo] = useState<{
//     walletAddress: string;
//     image: string;
//   } | null>(null);
//   const [selectedPromoCode, setSelectedPromoCode] = useState("NO_PROMO");
//   const adminId = userInfo?.objectId;

//   const { data: dashboard, loading: dashboardLoading } = useDashboardData(
//     adminId,
//     authToken
//   );

//   // console.log('dashboard: ',dashboard?.user?.id)

//   // after
//   const summary: PromoSummary | null | undefined = dashboard?.promoSummary;

//   // Your original check, now safe & typed
//   const checkPromo = useMemo(() => {
//     const bonuses = summary?.depositBonuses ?? [];
//     return bonuses.length === 0 || bonuses[0]?.promoCode === "NO_PROMO";
//   }, [summary]);

//   console.log({ checkPromo, summary });
//   //   data: promoSummary,
//   //   isLoading: promoLoading,
//   //   error: promoError,
//   // } = useGetAdminPromotionSummaryQuery(adminId);
//   // console.log(promoSummary);
//   // const checkpromo =
//   //   (promoSummary?.data?.depositBonuses?.length ?? 0) === 0 ||
//   //   promoSummary?.data?.depositBonuses?.[0]?.promoCode === "NO_PROMO";

//   // useEffect(() => {
//   //   const fetchTransfer = async () => {
//   //     try {
//   //       const res = await fetch(
//   //         `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/qr-transfer/my-transfers`,
//   //         {
//   //           headers: {
//   //             Authorization: `${authToken}`,
//   //           },
//   //         }
//   //       );
//   //       const result = await res.json();
//   //       if (result.success) {
//   //         setTransferInfo({
//   //           walletAddress: result.data.walletAddress,
//   //           image: result.data.image,
//   //         });
//   //       }
//   //     } catch (err) {
//   //       console.error("Failed to load QR transfer info", err);
//   //       toast.error("Failed to fetch wallet info.");
//   //     }
//   //   };

//   //   if (authToken) fetchTransfer();
//   // }, [authToken]);


//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, type } = e.target;

//     // Optionally sanitize numeric input (still store as string)
//     const newValue =
//       type === "number"
//         ? value.replace(/[^0-9.]/g, "") // remove invalid characters
//         : value;

//     setForm((prev) => ({
//       ...prev,
//       [name]: newValue,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (parseFloat(Number(form.amount).toFixed(2)) < 200) {
//       toast.error("Minimum deposit amount is 200 TK.");
//       return;
//     }
//     setSubmitting(true); // disable button

//     let imageUrl = "";

//     if (selectedFile) {
//       const formData = new FormData();
//       formData.append("file", selectedFile);
//       formData.append("upload_preset", "clicktoearn");

//       try {
//         const res = await fetch(
//           "https://api.cloudinary.com/v1_1/dsekhxz2h/image/upload",
//           {
//             method: "POST",
//             body: formData,
//           }
//         );

//         const data = await res.json();
//         if (data.secure_url) {
//           imageUrl = data.secure_url;
//           toast.success("Image uploaded successfully");
//         } else {
//           throw new Error("Upload failed");
//         }
//       } catch (err: any) {
//         toast.error("Image upload failed: " + err.message);
//         setSubmitting(false); // re-enable on error
//         return;
//       }
//     }



//     const payload = {
//       userId: userInfo.objectId,
//       id: dashboard?.user?.id, // optional: dynamic ID
//       transactionType: "deposit",
//       paymentMethod: selectedMethod.method.toLowerCase(),
//       status: "pending",
//       amount: parseFloat(Number(form.amount).toFixed(2)),
//       transactionId: form.transactionId,
//       walletNumber: form.walletNumber,
//       agentNumber: selectedMethod.number,
//       proofImage: imageUrl,
//       promoCode: selectedPromoCode,
//     };

//     console.log(payload);
//     const promise = fetch(`/api/transaction/deposit/manual`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `${authToken}`,
//       },
//       body: JSON.stringify(payload),
//     })
//       .then(async (res) => {
//         if (!res.ok) throw new Error("Failed to deposit");

//         setTimeout(() => {
//           router.push("/dashboard/user");
//         }, 1000);

//         return res.json();
//       })
//       .finally(() => {
//         setSubmitting(false); // re-enable after success/error
//       });

//     toast.promise(promise, {
//       loading: "Submitting deposit...",
//       success: (data) => `Deposit successful: ${data?.message || "Success"}`,
//       error: (err) => `Error: ${err.message}`,
//     });
//   };

//   return (
//     <div className="w-full pt-5 pb-20 px-2 flex justify-start flex-col gap-5 bg-primary">
//       {submitting && (
//         <LoadingOverlay />
//       )}
//       {/* Wallet Selection */}
//       <div className="w-full bg-secondary rounded-2xl shadow-md p-8">
//         <h2 className="text-sm font-semibold mb-6 text-white">
//           Mobile Wallet Address
//         </h2>

//         <div className="grid grid-cols-3 gap-3 mb-5">
//           {walletOptions.map((wallet) => (
//             <div
//               key={wallet.method}
//               onClick={() => setSelectedMethod(wallet)}
//               className={`cursor-pointer p-2 rounded-lg text-center border ${selectedMethod.method === wallet.method
//                   ? "bg-accent border-accent text-white"
//                   : "bg-primary border-gray-600 text-white hover:border-accent"
//                 }`}
//             >
//               <Image
//                 src={wallet.logo}
//                 alt={wallet.method}
//                 width={50}
//                 height={50}
//                 className="mx-auto mb-2"
//               />
//               <span className="text-xs">{wallet.method}</span>
//             </div>
//           ))}
//         </div>

//         <div
//           onClick={() => {
//             navigator.clipboard.writeText(selectedMethod.number);
//             toast.success("Wallet number copied to clipboard!");
//           }}
//           className="cursor-pointer text-center my-4 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition select-none text-gray-800 font-semibold flex flex-wrap items-center justify-center"
//         >
//           <p>
//             <b className="text-red-500">Cashout</b> to the following number:
//           </p>
//           <span className="text-nowrap text-lg font-bold">
//             {selectedMethod.number}
//           </span>
//           <span className="ml-2 text-sm text-pink-500 hover:text-red-400 flex justify-center items-center gap-2">
//             Copy <Copy />
//           </span>
//         </div>
//       </div>

//       {/* Deposit Form */}
//       <div className="w-full bg-secondary rounded-2xl shadow-md p-2 sm:p-8">
//         <h2 className="text-sm font-semibold mb-6 text-white">
//           Deposit Details
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-5">
//           {[
//             {
//               label: "Amount",
//               name: "amount",
//               type: "number",
//               placeholder: "e.g. 50",
//             },
//             {
//               label: "Your Wallet Number (where you paid from)",
//               name: "walletNumber",
//               type: "text",
//               placeholder: "e.g. 017xxxxxxxx",
//             },
//             {
//               label: "Transaction ID",
//               name: "transactionId",
//               type: "text",
//               placeholder: "e.g. TXNREF123456",
//             },
//           ].map((field) => (
//             <div key={field.name}>
//               <label
//                 htmlFor={field.name}
//                 className="block mb-1 text-sm font-medium  text-accent"
//               >
//                 {field.label}
//               </label>
//               <input
//                 id={field.name}
//                 name={field.name}
//                 type={field.type}
//                 placeholder={field.placeholder}
//                 value={(form as any)[field.name]}
//                 onChange={handleChange}
//                 required
//                 className="w-full h-12 px-4 border border-white rounded-lg bg-primary text-textcolor placeholder-textcolor focus:outline-none focus:ring-2 focus:ring-accent transition"
//               />
//             </div>
//           ))}

//           {/* Upload Image */}
//           <div>
//             <label className="block mb-1 text-sm font-medium mb-2 text-white">
//               Upload Payment Image
//             </label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
//               className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
//             />
//             {selectedFile && (
//               <p className="text-sm mt-2 text-gray-600">
//                 Selected: {selectedFile.name}
//               </p>
//             )}
//           </div>

//           {/* Promo Selection */}
//           <div className="w-full mt-10 bg-gray-900 rounded-2xl px-2 py-6 sm:p-6 text-white">
//             <h3 className="text-lg font-bold mb-4">
//               ⚠️ Important Instructions
//             </h3>
//             <ul className="list-disc list-inside text-sm space-y-2 mb-6">
//               <li>You can chose one promotion once in a lifetime</li>
//               <li>Incorrect transaction IDs will delay approval.</li>
//               <li>Upload a clear screenshot of the payment confirmation.</li>
//             </ul>

//             <h4 className="text-base font-semibold text-yellow-400 mb-3">
//               🎁 Select a Promotion
//             </h4>
//             {checkPromo ? (
//               <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
//                 {PROMOTION_LIST.map((promo) => {
//                   const isActive = selectedPromoCode === promo.code;
//                   return (
//                     <label
//                       key={promo.code}
//                       // className={`relative cursor-pointer rounded-lg p-3 border text-xs transition ${
//                       //   isActive
//                       //     ? "border-accent ring-2 bg-accent ring-accent text-white"
//                       //     : " bg-gray-800 border-gray-700 hover:border-accent"
//                       // }`}
//                       className={`relative cursor-pointer rounded-lg p-3 border text-xs transition ${isActive
//                           ? "border-accent ring-2 bg-accent ring-accent text-white"
//                           : parseFloat(Number(form.amount).toFixed(2)) <
//                             promo.minDeposit && promo.code !== "NO_PROMO"
//                             ? "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed opacity-60"
//                             : "bg-gray-800 border-gray-700 hover:border-accent"
//                         }`}
//                     >
//                       {/* <input
//                       type="radio"
//                       name="promotion"
//                       value={promo.code}
//                       checked={isActive}
//                       onChange={() => setSelectedPromoCode(promo.code)}
//                       className="absolute hidden top-8 right-3 h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
//                     /> */}
//                       <input
//                         type="radio"
//                         name="promotion"
//                         value={promo.code}
//                         checked={isActive}
//                         onChange={() => {
//                           if (
//                             promo.code === "NO_PROMO" ||
//                             parseFloat(Number(form.amount).toFixed(2)) >=
//                             promo.minDeposit
//                           ) {
//                             setSelectedPromoCode(promo.code);
//                           } else {
//                             toast.error(
//                               `Minimum deposit for this promo is ${promo.minDeposit} TK.`
//                             );
//                           }
//                         }}
//                         disabled={
//                           promo.code !== "NO_PROMO" &&
//                           parseFloat(Number(form.amount).toFixed(2)) <
//                           promo.minDeposit
//                         }
//                         className="absolute hidden top-8 right-3 h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
//                       />

//                       <h5
//                         className={`font-bold text-accent mb-2 ${isActive ? "text-black" : "text-white"
//                           }`}
//                       >
//                         {promo.title}
//                       </h5>
//                       <p
//                         className={`font-medium mb-2 ${isActive ? "text-black" : "text-white"
//                           }`}
//                       >
//                         <span>Min Deposit:</span>{" "}
//                         {promo.minDeposit === 0
//                           ? "Any Amount"
//                           : promo.minDeposit + " TK"}
//                       </p>
//                       {promo.fixedBonus !== undefined ? (
//                         <p
//                           className={`font-medium mb-2 ${isActive ? "text-black" : "text-white"
//                             }`}
//                         >
//                           <span>Fixed Bonus:</span> {promo.fixedBonus} TK
//                         </p>
//                       ) : (
//                         <p
//                           className={`font-medium mb-2 ${isActive ? "text-black" : "text-white"
//                             }`}
//                         >
//                           <span>Bonus Rate:</span> {promo.bonusRate * 100}%
//                         </p>
//                       )}
//                       <p
//                         className={`font-medium mb-2 ${isActive ? "text-black" : "text-white"
//                           }`}
//                       >
//                         <span>Turnover:</span> {promo.turnoverX}x
//                       </p>
//                       <p
//                         className={`font-medium mb-2 ${isActive ? "text-black" : "text-white"
//                           }`}
//                       >
//                         <span>Eligible Games:</span>{" "}
//                         {promo.eligibleGames.join(", ")}
//                       </p>
//                       {promo.maxWithdrawLimit && (
//                         <p
//                           className={`font-medium mb-2 ${isActive ? "text-black" : "text-white"
//                             }`}
//                         >
//                           <span>Max Withdrawal:</span> {promo.maxWithdrawLimit}{" "}
//                           TK
//                         </p>
//                       )}
//                       <p
//                         className={`text-[12px] italic ${isActive ? "text-black" : "text-white"
//                           }`}
//                       >
//                         Type:{" "}
//                         {promo.usageType.charAt(0).toUpperCase() +
//                           promo.usageType.slice(1)}
//                       </p>
//                     </label>
//                   );
//                 })}
//               </div>
//             ) : (
//               <h3>You Already Have a Promotion</h3>
//             )}
//           </div>

//           <button
//             type="submit"
//             disabled={submitting}
//             className={`w-full h-12 mt-2 font-semibold rounded-full transition flex justify-between items-center text-sm px-4 ${submitting
//                 ? "bg-gray-500 cursor-not-allowed text-gray-300"
//                 : "bg-accent hover:bg-blue-700 text-cardbg"
//               }`}
//           >
//             <span>{submitting ? "Submitting..." : "Submit Deposit"}</span>
//             <div className="h-6 w-6 bg-primary rounded-full flex justify-center items-center">
//               <ArrowBigRight className="w-3 h-3 text-textcolor" />
//             </div>
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
