import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

function formatDateLabel(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    custom_answer: "",
  });

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoadingEvent(true);
        setError("");
        const res = await api.get(`/events/${slug}`);
        setEvent(res.data);
      } catch (err) {
        console.error(err);
        setError("We couldn't load this booking page.");
      } finally {
        setLoadingEvent(false);
      }
    };

    loadEvent();
  }, [slug]);

  useEffect(() => {
    if (!date || !event) return;

    const loadSlots = async () => {
      try {
        setLoadingSlots(true);
        setError("");
        const res = await api.get("/availability/slots", {
          params: {
            event_id: event.id,
            date,
          },
        });
        setSlots(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Slot fetch error:", err);
        setSlots([]);
        setError("Available times couldn't be loaded for the selected day.");
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [date, event]);

  const submitDisabled = !selectedTime || !form.name || !form.email;
  const selectedSummary = useMemo(() => {
    if (!selectedTime || !date) return "Choose a date and time to continue.";
    return `${formatDateLabel(date)} at ${selectedTime}`;
  }, [date, selectedTime]);

  const handleBooking = async () => {
    try {
      const formattedTime =
        selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime;

      await api.post("/bookings", {
        event_id: event.id,
        date,
        time: formattedTime,
        ...form,
      });

      navigate("/confirmation", {
        state: { event, date, time: selectedTime, ...form },
      });
    } catch (err) {
      console.error(err);
      window.alert(err.response?.data?.message || "Booking failed");
    }
  };

  if (loadingEvent) {
    return <div className="center-state">Loading booking page...</div>;
  }

  if (error && !event) {
    return <div className="center-state">{error}</div>;
  }

  return (
    <div className="booking-shell">
      <header className="booking-topbar">
        <Link to="/" className="brand-mark">
          <span className="brand-mark__dot" />
          <span>Schedule</span>
        </Link>
        <span className="booking-topbar__meta">Public booking page</span>
      </header>

      <div className="booking-layout">
        <section className="booking-overview">
          <span className="eyebrow">Book meeting</span>
          <h1>{event.title}</h1>
          <p>{event.description || "Choose a slot and enter your details to confirm."}</p>

          <div className="booking-summary">
            <div>
              <span>Duration</span>
              <strong>{event.duration} minutes</strong>
            </div>
            <div>
              <span>Selected</span>
              <strong>{selectedSummary}</strong>
            </div>
            {(Number(event.buffer_before) || Number(event.buffer_after)) > 0 ? (
              <div>
                <span>Buffer</span>
                <strong>
                  {Number(event.buffer_before) || 0}m before / {Number(event.buffer_after) || 0}m after
                </strong>
              </div>
            ) : null}
          </div>

          <label className="field-label" htmlFor="booking-date">
            Select date
          </label>
          <input
            id="booking-date"
            type="date"
            className="input"
            min={new Date().toISOString().split("T")[0]}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedTime("");
            }}
          />

          <div className="booking-form">
            <label className="field-label" htmlFor="booking-name">
              Your name
            </label>
            <input
              id="booking-name"
              className="input"
              placeholder="Taylor Morgan"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label className="field-label" htmlFor="booking-email">
              Email address
            </label>
            <input
              id="booking-email"
              type="email"
              className="input"
              placeholder="taylor@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            {event.custom_question ? (
              <>
                <label className="field-label" htmlFor="booking-custom-answer">
                  {event.custom_question}
                </label>
                <input
                  id="booking-custom-answer"
                  className="input"
                  placeholder="Add a short answer"
                  value={form.custom_answer}
                  onChange={(e) => setForm({ ...form, custom_answer: e.target.value })}
                />
              </>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleBooking}
            disabled={submitDisabled}
            className="button button--primary button--block"
          >
            Confirm booking
          </button>
        </section>

        <section className="booking-slots">
          <div className="booking-slots__header">
            <div>
              <span className="eyebrow">Available times</span>
              <h2>{date ? formatDateLabel(date) : "Pick a day first"}</h2>
            </div>
          </div>

          {error && event ? <div className="notice notice--error">{error}</div> : null}
          {!date ? <p className="panel-hint">Select a date to reveal available time slots.</p> : null}
          {loadingSlots ? <p className="panel-hint">Loading available slots...</p> : null}
          {!loadingSlots && date && slots.length === 0 ? (
            <p className="panel-hint">No slots are available on this day.</p>
          ) : null}

          <div className="slots-grid">
            {slots.map((slot) => {
              const isSelected = selectedTime === slot;

              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`slot-button ${isSelected ? "slot-button--selected" : ""}`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
