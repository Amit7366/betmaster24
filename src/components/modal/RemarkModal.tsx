"use client";

import { getUserInfo } from "@/services/actions/auth.services";
import { useState } from "react";
import { toast } from "sonner";

interface TeleSalesLead {
  _id: string;
  CustomerName: string;
  PhoneNumber: string;
  CallStatus: string;
  Remarks: string;
  Operator: string;
}

interface Props {
  user: TeleSalesLead;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RemarkModal = ({ user, isOpen, onClose, onSuccess }: Props) => {
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("Interested");
  const token = localStorage.getItem("accessToken");
  const userInfo = getUserInfo();
  // console.log(user._id,userInfo.id)

  if (!isOpen) return null;

 const handleInsert = async () => {
  try {
    await toast.promise(
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tele/tele-sales-leads/officer/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            callStatus: status,
            remarks,
            operatorId: userInfo?.id,
          }),
        }
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to save call info");
        return res.json();
      }),
      {
        loading: "Saving call info...",
        success: "Call info saved successfully!",
        error: "Failed to save call info.",
      }
    );

    // ✅ Ensure fresh data before modal closes
    if (onSuccess) {
      await onSuccess(); // wait for parent to re-fetch
    }

    // ✅ Then close modal
    onClose();
  } catch (err) {
    console.error(err);
    toast.error("Unexpected error while saving.");
  }
};


  const handleCall = async (userId: string) => {
    // Call: guard against missing phone
    const phone = userId ?? "";
    if (phone) window.open(`tel:${phone}`, "_blank");
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          Call {user.CustomerName}
        </h2>

        <div className="space-y-2 text-sm">
          <p><strong>Phone:</strong> {user.PhoneNumber}</p>
          <p><strong>Operator:</strong> {user.Operator || "N/A"}</p>
          <p><strong>Previous Status:</strong> {user.CallStatus || "N/A"}</p>
          <p><strong>Previous Remarks:</strong> {user.Remarks || "N/A"}</p>
        </div>
        <button
          className="px-4 py-2 bg-cyan-300 mt-2 text-xs rounded-sm cursor-pointer hover:translate-x-1 duration-150"
          onClick={() => handleCall(user.PhoneNumber)} // ✅ wrap it in arrow function
        >
          Give a Call
        </button>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Call Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border p-2 rounded mt-1 text-sm"
            >
              <option value={'Success'}>Success</option>
              <option value={'Enageged'}>Enageged</option>
              <option value={'Invalid'}>Invalid</option>
              <option value={'Rejected'}>Rejected</option>
              <option value={'Follow Up'}>Follow Up</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border p-2 rounded mt-1 text-sm"
              rows={3}
              placeholder="Write your remarks..."
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};
