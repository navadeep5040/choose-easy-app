export type PlanId = "free" | "pro-student" | "mentor-plus";

export interface MarketingPlan {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  recommended?: boolean;
  cta: string;
  href: string;
  features: string[];
  audience: string;
}

export const MARKETING_PLANS: MarketingPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Explore careers with AI guidance",
    monthlyPrice: 0,
    annualPrice: 0,
    cta: "Get Started Free",
    href: "/login?mode=register",
    audience: "Students exploring options",
    features: [
      "AI career advisor (10 messages / day)",
      "Browse career pathways",
      "Discover mentor profiles",
      "Basic profile & dashboard",
    ],
  },
  {
    id: "pro-student",
    name: "Pro Student",
    tagline: "Book mentors and accelerate your path",
    monthlyPrice: 19,
    annualPrice: 15,
    recommended: true,
    cta: "Start Pro Student",
    href: "/login?mode=register",
    audience: "Active learners & job seekers",
    features: [
      "Unlimited AI career advisor",
      "Book 1:1 mentor sessions",
      "Live mentor chat per booking",
      "Session reviews & history",
      "Priority booking visibility",
      "Email support",
    ],
  },
  {
    id: "mentor-plus",
    name: "Mentor Plus",
    tagline: "Run your mentorship practice on Choose Easy",
    monthlyPrice: 39,
    annualPrice: 31,
    cta: "Apply as Mentor",
    href: "/login?mode=register",
    audience: "Approved mentors",
    features: [
      "Everything in Pro Student",
      "Mentor dashboard & calendar",
      "Accept / complete sessions",
      "Availability management",
      "Earnings & session analytics",
      "Mentor profile on marketplace",
    ],
  },
];

export const PLAN_COMPARISON_ROWS: {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  mentor: string | boolean;
}[] = [
  { label: "AI career advisor", free: "10 / day", pro: "Unlimited", mentor: "Unlimited" },
  { label: "Career pathways", free: true, pro: true, mentor: true },
  { label: "Mentor marketplace", free: "Browse", pro: "Book sessions", mentor: "Listed profile" },
  { label: "1:1 mentor sessions", free: false, pro: true, mentor: "Host sessions" },
  { label: "Mentor chat", free: false, pro: true, mentor: true },
  { label: "Mentor dashboard", free: false, pro: false, mentor: true },
  { label: "Session reviews", free: false, pro: true, mentor: true },
];

export const LANDING_FEATURES = [
  {
    icon: "psychology",
    title: "AI Career Advisor",
    desc: "Get tailored guidance on roles, skills, interview prep, and learning roadmaps—powered by context-aware AI built for career decisions.",
  },
  {
    icon: "groups",
    title: "Verified Mentors",
    desc: "Book live sessions with mentors across tech, finance, design, and more. Chat opens automatically when your session is confirmed.",
  },
  {
    icon: "route",
    title: "Structured Pathways",
    desc: "Explore curated career paths with clear milestones so you know what to learn next—not generic job board noise.",
  },
  {
    icon: "event_available",
    title: "Session Booking",
    desc: "Request time slots, track pending and confirmed sessions, and complete mentorship cycles with reviews that help the community.",
  },
];

export const MENTORSHIP_BENEFITS = [
  {
    step: "01",
    icon: "explore",
    title: "Discover your fit",
    desc: "Use the AI advisor and pathways to narrow roles that match your skills and goals.",
  },
  {
    step: "02",
    icon: "calendar_month",
    title: "Book a mentor",
    desc: "Choose a mentor, pick a slot, and get notified when your session is confirmed.",
  },
  {
    step: "03",
    icon: "forum",
    title: "Learn live",
    desc: "Chat with your mentor in-app, get actionable feedback, and mark sessions complete.",
  },
  {
    step: "04",
    icon: "star",
    title: "Grow with proof",
    desc: "Leave reviews, build your history, and return to the AI advisor with real context.",
  },
];

export const AI_HIGHLIGHTS = [
  {
    icon: "auto_awesome",
    title: "Context-aware replies",
    desc: "Career, resume, interview, and roadmap topics—without leaving the platform.",
  },
  {
    icon: "history",
    title: "Conversation memory",
    desc: "Pick up where you left off with saved chat history on your dashboard.",
  },
  {
    icon: "tips_and_updates",
    title: "Actionable suggestions",
    desc: "Suggested prompts for pathways, prep, and next steps—one click to start.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "The AI advisor helped me frame my pivot into product design, and my mentor session turned that plan into a concrete portfolio strategy.",
    name: "Sarah M.",
    role: "Pro Student · Product Design",
  },
  {
    quote:
      "Booking and chat in one place made mentorship feel professional. I completed two sessions and left reviews that actually mattered.",
    name: "James K.",
    role: "Pro Student · Software Engineering",
  },
  {
    quote:
      "As a mentor, the dashboard lets me accept requests, set availability, and mark sessions complete so students can review—clean workflow.",
    name: "Priya R.",
    role: "Mentor Plus · FinTech",
  },
];

export const FAQ_ITEMS = [
  {
    q: "Is Choose Easy free to try?",
    a: "Yes. The Free plan includes daily AI career chat, pathway browsing, and mentor discovery. Upgrade to Pro Student when you're ready to book live sessions.",
  },
  {
    q: "How do mentor sessions work?",
    a: "Browse mentors, submit a booking request, and wait for confirmation. Once confirmed, you can chat in-app. After the session, your mentor marks it complete and you can leave a review.",
  },
  {
    q: "What's the difference between Pro Student and Mentor Plus?",
    a: "Pro Student is for learners booking mentors. Mentor Plus is for approved mentors who need the mentor dashboard, availability tools, and session management.",
  },
  {
    q: "Can I become a mentor?",
    a: "Register as a mentor during signup. Your application is reviewed by our team. Once approved, you'll get mentor access and can subscribe to Mentor Plus for full tools.",
  },
  {
    q: "Does the AI replace human mentors?",
    a: "No. The AI advisor helps you explore and prepare. Mentors provide personalized, human guidance for decisions that matter.",
  },
];
