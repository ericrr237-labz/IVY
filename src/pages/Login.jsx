// src/pages/Login.jsx
import React, { useState } from "react";
import { Navigate } from "react-router-dom";


export default function Login() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("auth"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isLoggedIn) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: replace with real auth later
    if (email === "admin@aivi.com" && password === "password") {
      localStorage.setItem("auth", "1");
      setIsLoggedIn(true);
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-[#0f1115] text-white flex flex-col justify-center items-center p-6">
      <h1 className="text-5xl font-bold mb-4 text-blue-500">Login to AIVI</h1>
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
