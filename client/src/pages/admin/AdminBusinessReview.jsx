import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAdminBusinessReviewQueue } from "../../../config/api";
import Alert from "../../components/Alert";
import SearchableSelect from "../../components/SearchableSelect";
import { getAuthToken } from "../../utils/auth";

const statusBadgeClass = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminBusinessReview() {
  const token = useMemo(() => getAuthToken(), []);
  const location = useLocation();
  const [businesses, setBusinesses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: "",
    severity: "info",
  });

  const loadQueue = async () => {
    setLoading(true);
    try {
      const payload = await getAdminBusinessReviewQueue(token);
      setBusinesses(payload.data || []);
    } catch (error) {
      setAlertState({
        isOpen: true,
        message: error.message || "Failed to fetch review queue.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [token, statusFilter, facultyFilter]);

  const statusOptions = useMemo(() => {
    return Array.from(
      new Set(businesses.map((item) => item.status).filter(Boolean)),
    ).sort();
  }, [businesses]);

  const facultyOptions = useMemo(() => {
    return Array.from(
      new Set(businesses.map((item) => item.owner_name).filter(Boolean)),
    ).sort();
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (facultyFilter && item.owner_name !== facultyFilter) return false;
      return true;
    });
  }, [businesses, statusFilter, facultyFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Alert
        message={alertState.message}
        severity={alertState.severity}
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Business Review Queue</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="Filter by status..."
          />
          <SearchableSelect
            label="Faculty"
            value={facultyFilter}
            onChange={setFacultyFilter}
            options={facultyOptions}
            placeholder="Filter by faculty..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No businesses in the review queue.
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
                {filteredBusinesses.map((business) => (
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
                    <td className="px-6 py-4 text-center text-sm">
                      <Link
                        to={`/business/${business.id}`}
                        className="inline-px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Review
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
