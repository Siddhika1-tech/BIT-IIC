import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CirclePlus, Search, RotateCcw, Eye, Download } from "lucide-react";
import {
  getAdminApprovedBusinesses,
  getAdminApprovedBusinessFilterOptions,
} from "../../../config/api";
import Alert from "../../components/Alert";
import SearchableSelect from "../../components/SearchableSelect";
import { getAuthToken } from "../../utils/auth";

const statusBadgeClass = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminBusinessApprovedDashboard() {
  const token = useMemo(() => getAuthToken(), []);
  const location = useLocation();
  const [businesses, setBusinesses] = useState([]);
  const [facultyFilter, setFacultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: "",
    severity: "info",
  });

  const loadApproved = async () => {
    setLoading(true);
    try {
      const payload = await getAdminApprovedBusinesses({
        token,
        facultyName: facultyFilter || undefined,
      });
      const filtered = (payload.data || []).filter(
        (b) => !statusFilter || b.status === statusFilter
      );
      setBusinesses(filtered);
    } catch (error) {
      setAlertState({
        isOpen: true,
        message: error.message || "Failed to fetch approved businesses.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApproved();
  }, [token, facultyFilter, statusFilter]);

  const [facultyOptions, setFacultyOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const payload = await getAdminApprovedBusinessFilterOptions(token);
        setFacultyOptions(payload.data?.faculties || []);
        setStatusOptions(payload.data?.statuses || []);
      } catch (error) {
        console.error("Failed to fetch filter options:", error.message);
      }
    };

    loadFilterOptions();
  }, [token]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Alert
        message={alertState.message}
        severity={alertState.severity}
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Approved Businesses</h1>
        <Link
          to="/admin/business-review"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <CirclePlus size={20} />
          Review Queue
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchableSelect
            label="Faculty"
            value={facultyFilter}
            onChange={setFacultyFilter}
            options={facultyOptions}
            placeholder="Filter by faculty..."
          />
          <SearchableSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="Filter by status..."
          />
          <button
            onClick={() => {
              setFacultyFilter("");
              setStatusFilter("");
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : businesses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No approved businesses found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Submitted Date
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((business) => (
                  <tr
                    key={business.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {business.owner_name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusBadgeClass[business.status] ||
                          "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {business.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {business.submitted_date
                        ? new Date(business.submitted_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-center text-sm flex justify-center gap-2">
                      <Link
                        to={`/business/${business.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
