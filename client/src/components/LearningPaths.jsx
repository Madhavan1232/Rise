import { motion } from 'framer-motion';
import { Browser, HardDrives, Stack, Brain, ArrowRight } from '@phosphor-icons/react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import '../styles/Sections.css';

const PATHS = [
  {
    icon: Browser,
    title: 'Frontend Development',
    duration: '3 months · 12 projects',
    steps: ['HTML & CSS Fundamentals', 'JavaScript & TypeScript', 'React & Next.js', 'Performance & Testing', 'Portfolio & Job Prep'],
  },
  {
    icon: HardDrives,
    title: 'Backend Development',
    duration: '4 months · 14 projects',
    steps: ['Python / Node.js Basics', 'REST APIs & GraphQL', 'Databases & ORM', 'Auth & Security', 'Deployment & DevOps'],
  },
  {
    icon: Stack,
    title: 'Full-Stack Engineer',
    duration: '6 months · 20 projects',
    steps: ['Frontend Foundations', 'Backend & APIs', 'Databases', 'System Design', 'Cloud Deployment'],
  },
  {
    icon: Brain,
    title: 'Data & AI',
    duration: '5 months · 16 projects',
    steps: ['Python & Statistics', 'Data Wrangling (Pandas)', 'Machine Learning (sklearn)', 'Deep Learning (PyTorch)', 'MLOps & Deployment'],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } }),
};

export default function LearningPaths() {
  const [ref, visible] = useScrollReveal();

  return (
    <section className="learning-paths" aria-labelledby="paths-title">
      <div className="section-inner">
        <header className="learning-paths__header" ref={ref}>
          <motion.p
            className="section-eyebrow"
            initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}}
          >
            Structured Roadmaps
          </motion.p>
          <motion.h2
            className="section-title" id="paths-title"
            initial={{ opacity: 0, y: 16 }} animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.08 }}
          >
            Choose your learning path
          </motion.h2>
          <motion.p
            className="section-subtitle"
            style={{ margin: '16px auto 0', maxWidth: 540 }}
            initial={{ opacity: 0, y: 16 }} animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.16 }}
          >
            Go from beginner to job-ready with curated paths built around real hiring requirements.
          </motion.p>
        </header>

        <div className="paths-grid">
          {PATHS.map((path, i) => (
            <motion.div
              key={path.title}
              className="path-card"
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={visible ? 'show' : 'hidden'}
            >
              <div className="path-card__header">
                <div className="path-card__icon">
                  <path.icon size={28} weight="duotone" />
                </div>
                <div>
                  <div className="path-card__title">{path.title}</div>
                  <div className="path-card__duration">{path.duration}</div>
                </div>
              </div>

              <div className="path-steps">
                {path.steps.map((step, j) => (
                  <div key={step} className="path-step">
                    <div className="path-step__line-wrap">
                      <div className="path-step__dot">{j + 1}</div>
                      {j < path.steps.length - 1 && <div className="path-step__connector" />}
                    </div>
                    <div className="path-step__label">{step}</div>
                  </div>
                ))}
              </div>

              <button className="path-card__cta" aria-label={`Start ${path.title} path`}>
                Start this path <ArrowRight size={14} weight="bold" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
