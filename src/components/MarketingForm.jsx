// src/components/MarketingForm.jsx (drop-in)
import { useState } from "react";

function MarketingForm({ onSuccess }) {
  const [marketingSpend, setMarketingSpend] = useState("");
  const [newCustomers, setNewCustomers] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const spend = Number.parseFloat(marketingSpend);
    const customers = Number.parseInt(newCustomers, 10);

    if (!Number.isFinite(spend) || !Number.isFinite(customers) || spend <= 0 || customers <= 0) {
      alert("Please enter valid numbers greater than 0.");
      return;
    }

    // Payload that matches your records route/model expectations
    const payload = {
      key: "marketing",
      type: "marketing",
      value: spend,                 // many /records schemas require a generic numeric 'value'
      marketingSpend: spend,
      newCustomers: customers,
      date: new Date().toISOString(),
      category: "marketing",
      note: "",                     // optional, fill from a textarea later if you want
    };

    setLoading(true);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ POST /api/records failed:", res.status, text);
        alert(`Server error (${res.status}): ${text || "Bad Request"}`);
        return;
      }

      const saved = await res.json();
      console.log("✅ Saved marketing record:", saved);
      if (typeof onSuccess === "function") onSuccess(saved);

      // reset
      setMarketingSpend("");
      setNewCustomers("");
    } catch (err) {
      console.error("❌ Failed to save marketing data:", err);
      alert("Network or server error. Check the server console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg shadow-md space-y-3">
      <h3 className="text-white font-semibold text-lg">Add Marketing Data</h3>

      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="Marketing Spend (e.g., 120.50)"
        value={marketingSpend}
        onChange={(e) => setMarketingSpend(e.target.value)}
        className="w-full px-3 py-2 rounded bg-gray-700 text-white"
        required
      />

      <input
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        placeholder="New Customers (e.g., 7)"
        value={newCustomers}
        onChange={(e) => setNewCustomers(e.target.value)}
        className="w-full px-3 py-2 rounded bg-gray-700 text-white"
        required
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

export default MarketingForm;
