// components/auth/RegisterFormContent.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";

export default function RegisterFormContent({ onSuccess }: { onSuccess?: () => void }) {
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

  const searchParams = useSearchParams();
  const refIdFromURL = searchParams.get("refId") || "";

  // Typing effect per input field
  const [activeField, setActiveField] = useState<string | null>(null);
  const [displayText, setDisplayText] = useState("");

  const typingTexts: Record<string, string> = {
    name: "আপনি আপনার নাম লিখছেন...",
    userName: "আপনি আপনার ইউজারনেম লিখছেন...",
    phone: "আপনি আপনার ফোন নম্বর লিখছেন...",
    password: "আপনি পাসওয়ার্ড লিখছেন...",
    referral: "আপনি রেফারেল কোড লিখছেন...",
  };

  // unified input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name;
    setForm({ ...form, [field]: e.target.value });
    setActiveField(field);
  };

  // typing animation
  useEffect(() => {
    if (!activeField || !typingTexts[activeField]) return setDisplayText("");

    let i = 0;
    const text = typingTexts[activeField];
    setDisplayText("");

    const interval = setInterval(() => {
      setDisplayText((prev) => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 60);

    return () => clearInterval(interval);
  }, [activeField]);

  // referral from URL
  useEffect(() => {
    if (refIdFromURL) {
      setForm((prev) => ({ ...prev, referral: refIdFromURL }));
    }
  }, [refIdFromURL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      password: form.password || "Timetraveller0388@",
      normalUser: {
        name: form.name || "refBy" + Math.random().toString(36).substring(2, 8),
        userName: form.userName || form.email?.split("@")[0],
        contactNo: form.phone || "1354413735625323",
        age: 20,
        ...(form.referral?.trim() !== "" ? { referredBy: form.referral } : {}),
      },
    };

    await toast.promise(
      fetch(`/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Registration failed.");
        return data;
      }),
      {
        loading: "রেজিস্ট্রেশন চলছে...",
        success: () => {
          if (onSuccess) onSuccess();
          else setTimeout(() => router.push("/login"), 1000);
          return "সফলভাবে রেজিস্টার সম্পন্ন হয়েছে!";
        },
        error: (err) => err.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Typing Bengali Status */}
      {activeField && (
        <p className="text-[13px] font-medium text-white tracking-wide animate-animateWave">
          {displayText}
        </p>
      )}

      {/* NAME */}
      <InputField
        icon={User}
        name="name"
        value={form.name}
        onChange={handleChange}
        label="আপনার নাম"
      />

      {/* USERNAME */}
      <InputField
        icon={User}
        name="userName"
        value={form.userName}
        onChange={handleChange}
        label="গেম ইউজারনেম"
      />

      {/* PHONE */}
      <InputField
        icon={Phone}
        name="phone"
        value={form.phone}
        onChange={handleChange}
        label="ফোন নম্বর"
      />

      {/* PASSWORD */}
      <div className="relative group">
        <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-accent" />

        <label
          className={`absolute left-11 top-3 text-gray-400 transition-all duration-300 pointer-events-none
          group-focus-within:-top-3 group-focus-within:text-xs group-focus-within:text-accent
          ${form.password ? "-top-3 text-xs text-accent" : ""}`}
        >
          পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
        </label>

        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={form.password}
          onChange={handleChange}
          onFocus={() => setActiveField("password")}
          className="w-full bg-black/30 border border-gray-700 rounded-lg pl-11 pr-10 py-3 text-white
          outline-none focus:border-accent focus:shadow-[0_0_15px_#00ffbb80] transition-all"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-400 hover:text-accent"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* REFERRAL */}
      <div className="relative group">
        <label className="absolute left-2 -top-5 text-xs text-accent">রেফারেল কোড (ঐচ্ছিক)</label>
        <input
          type="text"
          name="referral"
          value={form.referral}
          onChange={handleChange}
          onFocus={() => setActiveField("referral")}
          className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none
          focus:border-accent focus:shadow-[0_0_15px_#00ffbb80] transition-all"
        />
      </div>

      {/* BUTTON */}
      <button
        type="submit"
        className="w-full py-3 rounded-lg text-black font-bold tracking-wide
        bg-gradient-to-r from-cyan-300 via-green-300 to-yellow-200
        hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_25px_#00ffbbaa]"
      >
        অ্যাকাউন্ট তৈরি করুন ✦
      </button>
    </form>
  );
}

// Reusable Input Field Component
type InputProps = {
  icon: any;
  name: string;
  value: string;
  label: string;
  onChange: (e: any) => void;
};

function InputField({ icon: Icon, name, value, onChange, label, setActiveField }: any) {
  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-accent" />

      <label
        className={`absolute left-11 top-3 text-gray-400 pointer-events-none transition-all duration-300
        group-focus-within:-top-3 group-focus-within:text-xs group-focus-within:text-accent
        ${value ? "-top-3 text-xs text-accent" : ""}`}
      >
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setActiveField(name)}
        className="w-full bg-black/30 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-white outline-none
        focus:border-accent focus:shadow-[0_0_15px_#00ffbb80] transition-all"
      />
    </div>
  );
}


