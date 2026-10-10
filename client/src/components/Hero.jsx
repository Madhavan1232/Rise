import { motion } from 'framer-motion';
import { Users, BookOpen, Star, BookBookmark, Fire, Check } from '@phosphor-icons/react';
import '../styles/Hero.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

const TRUST = [
  { icon: Users,    text: '10K+ learners' },
  { text: '|' },
  { icon: BookOpen, text: '200+ lessons' },
  { text: '|' },
  { icon: Star,     text: '4.8 rating' },
];

const LESSONS = [
  { label: 'Variables & Data Types', done: true },
  { label: 'Control Flow', done: true },
  { label: 'Functions & Scope', done: false },
  { label: 'OOP Fundamentals', done: false },
];

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-headline">
      <div className="hero__inner">
        {/* ── Left ── */}
        <div className="hero__left">
          <motion.div
            className="hero__badge"
            custom={0} variants={fadeUp} initial="hidden" animate="show"
          >
            <span className="hero__badge-dot" aria-hidden="true" />
            Built for IT careers
          </motion.div>

          <motion.h1
            className="hero__headline"
            id="hero-headline"
            custom={1} variants={fadeUp} initial="hidden" animate="show"
          >
            Master the skills that get you{' '}
            <span className="hero__headline-gradient">hired faster</span>
          </motion.h1>

          <motion.p
            className="hero__sub"
            custom={2} variants={fadeUp} initial="hidden" animate="show"
          >
            Structured learning paths, hands-on labs, and an AI mentor that adapts
            to your goals — everything you need to land your first or next IT role.
          </motion.p>

          <motion.div
            className="hero__cta"
            custom={3} variants={fadeUp} initial="hidden" animate="show"
          >
            <a href="/signup" className="btn-primary" id="hero-cta-primary">
              Start learning free
            </a>
            <a href="#topics" className="btn-outline" id="hero-cta-secondary">
              Explore courses
            </a>
          </motion.div>

          <motion.div
            className="hero__trust"
            custom={4} variants={fadeUp} initial="hidden" animate="show"
            role="list"
            aria-label="Platform stats"
          >
            {TRUST.map((item, i) =>
              item.text === '|' ? (
                <div key={i} className="hero__trust-divider" aria-hidden="true" />
              ) : (
                <div key={i} className="hero__trust-item" role="listitem">
                  {item.icon && <item.icon size={18} weight="duotone" className="hero__trust-icon" aria-hidden="true" />}
                  <span>{item.text}</span>
                </div>
              )
            )}
          </motion.div>
        </div>

        {/* ── Right: Product Mockup ── */}
        <motion.div
          className="hero__right"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          <div className="hero__mockup-glow" />
          <div className="hero__mockup">
            {/* Main course card */}
            <div className="mockup-main">
              <div className="mockup-main__header">
                <div className="mockup-main__icon">
                  <BookBookmark size={24} weight="duotone" />
                </div>
                <div>
                  <div className="mockup-main__title">Python for IT Professionals</div>
                  <div className="mockup-main__sub">Module 3 of 8 · Beginner</div>
                </div>
              </div>

              <div className="mockup-progress-label">
                <span>Course progress</span>
                <span>68%</span>
              </div>
              <div className="mockup-progress-bar">
                <div className="mockup-progress-fill" />
              </div>

              <div className="mockup-lessons">
                {LESSONS.map((l) => (
                  <div key={l.label} className={`mockup-lesson${l.done ? ' mockup-lesson--done' : ''}`}>
                    {l.done
                      ? <div className="mockup-lesson__check"><Check size={12} weight="bold" /></div>
                      : <div className="mockup-lesson__empty" />
                    }
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Code snippet card */}
            <div className="mockup-code">
              <pre>
                <span className="cm"># AI-generated hint</span>{'\n'}
                <span className="kw">def</span> <span className="fn">greet</span>(name):{'\n'}
                {'    '}<span className="kw">return</span> <span className="str">f"Hello, {'{name}'}"</span>
              </pre>
            </div>

            {/* Streak badge */}
            <div className="mockup-streak">
              <div className="mockup-streak__fire">
                <Fire size={24} weight="duotone" />
              </div>
              <div>
                <div className="mockup-streak__count">14</div>
                <div className="mockup-streak__label">day streak</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
