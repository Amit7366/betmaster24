"use client";

import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
import { getUserInfo } from "@/services/actions/auth.services";
import { getFromLocalStorage } from "@/utils/local-storage";
import { ArrowRight, ShieldCheck, Wallet, CreditCard, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { balanceApi } from "@/redux/api/balanceApi";

interface WalletType {
  _id: string;
  walletName: string;
  walletNumber: string;
  accountHolderName: string;
}

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
        {subtitle ? <p className="mt-1 text-xs text-white/60">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] text-white/55">{label}</p>
      <p className="mt-1 text-base font-bold text-white">{value}</p>
    </div>
  );
}

const WithdrawPage = () => {
  const router = useRouter();
  const userInfo = getUserInfo();
  const authToken = getFromLocalStorage("accessToken");
  const objectId = userInfo?.objectId;
  const dispatch = useDispatch();

  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");

  const [walletNumber, setWalletNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  const [amount, setAmount] = useState<number | string>("");
  const [submitting, setSubmitting] = useState(false);

  const { data: userBalance, isLoading, isError } = useGetUserBalanceQuery(objectId, {
    skip: !objectId,
  });

  useEffect(() => {
    if (!objectId || !authToken) return;

    const controller = new AbortController();

    const fetchWallets = async () => {
      try {
        const res = await fetch(`/api/wallets/user/${objectId}`, {
          headers: { Authorization: `${authToken}` },
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await res.json();
        if (result.success !== false) {
          setWallets(result.data ?? result);
        } else {
          throw new Error(result.message || "Failed to fetch wallets");
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error(err);
          toast.error("Could not load wallets");
        }
      }
    };

    fetchWallets();
    return () => controller.abort();
  }, [objectId, authToken]);

  // Auto-fill wallet details on selection
  useEffect(() => {
    const selected = wallets.find((w) => w._id === selectedWalletId);
    if (selected) {
      setWalletNumber(selected.walletNumber);
      setAccountHolderName(selected.accountHolderName);
    } else {
      setWalletNumber("");
      setAccountHolderName("");
    }
  }, [selectedWalletId, wallets]);

  const currentBalance = userBalance?.data?.currentBalance ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const balance = currentBalance ?? 0;
    if (balance < 10) {
      toast.error("Withdraw not available: Minimum $10 balance required.");
      return;
    }

    const payload = {
      userId: userInfo.objectId,
      id: userInfo.id,
      amount: amount,
      paymentMethod:
        wallets.find((w) => w._id === selectedWalletId)?.walletName.toLowerCase() || "",
      walletNumber,
      transactionId: "sbm",
      accountHolderName,
    };

    const promise = fetch(`/api/transaction/withdraw/manual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${authToken}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.message || "Failed to withdraw");
        }

        dispatch(
          balanceApi.util.invalidateTags([{ type: "UserBalance", id: objectId }])
        );

        setTimeout(() => router.push("/dashboard/user"), 1000);
        return res.json();
      })
      .finally(() => {
        setSubmitting(false);
      });

    toast.promise(promise, {
      loading: "Submitting Withdraw...",
      success: (data) => `Withdraw successful: ${data?.message || "Success"}`,
      error: (err) => `Error: ${err.message}`,
    });
  };

  const chargeRate = 0.0;
  const charge = typeof amount === "number" ? amount * chargeRate : 0;
  const receivable = typeof amount === "number" ? amount - charge : 0;

  const selectedWallet = useMemo(
    () => wallets.find((w) => w._id === selectedWalletId),
    [wallets, selectedWalletId]
  );

  const isDisabled = currentBalance < 10;

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-primary px-3 pb-24 pt-6">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Withdraw
              </h1>
              <p className="mt-1 text-xs text-white/60">
                Select a wallet and submit withdrawal request for manual approval.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
              <ShieldCheck className="h-4 w-4" />
              Secure manual verification
            </div>
          </div>

          {/* Balance stats */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Current Balance"
              value={isLoading ? "Loading..." : `${Number(currentBalance).toFixed(2)} BDT`}
            />
            <StatCard label="Fee" value={`${(chargeRate * 100).toFixed(0)}%`} />
            <StatCard label="Status" value={isDisabled ? "Not eligible" : "Eligible"} />
          </div>

          {/* Warning banner (UI only) */}
          {isDisabled ? (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-yellow-300/20 bg-yellow-400/10 p-3 text-xs text-yellow-200">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <div>
                <p className="font-semibold">Withdraw not available</p>
                <p className="mt-0.5 text-yellow-100/80">
                  Minimum balance required is 10 (as your current rule).
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-1">
          {/* Form */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-secondary/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
            <SectionTitle
              icon={<Wallet className="h-5 w-5 text-white" />}
              title="Withdraw Details"
              subtitle="Choose wallet and enter amount."
            />

            {/* Wallet Select */}
            <div className="mt-5">
              <label className="mb-1 block text-xs font-medium text-white/70">
                Select Wallet
              </label>
              <div className="relative">
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className={cn(
                    "h-12 w-full appearance-none rounded-2xl border bg-primary/40 px-4 pr-10 text-sm text-white outline-none transition",
                    "border-white/10 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                  )}
                  required
                >
                  <option value="">-- Select Wallet --</option>
                  {wallets.map((wallet) => (
                    <option key={wallet._id} value={wallet._id}>
                      {wallet.walletName} - {wallet.walletNumber}
                    </option>
                  ))}
                </select>

                {/* chevron */}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
                  ▾
                </div>
              </div>

              {/* Selected wallet chip (UI only) */}
              {selectedWallet ? (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] text-white/80">
                  <CreditCard className="h-3.5 w-3.5" />
                  {selectedWallet.walletName} • {selectedWallet.walletNumber}
                </div>
              ) : null}
            </div>

            {/* Amount */}
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-white/70">
                Amount
              </label>

              <div className="relative">
                <input
                  name="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className={cn(
                    "h-12 w-full rounded-2xl border bg-primary/40 px-4 pr-16 text-sm text-white placeholder:text-white/35 outline-none transition",
                    "border-white/10 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/70 ring-1 ring-white/10">
                  BDT
                </span>
              </div>

              <p className="mt-2 text-[11px] text-white/50">
                ⓘ Limit : 0 ~ 0 BDT
              </p>
            </div>

            {/* Wallet Number (read-only) */}
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-white/70">
                Wallet Number
              </label>
              <input
                value={walletNumber}
                readOnly
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white/80"
              />
            </div>

            {/* Account Holder Name (read-only) */}
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-white/70">
                Account Holder Name
              </label>
              <input
                value={accountHolderName}
                readOnly
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white/80"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-3xl border border-white/10 bg-secondary/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
            <SectionTitle
              icon={<ShieldCheck className="h-5 w-5 text-white" />}
              title="Summary"
              subtitle="Review before submitting."
            />

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-primary/35 p-4">
                <p className="text-xs text-white/55">Receivable</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {Number.isFinite(receivable) ? receivable.toFixed(2) : "0.00"} BDT
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-primary/35 p-4">
                <p className="text-xs text-white/55">Charge</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {Number.isFinite(charge) ? charge.toFixed(2) : "0.00"} BDT
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
                Tip: Make sure your wallet details are correct. Withdraw requests are
                manually verified.
              </div>
            </div>

            <button
              type="submit"
              disabled={isDisabled || submitting}
              className={cn(
                "mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
                "flex items-center justify-between",
                isDisabled || submitting
                  ? "cursor-not-allowed bg-white/10 text-white/50 ring-1 ring-white/10"
                  : "bg-accent text-cardbg hover:brightness-110 ring-1 ring-accent/30"
              )}
            >
              <span>{submitting ? "Submitting..." : "Submit Withdraw"}</span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/40 ring-1 ring-white/10">
                <ArrowRight className="h-4 w-4 text-white" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawPage;

// "use client";

// import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
// import { getUserInfo } from "@/services/actions/auth.services";
// import { getFromLocalStorage } from "@/utils/local-storage";
// import { ArrowBigRight } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import { toast } from "sonner";
// import { balanceApi } from "@/redux/api/balanceApi";

// interface Wallet {
//   _id: string;
//   walletName: string;
//   walletNumber: string;
//   accountHolderName: string;
// }

// const WithdrawPage = () => {
//   const router = useRouter();
//   const userInfo = getUserInfo();
//   const authToken = getFromLocalStorage("accessToken");
//   const objectId = userInfo?.objectId;
//   const dispatch = useDispatch();
//   const [wallets, setWallets] = useState<Wallet[]>([]);
//   const [selectedWalletId, setSelectedWalletId] = useState<string>("");
//   const [walletNumber, setWalletNumber] = useState("");
//   const [accountHolderName, setAccountHolderName] = useState("");
//   const [amount, setAmount] = useState<number | string>("");
//   const [submitting, setSubmitting] = useState(false);

//   const {
//     data: userBalance,
//     isLoading,
//     isError,
//   } = useGetUserBalanceQuery(objectId, {
//     skip: !objectId,
//   });
//   useEffect(() => {
//     if (!objectId || !authToken) return;

//     const controller = new AbortController();

//     const fetchWallets = async () => {
//       try {
//         const res = await fetch(`/api/wallets/user/${objectId}`, {
//           headers: { Authorization: `${authToken}` },
//           cache: "no-store",
//           signal: controller.signal,
//         });
//         const result = await res.json();
//         if (result.success !== false) {
//           setWallets(result.data ?? result);
//         } else {
//           throw new Error(result.message || "Failed to fetch wallets");
//         }
//       } catch (err: any) {
//         if (err?.name !== "AbortError") {
//           console.error(err);
//           toast.error("Could not load wallets");
//         }
//       }
//     };

//     fetchWallets();
//     return () => controller.abort();
//   }, [objectId, authToken]);

//   // Auto-fill wallet details on selection
//   useEffect(() => {
//     const selected = wallets.find((w) => w._id === selectedWalletId);
//     if (selected) {
//       setWalletNumber(selected.walletNumber);
//       setAccountHolderName(selected.accountHolderName);
//     } else {
//       setWalletNumber("");
//       setAccountHolderName("");
//     }
//   }, [selectedWalletId, wallets]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true); // disable button
//     const balance = userBalance?.data?.currentBalance ?? 0;
//     if (balance < 10) {
//       toast.error("Withdraw not available: Minimum $10 balance required.");
//       return;
//     }

//     const payload = {
//       userId: userInfo.objectId,
//       id: userInfo.id,
//       amount: amount,
//       paymentMethod:
//         wallets
//           .find((w) => w._id === selectedWalletId)
//           ?.walletName.toLowerCase() || "",
//       walletNumber,
//       transactionId: "sbm",
//       accountHolderName,
//     };

//     const promise = fetch(`/api/transaction/withdraw/manual`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `${authToken}`, // or Bearer format
//       },
//       body: JSON.stringify(payload),
//     }).then(async (res) => {
//       if (!res.ok) {
//         const j = await res.json().catch(() => ({}));
//         throw new Error(j?.message || "Failed to withdraw");
//       }
//       dispatch(
//         balanceApi.util.invalidateTags([{ type: "UserBalance", id: objectId }])
//       );
//       setTimeout(() => router.push("/dashboard/user"), 1000);

//       return res.json();
//     }).finally(() => {
//       setSubmitting(false); // re-enable after success/error
//     });

//     toast.promise(promise, {
//       loading: "Submitting Withdraw...",
//       success: (data) => `Withdraw successful: ${data?.message || "Success"}`,
//       error: (err) => `Error: ${err.message}`,
//     });
//   };

//   const chargeRate = 0.0;
//   const charge = typeof amount === "number" ? amount * chargeRate : 0;
//   const receivable = typeof amount === "number" ? amount - charge : 0;

//   return (
//     <div className="min-h-screen bg-primary p-4 md:p-10">
//       <form
//         onSubmit={handleSubmit}
//         className="max-w-5xl mx-auto grid grid-cols-1 gap-6"
//       >
//         {/* Withdraw Form */}
//         <div className="bg-secondary shadow rounded-lg p-6">
//           <h2 className="text-lg font-semibold text-white border-b pb-2 mb-4 flex items-center gap-2">
//             <span>💸</span> Withdraw Money
//           </h2>

//           {/* Wallet Select */}
//           <div className="mb-4">
//             <label className="block text-sm text-accent mb-1">
//               Select Wallet
//             </label>
//             <select
//               value={selectedWalletId}
//               onChange={(e) => setSelectedWalletId(e.target.value)}
//               className="w-full border border-gray-200 rounded px-4 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             >
//               <option value="">-- Select Wallet --</option>
//               {wallets.map((wallet) => (
//                 <option key={wallet._id} value={wallet._id}>
//                   {wallet.walletName} - {wallet.walletNumber}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Amount */}
//           <div className="mb-2">
//             <label className="block text-sm text-accent mb-1">Amount</label>
//             <div className="flex rounded overflow-hidden border border-gray-200">
//               <input
//                 name="amount"
//                 type="number"
//                 placeholder="0.00"
//                 value={amount}
//                 onChange={(e) => setAmount(parseFloat(e.target.value))}
//                 className="w-full px-4 py-2 focus:outline-none bg-primary text-white"
//               />
//               <span className="bg-gray-100 px-4 py-2 text-sm text-gray-600">
//                 BDT
//               </span>
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">
//             <span className="text-gray-400">ⓘ</span> Limit : 0 ~ 0 BDT
//           </p>

//           {/* Wallet Number (read-only) */}
//           <div className="mb-2">
//             <label className="block text-sm text-accent mb-1">
//               Wallet Number
//             </label>
//             <input
//               value={walletNumber}
//               readOnly
//               className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded text-gray-600"
//             />
//           </div>

//           {/* Account Holder Name (read-only) */}
//           <div>
//             <label className="block text-sm text-accent mb-1">
//               Account Holder Name
//             </label>
//             <input
//               value={accountHolderName}
//               readOnly
//               className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded text-gray-600"
//             />
//           </div>
//         </div>

//         {/* Summary */}
//         <div className="bg-secondary shadow rounded-lg p-6 relative">
//           <h2 className="text-lg font-semibold text-accent border-b pb-2 mb-4 flex items-center gap-2">
//             <span>📄</span> Summary
//           </h2>

//           <div className="bg-navbg p-4 rounded text-sm text-textcolor mb-4">
//             <div className="flex justify-between font-semibold">
//               <span>Receivable</span>
//               <span>{receivable.toFixed(2)} BDT</span>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={(userBalance?.data?.currentBalance ?? 0) < 10}
//             className="w-full h-12 mt-2 bg-accent hover:bg-blue-700 text-cardbg font-semibold rounded-full transition flex justify-between items-center text-sm px-4"
//           >
//             <span>Submit Withdraw</span>
//             <div className="h-6 w-6 bg-primary rounded-full flex justify-center items-center">
//               <ArrowBigRight className="w-3 h-3 text-textcolor" />
//             </div>
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default WithdrawPage;
