import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import AvailabilityForm from "../components/AvailabilityForm";

export default function AvailabilityPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/events");
        const nextEvents = Array.isArray(res.data) ? res.data : [];
        setEvents(nextEvents);
        setSelectedEventId((current) =>
          current || nextEvents[0]?.id?.toString() || "",
        );
      } catch (err) {
        console.error(err);
        setError("We couldn't load event types for availability.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const selectedEvent =
    events.find((event) => String(event.id) === String(selectedEventId)) || null;

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
          <Link to="/bookings" className="sidebar-link">
            Bookings
          </Link>
          <Link to="/availability" className="sidebar-link sidebar-link--active">
            Availability
          </Link>
        </nav>
      </aside>

      <main className="app-main">
        <section className="page-header">
          <div>
            <span className="eyebrow">Schedule setup</span>
            <h1>Availability</h1>
            <p>Choose which days and hours guests can book for each event type.</p>
          </div>
        </section>

        {error ? <div className="notice notice--error">{error}</div> : null}

        {loading ? (
          <div className="panel-empty">Loading availability settings...</div>
        ) : events.length === 0 ? (
          <div className="panel-empty">
            <h2>No event types yet</h2>
            <p>Create an event type first, then set its weekly availability.</p>
          </div>
        ) : (
          <div className="availability-layout">
            <section className="availability-sidebar-card">
              <div className="section-heading">
                <h2>Event types</h2>
                <span>{events.length} total</span>
              </div>

              <div className="availability-event-list">
                {events.map((event) => {
                  const isActive = String(event.id) === String(selectedEventId);

                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setSelectedEventId(String(event.id))}
                      className={`availability-event-button ${
                        isActive ? "availability-event-button--active" : ""
                      }`}
                    >
                      <strong>{event.title}</strong>
                      <span>/{event.slug}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="availability-main-card">
              {selectedEvent ? (
                <>
                  <div className="availability-main-card__header">
                    <div>
                      <span className="eyebrow">Editing availability</span>
                      <h2>{selectedEvent.title}</h2>
                    </div>
                    <span className="pill">{selectedEvent.duration} min meeting</span>
                  </div>

                  <AvailabilityForm eventId={selectedEvent.id} />
                </>
              ) : (
                <div className="panel-empty panel-empty--compact">
                  Select an event type to edit its hours.
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
