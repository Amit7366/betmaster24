// components/auth/LoginFormComponent.tsx
"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";
import { usePersistReady } from "@/redux/hook/usePersistReady";
import { persistor } from "@/redux/persistor";
import { getUserInfo, loginUser } from "@/services/actions/auth.services";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // install via: npm i js-cookie

export default function LoginFormComponent({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const isPersistReady = usePersistReady(persistor);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isPersistReady) return;
    const userInfo = getUserInfo();

    await toast.promise(
      loginUser(userName, password).then(({ accessToken, user }) => {
        if (!accessToken || !user) {
          throw new Error("Missing login data");
        }

        dispatch(setCredentials({ accessToken, user }));

        // ✅ Save in both localStorage and cookies
        localStorage.setItem("accessToken", accessToken);
        Cookies.set("accessToken", accessToken, {
          expires: 1, // 1 day
          secure: true,
          sameSite: "Strict",
        });

        // ✅ Redirect
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
            router.push("/");
          } else {
            router.push("/login");
          }
        }, 300);
      }),
      {
        loading: "Logging in...",
        success: "Login successful!",
        error: "Invalid login credentials.",
      }
    );
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="relative">
        <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Username"
          required
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
          aria-label="Toggle password visibility"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-300">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-purple-600" />
          Remember me
        </label>
        <a href="#" className="text-yellow-600 hover:underline">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        className="w-full bg-accent text-white py-2 rounded-md hover:bg-yellow-700 transition"
      >
        Login
      </button>
    </form>
  );
}
