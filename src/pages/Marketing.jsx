// src/pages/Marketing.jsx
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";


const API = process.env.REACT_APP_API_URL || "";

export default function Marketing() {
  const [notes, setNotes] = useState("");
  const [ideas, setIdeas] = useState([
    { id: 1, title: "Run referral promo", desc: "Offer $10 credit for each new client brought in." },
    { id: 2, title: "Boost Instagram reels", desc: "Post short haircut tutorials with trending sounds." },
  ]);

  useEffect(() => {
  (async () => {
    try {
      const r = await fetch(`${API}/api/marketing/notes`);
      if (r.ok) {
        const data = await r.json();
        if (typeof data === "string") setNotes(data);
        else if (data && typeof data.notes === "string") setNotes(data.notes);
      }
    } catch {}
  })();
}, []);

const saveNotes = async () => {
  try {
    const r = await fetch(`${API}/api/marketing/notes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (!r.ok) throw new Error("Failed");
    alert("Notes saved.");
  } catch (e) {
    console.error(e);
    alert("Could not save notes (check server).");
  }
};

<button onClick={saveNotes} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500">
  Save Notes
</button>

  return (
    <div className="flex min-h-screen bg-[#0f1115] text-white">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        <h1 className="text-2xl font-semibold border-b border-white/10 pb-3">
          Marketing
        </h1>

        {/* Campaign & notes */}
        <section className="rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
          <h2 className="text-lg font-medium mb-3">Campaign Notes</h2>
          <textarea
            className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-white/20"
            rows={5}
            placeholder="Write campaign plans, brainstorms, or content drafts here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => alert("Later: save to backend")}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500"
            >
              Save Notes
            </button>
          </div>
        </section>

        {/* Insights / ideas */}
        <section className="rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
          <h2 className="text-lg font-medium mb-3">Growth Ideas</h2>
          <ul className="space-y-3">
            {ideas.map((idea) => (
              <li key={idea.id} className="rounded-xl border border-white/10 p-4">
                <div className="font-medium">{idea.title}</div>
                <p className="text-gray-400 text-sm mt-1">{idea.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Demographics / targeting */}
        <section className="rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
          <h2 className="text-lg font-medium mb-3">Target Demographics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="rounded-xl border border-white/10 p-4">
              <div className="font-semibold text-white">Age</div>
              <p className="mt-1">18–34 (main), 35–50 (secondary)</p>
            </div>
            <div className="rounded-xl border border-white/10 p-4">
              <div className="font-semibold text-white">Location</div>
              <p className="mt-1">Local clients (Winters, CA) + Instagram reach</p>
            </div>
            <div className="rounded-xl border border-white/10 p-4">
              <div className="font-semibold text-white">Style</div>
              <p className="mt-1">Clean fades, shear work, lifestyle content</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
