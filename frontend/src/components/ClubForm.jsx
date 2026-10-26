import { useState } from "react";
import api, { errorMessage } from "../api/client";
import { CLUB_CATEGORIES } from "../utils/format";
import { useAuth } from "../context/authContext";
import { Alert, Field, SubmitButton } from "./ui";

// Create (admin) or edit a club.  Pass `club` to edit.
export default function ClubForm({ club, onSaved, onCancel }) {
  const editing = Boolean(club);
  const { accountType, isAdmin } = useAuth();
  const [form, setForm] = useState({
    name: club?.name || "",
    description: club?.description || "",
    category: club?.category || "Technology",
    contact_email: club?.contact_email || "",
    logo_url: club?.logo_url || "",
    president_email: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.description.trim()) {
      setError("Please enter a club name and description.");
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        const data = { ...form };
        delete data.president_email;
        await api.put(`/clubs/${club.id}`, data);
        onSaved?.();
      } else {
        const res = await api.post("/clubs", form);
        onSaved?.(res.data.id);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Alert onClose={() => setError("")}>{error}</Alert>

      <Field label="Club name">
        <input value={form.name} onChange={set("name")} placeholder="e.g. IEEE Student Branch" />
      </Field>

      <Field label="Description">
        <textarea
          rows={4}
          value={form.description}
          onChange={set("description")}
          placeholder="What does the club do? Who should join?"
        />
      </Field>

      <div className="form-row">
        <Field label="Category">
          <select value={form.category} onChange={set("category")}>
            {CLUB_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Contact email">
          <input type="email" value={form.contact_email} onChange={set("contact_email")} placeholder="club@university.lk" />
        </Field>
      </div>

      <Field label="Logo URL" hint="Optional. Link to a square image.">
        <input value={form.logo_url} onChange={set("logo_url")} placeholder="https://..." />
      </Field>

      {!editing && isAdmin && accountType !== "club" && (
        <Field label="President's email" hint="Optional. Must be a registered user - they become the club president.">
          <input type="email" value={form.president_email} onChange={set("president_email")} placeholder="student@university.lk" />
        </Field>
      )}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <SubmitButton loading={saving}>{editing ? "Save changes" : "Create club"}</SubmitButton>
      </div>
    </form>
  );
}
