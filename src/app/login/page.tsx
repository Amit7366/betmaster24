"use client";

import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePersistReady } from "@/redux/hook/usePersistReady";
import { persistor } from "@/redux/persistor";
import { loginUser } from "@/services/actions/auth.services";
import { Eye, Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginForm() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const isPersistReady = usePersistReady(persistor);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isPersistReady) return;

    await toast.promise(
      loginUser(userName, password).then(({ accessToken, user }) => {
        if (!accessToken || !user) {
          throw new Error("Missing login data");
        }

        dispatch(setCredentials({ accessToken, user }));
        setTimeout(() => {
          router.push("/");
        }, 100);
      }),
      {
        loading: "Logging in...",
        success: "Login successful!",
        error: "Invalid login credentials.",
      }
    );
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="bg-[#00303f] p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img src="/sbm777.png" alt="Logo" className="h-8 mb-2" />
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="text-sm text-gray-300 mt-1">
            Please enter your details.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Email"
              required
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Remember and Forgot */}
          <div className="flex items-center justify-between text-sm text-gray-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-purple-600" />
              Remember for 30 days
            </label>
            <a href="#" className="text-yellow-600 hover:underline">
              Forgot password
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition"
          >
            Login
          </button>

          {/* Sign up */}
          <p className="text-sm text-center text-gray-300">
            Don’t have an account?{" "}
            <Link href="/register" className="text-yellow-600 hover:underline">
              Sign up
            </Link>
          </p>
        </form>

        {/* Back to home */}
        <Link
          href={"/"}
          className="mt-6 flex items-center text-sm text-gray-300 hover:text-purple-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
