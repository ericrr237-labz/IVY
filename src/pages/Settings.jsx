// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";


const API = process.env.REACT_APP_API_URL || "";
const LS_KEY = "ivy_settings_v1";

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    theme: "dark",               // "dark" | "light" | "system"
    compactMode: false,
    showTips: true,

    // notifications
    emailUpdates: true,
    pushNotifications: false,
    inAppAlerts: true,

    // privacy
    usageAnalytics: true,

    // integrations (placeholders for now)
    googleCalendarConnected: false,
    gmailConnected: false,
    stripeConnected: false,
    openaiKey: "",
  });

  // load
useEffect(() => {
  (async () => {
    try {
      const r = await fetch(`${API}/api/settings`);
      if (r.ok) {
        const srv = await r.json();
        if (srv && typeof srv === "object") {
          setSettings((s) => ({ ...s, ...srv }));
          localStorage.setItem(LS_KEY, JSON.stringify({ ...srv }));
          return;
        }
      }
    } catch {}
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setSettings((s) => ({ ...s, ...JSON.parse(saved) }));
  })();
  // eslint-disable-next-line
}, []);


  // reflect theme on <html data-theme="">
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme; // available to your global CSS if needed
    if (settings.theme === "dark") root.classList.add("dark");
    else if (settings.theme === "light") root.classList.remove("dark");
    // if "system", leave as-is (you can enhance later)
  }, [settings.theme]);

  const setField = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

const handleSave = async () => {
  setSaving(true);
  try {
    const r = await fetch(`${API}/api/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!r.ok) console.warn("Server save failed; keeping local only.");
    localStorage.setItem(LS_KEY, JSON.stringify(settings));
  } finally {
    setSaving(false);
  }
};


  const fakeConnect = (k) => setField(k, true);
  const fakeDisconnect = (k) => setField(k, false);

  const dangerDelete = () => {
    if (!window.confirm("This will clear local settings. Continue?")) return;
    localStorage.removeItem(LS_KEY);
    setSettings({
      theme: "dark",
      compactMode: false,
      showTips: true,
      emailUpdates: true,
      pushNotifications: false,
      inAppAlerts: true,
      usageAnalytics: true,
      googleCalendarConnected: false,
      gmailConnected: false,
      stripeConnected: false,
      openaiKey: "",
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0f1115] text-white">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8">
        <h1 className="text-2xl font-semibold border-b border-white/10 pb-3">
          Settings
        </h1>

        {/* Appearance */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
          <h2 className="text-lg font-medium mb-4">Appearance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Theme</Label>
              <select
                className="mt-1 w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-white/20"
                value={settings.theme}
                onChange={(e) => setField("theme", e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
              <p className="text-xs text-gray-400 mt-2">
                “System” follows your OS preference.
              </p>
            </div>

            <Toggle
              label="Compact mode"
              checked={settings.compactMode}
              onChange={(v) => setField("compactMode", v)}
              hint="Tighter spacing for dense data views."
            />
            <Toggle
              label="Show inline tips"
              checked={settings.showTips}
              onChange={(v) => setField("showTips", v)}
              hint="Quick hints in dashboards and modals."
            />
          </div>
        </section>

        {/* Notifications */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
          <h2 className="text-lg font-medium mb-4">Notifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Toggle
              label="Email updates"
              checked={settings.emailUpdates}
              onChange={(v) => setField("emailUpdates", v)}
              hint="Reports, summaries, and alerts via email."
            />
            <Toggle
              label="Push notifications"
              checked={settings.pushNotifications}
              onChange={(v) => setField("pushNotifications", v)}
              hint="Browser push (enable in your browser)."
            />
            <Toggle
              label="In‑app alerts"
              checked={settings.inAppAlerts}
              onChange={(v) => setField("inAppAlerts", v)}
              hint="Banners and toasts inside IVY."
            />
          </div>
        </section>

        {/* Integrations */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
          <h2 className="text-lg font-medium mb-4">Integrations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           <IntegrationCard
            name="Google Calendar"
            connected={settings.googleCalendarConnected}   
            onConnect={async () => {
              try {
                const API = process.env.REACT_APP_API_URL || "";
                const r = await fetch(`${API}/api/google/oauth-url`);
                const { url } = await r.json();
                window.location.href = url; // go to Google consent screen
                } catch (e) {
                alert("Could not start Google OAuth");
              }
              }}
            onDisconnect={async () => {
              try {
                const API = process.env.REACT_APP_API_URL || "";
                await fetch(`${API}/api/google/disconnect`, { method: "DELETE" });
                setField("googleCalendarConnected", false);
              } catch {}
            }}
            note="Sync events with your IVY Calendar."
          />
            <IntegrationCard
              name="Gmail"
              connected={settings.gmailConnected}
              onConnect={() => fakeConnect("gmailConnected")}
              onDisconnect={() => fakeDisconnect("gmailConnected")}
              note="Send and track follow‑ups from IVY."
            />
            <IntegrationCard
              name="Stripe"
              connected={settings.stripeConnected}
              onConnect={() => fakeConnect("stripeConnected")}
              onDisconnect={() => fakeDisconnect("stripeConnected")}
              note="Enable billing and payouts."
            />
            <div className="rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">OpenAI Key</div>
                  <div className="text-sm text-gray-400">
                    Used by IVY assistant to process commands.
                  </div>
                </div>
              </div>
              <input
                type="password"
                className="mt-3 w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-white/20"
                placeholder="sk-****************"
                value={settings.openaiKey}
                onChange={(e) => setField("openaiKey", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
          <h2 className="text-lg font-medium mb-4">Privacy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Toggle
              label="Usage analytics"
              checked={settings.usageAnalytics}
              onChange={(v) => setField("usageAnalytics", v)}
              hint="Anonymous usage to improve IVY."
            />
          </div>
        </section>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
          <span className="text-gray-400 text-sm">
            Stored locally for now; we’ll wire your API later.
          </span>
        </div>

        {/* Danger zone */}
        <section className="mt-6 rounded-2xl border border-red-900/40 bg-[#140c0c] p-6">
          <h2 className="text-lg font-medium mb-4 text-red-300">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Reset local settings</div>
              <div className="text-sm text-red-200/80">
                Clears saved settings from this device.
              </div>
            </div>
            <button
              onClick={dangerDelete}
              className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600"
            >
              Reset
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------- tiny UI atoms ---------- */
function Label({ children }) {
  return <label className="text-sm text-gray-300">{children}</label>;
}
function Toggle({ label, checked, onChange, hint }) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{label}</div>
          {hint && <div className="text-sm text-gray-400">{hint}</div>}
        </div>
        <button
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`w-12 h-7 rounded-full transition relative ${
            checked ? "bg-blue-600" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition-transform ${
              checked ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
function IntegrationCard({ name, connected, onConnect, onDisconnect, note }) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-400">{note}</div>
        </div>
        {connected ? (
          <button
            onClick={onDisconnect}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
          >
            Connect
          </button>
        )}
      </div>
      <div className={`mt-3 text-xs ${connected ? "text-green-400" : "text-gray-400"}`}>
        {connected ? "Connected" : "Not connected"}
      </div>
    </div>
  );
}
