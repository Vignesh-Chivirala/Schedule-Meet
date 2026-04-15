const footerGroups = [
  {
    title: "Product",
    items: ["Scheduling", "Booking links", "Workflows"],
  },
  {
    title: "Use cases",
    items: ["Sales", "Recruiting", "Client calls"],
  },
  {
    title: "Resources",
    items: ["API", "Guides", "Support"],
  },
];

export default function Footer() {
  return (
    <footer className="footer footer--marketing">
      <div className="footer__intro">
        <div>
          <span className="eyebrow footer__eyebrow">Schedule</span>
          <h2>Scheduling that feels calm, clear, and ready to share.</h2>
        </div>
        <p>
          A polished booking experience for sharing links, setting availability, and
          managing meetings from a clean control panel.
        </p>
      </div>

      <div className="footer__grid">
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__bottom">
        <span>&copy; 2026 Schedule</span>
        <span>Designed for a cleaner scheduling experience</span>
      </div>
    </footer>
  );
}
