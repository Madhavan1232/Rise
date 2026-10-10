import { motion } from 'framer-motion';
import { UserPlus, BookBookmark, Briefcase } from '@phosphor-icons/react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import '../styles/Sections.css';

const STEPS = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Create your free account',
    desc: 'Sign up in 30 seconds. No credit card needed. Pick your goal and we build your roadmap instantly.',
  },
  {
    num: '02',
    icon: BookBookmark,
    title: 'Follow your personalised path',
    desc: 'Learn through bite-sized lessons, coding labs, and quizzes — guided by an AI mentor that adapts to your pace.',
  },
  {
    num: '03',
    icon: Briefcase,
    title: 'Land your next opportunity',
    desc: 'Earn verifiable certifications, build a portfolio of real projects, and get matched to employers hiring now.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] } }),
};

export default function HowItWorks() {
  const [ref, visible] = useScrollReveal();

  return (
    <section className="how-it-works" aria-labelledby="how-title">
      <div className="section-inner">
        <header className="how-it-works__header" ref={ref}>
          <motion.p
            className="section-eyebrow"
            initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}}
          >
            Simple Process
          </motion.p>
          <motion.h2
            className="section-title" id="how-title"
            initial={{ opacity: 0, y: 16 }} animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.08 }}
          >
            From zero to hired in 3 steps
          </motion.h2>
        </header>

        <div className="steps-row">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="step-card"
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={visible ? 'show' : 'hidden'}
            >
              <div className="step-card__number">{step.num}</div>
              <div className="step-card__icon-box">
                <step.icon size={32} weight="duotone" />
              </div>
              <h3 className="step-card__title">{step.title}</h3>
              <p className="step-card__desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
