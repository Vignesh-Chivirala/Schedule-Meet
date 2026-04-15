import { Link } from "react-router-dom";

const navItems = ["Features", "Experience", "Dashboard"];
const slots = ["10:00", "10:30", "11:00", "11:30", "14:00", "14:30"];

const highlights = [
  {
    title: "Cleaner booking flow",
    description:
      "Event details, date selection, and confirmation now live in one coherent flow.",
  },
  {
    title: "Reliable fallback",
    description:
      "The app keeps working even when the local MySQL setup is incomplete.",
  },
];

export default function Home() {
  return (
    <div className="marketing-shell marketing-shell--dark">
      <header className="marketing-nav marketing-nav--dark">
        <Link to="/" className="brand-mark">
          <span className="brand-mark__badge" aria-hidden="true">
            <span className="brand-mark__calendar" />
          </span>
          <span>Schedule</span>
        </Link>

        <nav className="marketing-nav__links marketing-nav__links--dark">
          {navItems.map((item) => (
            <span key={item} className="marketing-nav__link marketing-nav__link--dark">
              {item}
            </span>
          ))}
        </nav>

        <div className="marketing-nav__actions marketing-nav__actions--hero">
          <Link to="/dashboard" className="button button--hero-outline">
            Open app
          </Link>
          <Link to="/book/intro-call" className="button button--hero-solid">
            Book demo
          </Link>
        </div>
      </header>

      <main className="marketing-main marketing-main--dark">
        <section className="hero-grid">
          <div className="hero-copy hero-copy--dark">
            <span className="marketing-badge marketing-badge--dark">
              Working scheduling flow with upgraded UI
            </span>

            <h1>Schedule meetings with a calmer, sharper booking experience.</h1>

            <p>
              This rebuild keeps the product lightweight while pushing the experience
              closer to a modern scheduling app: cleaner hierarchy, stronger visual
              rhythm, and a booking flow that actually connects to usable data.
            </p>

            <div className="hero-actions hero-actions--dark">
              <Link to="/book/intro-call" className="button button--hero-primary">
                Try booking page
              </Link>
              <Link to="/dashboard" className="button button--hero-outline">
                View dashboard
              </Link>
            </div>
          </div>

          <div className="hero-showcase">
            <section className="showcase-card">
              <div className="showcase-card__header">
                <div>
                  <p className="showcase-card__eyebrow">Mia Chen</p>
                  <h2>Discovery call</h2>
                </div>
                <span className="showcase-live">Live</span>
              </div>

              <p className="showcase-card__description">
                A fast, high-signal meeting page that feels intentional on desktop and mobile.
              </p>

              <div className="showcase-slot-panel">
                <div className="showcase-slot-meta">30 min</div>
                <div className="showcase-slots">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`showcase-slot ${slot === "10:30" ? "showcase-slot--active" : ""}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="showcase-highlights">
                {highlights.map((item) => (
                  <article key={item.title} className="showcase-highlight-card">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>

              <Link to="/book/intro-call" className="button button--hero-outline showcase-cta">
                Open booking page
              </Link>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
