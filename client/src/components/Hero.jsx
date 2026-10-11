import { GraduationCap, ArrowRight, Code2, Brain, BarChart3 } from 'lucide-react';
import '../styles/Hero.css';

const SUBJECT_CARDS = [
  {
    icon: Code2,
    title: 'Programming',
    desc: 'Build real skills',
    href: '#topics',
    ariaLabel: 'Explore programming courses',
  },
  {
    icon: Brain,
    title: 'Artificial intelligence',
    desc: "Learn what's next",
    href: '#topics',
    ariaLabel: 'Explore artificial intelligence courses',
  },
  {
    icon: BarChart3,
    title: 'Data science',
    desc: 'Turn data into insights',
    href: '#topics',
    ariaLabel: 'Explore data science courses',
  },
];

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-headline">
      <div className="hero__inner">
        <div className="hero__banner">
          {/* ── Top Label ── */}
          <div className="hero__badge">
            <span className="hero__badge-icon" aria-hidden="true">
              <GraduationCap size={18} />
            </span>
            <span className="hero__badge-text">RISE LEARNING PLATFORM</span>
          </div>

          {/* ── Main Headline ── */}
          <h1 className="hero__headline" id="hero-headline">
            Build skills. Unlock your potential.
          </h1>

          {/* ── Description ── */}
          <p className="hero__sub">
            Learn in-demand skills with structured courses, hands-on projects, and personalized learning paths designed around your goals.
          </p>

          {/* ── Call to Action Buttons ── */}
          <div className="hero__cta">
            <a href="#topics" className="hero__btn-primary" id="hero-cta-primary">
              <span>Explore courses</span>
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a href="#learning-paths" className="hero__btn-secondary" id="hero-cta-secondary">
              <span>View learning paths</span>
            </a>
          </div>

          {/* ── Three Subject Cards ── */}
          <div className="hero__cards" role="list" aria-label="Popular subject tracks">
            {SUBJECT_CARDS.map(({ icon: Icon, title, desc, href, ariaLabel }) => (
              <a
                key={title}
                href={href}
                className="hero__card"
                role="listitem"
                aria-label={ariaLabel}
              >
                <div className="hero__card-icon" aria-hidden="true">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h2 className="hero__card-title">{title}</h2>
                <p className="hero__card-desc">{desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
