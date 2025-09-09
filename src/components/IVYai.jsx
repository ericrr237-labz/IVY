// IVYai.jsx
import React, { useState } from "react";

const IVYai = ({ onMemorySaved, context = {} }) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const formatMetricsForPrompt = () => {
    const {
      totalRevenue = 0,
      grossProfitMargin = 0,
      netProfitMargin = 0,
      cashFlow = 0,
      CAC = 0,
      CLTC = 0,
    } = context;

    return `
📊 Business Metrics:
- Total Revenue: $${totalRevenue.toLocaleString()}
- Gross Profit Margin: ${grossProfitMargin}%
- Net Profit Margin: ${netProfitMargin}%
- Cash Flow: $${cashFlow}
- CAC (Customer Acquisition Cost): $${CAC}
- CLTC (Customer Lifetime Value): $${CLTC}
    `.trim();
  };

  const sendCommand = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const systemPrompt = formatMetricsForPrompt();
      const res = await fetch("http://localhost:5001/api/ask-gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: input,
          context: systemPrompt,
        }),
      });

      const data = await res.json();
      setResponse(data.reply || "❌ No reply received.");

      if (data.memory && onMemorySaved) {
        onMemorySaved(data.memory);
      }
    } catch (err) {
      console.error("Error sending command:", err);
      setResponse("❌ Failed to get response.");
    }

    setLoading(false);
    setInput(""); // Clear input
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendCommand();
  };

  return (
  <div className="flex h-full flex-col gap-3">
    {/* Messages (when response exists, show above input) */}
    {response && (
      <div className="flex-1 min-h-0 overflow-auto rounded-md bg-[#0f141d] border border-gray-800 p-3 text-sm text-gray-300 whitespace-pre-line">
        {response}
      </div>
    )}

    {/* Integrated input + button */}
    <div className="rounded-lg overflow-hidden shadow-lg shadow-blue-500/20 ring-1 ring-inset ring-gray-800">
      <div className="flex bg-[#2a2f3c]">
        <input
          type="text"
          placeholder="Ask IVY…"
          className="flex-1 px-3 py-2 bg-transparent text-white placeholder:text-gray-400 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendCommand}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[.98] transition hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>
    </div>
  </div>
);
};

export default IVYai;
