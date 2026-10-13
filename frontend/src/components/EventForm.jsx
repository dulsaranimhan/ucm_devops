import { useState } from "react";
import api, { errorMessage } from "../api/client";
import { toInputDateTime } from "../utils/format";
import { Alert, Field, SubmitButton } from "./ui";

// Create an event for a club (pass clubId) or edit one (pass event)
export default function EventForm({ clubId, event, onSaved, onCancel }) {
  const editing = Boolean(event);
  const [form, setForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    venue: event?.venue || "",
    event_date: toInputDateTime(event?.event_date),
    capacity: event?.capacity ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.event_date) {
      setError("Please enter a title and date.");
      return;
    }
    try {
      setSaving(true);
      if (editing) await api.put(`/events/${event.id}`, form);
      else await api.post(`/clubs/${clubId}/events`, form);
      onSaved?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Alert onClose={() => setError("")}>{error}</Alert>

      <Field label="Event title">
        <input value={form.title} onChange={set("title")} placeholder="e.g. Intro to Web Development Workshop" />
      </Field>

      <Field label="Description">
        <textarea rows={3} value={form.description} onChange={set("description")} placeholder="What will happen at this event?" />
      </Field>

      <div className="form-row">
        <Field label="Date & time">
          <input type="datetime-local" value={form.event_date} onChange={set("event_date")} />
        </Field>
        <Field label="Venue">
          <input value={form.venue} onChange={set("venue")} placeholder="e.g. Main Auditorium" />
        </Field>
      </div>

      <Field label="Capacity" hint="Leave empty for unlimited seats.">
        <input type="number" min="1" value={form.capacity} onChange={set("capacity")} placeholder="Unlimited" />
      </Field>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <SubmitButton loading={saving}>{editing ? "Save changes" : "Create event"}</SubmitButton>
      </div>
    </form>
  );
}
