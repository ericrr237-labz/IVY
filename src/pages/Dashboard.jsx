// IVY Dashboard with Sidebar Integration + Live Data
import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Brush, Legend
} from "recharts";
import { motion } from "framer-motion";
import { Bot, X } from "lucide-react";
import { FaEdit, FaChartLine, FaUser, FaCog, FaSignOutAlt, FaChartPie, FaComments } from "react-icons/fa";
import IVYai from "../components/IVYai";
import RecordFormModal from "../components/RecordFormModal";
import MarketingForm from "../components/MarketingForm";
import ivybot from "../assets/ivy-bot.png";
import { useNavigate } from "react-router-dom";
import { getRecords, createRecord } from "../lib/api";
import Sidebar from "../components/Sidebar";




export default function Dashboard() {
  const [showBot, setShowBot] = useState(false);
  const [records, setRecords] = useState([]);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCOGSModal, setShowCOGSModal] = useState(false);
  const [showCACModal, setShowCACModal] = useState(false);
  const [timeRange, setTimeRange] = useState("7");
  const [useSample, setUseSample] = useState(false);
  const marketingData = records.filter(r => r.key === 'marketing');
  const [sidebarMode, setSidebarMode] = useState("menu"); // 'menu' | 'chat'
  const navigate = useNavigate();
  const [cltv, setCltv] = useState(null);
  const [cltvLoading, setCltvLoading] = useState(true);
  const [cltvErr, setCltvErr] = useState("");
 

  useEffect(() => {
  const loadCltv = async () => {
    try {
      const res = await fetch("/api/metrics/cltv"); // or full URL if no proxy
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch CLTV");
      setCltv(data.cltv);
    } catch (e) {
      setCltvErr(e.message || String(e));
    } finally {
      setCltvLoading(false);
    }
  };
  loadCltv();
}, []);

  const fetchRecordsAgain = () => {
  fetch ('/api/records')
    .then(res => res.json())
    .then(data => setRecords(data));
};

  useEffect(() => {
  getRecords().then(setRecords).catch(console.error);
}, []);


  useEffect(() => {
    const load = async () => {
      try {
        // If you don't have a Vite proxy, use the full URL: http://localhost:5001/api/metrics/cltv
        const res = await fetch("/api/metrics/cltv");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch CLTV");
        setCltv(data.cltv);
      } catch (e) {
        setCltvErr(e.message);
      } finally {
        setCltvLoading(false);
      }
    };
    load();
  }, []);

const formatMoney = (n) =>
    typeof n === "number"
      ? n.toLocaleString(undefined, { style: "currency", currency: "USD" })
      : "-";
const handleMemorySaved = (newRec) => setRecords((prev) => [newRec, ...prev]);
const revenueRecords = records.filter((r) => r.type === "revenue");
const expenseRecords = records.filter((r) => r.type === "expenses");
const cogsRecords = records.filter((r) => r.type === "cogs");
const marketingRecords = records.filter((r) => r.key === "marketing");

const totalRevenue = revenueRecords.reduce((sum, r) => sum + Number(r.value || 0), 0);
const totalExpensesRaw = expenseRecords.reduce((sum, r) => sum + Number(r.value || 0), 0);
const totalCOGS = cogsRecords.reduce((sum, r) => sum + Number(r.value || 0), 0);
const totalExpenses = totalExpensesRaw + totalCOGS;

const totalAdSpend = marketingRecords.reduce(
  (sum, r) => sum + Number(r.marketingSpend || 0),
  0
);
const totalNewCust = marketingRecords.reduce(
  (sum, r) => sum + Number(r.newCustomers || 0),
  0
);
const withMA7 = (rows) => {
  let sum = 0;
  const out = rows.map((d, i) => {
    sum += d.revenue || 0;
    if (i >= 7) sum -= rows[i - 7].revenue || 0;
    return { ...d, revMA7: i >= 6 ? +(sum / 7).toFixed(2) : null };
  });
  return out;
};

const COGS = totalCOGS
  ? ((totalRevenue - totalCOGS) / totalRevenue * 100).toFixed(1)
  : '0.0';
const CAC = totalNewCust > 0 ? totalAdSpend / totalNewCust : 0;

const grossProfitMargin = totalRevenue
  ? ((totalRevenue - totalCOGS) / totalRevenue * 100).toFixed(1)
  : '0.0';

const netProfitMargin = totalRevenue
  ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1)
  : '0.0';

const cashFlow = totalRevenue - totalExpenses;
const CLTC = 0; // placeholder

const safeCAC = isNaN(CAC) ? 0 : CAC;
console.log("✅ CAC:", CAC, "SafeCAC:", safeCAC, "Type:", typeof safeCAC);

  const buildChartData = () => {

    console.log("🧪 CAC raw:", CAC, "Type:", typeof CAC);

    const source = useSample
      ? [
          { date: "Day 1", revenue: 12000, netProfit: 3000 },
          { date: "Day 2", revenue: 15000, netProfit: 5000 },
          { date: "Day 3", revenue: 18000, netProfit: 4500 }
        ]
      : records;
    const revMap = {}, expMap = {};
    source.forEach((r) => {
      const dateKey = useSample ? r.date : new Date(r.createdAt).toLocaleDateString();
      const val = useSample ? r.revenue : Number(r.value || 0);
      if (r.type === "revenue" || useSample) revMap[dateKey] = (revMap[dateKey] || 0) + val;
      if ((r.type === "expenses" || r.type === "cogs") && !useSample) expMap[dateKey] = (expMap[dateKey] || 0) + val;
    });
    const dates = Array.from(new Set([...Object.keys(revMap), ...Object.keys(expMap)])).sort((a, b) => new Date(a) - new Date(b));
    const cutoff = new Date();
    if (timeRange !== "all") cutoff.setDate(cutoff.getDate() - Number(timeRange));
    return dates.filter((d) => timeRange === "all" || new Date(d) >= cutoff).map((date) => ({
      date,
      revenue: revMap[date] || 0,
      netProfit: (revMap[date] || 0) - (expMap[date] || 0)
    }));
  };
   const chartData = withMA7(buildChartData());
 

  const ratio = useMemo(() => {
  return (typeof cltv === "number" && typeof CAC === "number" && CAC > 0)
    ? cltv / CAC
    : null;
}, [cltv, CAC]);
const shortMoney = (v) =>
  typeof v === "number"
    ? (Math.abs(v) >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v.toFixed(0)}`)
    : v;
const ChartTooltip = ({ active, label, payload }) => {
  if (!active || !payload?.length) return null;
  const map = Object.fromEntries(payload.map(p => [p.dataKey, p.value]));
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur px-3 py-2 text-xs">
      <div className="text-slate-300 mb-1">{label}</div>
      <div className="space-y-1">
        <div><span className="text-slate-400">Revenue:</span> <b>{shortMoney(+map.revenue || 0)}</b></div>
        <div><span className="text-slate-400">Net:</span> <b>{shortMoney(+map.netProfit || 0)}</b></div>
        {map.revMA7 != null && <div className="text-slate-400">MA(7): <b>{shortMoney(+map.revMA7)}</b></div>}
      </div>
    </div>
  );
};
  return (
    <div className="flex h-screen bg-[#0f1115] text-white">
      
      <Sidebar />

    

      {/* Main Dashboard */}
  <motion.div className="flex-1 p-8 overflow-y-auto">
    {/* Title */}
    <div className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">
      Financial Overview
    </div>




{/* Metrics Grid */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
  {/* Total Revenue */}
  <motion.div className="bg-[#1a1e27] p-6 rounded-2xl shadow-lg flex justify-between items-start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div>
      <h3 className="text-xl font-semibold mb-2">💰 Total Revenue</h3>
      <p className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
    </div>
    <FaEdit className="text-gray-400 cursor-pointer hover:text-white mt-1" onClick={() => setShowRevenueModal(true)} />
  </motion.div>

  {/* Gross Profit Margin */}
  <motion.div className="bg-[#1a1e27] p-6 rounded-2xl shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
    <h3 className="text-xl font-semibold mb-2">📊 Gross Profit Margin</h3>
    <p className={`text-2xl font-bold ${grossProfitMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>{grossProfitMargin}%</p>
  </motion.div>

  {/* Net Profit Margin */}
  <motion.div className="bg-[#1a1e27] p-6 rounded-2xl shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
    <h3 className="text-xl font-semibold mb-2">🧮 Net Profit Margin</h3>
    <p className={`text-2xl font-bold ${netProfitMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>{netProfitMargin}%</p>
  </motion.div>

  {/* Cash Flow */}
  <motion.div className="bg-[#1a1e27] p-6 rounded-2xl shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
    <h3 className="text-xl font-semibold mb-2">💵 Cash Flow</h3>
    <p className={`text-2xl font-bold ${cashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>${cashFlow.toLocaleString()}</p>
  </motion.div>

  
  {/*COGS*/}
  <motion.div className="bg-[#1a1e27] p-6 rounded-2xl shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
    <h3 className="text-xl font-semibold mb-2">⚙️ COGS</h3>
    <p className={`text-2xl font-bold ${COGS >= 0 ? 'text-green-400' : 'text-red-400'}`}>${COGS.toLocaleString()}</p>
  </motion.div>
  {/* CAC */}
  <motion.div
    className="bg-[#1a1e27] p-6 rounded-2xl shadow-lg"
   initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
>
   <h3 className="text-xl font-semibold mb-2">📈 CAC</h3>
    <p className="text-2xl font-bold text-blue-400">
  {typeof CAC === 'number' && !isNaN(CAC)
    ? `$${CAC.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    : 'Invalid CAC'}
</p>

</motion.div>




  {/* CLTC Placeholder */}
  {/* CLTV */}
<motion.div
  className="bg-[#1a1e27] p-6 rounded-2xl shadow-lg"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6 }}
>
  <h3 className="text-xl font-semibold mb-2">💡 CLTV</h3>
  <p className="text-2xl font-bold text-blue-400">
    {typeof cltv === "number" && !isNaN(cltv)
      ? cltv.toLocaleString(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 2 })
      : "Invalid CLTV"}
  </p>
</motion.div>

<motion.div className="bg-[#1a1e27] p-6 rounded-2xl shadow-lg"
  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
  <h3 className="text-xl font-semibold mb-2">📊 CLTV : CAC Ratio</h3>
  <p className="text-2xl font-bold text-purple-400">
    {typeof ratio === "number" && isFinite(ratio) ? `${ratio.toFixed(2)}x` : "—"}
  </p>
  <div className="text-xs text-zinc-500">Customer value vs acquisition cost</div>
</motion.div>

</div>
<motion.div className="min-h-screen bg-[#0f1115] text-white p-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
    

      {/* Input Buttons */}
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setShowExpenseModal(true)} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Add Expense</button>
      </div>
   
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setShowCOGSModal(true)} className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700">Add COGS</button>
      </div>


      {/* Chart Section */}
      <div className="bg-[#1a1e27] p-6 rounded-2xl shadow-lg mb-10">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold">Revenue vs Net Profit</h2>
  </div>

  <div className="flex items-center space-x-4 mb-4">
    {["7", "30", "all"].map((tr) => (
      <button
        key={tr}
        onClick={() => setTimeRange(tr)}
        className={`px-3 py-1 rounded border ${timeRange === tr ? "border-blue-400" : "border-gray-600"}`}
      >
        {tr === "all" ? "All time" : `Last ${tr} days`}
      </button>
    ))}
    <label className="flex items-center space-x-2">
      <input type="checkbox" checked={useSample} onChange={(e) => setUseSample(e.target.checked)} />
      <span>Use Sample Data</span>
    </label>
  </div>
<ResponsiveContainer width="100%" height={320}>
  <AreaChart
    data={chartData}
    margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
  >
    <defs>
      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45}/>
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
      </linearGradient>
      <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
      </linearGradient>
    </defs>

    <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />

    <XAxis
      dataKey="date"
      tick={{ fill: "#94a3b8", fontSize: 12 }}
      padding={{ left: 10, right: 10 }}
    />
    <YAxis
      tick={{ fill: "#94a3b8", fontSize: 12 }}
      width={64}
      tickFormatter={shortMoney}
    />

    {/* Zero line so losses are obvious */}
    <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />

    <Tooltip content={<ChartTooltip />} />
    <Legend wrapperStyle={{ color: "#cbd5e1" }} />

    {/* Smooth, rounded strokes; dots off for cleaner look */}
    <Area
      type="monotone" dataKey="revenue" name="Revenue"
      stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#revGrad)"
      dot={false} activeDot={{ r: 4 }}
    />
    <Area
      type="monotone" dataKey="netProfit" name="Net Profit"
      stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#netGrad)"
      dot={false} activeDot={{ r: 4 }}
    />
    {/* Moving average line (no fill) */}
    <Area
      type="monotone" dataKey="revMA7" name="Revenue MA(7)"
      stroke="#a78bfa" strokeWidth={2} fillOpacity={0}
      dot={false} activeDot={false}  connectNulls  
    />

    {/* Drag to zoom; shows a mini timeline */}
    <Brush
      dataKey="date"
      height={22}
      travellerWidth={10}
      stroke="#334155"
    />
  </AreaChart>
</ResponsiveContainer>

</div>

<section className="mt-6">
  <MarketingForm onSuccess={(newRec) => setRecords((prev) => [newRec, ...prev])} />
</section>

      {/* Modals */}
      <RecordFormModal isOpen={showRevenueModal} onClose={() => setShowRevenueModal(false)} type="revenue" onSave={async (entry) => {
       try {
          const saved = await createRecord(entry);           // ← POST to same API
          setRecords((prev) => [saved, ...prev]);            // update local
          window.dispatchEvent(new Event("ivy:records-updated")); // ping Reports
        } catch (e) {
          console.error(e);
          alert("Failed to save revenue. Check server.");
        }

      }} />

      <RecordFormModal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} type="expenses" onSave={async (entry) => {
       try {
          const saved = await createRecord(entry);           // ← POST to same API
          setRecords((prev) => [saved, ...prev]);            // update local
          window.dispatchEvent(new Event("ivy:records-updated")); // ping Reports
        } catch (e) {
          console.error(e);
          alert("Failed to save revenue. Check server.");
        }
      }} />

      <RecordFormModal isOpen={showCOGSModal} onClose={() => setShowCOGSModal(false)} type="cogs" onSave={async (entry) => {
        try {
          const saved = await createRecord(entry);           // ← POST to same API
          setRecords((prev) => [saved, ...prev]);            // update local
          window.dispatchEvent(new Event("ivy:records-updated")); // ping Reports
        } catch (e) {
          console.error(e);
          alert("Failed to save revenue. Check server.");
        }
      }} />

      <RecordFormModal isOpen={showCACModal} onClose={() => setShowCACModal(false)} type="cac" onSave={async (entry) => {
        try {
          const saved = await createRecord(entry);           // ← POST to same API
          setRecords((prev) => [saved, ...prev]);            // update local
          window.dispatchEvent(new Event("ivy:records-updated")); // ping Reports
        } catch (e) {
          console.error(e);
          alert("Failed to save revenue. Check server.");
        }
      }} />
    </motion.div>
      
      </motion.div>
    </div>
  );
}
