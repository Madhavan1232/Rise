import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LanguageOutlined from '@mui/icons-material/LanguageOutlined';
import PsychologyOutlined from '@mui/icons-material/PsychologyOutlined';
import StorageOutlined from '@mui/icons-material/StorageOutlined';
import CloudOutlined from '@mui/icons-material/CloudOutlined';
import SecurityOutlined from '@mui/icons-material/SecurityOutlined';
import CodeOutlined from '@mui/icons-material/CodeOutlined';
import TerminalOutlined from '@mui/icons-material/TerminalOutlined';
import LanOutlined from '@mui/icons-material/LanOutlined';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import { useScrollReveal } from '../hooks/useScrollReveal';
import '../styles/Topics.css';

const CATS = ['All', 'Development', 'Infrastructure', 'Data', 'Security'];

const TOPICS = [
  { icon: LanguageOutlined,   title: 'Web Development',       desc: 'HTML, CSS, JS, React, Node.js and more', count: '1,240 lessons', cat: 'Development', slug: 'full-stack-web-development' },
  { icon: PsychologyOutlined, title: 'Artificial Intelligence',desc: 'ML, deep learning, and model deployment', count: '840 lessons',   cat: 'Data',           slug: null },
  { icon: StorageOutlined,    title: 'Databases & SQL',       desc: 'PostgreSQL, MySQL, MongoDB, Redis',      count: '620 lessons',   cat: 'Data',           slug: 'sql-databases' },
  { icon: CloudOutlined,      title: 'Cloud & DevOps',        desc: 'AWS, GCP, Docker, Kubernetes, CI/CD',    count: '780 lessons',   cat: 'Infrastructure', slug: null },
  { icon: SecurityOutlined,   title: 'Cybersecurity',         desc: 'Ethical hacking, OWASP, network defence',count: '415 lessons',   cat: 'Security',       slug: null },
  { icon: CodeOutlined,       title: 'Python Programming',    desc: 'Scripting, automation, and data pipelines', count: '970 lessons', cat: 'Development',    slug: 'python-programming' },
  { icon: TerminalOutlined,   title: 'Linux & Shell',         desc: 'Command line, bash scripting, sysadmin', count: '310 lessons',   cat: 'Infrastructure', slug: null },
  { icon: LanOutlined,        title: 'Networking',            desc: 'TCP/IP, DNS, HTTP, VPN, firewalls',      count: '270 lessons',   cat: 'Infrastructure', slug: null },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const card = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function Topics() {
  const [filter, setFilter] = useState('All');
  const [ref, visible] = useScrollReveal();

  const filtered = filter === 'All' ? TOPICS : TOPICS.filter((t) => t.cat === filter);

  return (
    <section id="topics" className="topics" aria-labelledby="topics-title">
      <div className="section-inner">
        <header className="topics__header" ref={ref}>
          <motion.p
            className="section-eyebrow"
            initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.4 }}
          >
            Explore Topics
          </motion.p>
          <motion.h2
            className="section-title" id="topics-title"
            initial={{ opacity: 0, y: 16 }} animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            Whatever you want to learn
          </motion.h2>
          <motion.p
            className="section-subtitle topics__header .section-subtitle"
            style={{ margin: '16px auto 0', maxWidth: 520 }}
            initial={{ opacity: 0, y: 16 }} animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            From web development to AI — structured paths taught by working engineers.
          </motion.p>
        </header>

        <div className="topics__filters" role="tablist" aria-label="Topic categories">
          {CATS.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={filter === c}
              className={`topic-filter${filter === c ? ' active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <motion.ul
          className="topics__grid"
          role="list"
          variants={container}
          initial="hidden"
          animate={visible ? 'show' : 'hidden'}
        >
          {filtered.map((t) => (
            <motion.li key={t.title} variants={card} style={{ listStyle: 'none' }}>
              {t.slug ? (
                <Link to={`/courses/${t.slug}`} className="topic-card" aria-label={`${t.title} — ${t.count}`}>
                  <div className="topic-card__icon-wrap" aria-hidden="true">
                    <t.icon style={{ fontSize: 24 }} />
                  </div>
                  <div className="topic-card__title">{t.title}</div>
                  <div className="topic-card__desc">{t.desc}</div>
                  <div className="topic-card__footer">
                    <span className="topic-card__count">{t.count}</span>
                    <span className="topic-card__arrow" aria-hidden="true">
                      <ArrowForwardOutlined style={{ fontSize: 16 }} />
                    </span>
                  </div>
                </Link>
              ) : (
                <a href="#" className="topic-card" aria-label={`${t.title} — ${t.count}`}>
                  <div className="topic-card__icon-wrap" aria-hidden="true">
                    <t.icon style={{ fontSize: 24 }} />
                  </div>
                  <div className="topic-card__title">{t.title}</div>
                  <div className="topic-card__desc">{t.desc}</div>
                  <div className="topic-card__footer">
                    <span className="topic-card__count">{t.count}</span>
                    <span className="topic-card__arrow" aria-hidden="true">
                      <ArrowForwardOutlined style={{ fontSize: 16 }} />
                    </span>
                  </div>
                </a>
              )}
            </motion.li>
          ))}
        </motion.ul>

        <div className="topics__footer">
          <a href="#" className="btn-outline">
            View all topics <ArrowForwardOutlined style={{ fontSize: 18 }} />
          </a>
        </div>
      </div>
    </section>
  );
}
