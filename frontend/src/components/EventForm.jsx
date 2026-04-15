import { useEffect, useState } from "react";
import api from "../api/api";

const initialForm = {
  title: "",
  description: "",
  duration: "",
  slug: "",
  buffer_before: 0,
  buffer_after: 0,
  custom_question: "",
};

export default function EventForm({ refresh, editData, closeModal }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        description: editData.description || "",
        duration: editData.duration || "",
        slug: editData.slug || "",
        buffer_before: editData.buffer_before || 0,
        buffer_after: editData.buffer_after || 0,
        custom_question: editData.custom_question || "",
      });
      return;
    }

    setForm(initialForm);
  }, [editData]);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editData) {
        await api.put(`/events/${editData.id}`, form);
      } else {
        await api.post("/events", form);
      }

      setForm(initialForm);
      refresh();
      closeModal();
    } catch (err) {
      console.error(err);
      window.alert("Error saving event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <div className="field-group">
        <label className="field-label" htmlFor="event-title">
          Title
        </label>
        <input
          id="event-title"
          className="input"
          placeholder="Intro call"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="event-description">
          Description
        </label>
        <input
          id="event-description"
          className="input"
          placeholder="15 minute conversation to align on goals"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <div className="field-row">
        <div className="field-group">
          <label className="field-label" htmlFor="event-duration">
            Duration
          </label>
          <input
            id="event-duration"
            type="number"
            min="1"
            className="input"
            placeholder="30"
            value={form.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="event-slug">
            Public slug
          </label>
          <input
            id="event-slug"
            className="input"
            placeholder="intro-call"
            value={form.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field-group">
          <label className="field-label" htmlFor="event-buffer-before">
            Buffer before
          </label>
          <input
            id="event-buffer-before"
            type="number"
            min="0"
            className="input"
            placeholder="0"
            value={form.buffer_before}
            onChange={(e) => handleChange("buffer_before", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="event-buffer-after">
            Buffer after
          </label>
          <input
            id="event-buffer-after"
            type="number"
            min="0"
            className="input"
            placeholder="0"
            value={form.buffer_after}
            onChange={(e) => handleChange("buffer_after", e.target.value)}
          />
        </div>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="event-custom-question">
          Custom booking question
        </label>
        <input
          id="event-custom-question"
          className="input"
          placeholder="What would you like to cover?"
          value={form.custom_question}
          onChange={(e) => handleChange("custom_question", e.target.value)}
        />
      </div>

      <button type="submit" disabled={saving} className="button button--primary button--block">
        {saving ? "Saving..." : editData ? "Update event" : "Create event"}
      </button>
    </form>
  );
}
