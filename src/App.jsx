// src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

// Marketing/site pages (components)
import Home from "./components/Home";
import OurPromise from "./components/OurPromise";
import Pricing from "./components/Pricing";
import Services from "./components/Services";
import Contact from "./components/Contact";

// App pages (full pages)
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Marketing from "./pages/Marketing";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Feedback from "./pages/Feedback";
import Login from "./pages/Login";
import Calendar from "./pages/Calendar";



// Small helper to highlight active top nav link
function TopNavLink({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`hover:text-white transition ${
        active ? "text-white" : "text-gray-300"
      }`}
    >
      {children}
    </Link>
  );
}

function App() {
  // Persist login so you don’t get kicked out when navigating
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("auth"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: replace with real auth later
    if (email === "admin@aivi.com" && password === "password") {
      localStorage.setItem("auth", "1");
      setIsLoggedIn(true);
      // Navigate is handled by <Navigate /> in the /login route below
    } else {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setIsLoggedIn(false);
  };

  

  return (
    <Router>
      {/* Top Navbar for the marketing site */}
      <nav className="bg-[#0f1115] text-white p-6 flex justify-between items-center shadow-md">
        <div className="text-2xl font-bold tracking-wide text-blue-500">AIVI</div>
        <div className="space-x-6 text-lg">
          <TopNavLink to="/">Home</TopNavLink>
          <TopNavLink to="/pricing">Pricing</TopNavLink>
          <TopNavLink to="/about">Our Promise</TopNavLink>
          <TopNavLink to="/services">Services</TopNavLink>
          <TopNavLink to="/contact">Contact</TopNavLink>
          {!isLoggedIn ? (
            <TopNavLink to="/login">Login</TopNavLink>
          ) : (
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-white transition"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      <Routes>
        {/* Marketing/site routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<OurPromise />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />

        {/* Login route (redirects to dashboard if already logged in) */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
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
            )
          }
        />

        {/* App routes (gated) */}
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/reports"
          element={isLoggedIn ? <Reports /> : <Navigate to="/login" />}
        />
        <Route
          path="/marketing"
          element={isLoggedIn ? <Marketing/> : <Navigate to="/marketing" />}
        />
        <Route
          path="/calendar"
          element={isLoggedIn ? <Calendar /> : <Navigate to="/calendar" />}
        />
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={isLoggedIn ? <Settings /> : <Navigate to="/login" />}
        />
        <Route
          path="/feedback"
          element={isLoggedIn ? <Feedback /> : <Navigate to="/login" />}
        />

        {/* Default redirect */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
