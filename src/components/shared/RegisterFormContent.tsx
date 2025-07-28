// components/auth/RegisterFormContent.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Lock, User, Phone } from "lucide-react";

export default function RegisterFormContent({
  onSuccess,
}: {
  onSuccess?: () => void;
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
        userName: form.userName || form.email?.split("@")[0],
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
          if (onSuccess) onSuccess();
          else setTimeout(() => router.push("/login"), 1000);
          return "Registration successful!";
        },
        error: "Registration failed. Try again.",
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your name"
          className="w-full pl-10 pr-4 py-2 border rounded-md"
        />
      </div>
      <div className="relative">
        <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          name="userName"
          value={form.userName}
          onChange={handleChange}
          placeholder="User Name"
          className="w-full pl-10 pr-4 py-2 border rounded-md"
        />
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          className="w-full pl-10 pr-4 py-2 border rounded-md"
        />
      </div>
      <div className="relative">
        <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Enter your phone"
          className="w-full pl-10 pr-4 py-2 border rounded-md"
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="********"
          className="w-full pl-10 pr-10 py-2 border rounded-md"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-800"
        >
          {showPassword ? <span>🙈</span> : <span>👁️</span>}
        </button>
        <small className="text-accent">min 6 digit</small>
      </div>
      <input
        type="text"
        name="referral"
        value={form.referral}
        onChange={handleChange}
        placeholder="Referral ID (optional)"
        className="w-full px-4 py-2 border rounded-md"
      />
      <button
        type="submit"
        className="w-full bg-accent text-white py-2 rounded-md hover:bg-purple-700 transition"
      >
        Register
      </button>
    </form>
  );
}