import React, { useState } from "react";

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How long does it take to implement AIVI?",
      answer: "On average, most clients go live in 2-4 weeks depending on complexity. Our team handles everything for a smooth rollout."
    },
    {
      question: "Can AIVI integrate with my existing tools?",
      answer: "Yes. AIVI is designed to work with your current CRMs, email marketing platforms, and task systems so you don't lose progress."
    },
    {
      question: "Is this a one-time setup or ongoing support?",
      answer: "AIVI includes ongoing support and optimization. We stay with you to ensure your system adapts and scales as you grow."
    },
    {
      question: "What type of businesses benefit most from AIVI?",
      answer: "Service-based businesses, agencies, consultancies, and fast-growing online brands see the biggest impact and fastest ROI."
    }
  ];

  return (
    <div className="bg-[#0f1115] text-white p-10 flex flex-col justify-center items-center">
      <h2 className="text-4xl md:text-5xl font-bold text-blue-500 mb-8 text-center">Frequently Asked Questions</h2>

      <div className="w-full max-w-2xl space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-[#1a1e27] p-4 rounded-lg cursor-pointer hover:shadow-blue-500/30 transition duration-300"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <h3 className="text-lg font-semibold flex justify-between items-center">
              {faq.question}
              <span className="text-blue-400">
                {openIndex === index ? "−" : "+"}
              </span>
            </h3>
            {openIndex === index && (
              <p className="text-gray-300 mt-2">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
