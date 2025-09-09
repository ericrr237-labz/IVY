import React from "react";
import { motion } from "framer-motion";

function IvyIntro() {
  return (
    <motion.div
      className="min-h-[60vh] bg-[#0f1115] text-white flex flex-col justify-center items-center p-10"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <h2 className="text-4xl md:text-5xl font-bold text-blue-500 mb-4">Meet IVY</h2>
      <p className="text-gray-400 text-center max-w-2xl mb-8">
        Your intelligent, always-on AI operator. IVY automates your workflows, enhances client experiences,
        and empowers you to focus on true growth. Think of IVY as your silent revenue partner working 24/7.
      </p>
      <motion.div
        className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-700 shadow-lg"
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 20px rgba(59,130,246,0.5)",
            "0 0 40px rgba(139,92,246,0.6)",
            "0 0 20px rgba(59,130,246,0.5)"
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
    </motion.div>
  );
}

export default IvyIntro;
