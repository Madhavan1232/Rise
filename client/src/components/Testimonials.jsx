import { motion } from 'framer-motion';
import { Star } from '@phosphor-icons/react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import '../styles/Sections.css';

const TESTIMONIALS = [
  {
    initials: 'AS',
    name: 'Anjali Sharma',
    role: 'Junior Cloud Engineer · Wipro',
    quote:
      'I went from a complete beginner to landing my first cloud role in 5 months. The structured path and hands-on labs made all the difference — no more tutorial hell.',
  },
  {
    initials: 'RK',
    name: 'Rohit Kumar',
    role: 'Full-Stack Developer · Startup',
    quote:
      'The AI mentor knew exactly when to push me harder and when to slow down. Finished the Full-Stack path in 4 months and shipped my first SaaS product a month later.',
  },
  {
    initials: 'PM',
    name: 'Priya Mehta',
    role: 'Data Analyst · TCS',
    quote:
      'Every lesson connects directly to real work. I learned SQL and Python here, got certified, and my manager noticed within two sprints. 10/10 would recommend.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] } }),
};

export default function Testimonials() {
  const [ref, visible] = useScrollReveal();

  return (
    <section className="testimonials" aria-labelledby="testimonials-title">
      <div className="section-inner">
        <header className="testimonials__header" ref={ref}>
          <motion.p
            className="section-eyebrow"
            initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}}
          >
            Learner Stories
          </motion.p>
          <motion.h2
            className="section-title" id="testimonials-title"
            initial={{ opacity: 0, y: 16 }} animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.08 }}
          >
            Real results from real learners
          </motion.h2>
        </header>

        <div className="testimonials__grid">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              className="testimonial-card"
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={visible ? 'show' : 'hidden'}
            >
              <div className="testimonial-stars" aria-label="5 stars">
                {[...Array(5)].map((_, j) => <Star key={j} size={15} weight="fill" />)}
              </div>
              <blockquote className="testimonial-quote">"{t.quote}"</blockquote>
              <div className="testimonial-author">
                <div className="testimonial-avatar" aria-hidden="true">{t.initials}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
