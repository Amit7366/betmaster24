"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";
import { Phone } from "lucide-react";
import { RemarkModal } from "@/components/modal/RemarkModal";
import { getUserInfo } from "@/services/actions/auth.services";

// ✅ Interface for leads
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

// ✅ Interface for history records
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

const NormalUsersTable = () => {
  const [leads, setLeads] = useState<TeleSalesLead[]>([]);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("New Leads");
  const [selectedUser, setSelectedUser] = useState<TeleSalesLead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = getFromLocalStorage("accessToken");
  const userInfo = getUserInfo();

  // ✅ Fetch new leads (Operator === "")
  const fetchUsers = async () => {
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
      const unassignedLeads = result.data.leads.filter(
        (lead: TeleSalesLead) => !lead.Operator
      );
      setLeads(unassignedLeads);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load leads");
    }
  };

  // ✅ Fetch history records
  const fetchHistoryUsers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tele/tele-sales-leads/AllAdmin/history`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      const result = await res.json();
      setHistoryRecords(result.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load history leads");
    }
  };

  const openModal = (user: TeleSalesLead) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  // ✅ On mount, fetch default tab
  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  // ✅ Fetch dynamically based on tab
  useEffect(() => {
    if (!token) return;
    if (activeTab === "History") {
      fetchHistoryUsers();
    } else {
      fetchUsers();
    }
  }, [activeTab]);

  // ✅ Data filtering + pagination logic
  const currentData =
    activeTab === "History"
      ? historyRecords
      : leads.filter((u) =>
          u.CustomerName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const pageCount = Math.ceil(currentData.length / entriesPerPage);
  const paginated = currentData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div className="p-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">Show</label>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="border px-2 py-1 rounded text-sm"
          >
            {[30, 50, 70].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <span className="text-sm">entries</span>
        </div>
        {activeTab !== "History" && (
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="border px-3 py-2 rounded w-full md:w-64 text-sm"
          />
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-2">
        {["New Leads", "Follow Up", "History"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-md font-medium ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {activeTab !== "History" ? (
          // ✅ Leads table
          <table className="w-full text-sm text-left border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="p-3">S.L.</th>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Phone Number</th>
                <th className="p-3">Registered User</th>
                <th className="p-3">FTD</th>
                <th className="p-3">Call Status</th>
                <th className="p-3">Remarks</th>
                <th className="p-3">Operator</th>
                <th className="p-3">Call DateTime</th>
                <th className="p-3">Created At</th>
                <th className="p-3">Updated At</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {(paginated as TeleSalesLead[]).map((lead, index) => (
                <tr key={lead._id} className="border-t bg-white">
                  <td className="p-3">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>
                  <td className="p-3">{lead.CustomerName}</td>
                  <td className="p-3">{lead.PhoneNumber}</td>
                  <td className="p-3">{lead.RegisteredUserName}</td>
                  <td className="p-3">{lead.FTD}</td>
                  <td className="p-3">{lead.CallStatus}</td>
                  <td className="p-3">{lead.Remarks}</td>
                  <td className="p-3">{lead.Operator}</td>
                  <td className="p-3">{lead.CallDateTime}</td>
                  <td className="p-3">{lead.createdAt?.slice(0, 10)}</td>
                  <td className="p-3">{lead.updatedAt?.slice(0, 10)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => openModal(lead)}
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Phone size={14} /> Call
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // ✅ History table
          <table className="w-full text-sm text-left border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="p-3">S.L.</th>
                <th className="p-3">Operator ID</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Previous Status</th>
                <th className="p-3">New Status</th>
                <th className="p-3">Remarks</th>
                <th className="p-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {(paginated as HistoryRecord[]).map((record, index) => (
                <tr key={record._id} className="border-t bg-white">
                  <td className="p-3">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>
                  <td className="p-3">{record.operatorId}</td>
                  <td className="p-3">{record.actionType}</td>
                  <td className="p-3">{record.previousStatus}</td>
                  <td className="p-3">{record.newStatus}</td>
                  <td className="p-3">{record.remarks}</td>
                  <td className="p-3">
                    {record.createdAt?.slice(0, 19).replace("T", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <p>
          Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
          {Math.min(currentPage * entriesPerPage, currentData.length)} of{" "}
          {currentData.length} entries
        </p>
        <div className="flex flex-wrap gap-1">
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

      {/* Modal */}
      {selectedUser && (
        <RemarkModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSuccess={() => {
            if (activeTab === "History") {
              fetchHistoryUsers();
            } else {
              fetchUsers();
            }
          }}
        />
      )}
    </div>
  );
};

export default NormalUsersTable;
