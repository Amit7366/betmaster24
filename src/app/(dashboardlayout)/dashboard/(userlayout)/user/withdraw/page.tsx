"use client";

import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
import { getUserInfo } from "@/services/actions/auth.services";
import { getFromLocalStorage } from "@/utils/local-storage";
import { ArrowBigRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { balanceApi } from "@/redux/api/balanceApi";

interface Wallet {
  _id: string;
  walletName: string;
  walletNumber: string;
  accountHolderName: string;
}

const WithdrawPage = () => {
  const router = useRouter();
  const userInfo = getUserInfo();
  const authToken = getFromLocalStorage("accessToken");
  const objectId = userInfo?.objectId;
  const dispatch = useDispatch();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [walletNumber, setWalletNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const [submitting, setSubmitting] = useState(false);

  const {
    data: userBalance,
    isLoading,
    isError,
  } = useGetUserBalanceQuery(objectId, {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); // disable button
    const balance = userBalance?.data?.currentBalance ?? 0;
    if (balance < 10) {
      toast.error("Withdraw not available: Minimum $10 balance required.");
      return;
    }

    const payload = {
      userId: userInfo.objectId,
      id: userInfo.id,
      amount: amount,
      paymentMethod:
        wallets
          .find((w) => w._id === selectedWalletId)
          ?.walletName.toLowerCase() || "",
      walletNumber,
      transactionId: "sbm",
      accountHolderName,
    };

    const promise = fetch(`/api/transaction/withdraw/manual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${authToken}`, // or Bearer format
      },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Failed to withdraw");
      }
      dispatch(
        balanceApi.util.invalidateTags([{ type: "UserBalance", id: objectId }])
      );
      setTimeout(() => router.push("/dashboard/user"), 1000);

      return res.json();
    }).finally(() => {
      setSubmitting(false); // re-enable after success/error
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

  return (
    <div className="min-h-screen bg-primary p-4 md:p-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto grid grid-cols-1 gap-6"
      >
        {/* Withdraw Form */}
        <div className="bg-secondary shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white border-b pb-2 mb-4 flex items-center gap-2">
            <span>💸</span> Withdraw Money
          </h2>

          {/* Wallet Select */}
          <div className="mb-4">
            <label className="block text-sm text-accent mb-1">
              Select Wallet
            </label>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="w-full border border-gray-200 rounded px-4 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select Wallet --</option>
              {wallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.walletName} - {wallet.walletNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="mb-2">
            <label className="block text-sm text-accent mb-1">Amount</label>
            <div className="flex rounded overflow-hidden border border-gray-200">
              <input
                name="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="w-full px-4 py-2 focus:outline-none bg-primary text-white"
              />
              <span className="bg-gray-100 px-4 py-2 text-sm text-gray-600">
                USD
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            <span className="text-gray-400">ⓘ</span> Limit : 0 ~ 0 USD
          </p>

          {/* Wallet Number (read-only) */}
          <div className="mb-2">
            <label className="block text-sm text-accent mb-1">
              Wallet Number
            </label>
            <input
              value={walletNumber}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded text-gray-600"
            />
          </div>

          {/* Account Holder Name (read-only) */}
          <div>
            <label className="block text-sm text-accent mb-1">
              Account Holder Name
            </label>
            <input
              value={accountHolderName}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded text-gray-600"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-secondary shadow rounded-lg p-6 relative">
          <h2 className="text-lg font-semibold text-accent border-b pb-2 mb-4 flex items-center gap-2">
            <span>📄</span> Summary
          </h2>

          <div className="bg-navbg p-4 rounded text-sm text-textcolor mb-4">
            <div className="flex justify-between font-semibold">
              <span>Receivable</span>
              <span>{receivable.toFixed(2)} USD</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={(userBalance?.data?.currentBalance ?? 0) < 10}
            className="w-full h-12 mt-2 bg-accent hover:bg-blue-700 text-cardbg font-semibold rounded-full transition flex justify-between items-center text-sm px-4"
          >
            <span>Submit Withdraw</span>
            <div className="h-6 w-6 bg-primary rounded-full flex justify-center items-center">
              <ArrowBigRight className="w-3 h-3 text-textcolor" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default WithdrawPage;
