"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    userName:"",
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
        userName: form.userName ||form.email?.split("@")[0],
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
          setTimeout(() => router.push("/login"), 1000);
          return "Registration successful!";
        },
        error: "Registration failed. Try again.",
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f1ecfe] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/sbm777.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-8 mb-2"
          />
          <h2 className="text-2xl font-bold">Registration</h2>
          <p className="text-sm text-gray-500 mt-1">
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
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-800"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.956 9.956 0 013.307-7.263M15 12a3 3 0 01-3 3m0-6a3 3 0 013 3m6.063-3.063a9.94 9.94 0 010 6.126M21 21L3 3"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Referral */}
          <input
            type="text"
            name="referral"
            value={form.referral}
            onChange={handleChange}
            placeholder="Referral ID (optional)"
            className="w-full pl-4 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-purple-600" />
              Remember for 30 days
            </label>
            <a href="#" className="text-purple-600 hover:underline">
              Forgot password
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
          >
            Register
          </button>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-purple-600 hover:underline">
              Login
            </a>
          </p>
        </form>

        <button
          onClick={() => router.push("/")}
          className="mt-6 flex items-center text-sm text-gray-600 hover:text-purple-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
