import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import EventForm from "../components/EventForm";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/events");
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("We couldn't load your event types right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      console.error(err);
      setError("Deleting the event failed. Please try again.");
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
          <Link to="/dashboard" className="sidebar-link sidebar-link--active">
            Event types
          </Link>
          <Link to="/bookings" className="sidebar-link">
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
            <span className="eyebrow">Workspace</span>
            <h1>Event types</h1>
            <p>Create shareable booking pages with concise public details.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditEvent(null);
              setShowModal(true);
            }}
            className="button button--primary"
          >
            New event type
          </button>
        </section>

        <section className="stats-row">
          <article className="stat-card">
            <span>Total event types</span>
            <strong>{events.length}</strong>
          </article>
          <article className="stat-card">
            <span>Shareable links</span>
            <strong>{events.filter((event) => event.slug).length}</strong>
          </article>
        </section>

        {error ? <div className="notice notice--error">{error}</div> : null}

        {loading ? (
          <div className="panel-empty">Loading event types...</div>
        ) : events.length === 0 ? (
          <div className="panel-empty">
            <h2>No event types yet</h2>
            <p>Create your first booking link to start sharing availability.</p>
          </div>
        ) : (
          <section className="list-panel">
            {events.map((event) => (
              <article key={event.id} className="event-row">
                <div className="event-row__main">
                  <h2>{event.title}</h2>
                  <p>{event.description || "No description added yet."}</p>
                  <div className="event-meta">
                    <span className="pill">/{event.slug}</span>
                    <span className="pill">{event.duration} min</span>
                    {(Number(event.buffer_before) || Number(event.buffer_after)) > 0 ? (
                      <span className="pill">
                        {Number(event.buffer_before) || 0}/{Number(event.buffer_after) || 0} min buffer
                      </span>
                    ) : null}
                    {event.custom_question ? <span className="pill">Custom question</span> : null}
                  </div>
                </div>

                <div className="event-actions">
                 <Link to={`/book/${event.slug}`} className="button button--ghost">
  Open
</Link>
                  <button
                    type="button"
                    onClick={() => {
                      setEditEvent(event);
                      setShowModal(true);
                    }}
                    className="button button--secondary"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    className="button button--danger"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {showModal ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
            <div className="modal-card__header">
              <div>
                <span className="eyebrow">Event editor</span>
                <h2 id="event-modal-title">
                  {editEvent ? "Update event type" : "Create event type"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditEvent(null);
                }}
                className="button button--ghost"
              >
                Close
              </button>
            </div>

            <EventForm
              refresh={fetchEvents}
              editData={editEvent}
              closeModal={() => {
                setShowModal(false);
                setEditEvent(null);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
