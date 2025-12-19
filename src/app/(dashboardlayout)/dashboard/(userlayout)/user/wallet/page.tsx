"use client";

import { getUserInfo } from "@/services/actions/auth.services";
import { getFromLocalStorage } from "@/utils/local-storage";
import { ArrowBigRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const walletNames = ["bkash", "nagad", "rocket"];

interface Wallet {
  _id: string;
  walletName: string;
  walletNumber: string;
  accountHolderName: string;
  isDefault: boolean;
}

export default function AddWalletPage() {
  const router = useRouter();
  const userInfo = getUserInfo();
  const authToken = getFromLocalStorage("accessToken");

  const [form, setForm] = useState({
    walletType: "ewallet",
    walletName: "bKash",
    accountHolderName: "",
    walletNumber: "",
    isDefault: true,
  });

  const [wallets, setWallets] = useState<Wallet[]>([]);

  const fetchWallets = async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`/api/wallets/user/${userInfo?.objectId}`, {
        headers: { Authorization: `${authToken}` },
        cache: "no-store",
        signal,
      });
      const result = await res.json();
      if (result.success !== false) {
        // many backends return { success, data }, some return just { data }
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

  return (
    <div className="w-full pt-5 pb-12 px-2 flex flex-col gap-5 bg-primary">
      {/* Add Wallet Form */}
      <div className="w-full bg-secondary rounded-2xl shadow-md p-8">
        <h2 className="text-sm font-semibold mb-6 text-white">
          Add New Wallet
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Wallet Name Dropdown */}
          <div>
            <label className="block mb-1 text-sm font-medium text-accent">
              Wallet Name
            </label>
            <select
              name="walletName"
              value={form.walletName}
              onChange={handleChange}
              className="w-full h-12 px-4 border border-white rounded-lg bg-primary text-textcolor focus:outline-none focus:ring-2 focus:ring-accent transition"
            >
              {walletNames.map((wallet) => (
                <option key={wallet} value={wallet}>
                  {wallet}
                </option>
              ))}
            </select>
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-accent">
              Account Holder Name
            </label>
            <input
              type="text"
              name="accountHolderName"
              value={form.accountHolderName}
              onChange={handleChange}
              required
              placeholder="e.g. Bank Account Holder Name"
              className="w-full h-12 px-4 border border-white rounded-lg bg-primary text-textcolor focus:outline-none focus:ring-2 focus:ring-accent transition"
            />
          </div>

          {/* Wallet Number */}
          <div>
            <label className="block mb-1 text-sm font-medium text-accent">
              Wallet Number
            </label>
            <input
              type="text"
              name="walletNumber"
              value={form.walletNumber}
              onChange={handleChange}
              required
              placeholder="e.g. 017XXXXXXXX"
              className="w-full h-12 px-4 border border-white rounded-lg bg-primary text-textcolor focus:outline-none focus:ring-2 focus:ring-accent transition"
            />
          </div>

          {/* Is Default */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleChange}
              className="accent-accent"
            />
            <label className="text-sm font-medium text-white">
              Set as Default Wallet
            </label>
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-2 bg-accent hover:bg-blue-700 text-cardbg font-semibold rounded-full transition flex justify-between items-center text-sm px-4"
          >
            <span>Add Wallet</span>
            <div className="h-6 w-6 bg-primary rounded-full flex justify-center items-center">
              <ArrowBigRight className="w-3 h-3 text-textcolor" />
            </div>
          </button>
        </form>
      </div>

      {/* View Wallets */}
      <div className="w-full bg-secondary rounded-2xl shadow-md p-8">
        <h2 className="text-sm font-semibold mb-6 text-white">Your Wallets</h2>
        <div className="space-y-4">
          {wallets.length === 0 ? (
            <p className="text-gray-400 text-sm">No wallets found.</p>
          ) : (
            wallets.map((wallet) => (
              <div
                key={wallet._id}
                className="border border-gray-600 rounded-lg p-4 text-white bg-primary"
              >
                <p className="text-sm">
                  <strong>Wallet:</strong> {wallet.walletName}
                </p>
                <p className="text-sm">
                  <strong>Number:</strong> {wallet.walletNumber}
                </p>
                <p className="text-sm">
                  <strong>Holder:</strong> {wallet.accountHolderName}
                </p>
                <p className="text-sm">
                  <strong>Status:</strong>{" "}
                  {wallet.isDefault ? (
                    <span className="text-green-400">Default</span>
                  ) : (
                    "Secondary"
                  )}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
