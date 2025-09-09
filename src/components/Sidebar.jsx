// src/components/Sidebar.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaChartLine, FaChartPie, FaUser, FaCog, FaComments, FaSignOutAlt,
  FaCalendarAlt,
  FaUsers
} from "react-icons/fa";
import ivybot from "../assets/ivy-bot.png";
import IVYai from "./IVYai"; // if you want chat inside sidebar; remove if not needed


export default function Sidebar() {
  const [mode, setMode] = useState("menu"); // 'menu' | 'chat'
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { icon: FaChartLine, label: "Dashboard", path: "/dashboard" },
    { icon: FaChartPie,  label: "Reports",   path: "/reports"   },
    { icon: FaUsers, label: "Marketing", path: "/marketing"},
    { icon: FaCalendarAlt, label: "Calendar", path: "/calendar"  },
    { icon: FaUser,      label: "Profile",   path: "/profile"   },
    { icon: FaCog,       label: "Settings",  path: "/settings"  },
    { icon: FaComments,  label: "Feedback",  path: "/feedback"  },
  ];

  const isActive = (p) => pathname.startsWith(p);

  return (
    <div className="w-60 bg-[#12141b] p-6 space-y-8 shadow-lg text-white">
      {/* Clickable logo toggles chat */}
      <img
        src={ivybot}
        alt="IVY Bot"
        className="w-14 h-14 mx-auto rounded-full cursor-pointer animate-pulse-glow hover:animate-none hover:scale-105 transition"
        onClick={() => setMode((m) => (m === "menu" ? "chat" : "menu"))}
        title={mode === "menu" ? "Open IVY Chat" : "Back to menu"}
      />

      <div className="mt-2 flex-1 min-h-0">
        {mode === "menu" ? (
          <nav className="space-y-2 text-sm">
            {items.map(({ icon: Icon, label, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`flex items-center w-full px-3 py-2 rounded-lg transition
                  hover:bg-gray-800 ${isActive(path) ? "bg-gray-800/60" : ""}`}
              >
                <Icon className="mr-2" /> {label}
              </button>
            ))}

            {/* Logout */}
            <button
              onClick={() => { localStorage.removeItem("auth"); navigate("/login"); }}
              className="mt-2 flex items-center w-full px-3 py-2 rounded-lg transition hover:bg-gray-800 text-red-300"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </nav>
        ) : (
          <div className="flex flex-col h-full -mt-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex-1">
                <h2 className="font-semibold leading-tight">IVY Assistant</h2>
                <p className="text-[11px] text-gray-400">Always ready to help</p>
              </div>
              <button
                onClick={() => setMode("menu")}
                className="text-gray-400 hover:text-white text-sm"
                title="Back to menu"
              >
                ←
              </button>
            </div>

            <div className="border-t border-gray-700 my-3" />
            <p className="text-xs text-gray-400 text-center mb-3">Ask me anything…</p>

            <div className="flex-1 min-h-0 rounded-lg border border-gray-700/60 bg-[#0f1115] shadow-lg shadow-blue-500/5 p-3">
              <IVYai />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
