"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";

export default function AdminCreateForm() {
  const router = useRouter();
  const token = getFromLocalStorage("accessToken");

  const [form, setForm] = useState({
    password: "",
    designation: "Admin",
    userName: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "male",
    dateOfBirth: "",
    email: "",
    contactNo: "",
    emergencyContactNo: "",
    bloodGroup: "",
    presentAddress: "",
    permanentAddress: "",
    profileImg: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      password: form.password,
      admin: {
        designation: form.designation,
        userName: form.userName,
        name: {
          firstName: form.firstName,
          middleName: form.middleName,
          lastName: form.lastName,
        },
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        email: form.email,
        contactNo: form.contactNo,
        emergencyContactNo: form.emergencyContactNo,
        bloodGroup: form.bloodGroup,
        presentAddress: form.presentAddress,
        permanentAddress: form.permanentAddress,
        profileImg: form.profileImg || "profile.jpg",
        isDeleted: false,
      },
    };

    const promise = fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/create-admin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload),
      }
    ).then(async (res) => {
      if (!res.ok) throw new Error("Failed to create admin");
      // setTimeout(() => router.push("/dashboard/admin"), 1000);
      return res.json();
    });

    toast.promise(promise, {
      loading: "Creating admin...",
      success: (data) => `Admin created: ${data?.message || "Success"}`,
      error: (err) => `Error: ${err.message}`,
    });
  };

  return (
    <div className="max-w-4xl my-12 p-6 bg-white rounded-xl shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Admin</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Username" name="userName" value={form.userName} onChange={handleChange} />
          <InputField label="Password" name="password" type="password" value={form.password} onChange={handleChange} />
          <InputField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} />
          <InputField label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} />
          <InputField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
          <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
          <InputField label="Contact No" name="contactNo" value={form.contactNo} onChange={handleChange} />
          <InputField label="Emergency Contact" name="emergencyContactNo" value={form.emergencyContactNo} onChange={handleChange} />
          <InputField label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} />
          <InputField label="Present Address" name="presentAddress" value={form.presentAddress} onChange={handleChange} />
          <InputField label="Permanent Address" name="permanentAddress" value={form.permanentAddress} onChange={handleChange} />
          <InputField label="Profile Image URL" name="profileImg" value={form.profileImg} onChange={handleChange} />

          {/* Gender Select */}
          <div className="space-y-1">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* DOB */}
          <InputField label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
        >
          Create Admin
        </button>
      </form>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={label}
        className="w-full border rounded-md p-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
  );
}
