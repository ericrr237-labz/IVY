import React from "react";
import { motion } from "framer-motion";

function Pricing() {
  return (
    <motion.div
      className="min-h-screen bg-[#0f1115] text-white p-10"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <h1 className="text-5xl font-bold text-blue-500 mb-4 text-center">Pricing</h1>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12 text-center">
        AIVI offers fully custom AI solutions, tailored to your business needs and growth goals. Our services start at $3,500/month.
        Every system is designed to maximize revenue, automate tasks, and deliver an unforgettable client experience.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        <div className="bg-[#1a1e27] p-6 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition transform duration-300 ease-in-out">
          <h2 className="text-xl font-semibold text-blue-400 mb-3">Full Customization</h2>
          <p className="text-gray-300">
            We analyze your current processes and build a fully tailored AI system unique to your business model.
          </p>
        </div>
        <div className="bg-[#1a1e27] p-6 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition transform duration-300 ease-in-out">
          <h2 className="text-xl font-semibold text-blue-400 mb-3">Scalable & Adaptive</h2>
          <p className="text-gray-300">
            Whether you're a startup or an enterprise, AIVI scales with you — evolving as your operations and revenue grow.
          </p>
        </div>
        <div className="bg-[#1a1e27] p-6 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition transform duration-300 ease-in-out">
          <h2 className="text-xl font-semibold text-blue-400 mb-3">Premium Support</h2>
          <p className="text-gray-300">
            Direct access to our team for strategy sessions, optimization advice, and fast support whenever you need it.
          </p>
        </div>
      </div>

      <div className="text-center">
        <a
          href="/contact"
          className="bg-blue-600 p-4 rounded-xl font-semibold hover:bg-blue-700 hover:scale-105 transition transform duration-300 inline-block"
        >
          Book Your AI Readiness Call →
        </a>
      </div>
    </motion.div>
  );
}

export default Pricing;
