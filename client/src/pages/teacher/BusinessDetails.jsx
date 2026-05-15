import React, { useEffect, useMemo, useState } from "react";
import { createBusinessDetails } from "../../../config/api";
import { getAuthToken, getAuthUser } from "../../utils/auth";
import Alert from "../../components/Alert";

const BUSINESS_DETAILS_STORAGE_KEY = "business-details-form-values";

export default function BusinessDetails() {
  const token = useMemo(() => getAuthToken(), []);
  const user = useMemo(() => getAuthUser(), []);
  const [formValues, setFormValues] = useState({
    businessName: "",
    description: "",
    document: null,
  });
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: "",
    severity: "info",
  });

  // Load saved values from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(BUSINESS_DETAILS_STORAGE_KEY);
    if (saved) {
      try {
        setFormValues(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load saved form values:", error);
      }
    }
  }, []);

  // Save form values to localStorage
  const saveFormValues = (values) => {
    const toSave = { ...values };
    delete toSave.document;
    localStorage.setItem(BUSINESS_DETAILS_STORAGE_KEY, JSON.stringify(toSave));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValues = { ...formValues, [name]: value };
    setFormValues(newValues);
    saveFormValues(newValues);
  };

  const handleFileChange = (e) => {
    const { files } = e.target;
    const newValues = { ...formValues, document: files?.[0] || null };
    setFormValues(newValues);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formValues.businessName.trim()) {
      setAlertState({
        isOpen: true,
        message: "Business name is required.",
        severity: "error",
      });
      return;
    }

    if (!formValues.description.trim()) {
      setAlertState({
        isOpen: true,
        message: "Description is required.",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("businessName", formValues.businessName);
      formData.append("description", formValues.description);
      if (formValues.document) {
        formData.append("document", formValues.document);
      }

      const payload = await createBusinessDetails(formData, token);

      setAlertState({
        isOpen: true,
        message: "Business details submitted successfully!",
        severity: "success",
      });

      localStorage.removeItem(BUSINESS_DETAILS_STORAGE_KEY);
      setFormValues({
        businessName: "",
        description: "",
        document: null,
      });
    } catch (error) {
      setAlertState({
        isOpen: true,
        message: error.message || "Failed to submit business details.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Alert
        message={alertState.message}
        severity={alertState.severity}
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-6">Business Details Form</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              name="businessName"
              value={formValues.businessName}
              onChange={handleInputChange}
              placeholder="Enter business name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formValues.description}
              onChange={handleInputChange}
              placeholder="Enter business description"
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Document (Optional)
            </label>
            <input
              type="file"
              name="document"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: PDF, JPG, JPEG, PNG (Max 2MB)
            </p>
            {formValues.document && (
              <p className="text-sm text-gray-700 mt-2">
                Selected: {formValues.document.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
