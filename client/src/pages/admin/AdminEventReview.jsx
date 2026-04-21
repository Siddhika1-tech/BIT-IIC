import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAdminReviewQueue } from "../../../config/api";
import Alert from "../../components/Alert";
import SearchableSelect from "../../components/SearchableSelect";
import { getAuthToken } from "../../utils/auth";

const statusBadgeClass = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminEventReview() {
  const token = useMemo(() => getAuthToken(), []);
  const location = useLocation();
  const [events, setEvents] = useState([]);
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
      const payload = await getAdminReviewQueue(token);
      setEvents(payload.data || []);
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
  }, [token]);

  const statusOptions = useMemo(() => {
    return Array.from(
      new Set(events.map((eventItem) => eventItem.status).filter(Boolean)),
    );
  }, [events]);

  const facultyOptions = useMemo(() => {
    const collected = new Set();

    events.forEach((eventItem) => {
      [
        eventItem.ownerName,
        eventItem.faculty1,
        eventItem.faculty2,
        eventItem.faculty3,
        eventItem.facultyApplied,
      ]
        .filter(Boolean)
        .forEach((value) => collected.add(value));
    });

    return Array.from(collected).sort((left, right) =>
      left.localeCompare(right),
    );
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((eventItem) => {
      if (statusFilter && eventItem.status !== statusFilter) {
        return false;
      }

      if (facultyFilter) {
        const facultyValues = [
          eventItem.ownerName,
          eventItem.faculty1,
          eventItem.faculty2,
          eventItem.faculty3,
          eventItem.facultyApplied,
        ]
          .filter(Boolean)
          .map((value) => String(value));

        if (!facultyValues.includes(facultyFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [events, statusFilter, facultyFilter]);

  const handleReset = () => {
    setStatusFilter("");
    setFacultyFilter("");
  };

  const fromPath = `${location.pathname}${location.search}`;

  return (
    <section className="-m-6 min-h-[calc(100vh-4rem)] bg-white">
      <div className="grid gap-4 border-b border-gray-200 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
        <SearchableSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          emptyLabel="All Statuses"
        />

        <SearchableSelect
          label="Faculty"
          value={facultyFilter}
          onChange={setFacultyFilter}
          options={facultyOptions}
          emptyLabel="All Faculty"
        />

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>

        <div className="flex items-end justify-end">
          <span className="badge-primary">
            {filteredEvents.length} event
            {filteredEvents.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="px-6 py-5">
        {!loading && filteredEvents.length === 0 && (
          <div className="empty-state mx-auto max-w-md py-8">
            <div className="empty-state-icon">
              <svg
                className="mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="empty-state-title">No Events in Review Queue</p>
            <p className="empty-state-description">
              All pending events have been reviewed.
            </p>
          </div>
        )}

        {filteredEvents.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Quarter
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Reviewer's Comment
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.map((eventItem) => (
                  <tr
                    key={eventItem.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {eventItem.eventName || `Event #${eventItem.id}`}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {eventItem.ownerName || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {eventItem.quarter || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                      {eventItem.majorReason || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`${
                          statusBadgeClass[eventItem.status] ||
                          "bg-gray-100 text-gray-700 border-gray-200"
                        } rounded-full px-3 py-1 text-xs font-semibold capitalize border inline-flex`}
                      >
                        {eventItem.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs">
                      <span className="text-xs font-semibold text-gray-600 block mb-1">
                        {eventItem.status === "approved" && "Approved"}
                        {eventItem.status === "rejected" && "Rejected"}
                        {eventItem.status === "pending" && "Pending"}
                      </span>
                      <span className="text-xs text-gray-600 line-clamp-2">
                        {eventItem.reviewerMessage || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {eventItem.createdAt
                        ? new Date(eventItem.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/event/${eventItem.id}`}
                        state={{ from: fromPath }}
                        className="text-primary hover:text-primary-dark font-semibold hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Alert
        isOpen={alertState.isOpen}
        onClose={() =>
          setAlertState((previous) => ({ ...previous, isOpen: false }))
        }
        severity={alertState.severity}
        message={alertState.message}
      />
    </section>
  );
}
