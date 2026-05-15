import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBusinessById } from "../../../config/api";
import { getAuthToken } from "../../utils/auth";
import Alert from "../../components/Alert";

export default function BusinessDetails() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const token = useMemo(() => getAuthToken(), []);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        if (!businessId) {
          throw new Error("Business ID is required");
        }
        const payload = await getBusinessById({ businessId, token });
        setBusiness(payload.data || {});
      } catch (error) {
        setAlertState({
          isOpen: true,
          message: error.message || "Failed to load business details.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [businessId, token]);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!business || Object.keys(business).length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">No data available.</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Alert
        message={alertState.message}
        severity={alertState.severity}
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
      />

      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
      >
        ← Back
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-6">Business Details</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(business).map(([key, value]) => (
            <div key={key} className="border-b border-gray-200 pb-4">
              <label className="text-sm font-semibold text-gray-700 uppercase">
                {key.replace(/_/g, " ")}
              </label>
              <p className="text-gray-900 mt-1">
                {value === null || value === undefined ? "-" : String(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
