import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import ScienceOutlined from '@mui/icons-material/ScienceOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import PsychologyOutlined from '@mui/icons-material/PsychologyOutlined';
import EditNoteOutlined from '@mui/icons-material/EditNoteOutlined';
import VideocamOutlined from '@mui/icons-material/VideocamOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import MapOutlined from '@mui/icons-material/MapOutlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined';
import RocketLaunchOutlined from '@mui/icons-material/RocketLaunchOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import PlayCircleOutlined from '@mui/icons-material/PlayCircleOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { MetalButton } from '@/components/ui/metal-button';
import { AUDIENCE_TABS, NAV_ITEMS } from '../data/navData';
import { useAuth } from '../context/AuthContext';
import UserButton from './UserButton';
import '../styles/Navbar.css';

// Map icon name strings → Material UI Outlined components
const ICON_MAP = {
  MenuBookOutlined,
  ScienceOutlined,
  EmojiEventsOutlined,
  PsychologyOutlined,
  EditNoteOutlined,
  VideocamOutlined,
  BarChartOutlined,
  PublicOutlined,
  GroupsOutlined,
  MapOutlined,
  BusinessOutlined,
  SchoolOutlined,
  AccountBalanceOutlined,
  RocketLaunchOutlined,
  ArticleOutlined,
  PlayCircleOutlined,
  DescriptionOutlined,
  HelpOutlineOutlined,
};

function NavIcon({ name, size = 20 }) {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon style={{ fontSize: size }} aria-hidden="true" /> : null;
}

/* ── Dropdown panel ── */
function NavDropdown({ item, open, onOpen, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      className="nav-item-wrapper"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        className={`navbar__link${open ? ' open' : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => (open ? onClose() : onOpen())}
      >
        {item.label}
        <KeyboardArrowDownOutlined className="nav-chevron" style={{ fontSize: 18 }} aria-hidden="true" />
      </button>

      <div
        ref={ref}
        className={`dropdown-panel${item.mega ? ' mega' : ''}${open ? ' open' : ''}`}
        role="region"
        aria-label={item.label}
      >
        {item.mega
          ? item.cols.map((col) => (
              <div key={col.title}>
                <div className="dd-col-title">{col.title}</div>
                {col.links.map((link) => {
                  const isInternal = link.href && link.href.startsWith('/');
                  if (isInternal) {
                    return (
                      <Link
                        key={link.label}
                        to={link.href}
                        className="dd-link"
                        onClick={onClose}
                      >
                        <div className="dd-link__icon-wrap">
                          <NavIcon name={link.icon} size={20} />
                        </div>
                        <div>
                          <div className="dd-link__label">{link.label}</div>
                          {link.desc && <div className="dd-link__desc">{link.desc}</div>}
                        </div>
                      </Link>
                    );
                  }
                  return (
                    <a key={link.label} href={link.href || '#'} className="dd-link">
                      <div className="dd-link__icon-wrap">
                        <NavIcon name={link.icon} size={20} />
                      </div>
                      <div>
                        <div className="dd-link__label">{link.label}</div>
                        {link.desc && <div className="dd-link__desc">{link.desc}</div>}
                      </div>
                    </a>
                  );
                })}
              </div>
            ))
          : item.dropdown.map((link) => {
              const isInternal = link.href && link.href.startsWith('/');
              if (isInternal) {
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="dd-link"
                    onClick={onClose}
                  >
                    <div className="dd-link__icon-wrap">
                      <NavIcon name={link.icon} size={20} />
                    </div>
                    <div>
                      <div className="dd-link__label">{link.label}</div>
                    </div>
                  </Link>
                );
              }
              return (
                <a key={link.label} href={link.href || '#'} className="dd-link">
                  <div className="dd-link__icon-wrap">
                    <NavIcon name={link.icon} size={20} />
                  </div>
                  <div>
                    <div className="dd-link__label">{link.label}</div>
                  </div>
                </a>
              );
            })}
      </div>
    </div>
  );
}

/* ── Navbar ── */
export default function Navbar() {
  const [activeTab, setActiveTab] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e) {
      if (!e.target.closest('.nav-item-wrapper')) setOpenMenu(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    if (q.includes('python')) {
      navigate('/courses/python-programming');
    } else if (q.includes('sql') || q.includes('data')) {
      navigate('/courses/sql-databases');
    } else if (q.includes('web') || q.includes('react') || q.includes('full')) {
      navigate('/courses/full-stack-web-development');
    } else {
      navigate('/courses/python-programming');
    }
  };


  return (
    <header>
      {/* Audience strip */}
      <div className="audience-strip" role="navigation" aria-label="Audience selector">
        <div className="audience-strip__inner">
          {AUDIENCE_TABS.map((tab, i) => (
            <button
              key={tab.label}
              className={`audience-tab${i === activeTab ? ' active' : ''}`}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && setActiveTab(i)}
              aria-current={i === activeTab ? 'true' : undefined}
            >
              {tab.label}
              {tab.disabled && tab.tooltip && (
                <span className="audience-tab__tooltip" role="tooltip">
                  {tab.tooltip}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`navbar${scrolled ? ' scrolled' : ''}`}
        aria-label="Main navigation"
      >
        <div className="navbar__inner">
          {/* Left Side: Logo & Navigation Links */}
          <div className="navbar__left">
            {/* Brand Logo */}
            <Link to="/" className="navbar__logo" aria-label="Rise home">
              <img src="/rise_logo.svg" alt="Rise" />
            </Link>

            {/* Desktop links */}
            <ul className="navbar__links" role="list">
              {NAV_ITEMS.map((item, i) => (
                <li key={item.label}>
                  {item.dropdown || item.mega ? (
                    <NavDropdown
                      item={item}
                      open={openMenu === i}
                      onOpen={() => setOpenMenu(i)}
                      onClose={() => setOpenMenu(null)}
                    />
                  ) : (
                    <a href={item.href || '#'} className="navbar__link">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side: Search Bar & User Avatar */}
          <div className="navbar__right">
            {/* Search Input */}
            <form className="navbar__search" onSubmit={handleSearch} role="search">
              <input
                type="text"
                className="navbar__search-input"
                placeholder="What do you want to learn?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="What do you want to learn?"
              />
              <button type="submit" className="navbar__search-btn" aria-label="Search">
                <SearchOutlined style={{ fontSize: 18 }} />
              </button>
            </form>

            {/* Auth / Avatar Button */}
            <div className="navbar__auth">
              {user ? (
                <UserButton
                  user={user}
                  onSignOut={logout}
                  onSettings={() => navigate('/settings')}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <MetalButton
                    variant="default"
                    type="button"
                    preset="silver"
                    disableGlow
                    paused={reducedMotion}
                    onClick={() => navigate('/login')}
                    metalFxClassName="rounded-lg shadow-xs bg-white! text-[#09090b]! hover:bg-slate-50! before:ring-1! before:ring-black!"
                    className="font-medium text-sm px-4 min-w-[78px] h-9 rounded-lg text-[#09090b]! cursor-pointer justify-center"
                  >
                    Log in
                  </MetalButton>
                  <MetalButton
                    variant="default"
                    type="button"
                    preset="silver"
                    disableGlow
                    paused={reducedMotion}
                    onClick={() => navigate('/signup')}
                    metalFxClassName="rounded-lg shadow-xs bg-white! text-[#09090b]! hover:bg-slate-50! before:ring-1! before:ring-black!"
                    className="font-semibold text-sm px-4.5 min-w-[86px] h-9 rounded-lg text-[#09090b]! cursor-pointer justify-center"
                  >
                    Sign up
                  </MetalButton>
                </div>
              )}
            </div>

            {/* Hamburger (Mobile) */}
            <button
              className={`navbar__hamburger${mobileOpen ? ' open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`mobile-drawer${mobileOpen ? ' open' : ''}`} aria-label="Mobile menu">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className="mobile-nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </button>
          ))}
          <div className="mobile-drawer__auth">
            {user ? (
              <button className="btn-outline" onClick={() => { logout(); setMobileOpen(false); }}>
                Log out ({user.name})
              </button>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                <MetalButton
                  variant="default"
                  type="button"
                  preset="silver"
                  disableGlow
                  paused={reducedMotion}
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  metalFxClassName="w-full rounded-lg shadow-xs bg-white! text-[#09090b]! hover:bg-slate-50! before:ring-1! before:ring-black!"
                  className="w-full justify-center font-medium text-sm h-10 rounded-lg text-[#09090b]! cursor-pointer"
                >
                  Log in
                </MetalButton>
                <MetalButton
                  variant="default"
                  type="button"
                  preset="silver"
                  disableGlow
                  paused={reducedMotion}
                  onClick={() => { navigate('/signup'); setMobileOpen(false); }}
                  metalFxClassName="w-full rounded-lg shadow-xs bg-white! text-[#09090b]! hover:bg-slate-50! before:ring-1! before:ring-black!"
                  className="w-full justify-center font-semibold text-sm h-10 rounded-lg text-[#09090b]! cursor-pointer"
                >
                  Sign up
                </MetalButton>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
