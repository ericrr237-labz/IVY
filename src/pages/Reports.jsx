import React, { useEffect, useMemo, useState } from "react";
import { FaChartLine, FaChartPie, FaUser, FaCog, FaComments, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ivybot from "../assets/ivy-bot.png";
import { getRecords } from "../lib/api";
import Sidebar from "../components/Sidebar";

const pretty = (n) =>
  (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const recType = (r) => (r?.key || r?.type || "").toLowerCase();
const isExpenseLike = (r) => ["expense", "expenses"].includes(recType(r));

export default function Reports() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sidebarMode, setSidebarMode] = useState("menu");

  const load = async () => {
    setLoading(true);
    try {
      setRecords(await getRecords());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); 

  useEffect(() => {
    const h = () => load();
    window.addEventListener("ivy:records-updated", h);
    window.addEventListener("focus", h);             // refresh on tab focus
    return () => {
          window.removeEventListener("ivy:records-updated", h);
          window.removeEventListener("focus", h);
     };
    }, []);

  const filtered = useMemo(() => {
   if (filter === "all") return records;
   if (filter === "expenses") return records.filter(isExpenseLike);
   return records.filter((r) => recType(r) === filter);
 }, [records, filter]);

   const totals = useMemo(() => {
   let rev = 0, exp = 0, cogs = 0;
   for (const r of records) {
     const t = recType(r);
     const v = Number(r.value || 0);
     if (t === "revenue") rev += v;
     else if (isExpenseLike(r)) exp += v;
     else if (t === "cogs") cogs += v;
   }
   return { rev, exp, cogs, net: rev - (exp + cogs) };
 }, 
 
 [records]);
  const exportCSV = () => {
 const headers = ["date","type","label","value"];
 const rows = filtered.map(r => ([
   r.date ? new Date(r.date).toLocaleString() :
            r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
   recType(r),
   r.label || r.note || r.key || "",
   Number(r.value || 0)
 ]));
    const csv = [headers, ...rows].map(a => a.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ivy_reports_${filter}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-[#0f1115] text-white">
     <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">Reports</div>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1a1e27] p-4 rounded-xl shadow">
            <div className="text-gray-400 text-xs">Total Revenue</div>
            <div className="text-green-400 text-xl font-bold">${pretty(totals.rev)}</div>
          </div>
          <div className="bg-[#1a1e27] p-4 rounded-xl shadow">
            <div className="text-gray-400 text-xs">Total Expenses</div>
            <div className="text-red-400 text-xl font-bold">${pretty(totals.exp)}</div>
          </div>
          <div className="bg-[#1a1e27] p-4 rounded-xl shadow">
            <div className="text-gray-400 text-xs">Total COGS</div>
            <div className="text-red-300 text-xl font-bold">${pretty(totals.cogs)}</div>
          </div>
          <div className="bg-[#1a1e27] p-4 rounded-xl shadow">
            <div className="text-gray-400 text-xs">Net</div>
            <div className={`${totals.net >= 0 ? "text-green-400" : "text-red-400"} text-xl font-bold`}>
              ${pretty(totals.net)}
            </div>
          </div>
        </div>

        {/* Filters + Export */}
        <div className="flex items-center gap-2 mb-4">
          {["all","revenue","expenses","cogs"].map(k => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1 rounded border ${filter===k ? "border-blue-400 text-blue-300" : "border-gray-600 text-gray-300"}`}
            >
              {k === "all" ? "All" : k[0].toUpperCase()+k.slice(1)}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={exportCSV} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700">
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#1a1e27] rounded-xl overflow-hidden border border-gray-700/60">
          <div className="grid grid-cols-4 px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
            <div>Date</div><div>Type</div><div>Label</div><div className="text-right">Amount</div>
          </div>
          <div className="max-h-[55vh] overflow-y-auto divide-y divide-gray-800">
            {loading ? (
              <div className="p-4 text-gray-400 text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-gray-400 text-sm">No records yet.</div>
            ) : (
              filtered.map(r => (
                <div key={r._id || r.id} className="grid grid-cols-4 px-4 py-2 text-sm">
                  <div>{r.date ? new Date(r.date).toLocaleDateString()
                  : r.createdAt ? new Date(r.createdAt).toLocaleDateString()
                  : "-"}</div>
                  <div className="capitalize">{recType(r) || "-"}</div>
                  <div className="truncate">{r.label || r.note || r.key || "-"}</div>
                  <div className="text-right">${pretty(r.value)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
