import React from "react";
import { motion } from "framer-motion";
import IvyIntro from "./IvyIntro";
import FAQ from "./FAQ";
import dashboardMockup from "../assets/dashboard-mockup.png";

function Home() {
  return (
    <>
      <motion.div
        className="bg-[#0f1115] text-white"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Hero */}
        <div className="min-h-screen flex flex-col justify-center items-center p-10">
          <h1 className="text-5xl font-bold text-blue-500 mb-4">AI business solution personalized for you</h1>
          <h2 className="text-3xl mb-4">Welcome to IVY</h2>
          <p className="text-gray-300 max-w-xl text-center mb-6">
            Here we turn your business into a revenue-generating machine. Discover the future of intelligent automation and see how you can automate and scale effortlessly.
          </p>
          <a
            href="/pricing"
            className="bg-blue-600 p-4 rounded-xl font-semibold hover:bg-blue-700 hover:scale-105 transition transform duration-300 inline-block"
          >
            Start Now →
          </a>
        </div>

        {/* Meet IVY */}
        <IvyIntro />

        {/* Dashboard transition text */}
        <div className="text-center my-8 px-4">
          <h3 className="text-3xl font-bold text-blue-500 mb-2">See IVY in action</h3>
          <p className="text-gray-300 max-w-xl mx-auto">
            Here’s a glimpse of how IVY empowers you to track, automate, and scale — all from one powerful, intelligent dashboard.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="flex justify-center my-12">
          <img
            src={dashboardMockup}
            alt="IVY Dashboard Mockup"
            className="rounded-xl shadow-lg hover:shadow-blue-500/30 transition duration-300 w-full max-w-4xl"
          />
        </div>

        {/* Who is this for */}
        <div className="min-h-[50vh] bg-[#0f1115] text-white flex flex-col justify-center items-center p-10">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-500 mb-4 text-center">Who is this for?</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8 text-center">
            IVY is built for ambitious business owners who want to scale faster, automate smarter, and dominate their market.
          </p>
          <ul className="text-gray-300 space-y-4 text-left max-w-md">
            <li className="flex items-start"><span className="text-green-400 mr-2">✔</span> Agencies and consultancies scaling from $10k to $100k+ months</li>
            <li className="flex items-start"><span className="text-green-400 mr-2">✔</span> Service-based businesses ready to automate repetitive tasks</li>
            <li className="flex items-start"><span className="text-green-400 mr-2">✔</span> Founders & CEOs who want to replace busywork with real strategy</li>
            <li className="flex items-start"><span className="text-green-400 mr-2">✔</span> Brands committed to premium client experiences and maximum efficiency</li>
          </ul>
        </div>
      </motion.div>

      {/* FAQ section */}
      <FAQ />
    </>
  );
}

export default Home;

