// src/data/navData.js
// Centralised nav content — keeps component clean

export const AUDIENCE_TABS = [
  { label: 'For IT Sector', active: true },
  { label: 'For 12th Students', disabled: true, tooltip: 'Coming soon' },
  { label: 'For Government Exams', disabled: true, tooltip: 'Coming soon' },
];

export const NAV_ITEMS = [
  {
    label: 'Products',
    mega: true,
    cols: [
      {
        title: 'Learn',
        links: [
          { icon: 'MenuBookOutlined',     label: 'Courses',          desc: 'Expert-led structured paths', href: '/courses/python-programming' },
          { icon: 'ScienceOutlined',      label: 'Labs',             desc: 'Browser-based sandboxes', href: '/courses/full-stack-web-development' },
          { icon: 'EmojiEventsOutlined',  label: 'Certifications',   desc: 'Industry-recognised certs', href: '/courses/sql-databases' },
          { icon: 'PsychologyOutlined',   label: 'AI Mentor',        desc: 'Personalised guidance', href: '/#topics' },
        ],
      },
      {
        title: 'Create',
        links: [
          { icon: 'EditNoteOutlined',     label: 'Course Builder',   desc: 'Build and sell your course' },
          { icon: 'VideocamOutlined',     label: 'Live Sessions',    desc: 'Host interactive classes' },
          { icon: 'BarChartOutlined',     label: 'Analytics',        desc: 'Track learner progress' },
        ],
      },
      {
        title: 'Discover',
        links: [
          { icon: 'PublicOutlined',       label: 'Marketplace',      desc: 'Thousands of topics' },
          { icon: 'GroupsOutlined',       label: 'Community',        desc: 'Connect with peers' },
          { icon: 'MapOutlined',          label: 'Learning Paths',   desc: 'Structured roadmaps' },
        ],
      },
    ],
  },
  {
    label: 'Solutions',
    dropdown: [
      { icon: 'BusinessOutlined',       label: 'Enterprise' },
      { icon: 'SchoolOutlined',         label: 'Universities' },
      { icon: 'AccountBalanceOutlined', label: 'Government' },
      { icon: 'RocketLaunchOutlined',   label: 'Startups' },
    ],
  },
  {
    label: 'Resources',
    dropdown: [
      { icon: 'ArticleOutlined',        label: 'Blog' },
      { icon: 'PlayCircleOutlined',     label: 'Webinars' },
      { icon: 'DescriptionOutlined',    label: 'Case Studies' },
      { icon: 'HelpOutlineOutlined',    label: 'Help Center' },
    ],
  },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Enterprise', href: '#enterprise' },
];
