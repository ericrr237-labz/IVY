// src/lib/api.js
export const API_BASE =
  process.env.NODE_ENV === "development" ? "" : (process.env.REACT_APP_API_URL || "");

export const getRecords = () =>
  fetch(`${API_BASE}/api/records`).then(r => r.json());

export const createRecord = (entry) =>
  fetch(`${API_BASE}/api/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  }).then(r => r.json());
