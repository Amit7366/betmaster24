"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";
import { useAuth } from "@/redux/hook/useAuth";

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
  const operatorId = user?.operatorId || "A-0016"; // fallback if not found

  const fetchMyLeads = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tele/tele-sales-leads/my-customer?operatorId=${operatorId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
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
  }, [token]);

  // Filtered + Paginated data
  const filtered = leads.filter(
    (lead) =>
      lead.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.PhoneNumber.includes(searchTerm)
  );

  const pageCount = Math.ceil(filtered.length / entriesPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        My Tele Sales Leads
      </h2>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">Show</label>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="border px-2 py-1 rounded text-sm"
          >
            {[5, 10, 15, 25].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <span className="text-sm">entries</span>
        </div>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or phone..."
          className="border px-3 py-2 rounded w-full md:w-64 text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-medium">
            <tr>
              <th className="p-3">S.L</th>
              <th className="p-3">Customer Name</th>
              <th className="p-3">Phone Number</th>
              <th className="p-3">Operator</th>
              <th className="p-3">Call Status</th>
              <th className="p-3">Call Remarks</th>
              <th className="p-3">Contact Purpose</th>
              <th className="p-3">Created</th>
              <th className="p-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((lead, index) => (
                <tr
                  key={lead._id}
                  className="border-t bg-white hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>
                  <td className="p-3 font-semibold">{lead.CustomerName}</td>
                  <td className="p-3">{lead.PhoneNumber}</td>
                  <td className="p-3">{lead.Operator}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.CallStatus === "Interested"
                          ? "bg-green-100 text-green-700"
                          : lead.CallStatus === "Not Interested"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {lead.CallStatus || "N/A"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700">
                    {lead.CallRemarks || "-"}
                  </td>
                  <td className="p-3">{lead.ContactPurpose || "-"}</td>
                  <td className="p-3 text-gray-600">
                    {lead.CreatedDateTime || "-"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {new Date(lead.UpdatedDateTime).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="p-4 text-center text-gray-500 italic"
                >
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <p>
          Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
          {Math.min(currentPage * entriesPerPage, filtered.length)} of{" "}
          {filtered.length} entries
        </p>
        <div className="flex gap-1">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyTeleCustomersPage;
