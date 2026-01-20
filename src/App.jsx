const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#stories", label: "Stories" },
];

const stats = [
  { value: "4.9", label: "Average organizer rating" },
  { value: "52k", label: "Trips coordinated in 2025" },
  { value: "12 hrs", label: "Saved per group on average" },
];

const features = [
  {
    title: "Shared itinerary",
    copy: "Drag, drop, and vote on activities. Each change updates every traveler instantly.",
  },
  {
    title: "Smart budget tracking",
    copy: "Split costs automatically, set caps, and see what is still outstanding in seconds.",
  },
  {
    title: "Live group updates",
    copy: "Built-in messaging, reminders, and checklists keep everyone on the same page.",
  },
  {
    title: "Trip templates",
    copy: "Start with curated templates for weekend getaways, retreats, or international tours.",
  },
  {
    title: "Vendor marketplace",
    copy: "Book stays, transport, and experiences directly from trusted partners.",
  },
  {
    title: "Offline access",
    copy: "Download your final plan so it is ready even when you are off the grid.",
  },
];

const steps = [
  {
    title: "Create your trip hub",
    copy: "Add dates, invite travelers, and drop in ideas from any device.",
  },
  {
    title: "Vote and finalize",
    copy: "Collect preferences, lock in bookings, and auto-build the daily schedule.",
  },
  {
    title: "Travel together",
    copy: "Share live updates, maps, and confirmations from one seamless itinerary.",
  },
];

const checklist = [
  "Automatically align arrival times and transport.",
  "Pin meeting points for every day.",
  "Set push reminders for the group.",
];

const timeline = [
  { time: "8:00 AM", title: "Meet in Lisbon", detail: "Pickup and breakfast at Avenida." },
  { time: "11:30 AM", title: "Coastal drive", detail: "Van booked, luggage packed." },
  { time: "3:00 PM", title: "Check-in", detail: "Hotel Bahia, rooms ready." },
  { time: "7:30 PM", title: "Welcome dinner", detail: "Group table reserved." },
];

const testimonials = [
  {
    quote:
      "We planned a company retreat for 24 people and never once lost track of expenses. The shared itinerary kept everyone aligned.",
    name: "Maya R.",
    title: "People Operations, Northwind",
  },
  {
    quote:
      "Waypoint made it easy to vote on activities. We saved hours of back-and-forth and still felt heard.",
    name: "Jordan P.",
    title: "Travel organizer, Atlas Crew",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$0",
    note: "Perfect for weekend getaways.",
    features: ["One active trip", "Group voting", "Basic budget tracking"],
    cta: "Get started",
    variant: "ghost",
  },
  {
    name: "Collective",
    price: "$12",
    note: "Per organizer per month.",
    features: [
      "Unlimited trips",
      "Live messaging",
      "Shared templates",
      "Automated reminders",
    ],
    cta: "Start free trial",
    variant: "primary",
    featured: true,
    badge: "Most popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "Built for travel teams at scale.",
    features: ["Dedicated concierge", "Advanced reporting", "Admin controls"],
    cta: "Contact sales",
    variant: "ghost",
  },
];

const footerLinks = {
  Product: [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#demo", label: "Demo" },
  ],
  Company: [
    { href: "#", label: "About" },
    { href: "#", label: "Careers" },
    { href: "#", label: "Contact" },
  ],
  Resources: [
    { href: "#", label: "Support" },
    { href: "#", label: "Guides" },
    { href: "#", label: "Privacy" },
  ],
};

const App = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="container nav">
          <div className="logo">Waypoint</div>
          <nav className="nav-links">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <a className="btn small" href="#plan">
            Start planning
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Trip organization platform</p>
              <h1>Plan trips that feel effortless from the first idea.</h1>
              <p className="lead">
                Keep itineraries, budgets, and group chats in one place. Waypoint helps your
                crew make decisions fast so you can focus on the trip.
              </p>
              <div className="actions">
                <a className="btn primary" href="#plan">
                  Build your itinerary
                </a>
                <a className="btn ghost" href="#demo">
                  See how it works
                </a>
              </div>
              <div className="stats">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <span>{stat.value}</span>
                    <p>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-card">
              <div className="card-header">
                <p>Upcoming trip</p>
                <span className="pill">Apr 18 - Apr 24</span>
              </div>
              <h3>Coastal Portugal Escape</h3>
              <ul>
                <li>
                  <strong>8</strong> travelers confirmed <span className="muted">+2 pending</span>
                </li>
                <li>
                  <strong>$420</strong> per traveler budget goal
                </li>
                <li>
                  <strong>14</strong> saved ideas, <strong>6</strong> booked
                </li>
              </ul>
              <button className="btn primary full" type="button">
                Open itinerary
              </button>
              <div className="progress">
                <div className="progress-bar" style={{ width: "68%" }}></div>
              </div>
              <p className="muted">68% of the plan is finalized</p>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <div className="container">
            <div className="section-title">
              <h2>Everything your group needs to move quickly</h2>
              <p>
                Waypoint keeps decisions organized with shared to-do lists, calendars, and
                budgets that update in real time.
              </p>
            </div>
            <div className="grid three">
              {features.map((feature) => (
                <article className="feature-card" key={feature.title}>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="section alt">
          <div className="container">
            <div className="section-title">
              <h2>How Waypoint works</h2>
              <p>Go from inspiration to confirmation in three focused steps.</p>
            </div>
            <div className="steps">
              {steps.map((step, index) => (
                <div className="step" key={step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="section">
          <div className="container demo">
            <div>
              <h2>See your trip timeline at a glance</h2>
              <p>
                Waypoint surfaces daily agendas, transit windows, and group check-ins so no
                one is left guessing.
              </p>
              <ul className="checklist">
                {checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="timeline">
              {timeline.map((item) => (
                <div className="timeline-item" key={`${item.time}-${item.title}`}>
                  <p className="time">{item.time}</p>
                  <div>
                    <h4>{item.title}</h4>
                    <p className="muted">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="stories" className="section alt">
          <div className="container">
            <div className="section-title">
              <h2>Teams and friend groups trust Waypoint</h2>
              <p>
                From offsites to bachelor parties, organizers rely on one shared source of
                truth.
              </p>
            </div>
            <div className="grid two">
              {testimonials.map((story) => (
                <figure className="quote" key={story.name}>
                  <blockquote>"{story.quote}"</blockquote>
                  <figcaption>
                    <strong>{story.name}</strong>
                    <span>{story.title}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="section">
          <div className="container">
            <div className="section-title">
              <h2>Simple pricing for every trip</h2>
              <p>Start free, upgrade when you need deeper coordination.</p>
            </div>
            <div className="grid three">
              {pricingTiers.map((tier) => (
                <article
                  className={["price-card", tier.featured ? "featured" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  key={tier.name}
                >
                  {tier.featured && <div className="pill">{tier.badge}</div>}
                  <h3>{tier.name}</h3>
                  <p className="price">{tier.price}</p>
                  <p className="muted">{tier.note}</p>
                  <ul>
                    {tier.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <a className={`btn ${tier.variant} full`} href="#plan">
                    {tier.cta}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="plan" className="cta">
          <div className="container cta-grid">
            <div>
              <h2>Ready to organize your next trip?</h2>
              <p>
                Create your trip hub in minutes and invite your crew to start planning
                together.
              </p>
            </div>
            <form className="cta-form" onSubmit={handleSubmit}>
              <label htmlFor="email">Work email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@team.com"
                required
              />
              <button className="btn primary full" type="submit">
                Start planning
              </button>
              <p className="muted">Free 14-day trial. No credit card required.</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div className="logo">Waypoint</div>
            <p>
              One shared space to organize, book, and experience unforgettable group travel.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4>{title}</h4>
              {links.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="container footer-bottom">
          <p>Copyright 2026 Waypoint. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
