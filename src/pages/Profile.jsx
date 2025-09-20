// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

// local cache key (for instant load + offline)
const LS_KEY = "ivy_profile_v1";

// CRA + Vite safe API base
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5001";

const PROFILE_URL = `${API_BASE}/api/profile`;

export default function Profile() {
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    instagram: "",
    bio: "",
    avatar: "", // base64 data url for now
    businessName: "IVY User",
    city: "",
    state: "",
  });

  // helper
  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Load profile: try API first, fallback to localStorage
  useEffect(() => {
    let canceled = false;

    const fromLocal = () => {
      const saved = localStorage.getItem(LS_KEY);
      if (saved && !canceled) {
        const data = JSON.parse(saved);
        setForm((f) => ({ ...f, ...data }));
        if (data.avatar) setPreview(data.avatar);
      }
    };

    (async () => {
      try {
        const res = await apiFetch('/profile');
        const json = await res.json();
        if (!canceled && json?.ok && json?.data) {
          setForm((f) => ({ ...f, ...json.data }));
          if (json.data.avatar) setPreview(json.data.avatar);
          localStorage.setItem(LS_KEY, JSON.stringify(json.data)); // cache
          return;
        }
        fromLocal();
      } catch (e) {
        console.warn("[Profile] GET failed, using local cache:", e);
        fromLocal();
      }
    })();

    return () => {
      canceled = true;
    };
  }, []);

  // Avatar file -> base64 preview
  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      setField("avatar", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Save to API (and cache locally)
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await apiFetch('/profile', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "save_failed");
      localStorage.setItem(LS_KEY, JSON.stringify(json.data));
    } catch (err) {
      console.error("[Profile] save failed:", err);
      alert("Save failed. Check the server (port 5001) and Network tab.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f1115] text-white">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8">
        <h1 className="text-2xl font-semibold border-b border-white/10 pb-3">
          Profile
        </h1>

        {/* top card: avatar + basics */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden border border-white/10 bg-black/30">
                {preview ? (
                  <img src={preview} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-xs text-gray-400">
                    No photo
                  </div>
                )}
              </div>
              <div>
                <label className="inline-block">
                  <span className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer text-sm">
                    Upload Photo
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                </label>
                {preview && (
                  <button
                    className="ml-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
                    onClick={() => { setPreview(""); setField("avatar", ""); }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Field
                label="Full Name"
                value={form.fullName}
                onChange={(v) => setField("fullName", v)}
                placeholder="Eric Reyes"
              />
              <Field
                label="Business Name"
                value={form.businessName}
                onChange={(v) => setField("businessName", v)}
                placeholder="Eric Fadezz"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="City"
                  value={form.city}
                  onChange={(v) => setField("city", v)}
                  placeholder="Winters"
                />
                <Field
                  label="State"
                  value={form.state}
                  onChange={(v) => setField("state", v)}
                  placeholder="CA"
                />
              </div>
            </div>
          </div>

          {/* details card */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setField("email", v)}
                placeholder="you@email.com"
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={(v) => setField("phone", v)}
                placeholder="530 601 3529"
              />
              <Field
                label="Instagram"
                value={form.instagram}
                onChange={(v) => setField("instagram", v)}
                placeholder="@eric.fadezz"
              />
              <div className="md:col-span-2">
                <Label>Bio</Label>
                <textarea
                  className="mt-1 w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-white/20"
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                  placeholder="Shear work specialist. Mobile barber. Bookings open."
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <span className="text-gray-400 text-sm">
                Changes save to your account (and cache locally for quick loads).
              </span>
            </div>
          </div>
        </section>

        {/* security card (stub for now) */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
          <h2 className="text-lg font-medium mb-4">Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PasswordField label="Current Password" />
            <PasswordField label="New Password" />
            <PasswordField label="Confirm New Password" />
          </div>
          <div className="mt-4">
            <button
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15"
              onClick={() => alert("Hook this to /api/change-password")}
            >
              Update Password
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---- tiny UI atoms ---- */
function Label({ children }) {
  return <label className="text-sm text-gray-300">{children}</label>;
}
function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        className="mt-1 w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-white/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
function PasswordField({ label }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="password"
        className="mt-1 w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-white/20"
        placeholder="••••••••"
      />
    </div>
  );
}
