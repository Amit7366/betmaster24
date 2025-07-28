"use client";

import { PROMOTION_LIST } from "@/constants/promotions";
import { getUserInfo } from "@/services/actions/auth.services";
import { getFromLocalStorage } from "@/utils/local-storage";
import { ArrowBigRight, Copy } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const walletOptions = [
  {
    method: "bKash",
    number: "017XXXXXXXX",
    logo: "/bkash-logo.jpg",
  },
  {
    method: "Nagad",
    number: "018XXXXXXXX",
    logo: "/nagad-logo.png",
  },
  {
    method: "Rocket",
    number: "019XXXXXXXX",
    logo: "/rocket-logo.jpeg",
  },
];

export default function DepositPage() {
  const router = useRouter();
  const userInfo = getUserInfo();
  const authToken = getFromLocalStorage("accessToken");
  const [selectedMethod, setSelectedMethod] = useState(walletOptions[0]);

  const [form, setForm] = useState({
    userId: "",
    amount: "",
    transactionId: "",
    proofImage: "",
    walletNumber: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transferInfo, setTransferInfo] = useState<{
    walletAddress: string;
    image: string;
  } | null>(null);

  const [selectedPromoCode, setSelectedPromoCode] = useState("NO_PROMO");

  useEffect(() => {
    const fetchTransfer = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/qr-transfer/my-transfers`,
          {
            headers: {
              Authorization: `${authToken}`,
            },
          }
        );
        const result = await res.json();
        if (result.success) {
          setTransferInfo({
            walletAddress: result.data.walletAddress,
            image: result.data.image,
          });
        }
      } catch (err) {
        console.error("Failed to load QR transfer info", err);
        toast.error("Failed to fetch wallet info.");
      }
    };

    if (authToken) fetchTransfer();
  }, [authToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = "";

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", "clicktoearn");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dsekhxz2h/image/upload",
          {
            method: "POST",
            body: formData,
          }
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
        return;
      }
    }

    const payload = {
      userId: userInfo.objectId,
      id: `sbm${Date.now()}`, // optional: dynamic ID
      transactionType: "deposit",
      paymentMethod: selectedMethod.method.toLowerCase(),
      status: "pending",
      amount: parseFloat(form.amount),
      transactionId: form.transactionId,
      walletNumber: form.walletNumber,
      agentNumber: selectedMethod.number,
      proofImage: imageUrl,
      promoCode: selectedPromoCode,
    };

    const promise = fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transaction/deposit/manual`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
        body: JSON.stringify(payload),
      }
    ).then(async (res) => {
      if (!res.ok) throw new Error("Failed to deposit");

      setTimeout(() => {
        router.push("/dashboard/user");
      }, 1000);

      return res.json();
    });

    toast.promise(promise, {
      loading: "Submitting deposit...",
      success: (data) => `Deposit successful: ${data?.message || "Success"}`,
      error: (err) => `Error: ${err.message}`,
    });
  };

  return (
    <div className="w-full pt-5 pb-12 px-2 flex justify-start flex-col gap-5 bg-primary">
      {/* Wallet Selection */}
      <div className="w-full bg-secondary rounded-2xl shadow-md p-8">
        <h2 className="text-sm font-semibold mb-6 text-white">
          Mobile Wallet Address
        </h2>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {walletOptions.map((wallet) => (
            <div
              key={wallet.method}
              onClick={() => setSelectedMethod(wallet)}
              className={`cursor-pointer p-2 rounded-lg text-center border ${
                selectedMethod.method === wallet.method
                  ? "bg-accent border-accent text-white"
                  : "bg-primary border-gray-600 text-white hover:border-accent"
              }`}
            >
              <Image
                src={wallet.logo}
                alt={wallet.method}
                width={50}
                height={50}
                className="mx-auto mb-2"
              />
              <span className="text-xs">{wallet.method}</span>
            </div>
          ))}
        </div>

        <div
          onClick={() => {
            navigator.clipboard.writeText(selectedMethod.number);
            toast.success("Wallet number copied to clipboard!");
          }}
          className="cursor-pointer text-center my-4 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition select-none text-gray-800 font-semibold flex flex-wrap items-center justify-center"
        >
          <p>Cashout to the following number:</p>
          <span className="text-nowrap text-xs">{selectedMethod.number}</span>
          <span className="ml-2 text-sm text-gray-500 hover:text-red-400">
            <Copy />
          </span>
        </div>
      </div>

      {/* Deposit Form */}
      <div className="w-full bg-secondary rounded-2xl shadow-md p-2 sm:p-8">
        <h2 className="text-sm font-semibold mb-6 text-white">
          Deposit Details
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            {
              label: "Amount",
              name: "amount",
              type: "number",
              placeholder: "e.g. 50",
            },
            {
              label: "Your Wallet Number (where you paid from)",
              name: "walletNumber",
              type: "text",
              placeholder: "e.g. 017xxxxxxxx",
            },
            {
              label: "Transaction ID",
              name: "transactionId",
              type: "text",
              placeholder: "e.g. TXNREF123456",
            },
          ].map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block mb-1 text-sm font-medium mb-2 text-accent"
              >
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={(form as any)[field.name]}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 border border-white rounded-lg bg-primary text-textcolor placeholder-textcolor focus:outline-none focus:ring-2 focus:ring-accent transition"
              />
            </div>
          ))}

          {/* Upload Image */}
          <div>
            <label className="block mb-1 text-sm font-medium mb-2 text-white">
              Upload Payment Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {selectedFile && (
              <p className="text-sm mt-2 text-gray-600">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Promo Selection */}
          <div className="w-full mt-10 bg-gray-900 rounded-2xl px-2 py-6 sm:p-6 text-white">
            <h3 className="text-lg font-bold mb-4">
              ⚠️ Important Instructions
            </h3>
            <ul className="list-disc list-inside text-sm space-y-2 mb-6">
              <li>You can chose one promotion once in a lifetime</li>
              <li>Incorrect transaction IDs will delay approval.</li>
              <li>Upload a clear screenshot of the payment confirmation.</li>
            </ul>

            <h4 className="text-base font-semibold text-yellow-400 mb-3">
              🎁 Select a Promotion
            </h4>
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
              {PROMOTION_LIST.map((promo) => {
                const isActive = selectedPromoCode === promo.code;
                return (
                  <label
                    key={promo.code}
                    className={`relative cursor-pointer rounded-lg p-3 border text-xs transition ${
                      isActive
                        ? "border-accent ring-2 bg-accent ring-accent text-white"
                        : " bg-gray-800 border-gray-700 hover:border-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="promotion"
                      value={promo.code}
                      checked={isActive}
                      onChange={() => setSelectedPromoCode(promo.code)}
                      className="absolute hidden top-8 right-3 h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                    />
                    <h5
                      className={`font-bold text-accent mb-2 ${
                        isActive ? "text-black" : "text-white"
                      }`}
                    >
                      {promo.title}
                    </h5>
                    <p
                      className={`font-medium mb-2 ${
                        isActive ? "text-black" : "text-white"
                      }`}
                    >
                      <span>Min Deposit:</span> {promo.minDeposit} TK
                    </p>
                    {promo.fixedBonus !== undefined ? (
                      <p
                        className={`font-medium mb-2 ${
                          isActive ? "text-black" : "text-white"
                        }`}
                      >
                        <span>Fixed Bonus:</span> {promo.fixedBonus} TK
                      </p>
                    ) : (
                      <p
                        className={`font-medium mb-2 ${
                          isActive ? "text-black" : "text-white"
                        }`}
                      >
                        <span>Bonus Rate:</span> {promo.bonusRate * 100}%
                      </p>
                    )}
                    <p
                      className={`font-medium mb-2 ${
                        isActive ? "text-black" : "text-white"
                      }`}
                    >
                      <span>Turnover:</span> {promo.turnoverX}x
                    </p>
                    <p
                      className={`font-medium mb-2 ${
                        isActive ? "text-black" : "text-white"
                      }`}
                    >
                      <span>Eligible Games:</span>{" "}
                      {promo.eligibleGames.join(", ")}
                    </p>
                    {promo.maxWithdrawLimit && (
                      <p
                        className={`font-medium mb-2 ${
                          isActive ? "text-black" : "text-white"
                        }`}
                      >
                        <span>Max Withdrawal:</span> {promo.maxWithdrawLimit} TK
                      </p>
                    )}
                    <p
                      className={`text-[12px] italic ${
                        isActive ? "text-black" : "text-white"
                      }`}
                    >
                      Type:{" "}
                      {promo.usageType.charAt(0).toUpperCase() +
                        promo.usageType.slice(1)}
                    </p>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-2 bg-accent hover:bg-blue-700 text-cardbg font-semibold rounded-full transition flex justify-between items-center text-sm px-4"
          >
            <span>Submit Deposit</span>
            <div className="h-6 w-6 bg-primary rounded-full flex justify-center items-center">
              <ArrowBigRight className="w-3 h-3 text-textcolor" />
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
