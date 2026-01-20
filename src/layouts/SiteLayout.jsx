import { Link, Outlet } from "react-router-dom";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#stories", label: "Stories" },
];

const footerLinks = {
  Product: [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#demo", label: "Demo" },
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

const SiteLayout = () => {
  return (
    <div className="app">
      <header className="site-header">
        <div className="container nav">
          <Link className="logo" to="/">
            Waypoint
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <Link className="text-link" to="/login">
              Log in
            </Link>
            <Link className="btn small" to="/register">
              Start planning
            </Link>
          </div>
        </div>
      </header>

      <Outlet />

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

export default SiteLayout;
