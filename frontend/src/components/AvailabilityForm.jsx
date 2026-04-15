import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

const daysList = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilityForm({ eventId }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [overrides, setOverrides] = useState([]);
  const [overrideForm, setOverrideForm] = useState({
    override_date: "",
    start_time: "09:00",
    end_time: "17:00",
    is_blocked: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    const loadAvailability = async () => {
      try {
        setLoading(true);
        setError("");
        setNotice("");

        const [availabilityRes, overridesRes] = await Promise.all([
          api.get(`/availability/${eventId}`),
          api.get(`/availability/overrides/${eventId}`),
        ]);
        const entries = Array.isArray(availabilityRes.data) ? availabilityRes.data : [];
        setOverrides(Array.isArray(overridesRes.data) ? overridesRes.data : []);

        if (entries.length === 0) {
          setSelectedDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
          setStart("09:00");
          setEnd("17:00");
          return;
        }

        setSelectedDays(entries.map((entry) => entry.day_of_week));
        setStart(entries[0].start_time?.slice(0, 5) || "09:00");
        setEnd(entries[0].end_time?.slice(0, 5) || "17:00");
      } catch (err) {
        console.error(err);
        setError("We couldn't load saved availability.");
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [eventId]);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((value) => value !== day)
        : [...prev, day],
    );
  };

  const sortedSelectedDays = useMemo(
    () => daysList.filter((day) => selectedDays.includes(day)),
    [selectedDays],
  );

  const save = async () => {
    if (selectedDays.length === 0) {
      setError("Select at least one day before saving.");
      return;
    }

    if (start >= end) {
      setError("End time must be later than start time.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setNotice("");

      await api.post("/availability", {
        event_id: eventId,
        days: sortedSelectedDays,
        start_time: start,
        end_time: end,
        timezone: "Asia/Kolkata",
      });

      setNotice("Availability saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Saving availability failed.");
    } finally {
      setSaving(false);
    }
  };

  const saveOverride = async () => {
    if (!overrideForm.override_date) {
      setError("Select a date for the override.");
      return;
    }

    if (!overrideForm.is_blocked && overrideForm.start_time >= overrideForm.end_time) {
      setError("Override end time must be later than start time.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setNotice("");

      await api.post("/availability/overrides", {
        event_id: eventId,
        override_date: overrideForm.override_date,
        start_time: overrideForm.is_blocked ? null : overrideForm.start_time,
        end_time: overrideForm.is_blocked ? null : overrideForm.end_time,
        is_blocked: overrideForm.is_blocked,
      });

      const res = await api.get(`/availability/overrides/${eventId}`);
      setOverrides(Array.isArray(res.data) ? res.data : []);
      setOverrideForm({
        override_date: "",
        start_time: "09:00",
        end_time: "17:00",
        is_blocked: false,
      });
      setNotice("Override saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Saving the date override failed.");
    } finally {
      setSaving(false);
    }
  };

  const removeOverride = async (id) => {
    try {
      setSaving(true);
      setError("");
      setNotice("");
      await api.delete(`/availability/overrides/${id}`);
      setOverrides((current) => current.filter((override) => override.id !== id));
      setNotice("Override removed.");
    } catch (err) {
      console.error(err);
      setError("Deleting the override failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="panel-empty panel-empty--compact">Loading event availability...</div>;
  }

  return (
    <div className="availability-form">
      <div className="availability-panel">
        <div className="section-heading">
          <h2>Weekly hours</h2>
          <span>{sortedSelectedDays.length} active days</span>
        </div>

        <p className="panel-hint">
          Guests will only see 30-minute slots inside this window on the selected days.
        </p>

        <div className="availability-day-grid">
          {daysList.map((day) => {
            const isSelected = selectedDays.includes(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`availability-day-pill ${
                  isSelected ? "availability-day-pill--active" : ""
                }`}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="availability-panel">
        <div className="section-heading">
          <h2>Time range</h2>
          <span>{start} to {end}</span>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label" htmlFor="availability-start">
              Start time
            </label>
            <input
              id="availability-start"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="input"
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="availability-end">
              End time
            </label>
            <input
              id="availability-end"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="availability-panel">
        <div className="section-heading">
          <h2>Date overrides</h2>
          <span>{overrides.length} saved</span>
        </div>

        <p className="panel-hint">
          Block a specific date or replace its default hours with a different window.
        </p>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label" htmlFor="override-date">
              Date
            </label>
            <input
              id="override-date"
              type="date"
              className="input"
              value={overrideForm.override_date}
              onChange={(e) =>
                setOverrideForm((current) => ({ ...current, override_date: e.target.value }))
              }
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="override-start">
              Start
            </label>
            <input
              id="override-start"
              type="time"
              className="input"
              value={overrideForm.start_time}
              disabled={overrideForm.is_blocked}
              onChange={(e) =>
                setOverrideForm((current) => ({ ...current, start_time: e.target.value }))
              }
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="override-end">
              End
            </label>
            <input
              id="override-end"
              type="time"
              className="input"
              value={overrideForm.end_time}
              disabled={overrideForm.is_blocked}
              onChange={(e) =>
                setOverrideForm((current) => ({ ...current, end_time: e.target.value }))
              }
            />
          </div>
        </div>

        <label className="availability-checkbox">
          <input
            type="checkbox"
            checked={overrideForm.is_blocked}
            onChange={(e) =>
              setOverrideForm((current) => ({ ...current, is_blocked: e.target.checked }))
            }
          />
          <span>Block this entire date</span>
        </label>

        <button
          type="button"
          onClick={saveOverride}
          disabled={saving}
          className="button button--secondary"
        >
          Save date override
        </button>

        <div className="override-list">
          {overrides.length === 0 ? (
            <div className="panel-empty panel-empty--compact">No date overrides yet.</div>
          ) : (
            overrides.map((override) => (
              <div key={override.id} className="override-row">
                <div>
                  <strong>{override.override_date?.slice(0, 10)}</strong>
                  <p className="panel-hint">
                    {override.is_blocked
                      ? "Blocked all day"
                      : `${override.start_time?.slice(0, 5)} to ${override.end_time?.slice(0, 5)}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeOverride(override.id)}
                  className="button button--ghost"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {error ? <div className="notice notice--error">{error}</div> : null}
      {notice ? <div className="notice notice--success">{notice}</div> : null}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="button button--primary"
      >
        {saving ? "Saving..." : "Save availability"}
      </button>
    </div>
  );
}
