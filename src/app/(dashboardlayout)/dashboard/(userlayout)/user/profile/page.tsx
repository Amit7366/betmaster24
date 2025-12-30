"use client";

import { useEffect, useState } from "react";
import { CheckCircle, ShieldCheck, User2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import ChangePassword from "./ChangePassword";
import Image from "next/image";
import { getUserInfo } from "@/services/actions/auth.services";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/redux/hook/useAuth";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-white/60">{subtitle}</p> : null}
      </div>
    </div>
  );
}

const UserSettings = () => {
  const [activeTab, setActiveTab] = useState<"settings" | "password">("settings");
  const [userData, setUserData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasBirthDate, setHasBirthDate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    userName: "",
    email: "",
    referralId: "",
    referredBy: "",
    refferCount: 0,
    contactNo: "",
    userLevel: "",
    profileImg: "",
    birthDate: "",
  });

  const userInfo = getUserInfo();
  const { user, isAuthenticated } = useAuth();
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ?? undefined
      : undefined;

  const objectId = user?.objectId;
  const { data: dashboard } = useDashboardData(objectId, token);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userInfo?.objectId || !token) return;

      const controller = new AbortController();

      try {
        const res = await fetch(`/api/normalUsers/${userInfo.objectId}`, {
          headers: { Authorization: `${token}` },
          cache: "no-store",
          signal: controller.signal,
        });

        const json = await res.json();

        if (json?.data) {
          const data = json.data;
          setUserData(data);
          setHasBirthDate(!!data.birthDate);
        } else {
          toast.error(json?.message || "Failed to fetch user info profile");
        }
      } catch {
        toast.error("Failed to fetch user info profile");
      }

      return () => controller.abort();
    };

    fetchUserData();
  }, [token, userInfo?.objectId]);

  useEffect(() => {
    const u = dashboard?.user;
    if (!u) return;

    setUserData(u);
    setHasBirthDate(!!u.birthDate);

    setForm((prev) => ({
      ...prev,
      name: u.name || "",
      userName: u.userName || "",
      email: u.email || "",
      referralId: u.referralId || "",
      referredBy: u.referredBy || "",
      refferCount: u.refferCount || 0,
      contactNo: u.contactNo || "",
      userLevel: u.userLevel || "",
      profileImg: u.profileImg || "",
      birthDate: u.birthDate ? u.birthDate.slice(0, 10) : "",
    }));
  }, [dashboard?.user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setForm((prev) => ({
        ...prev,
        profileImg: URL.createObjectURL(file), // live preview
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    toast.promise(
      (async () => {
        let imageUrl = form.profileImg;

        if (selectedFile) {
          const formData = new FormData();
          formData.append("file", selectedFile);
          formData.append("upload_preset", "clicktoearn");

          const uploadRes = await fetch(
            "https://api.cloudinary.com/v1_1/dsekhxz2h/image/upload",
            {
              method: "POST",
              body: formData,
            }
          );

          const uploadData = await uploadRes.json();
          if (!uploadData.secure_url) throw new Error("Image upload failed");
          imageUrl = uploadData.secure_url;
        }

        const payload: any = {
          name: form.name,
          referredBy: form.referredBy,
          birthDate: form.birthDate,
        };

        if (selectedFile) payload.profileImg = imageUrl;

        const res = await fetch(`/api/normalUsers/${userInfo?.objectId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({ normalUser: payload }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Profile update failed");
        }

        return "Profile updated successfully";
      })(),
      {
        loading: "Updating profile...",
        success: (msg) => msg,
        error: (err: any) => err.message || "Something went wrong",
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-primary px-3 pb-24 pt-6">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Account Settings
              </h1>
              <p className="mt-1 text-xs text-white/60">
                Manage profile info and security settings.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
              <ShieldCheck className="h-4 w-4" />
              Protected
            </div>
          </div>

          {/* Tabs (segmented) */}
          <div className="mt-5 flex gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            <button
              onClick={() => setActiveTab("settings")}
              className={cn(
                "flex-1 rounded-2xl px-4 py-2 text-xs font-semibold transition",
                activeTab === "settings"
                  ? "bg-accent/20 text-accent ring-1 ring-accent/30"
                  : "text-white/70 hover:bg-white/[0.06]"
              )}
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                <User2 className="h-4 w-4" />
                Profile
              </span>
            </button>

            <button
              onClick={() => setActiveTab("password")}
              className={cn(
                "flex-1 rounded-2xl px-4 py-2 text-xs font-semibold transition",
                activeTab === "password"
                  ? "bg-accent/20 text-accent ring-1 ring-accent/30"
                  : "text-white/70 hover:bg-white/[0.06]"
              )}
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                <LockKeyhole className="h-4 w-4" />
                Password
              </span>
            </button>
          </div>
        </div>

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="rounded-3xl border border-white/10 bg-secondary/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
            <SectionTitle
              icon={<User2 className="h-5 w-5 text-white" />}
              title="Profile Settings"
              subtitle="Update basic details. Birth date can be set once."
            />

            <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
              {/* Profile image */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-24 w-24 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                  <Image
                    src={form.profileImg || "/avatar.jpg"}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Profile Photo
                  </label>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-xs text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-accent/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-accent hover:file:bg-accent/25"
                    />
                    <p className="mt-2 text-[11px] text-white/50">
                      Upload a clear photo (JPG/PNG).
                    </p>
                  </div>
                </div>
              </div>

              {/* Birth date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="birthDate" className="mb-1 block text-xs font-medium text-white/70">
                    Birth Date
                  </label>

                  {hasBirthDate ? (
                    <div className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 flex items-center text-sm text-white/80">
                      {form.birthDate || "—"}
                    </div>
                  ) : (
                    <input
                      type="date"
                      name="birthDate"
                      value={form.birthDate}
                      onChange={handleChange}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-primary/40 px-4 text-sm text-white outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                      placeholder="Birth Date"
                    />
                  )}

                  <p className="mt-2 text-[11px] text-white/50">
                    Once set, birth date can’t be changed.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-2xl px-4 py-3 text-sm font-semibold transition flex items-center justify-between bg-accent text-cardbg hover:brightness-110 ring-1 ring-accent/30"
              >
                <span>Update Profile</span>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/40 ring-1 ring-white/10">
                  <CheckCircle className="h-4 w-4 text-white" />
                </span>
              </button>
            </form>
          </div>
        )}

        {/* Password */}
        {activeTab === "password" && <ChangePassword />}
      </div>
    </div>
  );
};

export default UserSettings;

// "use client";

// import { useEffect, useState } from "react";
// import { CheckCircle } from "lucide-react";
// import { getFromLocalStorage } from "@/utils/local-storage";
// import { toast } from "sonner";
// import ChangePassword from "./ChangePassword";
// import Image from "next/image";
// import { getUserInfo } from "@/services/actions/auth.services";
// import { useDashboardData } from "@/hooks/useDashboardData";
// import { useAuth } from "@/redux/hook/useAuth";

// const UserSettings = () => {
//   const [activeTab, setActiveTab] = useState("settings");
//   const [userData, setUserData] = useState<any>(null);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [hasBirthDate, setHasBirthDate] = useState(false);
//   const [form, setForm] = useState({
//     name: "",
//     userName: "",
//     email: "",
//     referralId: "",
//     referredBy: "",
//     refferCount: 0,
//     contactNo: "",
//     userLevel: "",
//     profileImg: "",
//     birthDate: "",
//   });

//   const userInfo = getUserInfo();
//   const { user, isAuthenticated } = useAuth();
//   const token =
//     typeof window !== "undefined"
//       ? localStorage.getItem("accessToken") ?? undefined
//       : undefined;
//   const objectId = user?.objectId;
//   const { data: dashboard } = useDashboardData(objectId, token);
//   useEffect(() => {
//     const fetchUserData = async () => {
//       if (!userInfo?.objectId || !token) return;

//       const controller = new AbortController();

//       try {
//         const res = await fetch(`/api/normalUsers/${userInfo.objectId}`, {
//           headers: { Authorization: `${token}` },
//           cache: "no-store",
//           signal: controller.signal,
//         });
//         const json = await res.json();

//         if (json?.data) {
//           const data = json.data;
//           setUserData(data);
//           setHasBirthDate(!!data.birthDate);
//           // setForm({
//           //   name: data.name || "",
//           //   userName: data.userName || "",
//           //   email: data.email || "",
//           //   referralId: data.referralId || "",
//           //   referredBy: data.referredBy || "",
//           //   refferCount: data.refferCount || 0,
//           //   contactNo: data.contactNo || "",
//           //   userLevel: data.userLevel || "",
//           //   profileImg: data.profileImg || "",
//           //   birthDate: data.birthDate ? data.birthDate.slice(0, 10) : "",
//           // });
//         } else {
//           toast.error(json?.message || "Failed to fetch user info profile");
//         }
//       } catch {
//         toast.error("Failed to fetch user info profile");
//       }

//       return () => controller.abort();
//     };

//     fetchUserData();
//   }, [token, userInfo?.objectId]);

//   useEffect(() => {
//     const u = dashboard?.user;
//     if (!u) return;
//     setUserData(u);
//     setHasBirthDate(!!u.birthDate);
//     setForm((prev) => ({
//       ...prev,
//       name: u.name || "",
//       userName: u.userName || "",
//       email: u.email || "",
//       referralId: u.referralId || "",
//       referredBy: u.referredBy || "",
//       refferCount: u.refferCount || 0,
//       contactNo: u.contactNo || "",
//       userLevel: u.userLevel || "",
//       profileImg: u.profileImg || "",
//       birthDate: u.birthDate ? u.birthDate.slice(0, 10) : "",
//     }));
//   }, [dashboard?.user]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setSelectedFile(file);
//       setForm((prev) => ({
//         ...prev,
//         profileImg: URL.createObjectURL(file), // 👈 live preview
//       }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     toast.promise(
//       (async () => {
//         let imageUrl = form.profileImg;

//         if (selectedFile) {
//           const formData = new FormData();
//           formData.append("file", selectedFile);
//           formData.append("upload_preset", "clicktoearn");

//           const uploadRes = await fetch(
//             "https://api.cloudinary.com/v1_1/dsekhxz2h/image/upload",
//             {
//               method: "POST",
//               body: formData,
//             }
//           );

//           const uploadData = await uploadRes.json();

//           if (!uploadData.secure_url) {
//             throw new Error("Image upload failed");
//           }

//           imageUrl = uploadData.secure_url;
//         }

//         const payload: any = {
//           name: form.name,
//           referredBy: form.referredBy,
//           birthDate: form.birthDate, // 👈 add this
//         };

//         if (selectedFile) {
//           payload.profileImg = imageUrl;
//         }

//         const res = await fetch(`/api/normalUsers/${userInfo?.objectId}`, {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `${token}`,
//           },
//           body: JSON.stringify({ normalUser: payload }),
//         });

//         const result = await res.json();

//         if (!res.ok) {
//           throw new Error(result.message || "Profile update failed");
//         }

//         return "Profile updated successfully";
//       })(),
//       {
//         loading: "Updating profile...",
//         success: (msg) => msg,
//         error: (err: any) => err.message || "Something went wrong",
//       }
//     );
//   };

//   return (
//     <div className="p-4 pb-24 md:p-8 w-full bg-primary rounded-lg shadow">
//       {/* Tabs */}
//       <div className="flex space-x-4 mb-6">
//         <button
//           onClick={() => setActiveTab("settings")}
//           className={`px-4 py-2 rounded-t-md font-semibold ${
//             activeTab === "settings"
//               ? "bg-accent text-white"
//               : "bg-white text-accent"
//           }`}
//         >
//           Settings
//         </button>
//         <button
//           onClick={() => setActiveTab("password")}
//           className={`px-4 py-2 rounded-t-md font-semibold ${
//             activeTab === "password"
//               ? "bg-accent text-white"
//               : "bg-white text-accent"
//           }`}
//         >
//           Change Password
//         </button>
//       </div>

//       {/* Settings Form */}
//       {activeTab === "settings" && (
//         <form className="space-y-6" onSubmit={handleSubmit}>
//           <h2 className="text-2xl font-bold text-white">Profile Settings</h2>

//           {/* Profile Image */}
//           <div className="flex flex-col md:flex-row items-center gap-4">
//             <Image
//               src={form.profileImg || "/avatar.jpg"}
//               alt="Profile"
//               width={96}
//               height={96}
//               className="w-24 h-24 rounded-full object-cover border-2 border-dotted border-purple-400"
//             />

//             <div className="flex flex-col gap-1">
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageChange}
//               />
//               <span className="text-xs text-gray-500">
//                 Upload new profile photo
//               </span>
//             </div>
//           </div>

//           {/* Form Fields */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="birthDate" className="text-accent mb-2">
//                 Birth Date
//               </label>
//               {hasBirthDate ? (
//                 <span>{form.birthDate}</span>
//               ) : (
//                 <input
//                   type="date"
//                   name="birthDate"
//                   value={form.birthDate}
//                   onChange={handleChange}
//                   className="input py-3 px-3 border"
//                   placeholder="Birth Date"
//                 />
//               )}
//             </div>
//           </div>
//           <button
//             type="submit"
//             className="w-full h-12 mt-2 bg-accent hover:bg-blue-700 text-cardbg font-semibold rounded-full transition flex justify-between items-center text-sm px-4"
//           >
//             <span>Update Profile</span>
//             <div className="h-6 w-6 bg-primary rounded-full flex justify-center items-center">
//               <CheckCircle className="w-3 h-3 text-textcolor" />
//             </div>
//           </button>
//         </form>
//       )}

//       {activeTab === "password" && <ChangePassword />}
//     </div>
//   );
// };

// export default UserSettings;
