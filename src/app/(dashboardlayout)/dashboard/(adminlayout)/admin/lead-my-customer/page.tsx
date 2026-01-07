"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";
import { useAuth } from "@/redux/hook/useAuth";
import { Search, X, Users2, Phone, CalendarClock } from "lucide-react";

interface Lead {
  _id: string;
  TeleSalesLeadsID: number;
  PhoneNumber: string;
  CustomerName: string;
  Operator: string;
  Remarks: string;
  CallStatus: string;
  CallRemarks: string;
  CreatedDateTime: string;
  CallDateTime: string;
  UpdatedDateTime: string;
  ContactPurpose: string;
  FTD: string;
  RegisteredUserName: string;
}

const MyTeleCustomersPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const token = getFromLocalStorage("accessToken");
  const { user } = useAuth();
  const operatorId = user?.operatorId || "A-0016"; // fallback

  const fetchMyLeads = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tele/tele-sales-leads/my-customer?operatorId=${operatorId}`,
        { headers: { Authorization: `${token}` } }
      );

      const result = await res.json();

      if (result.success) {
        setLeads(result.data.leads || []);
      } else {
        toast.error(result.message || "Failed to load leads.");
      }
    } catch (error) {
      toast.error("Failed to fetch tele sales leads.");
    }
  };

  useEffect(() => {
    if (token) fetchMyLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // UX: reset page on filters changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return leads;

    return leads.filter((lead) => {
      const name = (lead.CustomerName || "").toLowerCase();
      const phone = lead.PhoneNumber || "";
      return name.includes(q) || phone.includes(searchTerm);
    });
  }, [leads, searchTerm]);

  const pageCount = Math.ceil(filtered.length / entriesPerPage);

  const paginated = useMemo(() => {
    return filtered.slice(
      (currentPage - 1) * entriesPerPage,
      currentPage * entriesPerPage
    );
  }, [filtered, currentPage, entriesPerPage]);

  const statusPill = (s: string) => {
    const v = (s || "").toLowerCase();
    if (v === "interested")
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    if (v === "not interested")
      return "bg-rose-50 text-rose-700 ring-rose-100";
    if (v === "follow up" || v === "followup")
      return "bg-amber-50 text-amber-700 ring-amber-100";
    return "bg-slate-100 text-slate-700 ring-slate-200";
  };

  return (
    <section className="min-h-screen bg-slate-50/70 py-8">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100">
              <Users2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              My Tele Sales Leads
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Operator: <span className="font-semibold text-slate-800">{operatorId}</span>{" "}
            • Total: <span className="font-semibold text-slate-800">{filtered.length}</span>
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            {/* Left */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
              >
                {[5, 10, 15, 25].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-sm text-slate-600">entries</span>
            </div>

            {/* Right */}
            <div className="relative w-full sm:w-[360px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or phone..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
              />
              {!!searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">SL</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3">Call Status</th>
                  <th className="px-4 py-3">Call Remarks</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {paginated.length > 0 ? (
                  paginated.map((lead, index) => (
                    <tr
                      key={lead._id}
                      className="bg-white hover:bg-slate-50/60 transition"
                    >
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {(currentPage - 1) * entriesPerPage + index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {lead.CustomerName || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          Lead ID: {lead.TeleSalesLeadsID ?? "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2 text-slate-800">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-inset ring-slate-200">
                            <Phone className="h-4 w-4 text-slate-600" />
                          </span>
                          <span className="font-medium">
                            {lead.PhoneNumber || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {lead.Operator || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                            statusPill(lead.CallStatus),
                          ].join(" ")}
                        >
                          {lead.CallStatus || "N/A"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {lead.CallRemarks || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {lead.ContactPurpose || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        <div className="inline-flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-slate-400" />
                          <span className="text-xs">
                            {lead.CreatedDateTime || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {lead.UpdatedDateTime
                          ? new Date(lead.UpdatedDateTime).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="text-sm font-semibold text-slate-800">
                        No leads found
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Try a different search term.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {(currentPage - 1) * entriesPerPage + (filtered.length ? 1 : 0)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(currentPage * entriesPerPage, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {filtered.length}
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
      </div>
    </section>
  );
};

export default MyTeleCustomersPage;
