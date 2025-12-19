// components/auth/LoginFormComponent.tsx
"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";
import { usePersistReady } from "@/redux/hook/usePersistReady";
import { persistor } from "@/redux/persistor";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// 🔹 InputField Component (same as Register page)
function InputField({
  icon: Icon,
  name,
  value,
  onChange,
  label,
  setActiveField,
}: any) {
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

export default function LoginFormComponent({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState({
    userName: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const isPersistReady = usePersistReady(persistor);

  // 🔹 Bengali typing effect state (same behavior as Register)
  const [activeField, setActiveField] = useState("");
  const [displayText, setDisplayText] = useState("");

  const typingText: any = {
    userName: "ইউজারনেম বা ফোন নম্বর লিখছেন...",
    password: "পাসওয়ার্ড লিখছেন...",
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFocus = (field: string) => {
    setActiveField(field);
    setDisplayText(typingText[field]);
  };

  // 🔹 Login Logic (unchanged — all Redux/Cookies/JWT kept)
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isPersistReady) return;

    const isPhone = /^\d+$/.test(form.userName.trim());
    const body = isPhone
      ? { contactNo: form.userName.trim(), password: form.password }
      : { userName: form.userName.trim(), password: form.password };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    await toast.promise(
      (async () => {
        try {
          const res = await fetch("/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.message || "Login failed");

          const accessToken: string | undefined =
            data?.data?.accessToken || data?.accessToken;
          if (!accessToken) throw new Error("Missing access token");

          const user = jwtDecode<any>(accessToken);

          dispatch(setCredentials({ accessToken, user }));
          localStorage.setItem("accessToken", accessToken);
          Cookies.set("accessToken", accessToken, {
            path: "/",
            expires: 1,
            secure: true,
            sameSite: "Strict",
            domain: "bm24api.xyz", // <-- add this
          });

          setTimeout(() => {
            if (onSuccess) onSuccess();
            router.push("/dashboard");
          }, 300);

          return { accessToken, user };
        } finally {
          clearTimeout(timeout);
        }
      })(),
      {
        loading: "লগইন হচ্ছে...",
        success: "লগইন সফল!",
        error: (err) =>
          err?.name === "AbortError"
            ? "অনুরোধের সময় শেষ হয়ে গেছে। আবার চেষ্টা করুন।"
            : err?.message || "ইউজারনেম বা পাসওয়ার্ড ভুল।",
      }
    );
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {/* Bengali typing animation */}
      {activeField && (
        <p className="text-[13px] font-medium text-white tracking-wide animate-animateWave">
          {displayText}
        </p>
      )}

      {/* Username */}
      <InputField
        icon={User}
        name="userName"
        value={form.userName}
        onChange={handleChange}
        label="ইউজারনেম / ফোন নম্বর"
        setActiveField={handleFocus}
      />

      {/* Password */}
      <div className="relative group">
        <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-accent" />

        <label
          className={`absolute left-11 top-3 text-gray-400 transition-all duration-300 pointer-events-none
          group-focus-within:-top-3 group-focus-within:text-xs group-focus-within:text-accent
          ${form.password ? "-top-3 text-xs text-accent" : ""}`}
        >
          পাসওয়ার্ড
        </label>

        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={form.password}
          onChange={handleChange}
          onFocus={() => handleFocus("password")}
          className="w-full bg-black/30 border border-gray-700 rounded-lg pl-11 pr-10 py-3 text-white
          outline-none focus:border-accent focus:shadow-[0_0_15px_#00ffbb80] transition-all"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-400 hover:text-accent"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        className="w-full py-3 rounded-lg text-black font-bold tracking-wide
        bg-gradient-to-r from-cyan-300 via-green-300 to-yellow-200
        hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_25px_#00ffbbaa]"
      >
        লগইন করুন ✦
      </button>
    </form>
  );
}
