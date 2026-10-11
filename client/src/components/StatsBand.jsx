import { useEffect, useRef, useState } from 'react';
import { Star } from '@phosphor-icons/react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import '../styles/Sections.css';

const STATS = [
  { value: 10000, suffix: '+', label: 'Active Learners' },
  { value: 200,   suffix: '+', label: 'Expert Lessons' },
  { value: 95,    suffix: '%', label: 'Satisfaction Rate' },
  { value: 4.8,   hasStar: true, label: 'Average Rating',  decimals: 1 },
];

function useCountUp(target, active, decimals = 0) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!active) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setCount(target); return; }

    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(parseFloat((target * eased).toFixed(decimals)));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, target, decimals]);

  return count;
}

function StatItem({ stat, active }) {
  const count = useCountUp(stat.value, active, stat.decimals || 0);
  return (
    <div className="stat-item">
      <div className="stat-item__number" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <span>{stat.decimals ? count.toFixed(stat.decimals) : Math.floor(count).toLocaleString()}</span>
        {stat.suffix && <span>{stat.suffix}</span>}
        {stat.hasStar && <Star size={24} weight="fill" style={{ color: '#f59e0b' }} aria-hidden="true" />}
      </div>
      <div className="stat-item__label">{stat.label}</div>
    </div>
  );
}

export default function StatsBand() {
  const [ref, visible] = useScrollReveal();

  return (
    <section className="stats-band" aria-label="Platform statistics">
      <div className="section-inner">
        <div className="stats-band__grid" ref={ref}>
          {STATS.map((s) => (
            <StatItem key={s.label} stat={s} active={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}
