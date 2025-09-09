// src/pages/Feedback.jsx
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";


const API = process.env.REACT_APP_API_URL || "";

const LS_KEY = "ivy_feedback_v1";

export default function Feedback() {
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    category: "Bug",
    priority: "Normal",
    title: "",
    details: "",
    email: "",
    includeScreenshot: false,
    screenshot: "", // base64
    allowContact: true,
  });

  // load stored feedback on mount
 useEffect(() => {
  (async () => {
    try {
      const r = await fetch(`${API}/api/feedback`);
      if (r.ok) {
        const rows = await r.json();
        if (Array.isArray(rows)) {
          setItems(rows.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
          return;
        }
      }
    } catch {}
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setItems(JSON.parse(saved));
  })();
}, []);


  // derived helpers
  const remaining = useMemo(() => Math.max(0, 1000 - form.details.length), [form.details]);
  const disabled = useMemo(() => !form.title.trim() || !form.details.trim(), [form]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleScreenshot = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      setField("screenshot", dataUrl);
      setField("includeScreenshot", true);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setPreview("");
    setField("screenshot", "");
    setField("includeScreenshot", false);
  };

  const persist = (next) => {
    setItems(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

const submit = async () => {
  if (disabled) return;
  setSubmitting(true);
  try {
    let entry = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...form,
      status: "Recorded",
    };

    // POST to backend
    try {
      const r = await fetch(`${API}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (r.ok) {
        const saved = await r.json();
        entry = { ...entry, ...saved };
      }
    } catch {}

    // local fallback/history
    const next = [entry, ...items];
    persist(next);

    setForm((f) => ({
      ...f,
      title: "",
      details: "",
      includeScreenshot: false,
      screenshot: "",
    }));
    setPreview("");
    alert("Feedback submitted. Thanks.");
  } finally {
    setSubmitting(false);
  }
};

  const removeItem = (id) => {
    if (!window.confirm("Remove this feedback from local history?")) return;
    const next = items.filter((x) => x.id !== id);
    persist(next);
  };

  return (
    <div className="flex min-h-screen bg-[#0f1115] text-white">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8">
        <h1 className="text-2xl font-semibold border-b border-white/10 pb-3">
          Feedback
        </h1>

        {/* form */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Category</Label>
              <select
                className="mt-1 w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-white/20"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
              >
                <option>Bug</option>
                <option>Feature request</option>
                <option>UI polish</option>
                <option>Integration</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <Label>Priority</Label>
              <select
                className="mt-1 w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-white/20"
                value={form.priority}
                onChange={(e) => setField("priority", e.target.value)}
              >
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label>Contact email (optional)</Label>
              <input
                type="email"
                className="mt-1 w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-white/20"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="you@email.com"
              />
              <div className="mt-2 text-xs text-gray-400">
                Only used for follow-up if you allow contact.
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Label>Title</Label>
            <input
              className="mt-1 w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-white/20"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Short summary (e.g., Calendar drag not saving)"
              maxLength={120}
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <Label>Details</Label>
              <span className="text-xs text-gray-400">{remaining} characters left</span>
            </div>
            <textarea
              className="mt-1 w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-white/20"
              rows={6}
              value={form.details}
              onChange={(e) => setField("details", e.target.value.slice(0, 1000))}
              placeholder="What happened, steps to reproduce, what you expected, any errors you saw."
            />
          </div>

          {/* screenshot */}
          <div className="mt-4">
            <Label>Screenshot (optional)</Label>
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-block">
                <span className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer text-sm">
                  Upload image
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
              </label>
              {preview && (
                <button
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
                  onClick={removeScreenshot}
                >
                  Remove
                </button>
              )}
              <label className="ml-auto text-sm text-gray-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allowContact}
                  onChange={(e) => setField("allowContact", e.target.checked)}
                />
                Allow follow-up contact
              </label>
            </div>

            {preview && (
              <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/30">
                <img src={preview} alt="screenshot" className="max-h-64 w-full object-contain" />
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={submit}
              disabled={submitting || disabled}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit feedback"}
            </button>
          </div>
        </section>

        {/* history */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
          <h2 className="text-lg font-medium mb-4">Submitted feedback (local)</h2>
          {items.length === 0 ? (
            <div className="text-gray-400 text-sm">No feedback yet.</div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.id} className="rounded-xl border border-white/10 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{it.title}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {it.category} • {it.priority} • {new Date(it.createdAt).toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-300 mt-3 whitespace-pre-wrap">
                        {it.details}
                      </p>
                      {it.screenshot && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-white/10 bg-black/30">
                          <img src={it.screenshot} alt="attachment" className="max-h-56 w-full object-contain" />
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">{it.status}</div>
                      <button
                        className="mt-3 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
                        onClick={() => removeItem(it.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

/* ---------- tiny UI atom ---------- */
function Label({ children }) {
  return <label className="text-sm text-gray-300">{children}</label>;
}
