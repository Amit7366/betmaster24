"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";
import { usePersistReady } from "@/redux/hook/usePersistReady";
import { persistor } from "@/redux/persistor";
import { loginUser } from "@/services/actions/auth.services";
import { toast } from "sonner";
import { Eye, Mail, Lock, X } from "lucide-react";

export default function LoginModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
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
        onClose();
      }),
      {
        loading: "Logging in...",
        success: "Login successful!",
        error: "Invalid login credentials.",
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
          <img src="/sbm777.png" alt="Logo" className="h-8 mb-2" />
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="text-sm text-gray-300 mt-1">Please enter your details.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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

          <div className="flex items-center justify-between text-sm text-gray-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-purple-600" />
              Remember for 30 days
            </label>
            <a href="#" className="text-yellow-600 hover:underline">
              Forgot password
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
