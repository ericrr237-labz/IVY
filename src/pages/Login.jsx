// src/pages/Login.jsx
import React, { useState } from "react";
import { Navigate } from "react-router-dom";


export default function Login() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("auth"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const API_BASE = (process.env.REACT_APP_API_BASE);
  const LOGIN_URL = `${API_BASE}/api/auth/login`;

  if (isLoggedIn) {
    return <Navigate to="/dashboard" />;
  }

 const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(), // normalize email
        password, // do NOT trim passwords
      }),
      credentials: "include", // optional if you set cookies; harmless otherwise
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.ok) {
      throw new Error(json?.error || `Login failed (${res.status})`);
    }

    // Save tokens (adjust keys to match your backend response shape)
    // json.tokens.access / json.tokens.refresh
    localStorage.setItem("auth", JSON.stringify({
      user: json.user,
      tokens: json.tokens,
      activeOrgId: json.user?.activeOrgId
    }));

    setIsLoggedIn(true);
  } catch (err) {
    console.error("[Login] error:", err);
    alert("Invalid credentials");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-[#0f1115] text-white flex flex-col justify-center items-center p-6">
      <h1 className="text-5xl font-bold mb-4 text-blue-500">Login to IVY</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        Unlock your custom AI dashboard and start scaling your business.
      </p>
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-4 bg-[#1a1e27] p-6 rounded-lg shadow-lg"
      >
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-[#2a2f3c] text-white focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-[#2a2f3c] text-white focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 p-3 rounded font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
