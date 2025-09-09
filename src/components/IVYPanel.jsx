import React, { useState } from "react";
import { Bot, X, Mic } from "lucide-react";
import { motion } from "framer-motion";

export default function IVYPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ivy",
      text: "Got it! I've added $800 to revenue.",
      tag: "Revenue updated",
    },
    {
      id: 2,
      sender: "user",
      text: "Ok",
    },
    {
      id: 3,
      sender: "ivy",
      text: "Would you like to add an expense?",
      actions: ["Add Expense", "Set Limit", "Dismiss"],
    },
  ]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-[400px] bg-[#0f172a] text-white rounded-2xl shadow-2xl border border-[#3b82f6] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-[#3b82f6] bg-[#1e293b]">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-1 rounded-full">
                <div className="bg-[#0f172a] p-1 rounded-full">
                  <span className="text-lg">👩‍💻</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold">IVY</h3>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="max-h-[360px] overflow-y-auto px-4 py-3 space-y-4 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl px-3 py-2 ${
                  msg.sender === "ivy"
                    ? "bg-[#1e293b] text-white"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white self-end ml-auto"
                }`}
              >
                <p>{msg.text}</p>
                {msg.tag && (
                  <div className="mt-2 text-xs inline-block px-2 py-1 bg-[#172033] rounded-full border border-[#3b82f6] text-blue-400">
                    {msg.tag}
                  </div>
                )}
                {msg.actions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.actions.map((a, i) => (
                      <button
                        key={i}
                        className="bg-[#0f172a] border border-gray-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-[#1e293b] transition"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-[#3b82f6] bg-[#1e293b]">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-[#0f172a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none"
            />
            <button className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-full shadow-md hover:scale-105 transition">
              <Mic className="text-white" size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <Bot className="text-white" />
        </button>
      )}
    </div>
  );
}
