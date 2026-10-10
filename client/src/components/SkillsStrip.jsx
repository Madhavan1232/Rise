import { SiPython, SiReact, SiNodedotjs, SiMysql, SiDocker, SiGit, SiTypescript, SiLinux } from 'react-icons/si';
import { FaJava, FaAws } from 'react-icons/fa6';
import '../styles/SkillsStrip.css';

const SKILLS = [
  { name: 'Python',     Icon: SiPython,     color: '#3776AB' },
  { name: 'Java',       Icon: FaJava,       color: '#E76F00' },
  { name: 'React',      Icon: SiReact,      color: '#087EA4' },
  { name: 'Node.js',    Icon: SiNodedotjs,  color: '#5FA04E' },
  { name: 'SQL',        Icon: SiMysql,      color: '#4479A1' },
  { name: 'AWS',        Icon: FaAws,        color: '#FF9900' },
  { name: 'Docker',     Icon: SiDocker,     color: '#2496ED' },
  { name: 'Git',        Icon: SiGit,        color: '#F05032' },
  { name: 'TypeScript', Icon: SiTypescript, color: '#3178C6' },
  { name: 'Linux',      Icon: SiLinux,      color: '#E95420' },
];

export default function SkillsStrip() {
  return (
    <div className="skills-strip" aria-label="Tech skills">
      <div className="section-inner">
        <p className="skills-strip__label">Learn the skills companies hire for</p>
        <div className="skills-strip__row" role="list">
          {SKILLS.map(({ name, Icon, color }) => (
            <div
              key={name}
              className="skill-pill"
              role="listitem"
              style={{ '--brand-color': color }}
            >
              <span className="skill-pill__icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
