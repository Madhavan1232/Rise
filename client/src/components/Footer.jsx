import { FaXTwitter, FaYoutube, FaLinkedinIn, FaGithub, FaInstagram } from 'react-icons/fa6';
import '../styles/Sections.css';

const CURRENT_YEAR = new Date().getFullYear();

const COLS = [
  {
    title: 'Product',
    links: ['Courses', 'Labs', 'Certifications', 'AI Mentor', 'Live Sessions', 'Course Builder'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Press', 'Partners', 'Affiliates'],
  },
  {
    title: 'Resources',
    links: ['Blog', 'Webinars', 'Case Studies', 'Help Center', 'Community', 'Status'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Accessibility'],
  },
];

const SOCIAL = [
  { Icon: FaXTwitter,   label: 'Twitter / X' },
  { Icon: FaYoutube,    label: 'YouTube' },
  { Icon: FaLinkedinIn, label: 'LinkedIn' },
  { Icon: FaGithub,     label: 'GitHub' },
  { Icon: FaInstagram,  label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="footer" aria-label="Site footer">
      <div className="section-inner">
        <div className="footer__top">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__brand-logo">
              <img src="/rise_logo.svg" alt="Rise" />
            </div>
            <p className="footer__brand-desc">
              The all-in-one platform for ambitious IT learners. Go from beginner to hired.
            </p>
            <div className="footer__social" role="list" aria-label="Social media">
              {SOCIAL.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="social-btn"
                  aria-label={label}
                  role="listitem"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <div className="footer__col-title">{col.title}</div>
              <ul className="footer__links">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="footer__link">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {CURRENT_YEAR} Rise Technologies, Inc. All rights reserved.
          </p>
          <nav className="footer__legal" aria-label="Legal links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
            <a href="#">Sitemap</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
