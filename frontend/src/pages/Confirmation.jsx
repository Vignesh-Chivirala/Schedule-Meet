import { Link, useLocation } from "react-router-dom";

export default function Confirmation() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="center-state">
        <div>
          <h1>No booking found</h1>
          <p>Complete a booking first, then this page will show the confirmation details.</p>
          <Link to="/" className="button button--primary">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="center-state">
      <section className="confirmation-card">
        <span className="confirmation-badge">Confirmed</span>
        <h1>{state.event.title}</h1>
        <p>Your meeting is on the calendar. A concise summary is below.</p>

        <div className="confirmation-grid">
          <div>
            <span>Name</span>
            <strong>{state.name}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{state.email}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{state.date}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{state.time}</strong>
          </div>
          {state.custom_answer ? (
            <div>
              <span>Booking note</span>
              <strong>{state.custom_answer}</strong>
            </div>
          ) : null}
        </div>

        <div className="hero-actions">
          <Link to="/" className="button button--primary">
            Back to home
          </Link>
          <Link to="/dashboard" className="button button--secondary">
            Open dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
