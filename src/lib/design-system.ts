// Tenkai Marketing Design System
// Visual Direction: Classical Japanese tea house meets Linear SaaS
// Restrained, warm, premium — whispers Japan, doesn't shout it

export const colors = {
  // Base
  ivory: '#FEFCF8',
  cream: '#FAF7F2',
  parchment: '#F5F1EB',

  // Accent — Torii Gate Red (use sparingly, ~10% of surface)
  torii: '#C1554D',
  toriiLight: '#D4736C',
  toriiDark: '#A33F38',
  toriiSubtle: '#F4E4E1', // sakura pink — very light wash

  // Text
  charcoal: '#2D2B2A',
  warmGray: '#8A8580',
  mutedGray: '#B5B0AA',

  // Functional
  success: '#4A7C59',
  warning: '#C49A3C',
  error: '#C1554D',
  info: '#5B7B9A',

  // Borders & Dividers
  border: '#E8E4DE',
  borderLight: '#F0ECE6',

  // Portal-specific
  cardBg: '#FFFFFF',
  sidebarBg: '#FAF7F2',
  portalBg: '#FEFCF8',
} as const;

export const fonts = {
  heading: '"Noto Serif JP", "Playfair Display", Georgia, serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", monospace',
} as const;

export const spacing = {
  section: '120px',  // between landing page sections
  sectionMobile: '80px',
  container: '1200px',
  portalSidebar: '260px',
} as const;

// Agent Personas — The Tenkai Team
export const agents = [
  { name: 'Haruki', nameJp: '春樹', role: 'SEO Strategist', description: 'Maps your path to the top of search results', icon: '🎯' },
  { name: 'Sakura', nameJp: '桜', role: 'Content Writer', description: 'Crafts EEAT-compliant articles that rank and resonate', icon: '✍️' },
  { name: 'Kenji', nameJp: '健二', role: 'Technical Auditor', description: 'Finds and fixes every technical SEO issue', icon: '🔍' },
  { name: 'Yumi', nameJp: '由美', role: 'GBP Manager', description: 'Optimizes your Google Business Profile presence', icon: '📍' },
  { name: 'Takeshi', nameJp: '武', role: 'Rank Monitor', description: 'Tracks your keywords and alerts on changes', icon: '📊' },
  { name: 'Aiko', nameJp: '愛子', role: 'Report Analyst', description: 'Translates data into plain English insights', icon: '📋' },
] as const;

export const tiers = [
  {
    name: 'Starter',
    displayName: 'Visibility',
    nameJp: '見',
    price: 149,
    description: 'See how your website performs and start climbing the rankings',
    features: {
      audit: 'Website health score',
      content: '1 blog post/mo',
      reporting: 'Monthly performance report',
      gbp: false,
      keywords: 'Top 10 keyword rankings',
      strategy: 'Monthly strategy brief',
      approval: 'Approve/deny',
      support: 'Dashboard + email',
    },
  },
  {
    name: 'Growth',
    displayName: 'Growth',
    nameJp: '成長',
    price: 299,
    popular: true,
    description: 'Active SEO strategy with content, competitors, and local optimization',
    features: {
      audit: 'Full SEO audit',
      content: '4 blog posts/mo',
      reporting: 'Bi-monthly reports',
      gbp: 'GBP optimization (monthly)',
      keywords: 'Keyword strategy + competitors',
      strategy: 'Monthly keyword strategy',
      approval: 'Approve/edit/deny',
      support: 'Dashboard + email',
    },
  },
  {
    name: 'Pro',
    displayName: 'Done-For-You',
    nameJp: '天',
    price: 499,
    description: 'We handle everything — content creation, publishing, and link building',
    features: {
      audit: 'Full audit + technical fixes',
      content: '8 blog posts/mo',
      reporting: 'Weekly reports',
      gbp: 'GBP posts + review responses',
      keywords: 'Full strategy + GEO/AI search',
      strategy: 'Monthly roadmap',
      approval: 'Approve/edit/deny',
      support: 'We publish to your website',
    },
  },
] as const;
