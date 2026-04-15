import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

function parseDateTime(date, time) {
  const [hours, minutes] = time.split(":");
  const result = new Date(date);
  result.setHours(Number(hours), Number(minutes), 0, 0);
  return result;
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBooking, setEditingBooking] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/bookings");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("We couldn't load bookings right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const now = new Date();
  const upcoming = bookings
    .filter((booking) => parseDateTime(booking.date, booking.time) >= now)
    .sort((a, b) => parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time));
  const past = bookings
    .filter((booking) => parseDateTime(booking.date, booking.time) < now)
    .sort((a, b) => parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time));

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      await api.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (err) {
      console.error(err);
      setError("Canceling the booking failed. Please try again.");
    }
  };

  useEffect(() => {
    if (!editingBooking || !rescheduleDate) return;

    const loadSlots = async () => {
      try {
        setRescheduleLoading(true);
        const res = await api.get("/availability/slots", {
          params: {
            event_id: editingBooking.event_id,
            date: rescheduleDate,
          },
        });

        const nextSlots = Array.isArray(res.data) ? res.data : [];
        if (
          rescheduleDate === editingBooking.date?.slice(0, 10) &&
          editingBooking.time &&
          !nextSlots.includes(editingBooking.time.slice(0, 5))
        ) {
          nextSlots.unshift(editingBooking.time.slice(0, 5));
        }

        setRescheduleSlots(nextSlots);
      } catch (err) {
        console.error(err);
        setRescheduleSlots([]);
        setError("We couldn't load slots for rescheduling.");
      } finally {
        setRescheduleLoading(false);
      }
    };

    loadSlots();
  }, [editingBooking, rescheduleDate]);

  const openReschedule = (booking) => {
    setEditingBooking(booking);
    setRescheduleDate(booking.date?.slice(0, 10) || "");
    setRescheduleTime(booking.time?.slice(0, 5) || "");
    setRescheduleSlots([]);
  };

  const saveReschedule = async () => {
    if (!editingBooking || !rescheduleDate || !rescheduleTime) return;

    try {
      await api.put(`/bookings/${editingBooking.id}`, {
        date: rescheduleDate,
        time: `${rescheduleTime}:00`,
      });
      setEditingBooking(null);
      setRescheduleDate("");
      setRescheduleTime("");
      setRescheduleSlots([]);
      fetchBookings();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Rescheduling failed.");
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand-mark">
          <span className="brand-mark__dot" />
          <span>Schedule</span>
        </Link>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="sidebar-link">
            Event types
          </Link>
          <Link to="/bookings" className="sidebar-link sidebar-link--active">
            Bookings
          </Link>
          <Link to="/availability" className="sidebar-link">
            Availability
          </Link>
        </nav>
      </aside>

      <main className="app-main">
        <section className="page-header">
          <div>
            <span className="eyebrow">Meetings</span>
            <h1>Bookings</h1>
            <p>Track upcoming meetings and keep a clean history of completed sessions.</p>
          </div>
        </section>

        {error ? <div className="notice notice--error">{error}</div> : null}

        {loading ? (
          <div className="panel-empty">Loading bookings...</div>
        ) : (
          <>
            <section className="list-section">
              <div className="section-heading">
                <h2>Upcoming</h2>
                <span>{upcoming.length} scheduled</span>
              </div>

              {upcoming.length === 0 ? (
                <div className="panel-empty panel-empty--compact">No upcoming bookings</div>
              ) : (
                <div className="list-panel">
                  {upcoming.map((booking) => (
                    <article key={booking.id} className="event-row">
                      <div className="event-row__main">
                        <h2>{booking.name}</h2>
                        <p>{booking.event_title || "Event"}</p>
                        <p>{booking.email}</p>
                        {booking.custom_answer ? (
                          <p className="booking-answer">"{booking.custom_answer}"</p>
                        ) : null}
                        <div className="event-meta">
                          <span className="pill">{booking.date}</span>
                          <span className="pill">{booking.time}</span>
                        </div>
                      </div>

                      <div className="event-actions">
                        <button
                          type="button"
                          onClick={() => openReschedule(booking)}
                          className="button button--secondary"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelBooking(booking.id)}
                          className="button button--danger"
                        >
                          Cancel
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="list-section">
              <div className="section-heading">
                <h2>Past</h2>
                <span>{past.length} completed</span>
              </div>

              {past.length === 0 ? (
                <div className="panel-empty panel-empty--compact">No past bookings</div>
              ) : (
                <div className="list-panel">
                  {past.map((booking) => (
                    <article key={booking.id} className="event-row event-row--muted">
                      <div className="event-row__main">
                        <h2>{booking.name}</h2>
                        <p>{booking.event_title || "Event"}</p>
                        <p>{booking.email}</p>
                        <div className="event-meta">
                          <span className="pill">{booking.date}</span>
                          <span className="pill">{booking.time}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {editingBooking ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true">
            <div className="modal-card__header">
              <div>
                <span className="eyebrow">Reschedule booking</span>
                <h2>{editingBooking.name}</h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="button button--ghost"
              >
                Close
              </button>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="reschedule-date">
                Select date
              </label>
              <input
                id="reschedule-date"
                type="date"
                className="input"
                value={rescheduleDate}
                onChange={(e) => {
                  setRescheduleDate(e.target.value);
                  setRescheduleTime("");
                }}
              />
            </div>

            {rescheduleLoading ? <p className="panel-hint">Loading available times...</p> : null}

            <div className="slots-grid">
              {rescheduleSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setRescheduleTime(slot)}
                  className={`slot-button ${rescheduleTime === slot ? "slot-button--selected" : ""}`}
                >
                  {slot}
                </button>
              ))}
            </div>

            {!rescheduleLoading && rescheduleDate && rescheduleSlots.length === 0 ? (
              <p className="panel-hint">No times available on this date.</p>
            ) : null}

            <button type="button" onClick={saveReschedule} className="button button--primary button--block">
              Save reschedule
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
