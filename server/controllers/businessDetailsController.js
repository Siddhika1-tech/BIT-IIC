import db from "../config/db.js";
import { randomUUID } from "crypto";
import { sendEmail } from "../utils/mail.js";

const getBodyValue = (body, key) => String(body?.[key] ?? "").trim();

const getBodyBoolean = (body, key) =>
  String(body?.[key] ?? "").toLowerCase() === "true";

const getBodyNumber = (body, key) => {
  const rawValue = String(body?.[key] ?? "").trim();
  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);
  return Number.isNaN(parsed) ? null : parsed;
};

const getUploadedFilePath = (files, fieldName) => {
  const uploadedFile = files?.[fieldName]?.[0];
  if (!uploadedFile) {
    return null;
  }

  return `/uploads/business-details/${uploadedFile.filename}`;
};

const getQueryValue = (query, key) => String(query?.[key] ?? "").trim();

const getNumericUserId = (requestUserId) => {
  const parsed = Number(requestUserId);
  return Number.isFinite(parsed) ? parsed : null;
};

export const createBusinessDetails = async (request, response) => {
  try {
    response.status(501).json({ message: "Not yet implemented" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

export const deleteBusinessByAdmin = async (request, response) => {
  try {
    response.status(501).json({ message: "Not yet implemented" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

export const getApprovedBusinessFilterOptionsForAdmin = async (
  request,
  response,
) => {
  try {
    response.status(501).json({ message: "Not yet implemented" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

export const getApprovedBusinessesForAdmin = async (request, response) => {
  try {
    response.status(501).json({ message: "Not yet implemented" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

export const getBusinessById = async (request, response) => {
  try {
    response.status(501).json({ message: "Not yet implemented" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

export const getMyBusinessesForFaculty = async (request, response) => {
  try {
    response.status(501).json({ message: "Not yet implemented" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

export const getReviewQueueForAdmin = async (request, response) => {
  try {
    response.status(501).json({ message: "Not yet implemented" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

export const reviewBusinessByAdmin = async (request, response) => {
  try {
    response.status(501).json({ message: "Not yet implemented" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};
