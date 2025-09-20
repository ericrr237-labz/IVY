import React from "react";
import { motion } from "framer-motion";

function Services() {
  return (
    <motion.div
      className="min-h-screen bg-[#0f1115] text-white p-10"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <h1 className="text-5xl font-bold text-blue-500 mb-4 text-center">Our Services</h1>
      <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-12 text-center">
        One integrated AI system. Four powerful capabilities. Fully customized to fit your business and growth goals.
      </p>

      {/** Service 1 */}
      <div className="bg-[#1a1e27] p-8 rounded-xl shadow-lg mb-8 hover:shadow-blue-500/30 hover:scale-105 transition transform duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold text-blue-400 mb-3">Customer Support + Website Building & Maintenance</h2>
        <p className="text-gray-300">
          Deliver unforgettable experiences — even when you're offline. IVY’s AI-powered support handles customer questions,
          bookings, and issues 24/7, keeping your reputation sharp and your clients happy. We also design and maintain a
          high-performing website that reflects your brand and effortlessly supports your growth.
        </p>
      </div>

      {/** Service 2 */}
      <div className="bg-[#1a1e27] p-8 rounded-xl shadow-lg mb-8 hover:shadow-blue-500/30 hover:scale-105 transition transform duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold text-blue-400 mb-3">Performance Insights & Profit Maximization</h2>
        <p className="text-gray-300">
          See exactly where you're winning — and where you're leaving money on the table. With IVY’s deep performance analytics,
          you'll get clear, actionable insights on revenue impact, conversion rates, and client retention. Our system doesn’t just
          report — it recommends exactly how to boost profits and streamline your operations.
        </p>
      </div>

      {/** Service 3 */}
      <div className="bg-[#1a1e27] p-8 rounded-xl shadow-lg mb-8 hover:shadow-blue-500/30 hover:scale-105 transition transform duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold text-blue-400 mb-3">IVY: Your Personal AI Operator</h2>
        <p className="text-gray-300">
          Imagine a personal assistant that never sleeps, never forgets, and always thinks ahead. IVY helps you schedule meetings,
          manage your inbox, organize tasks, and free up your mental space — so you can focus on big-picture growth. Replace
          busywork with true leadership time.
        </p>
      </div>

      {/** Service 4 */}
      <div className="bg-[#1a1e27] p-8 rounded-xl shadow-lg mb-12 hover:shadow-blue-500/30 hover:scale-105 transition transform duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold text-blue-400 mb-3">Business Automation & AI Efficiency</h2>
        <p className="text-gray-300">
          Stop wasting time on repetitive tasks — let your AI handle it. From automating lead qualification and follow-ups to backend
          workflows and data updates, IVY ensures your business runs like a high-precision machine. Free up your team to focus
          on what really matters.
        </p>
      </div>

      <div className="text-center">
        <a
          href="/pricing"
          className="bg-blue-600 p-4 rounded-xl font-semibold hover:bg-blue-700 hover:scale-105 transition transform duration-300 inline-block"
        >
          Explore Pricing & Get Started →
        </a>
      </div>
    </motion.div>
  );
}

export default Services;
