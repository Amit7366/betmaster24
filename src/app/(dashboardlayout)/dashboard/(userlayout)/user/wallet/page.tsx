"use client";

import { getUserInfo } from "@/services/actions/auth.services";
import { getFromLocalStorage } from "@/utils/local-storage";
import { ArrowRight, Copy, ShieldCheck, Wallet, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const walletNames = ["bkash", "nagad", "rocket"];

interface WalletType {
  _id: string;
  walletName: string;
  walletNumber: string;
  accountHolderName: string;
  isDefault: boolean;
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

export default function AddWalletPage() {
  const userInfo = getUserInfo();
  const authToken = getFromLocalStorage("accessToken");

  const [form, setForm] = useState({
    walletType: "ewallet",
    walletName: "bKash",
    accountHolderName: "",
    walletNumber: "",
    isDefault: true,
  });

  const [wallets, setWallets] = useState<WalletType[]>([]);

  const fetchWallets = async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`/api/wallets/user/${userInfo?.objectId}`, {
        headers: { Authorization: `${authToken}` },
        cache: "no-store",
        signal,
      });
      const result = await res.json();
      if (result.success !== false) {
        setWallets(result.data ?? result);
      } else {
        throw new Error(result.message || "Failed to load wallet list");
      }
    } catch (error) {
      if ((error as any)?.name === "AbortError") return;
      toast.error("Failed to load wallet list");
    }
  };

  useEffect(() => {
    if (!userInfo?.objectId || !authToken) return;
    const controller = new AbortController();
    fetchWallets(controller.signal);
    return () => controller.abort();
  }, [userInfo?.objectId, authToken]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      userId: userInfo?.objectId,
      ...form,
    };

    const promise = fetch(`/api/wallets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${authToken}`,
      },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Failed to add wallet");
      }
      await fetchWallets(); // refresh list on success
      return res.json();
    });

    toast.promise(promise, {
      loading: "Adding wallet...",
      success: "Wallet added successfully!",
      error: (err) => `Error: ${err.message}`,
    });
  };

  const defaultCount = useMemo(
    () => wallets.filter((w) => w.isDefault).length,
    [wallets]
  );

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-primary px-3 pb-24 pt-6">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Wallets
              </h1>
              <p className="mt-1 text-xs text-white/60">
                Add and manage your withdraw wallets securely.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
              <ShieldCheck className="h-4 w-4" />
              Protected details
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] text-white/55">Total wallets</p>
              <p className="mt-1 text-base font-bold text-white">
                {wallets.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] text-white/55">Default wallets</p>
              <p className="mt-1 text-base font-bold text-white">
                {defaultCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] text-white/55">Status</p>
              <p className="mt-1 text-base font-bold text-white">Ready</p>
            </div>
          </div>
        </div>

        {/* Add Wallet Form */}
        <div className="rounded-3xl border border-white/10 bg-secondary/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <SectionTitle
            icon={<Wallet className="h-5 w-5 text-white" />}
            title="Add New Wallet"
            subtitle="Use a correct number and name to avoid withdraw issues."
          />

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Wallet Name */}
            <div>
              <label className="mb-1 block text-xs font-medium text-white/70">
                Wallet Name
              </label>
              <div className="relative">
                <select
                  name="walletName"
                  value={form.walletName}
                  onChange={handleChange}
                  className={cn(
                    "h-12 w-full appearance-none rounded-2xl border bg-primary/40 px-4 pr-10 text-sm text-white outline-none transition",
                    "border-white/10 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                  )}
                >
                  {walletNames.map((wallet) => (
                    <option key={wallet} value={wallet}>
                      {wallet}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
                  ▾
                </div>
              </div>
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="mb-1 block text-xs font-medium text-white/70">
                Account Holder Name
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={form.accountHolderName}
                onChange={handleChange}
                required
                placeholder="e.g. Account holder name"
                className={cn(
                  "h-12 w-full rounded-2xl border bg-primary/40 px-4 text-sm text-white placeholder:text-white/35 outline-none transition",
                  "border-white/10 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                )}
              />
            </div>

            {/* Wallet Number */}
            <div>
              <label className="mb-1 block text-xs font-medium text-white/70">
                Wallet Number
              </label>
              <input
                type="text"
                name="walletNumber"
                value={form.walletNumber}
                onChange={handleChange}
                required
                placeholder="e.g. 017XXXXXXXX"
                className={cn(
                  "h-12 w-full rounded-2xl border bg-primary/40 px-4 text-sm text-white placeholder:text-white/35 outline-none transition",
                  "border-white/10 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                )}
              />
              <p className="mt-2 text-[11px] text-white/50">
                Tip: Use the same number you will withdraw to.
              </p>
            </div>

            {/* Default Toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Set as Default Wallet
                  </p>
                  <p className="mt-0.5 text-xs text-white/60">
                    Default wallet will be selected first on withdraw.
                  </p>
                </div>
              </div>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="h-5 w-5 accent-accent"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition flex items-center justify-between bg-accent text-cardbg hover:brightness-110 ring-1 ring-accent/30"
            >
              <span>Add Wallet</span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/40 ring-1 ring-white/10">
                <ArrowRight className="h-4 w-4 text-white" />
              </span>
            </button>
          </form>
        </div>

        {/* Wallets List */}
        <div className="rounded-3xl border border-white/10 bg-secondary/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <SectionTitle
            icon={<Wallet className="h-5 w-5 text-white" />}
            title="Your Wallets"
            subtitle="Tap copy to copy wallet number."
          />

          <div className="mt-5 space-y-3">
            {wallets.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <p className="text-sm font-semibold text-white">No wallets found</p>
                <p className="mt-1 text-xs text-white/60">
                  Add your first wallet using the form above.
                </p>
              </div>
            ) : (
              wallets.map((wallet) => (
                <div
                  key={wallet._id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.06] transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white capitalize">
                          {wallet.walletName}
                        </p>
                        {wallet.isDefault ? (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 ring-1 ring-emerald-400/20">
                            Default
                          </span>
                        ) : (
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">
                            Secondary
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-white/60">
                        Holder:{" "}
                        <span className="text-white/80">
                          {wallet.accountHolderName}
                        </span>
                      </p>

                      <p className="mt-1 text-xs text-white/60">
                        Number:{" "}
                        <span className="text-white/80">{wallet.walletNumber}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(wallet.walletNumber);
                        toast.success("Wallet number copied!");
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80 hover:bg-white/[0.08] transition"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { getUserInfo } from "@/services/actions/auth.services";
// import { getFromLocalStorage } from "@/utils/local-storage";
// import { ArrowBigRight } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";

// const walletNames = ["bkash", "nagad", "rocket"];

// interface Wallet {
//   _id: string;
//   walletName: string;
//   walletNumber: string;
//   accountHolderName: string;
//   isDefault: boolean;
// }

// export default function AddWalletPage() {
//   const router = useRouter();
//   const userInfo = getUserInfo();
//   const authToken = getFromLocalStorage("accessToken");

//   const [form, setForm] = useState({
//     walletType: "ewallet",
//     walletName: "bKash",
//     accountHolderName: "",
//     walletNumber: "",
//     isDefault: true,
//   });

//   const [wallets, setWallets] = useState<Wallet[]>([]);

//   const fetchWallets = async (signal?: AbortSignal) => {
//     try {
//       const res = await fetch(`/api/wallets/user/${userInfo?.objectId}`, {
//         headers: { Authorization: `${authToken}` },
//         cache: "no-store",
//         signal,
//       });
//       const result = await res.json();
//       if (result.success !== false) {
//         // many backends return { success, data }, some return just { data }
//         setWallets(result.data ?? result);
//       } else {
//         throw new Error(result.message || "Failed to load wallet list");
//       }
//     } catch (error) {
//       if ((error as any)?.name === "AbortError") return;
//       toast.error("Failed to load wallet list");
//     }
//   };

//   useEffect(() => {
//     if (!userInfo?.objectId || !authToken) return;
//     const controller = new AbortController();
//     fetchWallets(controller.signal);
//     return () => controller.abort();
//   }, [userInfo?.objectId, authToken]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const target = e.target as HTMLInputElement;
//     const { name, value, type } = target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? target.checked : value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const payload = {
//       userId: userInfo?.objectId,
//       ...form,
//     };

//     const promise = fetch(`/api/wallets`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `${authToken}`,
//       },
//       body: JSON.stringify(payload),
//     }).then(async (res) => {
//       if (!res.ok) {
//         const j = await res.json().catch(() => ({}));
//         throw new Error(j?.message || "Failed to add wallet");
//       }
//       await fetchWallets(); // refresh list on success
//       return res.json();
//     });

//     toast.promise(promise, {
//       loading: "Adding wallet...",
//       success: "Wallet added successfully!",
//       error: (err) => `Error: ${err.message}`,
//     });
//   };

//   return (
//     <div className="w-full pt-5 pb-12 px-2 flex flex-col gap-5 bg-primary">
//       {/* Add Wallet Form */}
//       <div className="w-full bg-secondary rounded-2xl shadow-md p-8">
//         <h2 className="text-sm font-semibold mb-6 text-white">
//           Add New Wallet
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* Wallet Name Dropdown */}
//           <div>
//             <label className="block mb-1 text-sm font-medium text-accent">
//               Wallet Name
//             </label>
//             <select
//               name="walletName"
//               value={form.walletName}
//               onChange={handleChange}
//               className="w-full h-12 px-4 border border-white rounded-lg bg-primary text-textcolor focus:outline-none focus:ring-2 focus:ring-accent transition"
//             >
//               {walletNames.map((wallet) => (
//                 <option key={wallet} value={wallet}>
//                   {wallet}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Account Holder Name */}
//           <div>
//             <label className="block mb-1 text-sm font-medium text-accent">
//               Account Holder Name
//             </label>
//             <input
//               type="text"
//               name="accountHolderName"
//               value={form.accountHolderName}
//               onChange={handleChange}
//               required
//               placeholder="e.g. Bank Account Holder Name"
//               className="w-full h-12 px-4 border border-white rounded-lg bg-primary text-textcolor focus:outline-none focus:ring-2 focus:ring-accent transition"
//             />
//           </div>

//           {/* Wallet Number */}
//           <div>
//             <label className="block mb-1 text-sm font-medium text-accent">
//               Wallet Number
//             </label>
//             <input
//               type="text"
//               name="walletNumber"
//               value={form.walletNumber}
//               onChange={handleChange}
//               required
//               placeholder="e.g. 017XXXXXXXX"
//               className="w-full h-12 px-4 border border-white rounded-lg bg-primary text-textcolor focus:outline-none focus:ring-2 focus:ring-accent transition"
//             />
//           </div>

//           {/* Is Default */}
//           <div className="flex items-center gap-3">
//             <input
//               type="checkbox"
//               name="isDefault"
//               checked={form.isDefault}
//               onChange={handleChange}
//               className="accent-accent"
//             />
//             <label className="text-sm font-medium text-white">
//               Set as Default Wallet
//             </label>
//           </div>

//           <button
//             type="submit"
//             className="w-full h-12 mt-2 bg-accent hover:bg-blue-700 text-cardbg font-semibold rounded-full transition flex justify-between items-center text-sm px-4"
//           >
//             <span>Add Wallet</span>
//             <div className="h-6 w-6 bg-primary rounded-full flex justify-center items-center">
//               <ArrowBigRight className="w-3 h-3 text-textcolor" />
//             </div>
//           </button>
//         </form>
//       </div>

//       {/* View Wallets */}
//       <div className="w-full bg-secondary rounded-2xl shadow-md p-8">
//         <h2 className="text-sm font-semibold mb-6 text-white">Your Wallets</h2>
//         <div className="space-y-4">
//           {wallets.length === 0 ? (
//             <p className="text-gray-400 text-sm">No wallets found.</p>
//           ) : (
//             wallets.map((wallet) => (
//               <div
//                 key={wallet._id}
//                 className="border border-gray-600 rounded-lg p-4 text-white bg-primary"
//               >
//                 <p className="text-sm">
//                   <strong>Wallet:</strong> {wallet.walletName}
//                 </p>
//                 <p className="text-sm">
//                   <strong>Number:</strong> {wallet.walletNumber}
//                 </p>
//                 <p className="text-sm">
//                   <strong>Holder:</strong> {wallet.accountHolderName}
//                 </p>
//                 <p className="text-sm">
//                   <strong>Status:</strong>{" "}
//                   {wallet.isDefault ? (
//                     <span className="text-green-400">Default</span>
//                   ) : (
//                     "Secondary"
//                   )}
//                 </p>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
