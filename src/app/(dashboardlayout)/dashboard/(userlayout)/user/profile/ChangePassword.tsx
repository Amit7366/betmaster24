"use client";

import { useState } from "react";
import { getFromLocalStorage } from "@/utils/local-storage";
import { toast } from "sonner";
import { CheckCircle, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

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
          Authorization: `${token}`,
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
    <div className="rounded-3xl border border-white/10 bg-secondary/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
            <LockKeyhole className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Change Password</h2>
            <p className="mt-1 text-xs text-white/60">
              Use a strong password for better security.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
          <ShieldCheck className="h-4 w-4" />
          Secure
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Old password */}
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70">
            Old Password
          </label>
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              required
              className={cn(
                "h-12 w-full rounded-2xl border bg-primary/40 px-4 pr-12 text-sm text-white outline-none transition",
                "border-white/10 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
              )}
            />
            <button
              type="button"
              onClick={() => setShowOld((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <label className="mb-1 block text-xs font-medium text-white/70">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              className={cn(
                "h-12 w-full rounded-2xl border bg-primary/40 px-4 pr-12 text-sm text-white outline-none transition",
                "border-white/10 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
              )}
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <p className="mt-2 text-[11px] text-white/50">
            Tip: Use 8+ characters with numbers and symbols.
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl px-4 py-3 text-sm font-semibold transition flex items-center justify-between bg-accent text-cardbg hover:brightness-110 ring-1 ring-accent/30"
        >
          <span>Change Password</span>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/40 ring-1 ring-white/10">
            <CheckCircle className="h-4 w-4 text-white" />
          </span>
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;

// "use client";

// import { useState } from "react";
// import { getFromLocalStorage } from "@/utils/local-storage";
// import { toast } from "sonner";
// import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";

// const ChangePassword = () => {
//   const [form, setForm] = useState({
//     oldPassword: "",
//     newPassword: "",
//   });

//   const [showOld, setShowOld] = useState(false);
//   const [showNew, setShowNew] = useState(false);

//   const token = getFromLocalStorage("accessToken");

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

// const changePassword = async () => {
//   const res = await fetch(`/api/auth/change-password`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `${token}`, // or `Bearer ${token}`
//     },
//     body: JSON.stringify({
//       oldPassword: form.oldPassword,
//       newPassword: form.newPassword,
//     }),
//     cache: "no-store",
//   });

//   const errData = await res.json().catch(() => ({}));
//   if (!res.ok) {
//     throw new Error(errData?.message || "Password change failed.");
//   }
//   return errData;
// };


//     await toast.promise(changePassword(), {
//       loading: "Updating password...",
//       success: () => "✅ Password changed successfully!",
//       error: (err) => err.message || "❌ Password change failed.",
//     });

//     setForm({ oldPassword: "", newPassword: "" });
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="space-y-6 bg-secondary hover:bg-cardbg rounded-lg p-6 shadow"
//     >
//       <h2 className="text-2xl font-bold text-white mb-4">Change Password</h2>

//       <div className="flex flex-col gap-4">
//         <div>
//           <label className="block text-sm font-medium text-accent mb-1">
//             Old Password
//           </label>
//           <div className="relative">
//             <input
//               type={showOld ? "text" : "password"}
//               name="oldPassword"
//               value={form.oldPassword}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//             <button
//               type="button"
//               onClick={() => setShowOld((prev) => !prev)}
//               className="absolute right-2 top-1/2 -translate-y-1/2 text-textcolor"
//             >
//               {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-accent mb-1">
//             New Password
//           </label>
//           <div className="relative">
//             <input
//               type={showNew ? "text" : "password"}
//               name="newPassword"
//               value={form.newPassword}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//             <button
//               type="button"
//               onClick={() => setShowNew((prev) => !prev)}
//               className="absolute right-2 top-1/2 -translate-y-1/2 text-textcolor"
//             >
//               {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       <button
//         type="submit"
//         className="w-full h-12 mt-2 bg-accent hover:bg-blue-700 text-cardbg font-semibold rounded-full transition flex justify-between items-center text-sm px-4"
//       >
//         <span>Change Password</span>
//         <div className="h-6 w-6 bg-primary rounded-full flex justify-center items-center">
//           <CheckCircle className="w-3 h-3 text-textcolor" />
//         </div>
//       </button>
//     </form>
//   );
// };

// export default ChangePassword;
