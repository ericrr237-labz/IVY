// src/lib/api.js
export const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:5001").replace(/\/$/, "");

function readAuth() {
  try { return JSON.parse(localStorage.getItem("auth") || "{}"); } catch { return {}; }
}
function getAccess() {
  const a = readAuth();
  return a?.tokens?.access || localStorage.getItem("access") || "";
}
function getRefresh() {
  const a = readAuth();
  return a?.tokens?.refresh || localStorage.getItem("refresh") || "";
}
export function setAuth(v) { localStorage.setItem("auth", JSON.stringify(v)); }

export async function fetchWithAuth(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = new Headers(opts.headers || {});
  headers.set("Content-Type", "application/json");
  const access = getAccess();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  let res = await fetch(url, { ...opts, headers });
  if (res.status !== 401) return res;

  const refresh = getRefresh();
  if (!refresh) return res;

  const rr = await fetch(`${API_BASE}/api/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh })
  });
  if (!rr.ok) return res;

  const data = await rr.json(); // { tokens: { access } }
  const cur = readAuth();
  const updated = { ...cur, tokens: { ...(cur?.tokens || {}), access: data.tokens.access } };
  setAuth(updated);

  const retryHeaders = new Headers(headers);
  retryHeaders.set("Authorization", `Bearer ${data.tokens.access}`);
  return fetch(url, { ...opts, headers: retryHeaders });
}

/* ---------- Normalizers & helpers ---------- */
function normalizeRecord(r = {}) {

  const key = r.key ?? r.type ?? r.kind ?? r.category ?? "unknown";
  const marketingSpend = Number(
    r.marketingSpend ??
    r.meta?.marketingSpend ??
    (key === "marketing" ? r.value : 0)
  );

  const newCustomers = Number(
    r.newCustomers ??
    r.meta?.newCustomers ?? 0
  );

  return {
     _id: r._id,
    key,
    value: typeof r.value === "number" ? r.value : Number(r.amount ?? r.price ?? 0),
    date: r.date ? new Date(r.date) : new Date(),
    note: r.note ?? r.description ?? "",
    orgId: r.orgId,
    createdBy: r.createdBy,
    marketingSpend,   // <-- keep
    newCustomers,     // <-- keep
    meta: r.meta || {}
  };
}
function unwrapItems(payload) {
  // Accept {ok,items:[]}, {records:[]}, or [] directly
  if (Array.isArray(payload)) return payload;
  if (payload?.items && Array.isArray(payload.items)) return payload.items;
  if (payload?.records && Array.isArray(payload.records)) return payload.records;
  return [];
}

/* ---------- Public API used by UI ---------- */
export async function getRecords() {
  const res = await fetchWithAuth("/api/records");
  if (!res.ok) throw new Error("getRecords failed");
  const raw = await res.json();
  const items = unwrapItems(raw).map(normalizeRecord);
  return items; // ALWAYS an array
}

export async function createRecord(entry = {}) {
  // accept both legacy and new shapes
  const payload = {
    key: entry.key ?? entry.kind ?? entry.type ?? entry.category ?? "revenue",
    value: typeof entry.value === "number" ? entry.value : Number(entry.amount ?? entry.price ?? 0),
    note: entry.note ?? entry.description ?? "",
    date: entry.date ?? new Date().toISOString(),
    category: entry.category ?? entry.key ?? entry.kind ?? undefined,
    marketingSpend: entry.marketingSpend,
    newCustomers: entry.newCustomers,
  };
  const res = await fetchWithAuth("/api/records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("createRecord failed");
  const data = await res.json();
  // server returns { ok, item }; normalize to array-style consumer if needed
  return data?.item ? normalizeRecord(data.item) : data;
}

export async function getCLTV() {
  const res = await fetchWithAuth("/api/metrics/cltv");
  if (!res.ok) throw new Error("getCLTV failed");
  const data = await res.json();
  // accept { cltv }, { value }, or number
  return typeof data === "number" ? data : (data.cltv ?? data.value ?? 0);
}
