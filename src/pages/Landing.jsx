import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Landing = () => {
  const { t } = useTranslation();
  const stats = t("landing.stats", { returnObjects: true });
  const features = t("landing.features.items", { returnObjects: true });
  const steps = t("landing.how.steps", { returnObjects: true });
  const checklist = t("landing.demo.checklist", { returnObjects: true });
  const timeline = t("landing.demo.timeline", { returnObjects: true });
  const testimonials = t("landing.stories.testimonials", { returnObjects: true });
  const pricingTiers = t("landing.pricing.tiers", { returnObjects: true });
  const card = t("landing.card", { returnObjects: true });
  const statsCounts = {
    travelersConfirmed: "8",
    travelersPending: "2",
    budget: "$420",
    ideas: "14",
    booked: "6",
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{t("landing.hero.eyebrow")}</p>
            <h1>{t("landing.hero.title")}</h1>
            <p className="lead">{t("landing.hero.lead")}</p>
            <div className="actions">
              <a className="btn primary" href="#plan">
                {t("landing.hero.primary")}
              </a>
              <a className="btn ghost" href="#demo">
                {t("landing.hero.secondary")}
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
              <p>{card.header}</p>
              <span className="pill">{card.dates}</span>
            </div>
            <h3>{card.name}</h3>
            <ul>
              <li>
                <strong>{statsCounts.travelersConfirmed}</strong>{" "}
                {card.travelersConfirmedLabel}{" "}
                <span className="muted">
                  +{statsCounts.travelersPending} {card.travelersPendingLabel}
                </span>
              </li>
              <li>
                <strong>{statsCounts.budget}</strong> {card.budgetLabel}
              </li>
              <li>
                <strong>{statsCounts.ideas}</strong> {card.ideasLabel},{" "}
                <strong>{statsCounts.booked}</strong> {card.bookedLabel}
              </li>
            </ul>
            <button className="btn primary full" type="button">
              {t("actions.openItinerary")}
            </button>
            <div className="progress">
              <div className="progress-bar" style={{ width: "68%" }}></div>
            </div>
            <p className="muted">{card.progress}</p>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="container">
          <div className="section-title">
            <h2>{t("landing.features.title")}</h2>
            <p>{t("landing.features.subtitle")}</p>
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
            <h2>{t("landing.how.title")}</h2>
            <p>{t("landing.how.subtitle")}</p>
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
            <h2>{t("landing.demo.title")}</h2>
            <p>{t("landing.demo.subtitle")}</p>
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
            <h2>{t("landing.stories.title")}</h2>
            <p>{t("landing.stories.subtitle")}</p>
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
            <h2>{t("landing.pricing.title")}</h2>
            <p>{t("landing.pricing.subtitle")}</p>
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
            <h2>{t("landing.cta.title")}</h2>
            <p>{t("landing.cta.subtitle")}</p>
          </div>
          <form className="cta-form" onSubmit={handleSubmit}>
            <label htmlFor="email">{t("landing.cta.label")}</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder={t("landing.cta.placeholder")}
              required
            />
            <button className="btn primary full" type="submit">
              {t("landing.cta.button")}
            </button>
            <p className="muted">{t("landing.cta.note")}</p>
            <p className="form-helper">
              {t("landing.cta.helper")} <Link to="/register">{t("landing.cta.helperLink")}</Link>.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Landing;
