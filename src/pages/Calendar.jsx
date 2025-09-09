// src/pages/Calendar.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../components/Sidebar";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

const LS_KEY = "ivy_calendar_events_v1";

export default function Calendar() {
  const calendarRef = useRef(null);
  const selectionRef = useRef(null); // keep last selection
  const [events, setEvents] = useState([]);

  // 🔵 modal state (INSIDE the component)
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    notes: "",
  });

  // Load/save events locally
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setEvents(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(events));
  }, [events]);

  const addEvent = useCallback((e) => setEvents((p) => [...p, e]), []);
  const upsertEvent = useCallback(
    (id, patch) => setEvents((p) => p.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev))),
    []
  );
  const removeEvent = useCallback((id) => setEvents((p) => p.filter((ev) => ev.id !== id)), []);

  // When user drags/selects a date on the calendar
  const handleDateSelect = (selectInfo) => {
    selectionRef.current = selectInfo;
    // Immediately unselect to remove the yellow band (we’ll still use the dates)
    selectInfo.view.calendar.unselect();

    setFormData({
      title: "",
      date: selectInfo.startStr.split("T")[0],
      notes: "",
    });
    setShowForm(true);
  };

  const submitForm = () => {
    if (!formData.title) return;

    const baseDate = formData.date; // YYYY-MM-DD
    addEvent({
      id: crypto.randomUUID(),
      title: formData.title,
      start: baseDate,
      allDay: true,
      extendedProps: { notes: formData.notes },
    });

    setShowForm(false);
    selectionRef.current = null;
  };

  const handleEventClick = (clickInfo) => {
    const { id, title } = clickInfo.event;
    if (confirm(`Delete "${title}"?`)) {
      clickInfo.event.remove();
      removeEvent(id);
    }
  };

  const handleEventDrop = (info) => {
    const { id, startStr, endStr, allDay } = info.event;
    upsertEvent(id, { start: startStr, end: endStr ?? null, allDay });
  };

  const handleEventResize = (info) => {
    const { id, startStr, endStr } = info.event;
    upsertEvent(id, { start: startStr, end: endStr ?? null });
  };

  // Close on Escape / backdrop click
  const closeForm = () => setShowForm(false);

  return (
    <div className="flex min-h-screen bg-[#0f1115] text-white">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => calendarRef.current?.getApi().today()}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15"
            >
              Today
            </button>
            <button
              onClick={() => calendarRef.current?.getApi().prev()}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15"
            >
              Prev
            </button>
            <button
              onClick={() => calendarRef.current?.getApi().next()}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b0d12] p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "title",
              center: "",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            height="auto"
            selectable
            selectMirror
            editable
            eventStartEditable
            eventDurationEditable
            longPressDelay={0}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            events={events}
            dayMaxEventRows={3}
            aspectRatio={1.6}
          />
        </div>

        {/* Modal */}
        {showForm && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
            onClick={closeForm}
            onKeyDown={(e) => e.key === "Escape" && closeForm()}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="w-96 rounded-2xl bg-[#1a1d24] p-6 shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">Add Event</h2>

              <label className="block text-sm mb-1 opacity-80">Event Title</label>
              <input
                autoFocus
                type="text"
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full mb-3 px-3 py-2 rounded-lg bg-[#0f1115] border border-white/20 focus:border-blue-500 outline-none"
              />

              <label className="block text-sm mb-1 opacity-80">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full mb-3 px-3 py-2 rounded-lg bg-[#0f1115] border border-white/20 focus:border-blue-500 outline-none"
              />

              <label className="block text-sm mb-1 opacity-80">Notes</label>
              <textarea
                rows={3}
                placeholder="Details, location, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full mb-4 px-3 py-2 rounded-lg bg-[#0f1115] border border-white/20 focus:border-blue-500 outline-none resize-y"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={closeForm}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={submitForm}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
