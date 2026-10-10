import { motion } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import '../styles/Sections.css';

export default function CTABand() {
  const [ref, visible] = useScrollReveal();

  return (
    <section className="cta-band" aria-labelledby="cta-title" ref={ref}>
      <div className="section-inner">
        <div className="cta-band__inner">
          <motion.h2
            className="cta-band__title" id="cta-title"
            initial={{ opacity: 0, y: 24 }} animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Your IT career starts today
          </motion.h2>
          <motion.p
            className="cta-band__sub"
            initial={{ opacity: 0, y: 24 }} animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join thousands of learners who used Rise to land roles at top tech companies.
            Start free — no credit card required.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a href="/signup" className="btn-white" id="cta-band-signup">
              Create free account <ArrowRight size={18} weight="bold" />
            </a>
          </motion.div>
          <motion.p
            className="cta-band__note"
            initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}}
            transition={{ delay: 0.35 }}
          >
            Free forever plan · No credit card · Cancel anytime
          </motion.p>
        </div>
      </div>
    </section>
  );
}
