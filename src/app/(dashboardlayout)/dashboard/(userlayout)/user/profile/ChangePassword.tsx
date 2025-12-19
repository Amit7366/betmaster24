"use client";

import { useState } from "react";
import { getFromLocalStorage } from "@/utils/local-storage";
import { toast } from "sonner";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";

const ChangePassword = () => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const token = getFromLocalStorage("accessToken");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

const changePassword = async () => {
  const res = await fetch(`/api/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`, // or `Bearer ${token}`
    },
    body: JSON.stringify({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    }),
    cache: "no-store",
  });

  const errData = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(errData?.message || "Password change failed.");
  }
  return errData;
};


    await toast.promise(changePassword(), {
      loading: "Updating password...",
      success: () => "✅ Password changed successfully!",
      error: (err) => err.message || "❌ Password change failed.",
    });

    setForm({ oldPassword: "", newPassword: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-secondary hover:bg-cardbg rounded-lg p-6 shadow"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Change Password</h2>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-accent mb-1">
            Old Password
          </label>
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowOld((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-textcolor"
            >
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-accent mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-textcolor"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full h-12 mt-2 bg-accent hover:bg-blue-700 text-cardbg font-semibold rounded-full transition flex justify-between items-center text-sm px-4"
      >
        <span>Change Password</span>
        <div className="h-6 w-6 bg-primary rounded-full flex justify-center items-center">
          <CheckCircle className="w-3 h-3 text-textcolor" />
        </div>
      </button>
    </form>
  );
};

export default ChangePassword;
