"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";
import {
  Phone,
  Search,
  X,
  Users2,
  History as HistoryIcon,
  BellRing,
} from "lucide-react";
import { RemarkModal } from "@/components/modal/RemarkModal";
import { getUserInfo } from "@/services/actions/auth.services";

interface TeleSalesLead {
  _id: string;
  TeleSalesLeadsID: number;
  CallDateTime: string;
  CallRemarks: string;
  CallStatus: string;
  ContactPurpose: string;
  CreatedDateTime: string;
  CustomerName: string;
  FTD: string;
  Operator: string;
  PhoneNumber: string;
  ProcessingTime: string;
  RegisteredUserName: string;
  RegistrationDate: string;
  Remarks: string;
  ReminderDateTime: string;
  UpdatedDateTime: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

interface HistoryRecord {
  _id: string;
  leadId: string;
  operatorId: string;
  actionType: string;
  previousStatus: string;
  newStatus: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

interface FollowUpRecord {
  _id: string;
  operatorId: string;
  actionType: string;
  previousStatus: string;
  newStatus: string;
  remarks: string;
  reminderDateTime: string;
  createdAt: string;
  leadDetails: {
    _id: string;
    PhoneNumber: string;
    CustomerName: string;
    Operator: string;
    CallRemarks: string;
    CallStatus: string;
    ReminderDateTime: string;
  };
}

const TABS = ["New Leads", "Follow Up", "History"] as const;
type Tab = (typeof TABS)[number];

const NormalUsersTable = () => {
  const [leads, setLeads] = useState<TeleSalesLead[]>([]);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("New Leads");
  const [selectedUser, setSelectedUser] = useState<TeleSalesLead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = getFromLocalStorage("accessToken");
  const userInfo = getUserInfo();

  const openModal = (user: TeleSalesLead) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  // ✅ Fetch new leads (Operator empty)
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tele/tele-sales-leads`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      const result = await res.json();
      const unassignedLeads =
        result?.data?.leads?.filter((l: any) => !l.Operator) || [];
      setLeads(unassignedLeads);
    } catch {
      toast.error("Failed to load leads");
    }
  }, [token]);

  // ✅ Fetch history
  const fetchHistoryUsers = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tele/tele-sales-leads/AllAdmin/history`,
        { headers: { Authorization: `${token}` } }
      );
      const result = await res.json();
      setHistoryRecords(result.data || []);
    } catch {
      toast.error("Failed to load history leads");
    }
  }, [token]);

  // ✅ Fetch follow-ups
  const fetchFollowUps = useCallback(async () => {
    try {
      const token = getFromLocalStorage("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tele/tele-sales-leads/follow-up/byAdmin`,
        { headers: { Authorization: `${token}` } }
      );
      const result = await res.json();
      setFollowUps(result?.data || []);
    } catch {
      toast.error("Failed to load follow-ups");
    }
  }, []);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, entriesPerPage, searchTerm]);

  useEffect(() => {
    if (activeTab === "New Leads") fetchUsers();
    else if (activeTab === "History") fetchHistoryUsers();
    else if (activeTab === "Follow Up") fetchFollowUps();
  }, [activeTab, fetchUsers, fetchHistoryUsers, fetchFollowUps]);

  // ✅ Filter + current dataset
  const currentData = useMemo(() => {
    if (activeTab === "New Leads") {
      const q = searchTerm.trim().toLowerCase();
      return leads.filter(
        (lead) =>
          lead.CustomerName.toLowerCase().includes(q) ||
          lead.PhoneNumber.includes(searchTerm)
      );
    }
    if (activeTab === "History") return historyRecords;
    return followUps;
  }, [activeTab, leads, historyRecords, followUps, searchTerm]);

  const pageCount = Math.ceil(currentData.length / entriesPerPage);

  const paginated = useMemo(() => {
    return currentData.slice(
      (currentPage - 1) * entriesPerPage,
      currentPage * entriesPerPage
    );
  }, [currentData, currentPage, entriesPerPage]);

  const tabIcon = (t: Tab) => {
    if (t === "New Leads") return <Users2 className="h-4 w-4" />;
    if (t === "Follow Up") return <BellRing className="h-4 w-4" />;
    return <HistoryIcon className="h-4 w-4" />;
  };

  const badge = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "success")
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    if (s === "rejected" || s === "invalid")
      return "bg-rose-50 text-rose-700 ring-rose-100";
    if (s.includes("follow"))
      return "bg-amber-50 text-amber-700 ring-amber-100";
    if (s === "enageged" || s === "engaged")
      return "bg-indigo-50 text-indigo-700 ring-indigo-100";
    return "bg-slate-100 text-slate-700 ring-slate-200";
  };

  return (
    <section className="min-h-screen bg-slate-50/70 py-8">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-slate-900">
            Tele Sales — Admin Leads
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage unassigned leads, follow-ups, and complete history.
          </p>
        </div>

        {/* Top Bar */}
        <div className="mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {TABS.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={[
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ring-1 ring-inset",
                      active
                        ? "bg-slate-900 text-white ring-slate-900"
                        : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {tabIcon(tab)}
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                >
                  {[30, 50, 70].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-slate-600">entries</span>
              </div>

              {/* Search only for New Leads / Follow Up */}
              {activeTab !== "History" && (
                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                  />
                  {!!searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                      aria-label="Clear"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:px-5">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {currentData.length}
            </span>{" "}
            record(s) • Officer:{" "}
            <span className="font-semibold text-slate-900">
              {userInfo?.id || "—"}
            </span>
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            {activeTab === "New Leads" ? (
              <table className="min-w-full">
                <thead className="sticky top-0 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Registered</th>
                    <th className="px-4 py-3">FTD</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3">Operator</th>
                    <th className="px-4 py-3">Call Time</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {(paginated as TeleSalesLead[]).length ? (
                    (paginated as TeleSalesLead[]).map((lead, index) => (
                      <tr
                        key={lead._id}
                        className="bg-white hover:bg-slate-50/60 transition"
                      >
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {(currentPage - 1) * entriesPerPage + index + 1}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {lead.CustomerName}
                          </div>
                          <div className="text-xs text-slate-500">
                            Lead ID: {lead.TeleSalesLeadsID ?? "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-800">
                          {lead.PhoneNumber}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {lead.RegisteredUserName || "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {lead.FTD || "—"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                              badge(lead.CallStatus),
                            ].join(" ")}
                          >
                            {lead.CallStatus || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {lead.Remarks || "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {lead.Operator || "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {lead.CallDateTime || "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {lead.createdAt?.slice(0, 10) || "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {lead.updatedAt?.slice(0, 10) || "—"}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => openModal(lead)}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                            >
                              <Phone className="h-4 w-4" />
                              Call & Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="py-12 text-center">
                        <div className="text-sm font-semibold text-slate-800">
                          No leads found
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Try changing search term or refresh.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : activeTab === "History" ? (
              <table className="min-w-full">
                <thead className="sticky top-0 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">Operator ID</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Prev</th>
                    <th className="px-4 py-3">New</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {(paginated as HistoryRecord[]).length ? (
                    (paginated as HistoryRecord[]).map((record, index) => (
                      <tr
                        key={record._id}
                        className="bg-white hover:bg-slate-50/60 transition"
                      >
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {(currentPage - 1) * entriesPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3 text-slate-800 font-medium">
                          {record.operatorId}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {record.actionType}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                              badge(record.previousStatus),
                            ].join(" ")}
                          >
                            {record.previousStatus || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                              badge(record.newStatus),
                            ].join(" ")}
                          >
                            {record.newStatus || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {record.remarks || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {record.createdAt?.slice(0, 19).replace("T", " ") ||
                            "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="text-sm font-semibold text-slate-800">
                          No history found
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          No actions recorded yet.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full">
                <thead className="sticky top-0 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Operator</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3">Reminder</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {(paginated as FollowUpRecord[]).length ? (
                    (paginated as FollowUpRecord[]).map((record, index) => (
                      <tr
                        key={record._id}
                        className="bg-white hover:bg-slate-50/60 transition"
                      >
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {(currentPage - 1) * entriesPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {record.leadDetails?.CustomerName || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-800 font-medium">
                          {record.leadDetails?.PhoneNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {record.leadDetails?.Operator || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {record.remarks || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {record.reminderDateTime
                            ?.slice(0, 19)
                            .replace("T", " ") || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {record.createdAt?.slice(0, 19).replace("T", " ") ||
                            "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="text-sm font-semibold text-slate-800">
                          No follow-ups found
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Everything is cleared for now.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {(currentPage - 1) * entriesPerPage + (currentData.length ? 1 : 0)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(currentPage * entriesPerPage, currentData.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {currentData.length}
              </span>{" "}
              entries
            </p>

            <div className="flex flex-wrap gap-1">
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={[
                    "h-9 min-w-[36px] rounded-xl border px-3 text-xs font-semibold transition",
                    currentPage === i + 1
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        {selectedUser && (
          <RemarkModal
            user={selectedUser}
            isOpen={isModalOpen}
            onClose={closeModal}
            onSuccess={async () => {
              if (activeTab === "History") {
                await fetchHistoryUsers();
              } else if (activeTab === "New Leads") {
                await fetchUsers();
              } else {
                await fetchFollowUps();
              }
            }}
          />
        )}
      </div>
    </section>
  );
};

export default NormalUsersTable;
