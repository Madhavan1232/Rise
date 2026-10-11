import { useMemo } from 'react';
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiCplusplus,
  SiGo,
  SiRust,
  SiReact,
  SiNodedotjs,
  SiLeetcode,
  SiMysql,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiGit,
  SiGithub,
  SiGitlab,
  SiBitbucket,
  SiDocker,
  SiKubernetes,
  SiLinux,
} from 'react-icons/si';
import { FaJava, FaAws } from 'react-icons/fa6';
import { TbBinaryTree, TbStack2, TbHierarchy2, TbSchema } from 'react-icons/tb';
import LogoLoop from './LogoLoop';
import '../styles/SkillsStrip.css';

// ── Track 1: Programming Languages & Data Structures (Right-to-Left) ──
const TRACK_PROGRAMMING_DSA = [
  { name: 'Python', Icon: SiPython, color: '#3776AB', title: 'Python' },
  { name: 'Java', Icon: FaJava, color: '#E76F00', title: 'Java' },
  { name: 'C++', Icon: SiCplusplus, color: '#00599C', title: 'C++' },
  { name: 'TypeScript', Icon: SiTypescript, color: '#3178C6', title: 'TypeScript' },
  { name: 'JavaScript', Icon: SiJavascript, color: '#F7DF1E', title: 'JavaScript' },
  { name: 'Go', Icon: SiGo, color: '#00ADD8', title: 'Go' },
  { name: 'Rust', Icon: SiRust, color: '#CE412B', title: 'Rust' },
  { name: 'React', Icon: SiReact, color: '#61DAFB', title: 'React' },
  { name: 'Node.js', Icon: SiNodedotjs, color: '#5FA04E', title: 'Node.js' },
  { name: 'Binary Trees', Icon: TbBinaryTree, color: '#2563EB', title: 'Binary Trees' },
  { name: 'Data Structures', Icon: TbStack2, color: '#7C3AED', title: 'Data Structures' },
  { name: 'Graph Theory', Icon: TbHierarchy2, color: '#EC4899', title: 'Graphs' },
  { name: 'Algorithms', Icon: SiLeetcode, color: '#FFA116', title: 'Algorithms' },
];

// ── Track 2: Databases, MySQL, Version Control & DevOps (Left-to-Right) ──
const TRACK_DATABASES_VCS = [
  { name: 'MySQL', Icon: SiMysql, color: '#4479A1', title: 'MySQL' },
  { name: 'PostgreSQL', Icon: SiPostgresql, color: '#4169E1', title: 'PostgreSQL' },
  { name: 'MongoDB', Icon: SiMongodb, color: '#47A248', title: 'MongoDB' },
  { name: 'Redis', Icon: SiRedis, color: '#DC382D', title: 'Redis' },
  { name: 'SQL Schema', Icon: TbSchema, color: '#0284C7', title: 'SQL Schema' },
  { name: 'Git', Icon: SiGit, color: '#F05032', title: 'Git' },
  { name: 'GitHub', Icon: SiGithub, color: '#181717', title: 'GitHub' },
  { name: 'GitLab', Icon: SiGitlab, color: '#FC6D26', title: 'GitLab' },
  { name: 'Bitbucket', Icon: SiBitbucket, color: '#0052CC', title: 'Bitbucket' },
  { name: 'Docker', Icon: SiDocker, color: '#2496ED', title: 'Docker' },
  { name: 'Kubernetes', Icon: SiKubernetes, color: '#326CE5', title: 'Kubernetes' },
  { name: 'Linux', Icon: SiLinux, color: '#FCC624', title: 'Linux' },
  { name: 'AWS', Icon: FaAws, color: '#FF9900', title: 'AWS' },
];

function createLogoItems(list) {
  return list.map(({ name, Icon, color, title }) => ({
    name,
    title,
    node: (
      <div className="skill-pill" style={{ '--brand-color': color }}>
        <span
          className="skill-pill__icon"
          aria-hidden="true"
          style={{ color }}
        >
          <Icon size={18} color={color} />
        </span>
        <span>{name}</span>
      </div>
    ),
  }));
}

export default function SkillsStrip() {
  const loop1Logos = useMemo(() => createLogoItems(TRACK_PROGRAMMING_DSA), []);
  const loop2Logos = useMemo(() => createLogoItems(TRACK_DATABASES_VCS), []);

  return (
    <section className="skills-strip" aria-label="In-demand tech skills">
      <div className="section-inner">
        <p className="skills-strip__label">Learn the skills companies hire for</p>
      </div>

      <div className="skills-strip__loops">
        {/* Track 1: Moving right-to-left */}
        <LogoLoop
          logos={loop1Logos}
          speed={50}
          direction="left"
          logoHeight={42}
          gap={20}
          hoverSpeed={0}
          scaleOnHover
          fadeOut
          fadeOutColor="var(--bg-primary, #ffffff)"
          ariaLabel="Programming languages and data structures loop"
        />

        {/* Track 2: Moving left-to-right */}
        <LogoLoop
          logos={loop2Logos}
          speed={50}
          direction="right"
          logoHeight={42}
          gap={20}
          hoverSpeed={0}
          scaleOnHover
          fadeOut
          fadeOutColor="var(--bg-primary, #ffffff)"
          ariaLabel="Databases, MySQL, and version control loop"
        />
      </div>
    </section>
  );
}
