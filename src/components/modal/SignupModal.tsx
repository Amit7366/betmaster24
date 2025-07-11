"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User, Phone, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function SignupModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
    referral: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      password: form.password || "Timetraveller0388@",
      normalUser: {
        name: form.name || "refBy" + Math.random().toString(36).substring(2, 8),
        userName:
          form.userName ||
          form.email?.split("@")[0] ||
          "ref" + Math.random().toString(36).substring(2, 10),
        contactNo: form.phone || "1354413735625323",
        age: 20,
        referredBy: form.referral || "sbm47374",
      },
    };

    await toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/create-User`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to register user.");
        return res.json();
      }),
      {
        loading: "Registering...",
        success: () => {
          setTimeout(() => {
            onClose();
            router.push("/login");
          }, 800);
          return "Registration successful!";
        },
        error: "Registration failed. Try again.",
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center px-4">
      <div className="bg-[#00303f] p-6 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-red-500"
        >
          <X />
        </button>

        <div className="flex flex-col items-center mb-4">
          <Image
            src="/sbm777.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-8 mb-2"
          />
          <h2 className="text-2xl font-bold text-white">Registration</h2>
          <p className="text-sm text-gray-300 mt-1">
            Welcome! Please enter your details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-[#0f3b4a] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="userName"
              value={form.userName}
              onChange={handleChange}
              placeholder="User Name"
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-[#0f3b4a] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-[#0f3b4a] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone"
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-[#0f3b4a] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              className="w-full pl-10 pr-10 py-2 border rounded-md bg-[#0f3b4a] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              👁️
            </button>
          </div>

          {/* Referral */}
          <input
            type="text"
            name="referral"
            value={form.referral}
            onChange={handleChange}
            placeholder="Referral ID (optional)"
            className="w-full pl-4 pr-4 py-2 border rounded-md bg-[#0f3b4a] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
