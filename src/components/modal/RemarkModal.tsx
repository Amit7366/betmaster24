"use client";

import { getUserInfo } from "@/services/actions/auth.services";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Phone, X, Loader2 } from "lucide-react";

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
  onSuccess?: () => void | Promise<void>;
}

export const RemarkModal = ({ user, isOpen, onClose, onSuccess }: Props) => {
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("Success");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("accessToken");
  const userInfo = getUserInfo();

  const canSave = useMemo(() => {
    // allow empty remarks if you want — but better UX with at least 2 chars
    return status.trim().length > 0 && remarks.trim().length >= 2;
  }, [status, remarks]);

  if (!isOpen) return null;

  const handleInsert = async () => {
    try {
      setSaving(true);

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

      if (onSuccess) await onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleCall = () => {
    const phone = user.PhoneNumber ?? "";
    if (phone) window.open(`tel:${phone}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={saving ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Call & Update — {user.CustomerName}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Save status + remarks after calling the customer.
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            {/* Info */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-500">Phone</div>
                  <div className="font-semibold text-slate-900">
                    {user.PhoneNumber || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Operator</div>
                  <div className="font-semibold text-slate-900">
                    {user.Operator || "N/A"}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-slate-500">Previous Status</div>
                  <div className="font-semibold text-slate-900">
                    {user.CallStatus || "N/A"}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-slate-500">Previous Remarks</div>
                  <div className="text-slate-700">
                    {user.Remarks || "N/A"}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCall}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </button>
            </div>

            {/* Form */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Call Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="Success">Success</option>
                  <option value="Enageged">Enageged</option>
                  <option value="Invalid">Invalid</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Follow Up">Follow Up</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                  rows={4}
                  placeholder="Write call summary, customer response, next steps..."
                />
                <div className="mt-1 text-xs text-slate-500">
                  Tip: write at least 2 characters.
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
            <button
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleInsert}
              disabled={saving || !canSave}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
