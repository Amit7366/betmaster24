"use client";

import { useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modalContentRef.current?.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-filter backdrop-blur-sm bg-opacity-10 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalContentRef}
        className="relative w-full max-w-sm rounded-ms bg-graybg p-6 text-white shadow-lg"
      >
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-sm bg-red-500 absolute top-4 right-4 text-white text-lg"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-1">Create an account</h2>
        <p className="text-sm mb-4 text-gray-400">
          Already have an account? <a href="#" className="text-blue-400">Log in</a>
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Name"
            className="w-1/2 rounded-md bg-graycardbg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="user name"
            className="w-1/2 rounded-md bg-graycardbg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <input
          type="number"
          placeholder="phone number"
          className="w-full mb-4 rounded-md bg-graycardbg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="w-full rounded-md bg-graycardbg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>

        <div className="flex items-center mb-4">
          <input type="checkbox" className="mr-2" />
          <span className="text-sm text-gray-300">
            I agree to the <a href="#" className="text-blue-400">Terms & Conditions</a>
          </span>
        </div>

        <button className="w-full bg-purple-600 hover:bg-purple-700 transition-colors text-white py-2 rounded-md mb-4">
          Create account
        </button>

        {/* <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-gray-600" />
          <span className="text-xs text-gray-400">Or register with</span>
          <div className="flex-1 h-px bg-gray-600" />
        </div>

        <div className="flex gap-2">
          <button className="flex-1 border border-gray-600 rounded-md py-2 flex items-center justify-center gap-2">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
            Google
          </button>
          <button className="flex-1 border border-gray-600 rounded-md py-2 flex items-center justify-center gap-2">
            <img src="https://www.svgrepo.com/show/303128/apple-logo.svg" alt="Apple" className="w-4 h-4" />
            Apple
          </button>
        </div> */}
      </div>
    </div>
  );
}
