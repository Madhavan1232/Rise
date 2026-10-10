import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import PlayCircleOutlined from '@mui/icons-material/PlayCircleOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import ScienceOutlined from '@mui/icons-material/ScienceOutlined';
import QuizOutlined from '@mui/icons-material/QuizOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getCourseBySlug, getRelatedCourses } from '../data/courses';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import '../styles/CourseDetail.css';

/* ── Lesson type icon map ── */
function LessonIcon({ type }) {
  const props = { style: { fontSize: 16 }, 'aria-hidden': true };
  if (type === 'video')   return <PlayCircleOutlined {...props} />;
  if (type === 'reading') return <MenuBookOutlined {...props} />;
  if (type === 'lab')     return <ScienceOutlined {...props} />;
  if (type === 'quiz')    return <QuizOutlined {...props} />;
  if (type === 'project') return <AssignmentOutlined {...props} />;
  return null;
}

/* ── Accordion item ── */
function AccordionItem({ item, index, isOpen, onToggle }) {
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      <button
        className="accordion-trigger"
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        id={`acc-btn-${index}`}
        aria-controls={`acc-panel-${index}`}
      >
        <div className="accordion-trigger__left">
          <span className="accordion-trigger__num">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <div className="accordion-trigger__title">{item.module}</div>
            <div className="accordion-trigger__meta">
              {item.lessons.length} lessons · {item.totalDuration}
            </div>
          </div>
        </div>
        <ExpandMoreOutlined className="accordion-chevron" aria-hidden="true" />
      </button>

      <div
        id={`acc-panel-${index}`}
        role="region"
        aria-labelledby={`acc-btn-${index}`}
        className="accordion-body"
        style={{ height }}
      >
        <div ref={bodyRef} className="accordion-body__inner">
          {item.lessons.map((lesson, li) => (
            <div key={li} className="lesson-row">
              <span className={`lesson-icon lesson-icon--${lesson.type}`}>
                <LessonIcon type={lesson.type} />
              </span>
              <span className="lesson-title">{lesson.title}</span>
              <span className="lesson-duration">{lesson.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── FAQ item ── */
function FaqItem({ item, index, isOpen, onToggle }) {
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (bodyRef.current) setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
  }, [isOpen]);

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button
        className="faq-trigger"
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        id={`faq-btn-${index}`}
        aria-controls={`faq-panel-${index}`}
      >
        <span>{item.q}</span>
        <ExpandMoreOutlined className="accordion-chevron" aria-hidden="true" />
      </button>
      <div
        id={`faq-panel-${index}`}
        role="region"
        aria-labelledby={`faq-btn-${index}`}
        className="accordion-body"
        style={{ height }}
      >
        <div ref={bodyRef} className="faq-body">
          <p>{item.a}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton loading ── */
function Skeleton({ w, h, radius = 6 }) {
  return (
    <div
      className="skeleton"
      style={{ width: w, height: h, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="cd-skeleton">
      <div className="cd-hero cd-hero--skeleton">
        <div className="section-inner">
          <Skeleton w="100px" h="24px" />
          <Skeleton w="70%" h="56px" radius={8} />
          <Skeleton w="90%" h="22px" />
          <Skeleton w="60%" h="22px" />
        </div>
      </div>
      <div className="section-inner" style={{ marginTop: 80 }}>
        <Skeleton w="100%" h="140px" radius={16} />
      </div>
    </div>
  );
}

/* ── Scroll-reveal hook ── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Reveal wrapper ── */
function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal--in' : ''}`}
      style={{ '--delay': `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Format large numbers ── */
function fmt(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [related, setRelated] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [openModule, setOpenModule] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const heroRef = useRef(null);

  // Simulate async data fetch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLoading(true);
    const timer = setTimeout(() => {
      const data = getCourseBySlug(slug);
      if (!data) { setCourse(null); setLoading(false); return; }
      setCourse(data);
      setRelated(getRelatedCourses(data.related || []));
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [slug]);

  // Check enrollment status
  useEffect(() => {
    if (!user || !course) return;
    const token = localStorage.getItem('rise_token');
    if (!token) return;
    api.get('/enroll/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setEnrolled(data.courses?.includes(course.slug));
      })
      .catch(() => {});
  }, [user, course]);

  // Sticky bar observer
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [course]);

  async function handleEnroll() {
    if (!user) { navigate('/signup'); return; }
    if (enrolled) {
      const el = document.getElementById('syllabus');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const token = localStorage.getItem('rise_token');
    setEnrolling(true);
    try {
      await api.post('/enroll', { courseSlug: course.slug }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrolled(true);
    } catch {
      // ignore duplicate / network errors silently
    } finally {
      setEnrolling(false);
    }
  }

  const toggleModule = (i) => setOpenModule(openModule === i ? null : i);
  const toggleFaq    = (i) => setOpenFaq(openFaq === i ? null : i);

  if (loading) return <><Navbar /><CourseDetailSkeleton /><Footer /></>;

  if (!course) return (
    <>
      <Navbar />
      <main className="cd-404">
        <SchoolOutlined style={{ fontSize: 64, color: 'var(--blue-100)' }} aria-hidden="true" />
        <h1>Course not found</h1>
        <p>We couldn't find a course with that URL. Browse our catalogue below.</p>
        <Link to="/#topics" className="btn-primary">Browse all topics</Link>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />

      {/* ── Sticky enroll bar ── */}
      <div className={`cd-sticky-bar ${stickyVisible ? 'visible' : ''}`} aria-hidden={!stickyVisible}>
        <div className="cd-sticky-bar__inner">
          <span className="cd-sticky-bar__title">{course.title}</span>
          <button
            className="cd-enroll-btn cd-enroll-btn--sm"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolled ? 'Go to course' : 'Enroll for free'}
          </button>
        </div>
      </div>

      <main id="main-content">
        {/* ── Breadcrumb ── */}
        <nav className="cd-breadcrumb" aria-label="Breadcrumb">
          <div className="section-inner">
            <ol className="cd-breadcrumb__list">
              <li><Link to="/"><HomeOutlined style={{ fontSize: 15 }} aria-hidden="true" /> Home</Link></li>
              <li aria-hidden="true"><ChevronRightOutlined style={{ fontSize: 14 }} /></li>
              <li><Link to="/#topics">Courses</Link></li>
              <li aria-hidden="true"><ChevronRightOutlined style={{ fontSize: 14 }} /></li>
              <li><Link to="/#topics">{course.category}</Link></li>
              <li aria-hidden="true"><ChevronRightOutlined style={{ fontSize: 14 }} /></li>
              <li aria-current="page">{course.title}</li>
            </ol>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="cd-hero" ref={heroRef} aria-labelledby="course-title">
          {/* Decorative SVG shapes */}
          <svg className="cd-hero__deco" aria-hidden="true" viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="520" cy="80"  r="200" stroke="#2563eb" strokeWidth="1.5" strokeOpacity="0.12" fill="none"/>
            <circle cx="480" cy="80"  r="140" stroke="#2563eb" strokeWidth="1"   strokeOpacity="0.08" fill="none"/>
            <circle cx="440" cy="80"  r="80"  fill="#2563eb" fillOpacity="0.05"/>
            <circle cx="100" cy="400" r="120" stroke="#2563eb" strokeWidth="1"   strokeOpacity="0.07" fill="none"/>
            <circle cx="560" cy="380" r="60"  fill="#2563eb" fillOpacity="0.04"/>
            <path d="M0 300 Q150 200 300 300 T600 300" stroke="#2563eb" strokeWidth="1" strokeOpacity="0.06" fill="none"/>
            <path d="M0 350 Q150 250 300 350 T600 350" stroke="#2563eb" strokeWidth="1" strokeOpacity="0.05" fill="none"/>
          </svg>

          <div className="section-inner cd-hero__inner">
            {/* Left */}
            <div className="cd-hero__content">
              <div className="cd-hero__badges">
                <span className="cd-badge cd-badge--originals">{course.badge}</span>
                <span className="cd-badge cd-badge--category">{course.category}</span>
              </div>

              <h1 className="cd-hero__title" id="course-title">{course.title}</h1>
              <p className="cd-hero__desc">{course.description}</p>

              {/* Instructor row */}
              <div className="cd-hero__instructors">
                <div className="cd-avatar-stack" aria-hidden="true">
                  {course.instructors.slice(0, 3).map((ins) => (
                    <div
                      key={ins.initials}
                      className="cd-avatar-stack__item"
                      style={{ background: ins.color }}
                    >
                      {ins.initials}
                    </div>
                  ))}
                </div>
                <span className="cd-hero__instructor-text">
                  <strong>Instructors:</strong>{' '}
                  {course.instructors[0].name}
                  {course.instructors.length > 1 && ` + ${course.instructors.length - 1} more`}
                </span>
                {course.trending && (
                  <span className="cd-badge cd-badge--trending">
                    <TrendingUpOutlined style={{ fontSize: 14 }} aria-hidden="true" />
                    Trending right now
                  </span>
                )}
              </div>

              {/* CTA */}
              <div className="cd-hero__cta">
                <button
                  className="cd-enroll-btn"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  aria-label={enrolled ? 'Go to course' : 'Enroll for free — starts today'}
                >
                  <span>{enrolled ? 'Go to course' : (enrolling ? 'Enrolling…' : 'Enroll for free')}</span>
                  {!enrolled && <span className="cd-enroll-btn__sub">Starts today</span>}
                </button>

                <div className="cd-hero__social-proof">
                  <p className="cd-hero__enrolled">
                    <strong>{fmt(course.enrolledCount)}</strong> already enrolled
                  </p>
                  <p className="cd-hero__included">
                    Included with Rise Free, no card required ·{' '}
                    <a href="#faq" className="cd-link">Learn more</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats card ── */}
        <div className="cd-stats-wrap section-inner">
          <div className="cd-stats-card" role="list" aria-label="Course stats">
            <div className="cd-stat" role="listitem">
              <div className="cd-stat__value">
                <LayersOutlined style={{ fontSize: 20, color: 'var(--blue-500)' }} aria-hidden="true" />
                {course.modulesCount}
              </div>
              <div className="cd-stat__label">modules</div>
              <div className="cd-stat__desc">Complete hands-on modules that build real skills</div>
            </div>
            <div className="cd-stat__divider" aria-hidden="true" />
            <div className="cd-stat" role="listitem">
              <div className="cd-stat__value">
                <StarRounded style={{ fontSize: 20, color: '#f59e0b' }} aria-hidden="true" />
                {course.rating}
              </div>
              <div className="cd-stat__label">rating</div>
              <div className="cd-stat__desc">from {fmt(course.reviewsCount)} learner reviews</div>
            </div>
            <div className="cd-stat__divider" aria-hidden="true" />
            <div className="cd-stat" role="listitem">
              <div className="cd-stat__value">
                <SchoolOutlined style={{ fontSize: 20, color: 'var(--blue-500)' }} aria-hidden="true" />
                {course.level}
              </div>
              <div className="cd-stat__label">level</div>
              <div className="cd-stat__desc">
                Recommended experience{' '}
                <button className="cd-tooltip-btn" aria-label="About experience level">
                  <InfoOutlined style={{ fontSize: 14 }} aria-hidden="true" />
                  <span className="cd-tooltip">
                    This course is aimed at {course.level.toLowerCase()} learners. No specific prerequisites unless stated in the FAQ.
                  </span>
                </button>
              </div>
            </div>
            <div className="cd-stat__divider" aria-hidden="true" />
            <div className="cd-stat" role="listitem">
              <div className="cd-stat__value">
                <AccessTimeOutlined style={{ fontSize: 20, color: 'var(--blue-500)' }} aria-hidden="true" />
                {course.weeks}
              </div>
              <div className="cd-stat__label">weeks</div>
              <div className="cd-stat__desc">to complete at 5 hours a week</div>
            </div>
          </div>
        </div>

        {/* ── What you'll learn ── */}
        <section className="cd-section" aria-labelledby="outcomes-title">
          <div className="section-inner">
            <Reveal>
              <h2 className="cd-section__title" id="outcomes-title">What you'll learn</h2>
              <ul className="cd-outcomes" role="list">
                {course.learnOutcomes.map((o, i) => (
                  <li key={i} className="cd-outcome">
                    <CheckCircleOutlined className="cd-outcome__icon" aria-hidden="true" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ── Skills ── */}
        <section className="cd-section cd-section--alt" aria-labelledby="skills-title">
          <div className="section-inner">
            <Reveal>
              <h2 className="cd-section__title" id="skills-title">Skills you'll gain</h2>
              <div className="cd-skills" role="list" aria-label="Skills">
                {course.skills.map((sk) => (
                  <span key={sk} className="cd-skill-chip" role="listitem">{sk}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Syllabus ── */}
        <section className="cd-section" id="syllabus" aria-labelledby="syllabus-title">
          <div className="section-inner">
            <Reveal>
              <h2 className="cd-section__title" id="syllabus-title">Syllabus</h2>
              <p className="cd-section__sub">
                {course.modulesCount} modules · approximately {course.weeks} weeks at 5 hrs/week
              </p>
              <div className="cd-accordion">
                {course.syllabus.map((item, i) => (
                  <AccordionItem
                    key={i}
                    item={item}
                    index={i}
                    isOpen={openModule === i}
                    onToggle={toggleModule}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Instructors ── */}
        <section className="cd-section cd-section--alt" aria-labelledby="instructors-title">
          <div className="section-inner">
            <Reveal>
              <h2 className="cd-section__title" id="instructors-title">Instructors</h2>
              <div className="cd-instructors">
                {course.instructors.map((ins) => (
                  <div key={ins.initials} className="cd-instructor-card">
                    <div
                      className="cd-instructor-card__avatar"
                      style={{ background: ins.color }}
                      aria-hidden="true"
                    >
                      {ins.initials}
                    </div>
                    <div>
                      <div className="cd-instructor-card__name">{ins.name}</div>
                      <div className="cd-instructor-card__role">{ins.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FAQs ── */}
        <section className="cd-section" id="faq" aria-labelledby="faq-title">
          <div className="section-inner">
            <Reveal>
              <h2 className="cd-section__title" id="faq-title">Frequently asked questions</h2>
              <div className="cd-accordion cd-accordion--faq">
                {course.faqs.map((item, i) => (
                  <FaqItem
                    key={i}
                    item={item}
                    index={i}
                    isOpen={openFaq === i}
                    onToggle={toggleFaq}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Learners also viewed ── */}
        {related.length > 0 && (
          <section className="cd-section cd-section--alt" aria-labelledby="related-title">
            <div className="section-inner">
              <Reveal>
                <h2 className="cd-section__title" id="related-title">Learners also viewed</h2>
                <div className="cd-related">
                  {related.map((rc) => (
                    <Link
                      to={`/courses/${rc.slug}`}
                      key={rc.slug}
                      className="cd-related-card"
                      aria-label={`${rc.title} — ${rc.level}`}
                    >
                      <div className="cd-related-card__category">{rc.category}</div>
                      <div className="cd-related-card__title">{rc.title}</div>
                      <div className="cd-related-card__meta">
                        <span className="cd-related-card__level">{rc.level}</span>
                        <span className="cd-related-card__rating">
                          <StarRounded style={{ fontSize: 13, color: '#f59e0b' }} aria-hidden="true" />
                          {rc.rating}
                        </span>
                      </div>
                      <div className="cd-related-card__weeks">{rc.weeks} weeks · {rc.modulesCount} modules</div>
                      <span className="cd-related-card__arrow" aria-hidden="true">
                        <ArrowForwardOutlined style={{ fontSize: 16 }} />
                      </span>
                    </Link>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* ── Bottom CTA ── */}
        <section className="cd-bottom-cta">
          <div className="section-inner cd-bottom-cta__inner">
            <div>
              <h2 className="cd-bottom-cta__title">Ready to start learning?</h2>
              <p className="cd-bottom-cta__sub">Join {fmt(course.enrolledCount)}+ learners already taking this course.</p>
            </div>
            <button className="cd-enroll-btn" onClick={handleEnroll} disabled={enrolling}>
              <span>{enrolled ? 'Go to course' : 'Enroll for free'}</span>
              {!enrolled && <span className="cd-enroll-btn__sub">Starts today</span>}
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
