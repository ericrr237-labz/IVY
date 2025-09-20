import React from "react";
import { motion } from "framer-motion";

function Contact() {
  return (
    <motion.div
      className="min-h-screen bg-[#0f1115] text-white p-10 flex flex-col justify-center items-center"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <h1 className="text-5xl font-bold text-blue-500 mb-4 text-center">Book Your AI Readiness Call</h1>
      <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8 text-center">
        This isn’t a generic demo. On this call, we’ll map out exactly how IVY can automate and scale your business — fully personalized to your needs.
      </p>

      <div className="bg-[#1a1e27] p-8 rounded-xl shadow-lg w-full max-w-xl text-center hover:shadow-blue-500/30 hover:scale-105 transition transform duration-300 ease-in-out">
        <p className="text-gray-300 mb-6">
          Ready to transform your business? Choose a time below to get started.
        </p>
        <a
          href="https://calendly.com/YOUR-CALENDLY-LINK"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 p-4 rounded-xl font-semibold hover:bg-blue-700 hover:scale-105 transition transform duration-300 inline-block"
        >
          Schedule Your Call →
        </a>
      </div>
    </motion.div>
  );
}

export default Contact;
