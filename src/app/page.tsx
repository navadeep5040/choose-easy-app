"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import FAQSection from "@/components/marketing/FAQSection";
import {
  LANDING_FEATURES,
  MENTORSHIP_BENEFITS,
  AI_HIGHLIGHTS,
  TESTIMONIALS,
} from "@/data/marketing";

export default function Home() {
  useReveal();

  return (
    <div className="w-full flex flex-col items-center pb-24 sm:pb-32">
      {/* Hero */}
      <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 pt-16 sm:pt-24 pb-16 overflow-hidden text-center">
        <div className="absolute inset-0 marketing-hero-glow pointer-events-none" />
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[min(100%,720px)] h-[420px] bg-primary/15 rounded-full blur-[120px] pointer-events-none animate-[pulse-glow_8s_ease-in-out_infinite]" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/25 bg-surface-container/60 backdrop-blur-md mb-6 sm:mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4edea3]" />
            <span className="font-mono-label text-[10px] sm:text-xs text-primary uppercase tracking-widest">
              AI mentorship · Live sessions
            </span>
          </div>

          <h1
            className="font-display-xl text-[2.5rem] sm:text-display-xl text-on-background mb-6 sm:mb-8 max-w-4xl leading-[1.08] tracking-tight animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Your career, guided by{" "}
            <span className="marketing-gradient-text block sm:inline mt-1 sm:mt-0">AI and real mentors</span>
          </h1>

          <p
            className="font-body-lg text-base sm:text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8 sm:mb-10 px-2 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            Choose Easy combines an AI career advisor with verified 1:1 mentorship—book sessions, chat in-app,
            and build momentum with structured pathways.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full sm:w-auto px-2 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Link
              href="/get-started"
              className="group px-8 py-4 bg-primary text-surface font-mono-label text-xs sm:text-sm uppercase tracking-wider rounded-full inline-flex items-center justify-center gap-2 hover:cyan-glow transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Start free
              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 glass-panel border border-white/15 text-on-surface font-mono-label text-xs sm:text-sm uppercase tracking-wider rounded-full hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              View pricing
            </Link>
          </div>

          <p className="mt-6 font-mono-label text-[10px] text-outline uppercase tracking-widest animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            No credit card · Free plan available
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 -mt-8 mb-16 sm:mb-24 reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { num: "AI + Human", label: "Dual guidance model" },
            { num: "1:1", label: "Mentor sessions" },
            { num: "In-app", label: "Booking & chat" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center border border-white/5 hover:border-primary/20 transition-colors duration-300"
            >
              <h3 className="font-h2 text-xl sm:text-2xl text-primary mb-2">{stat.num}</h3>
              <p className="font-mono-label text-outline text-[10px] sm:text-xs uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 sm:mb-28 w-full">
        <div className="text-center mb-12 sm:mb-16 reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
          <p className="font-mono-label text-secondary text-[10px] uppercase tracking-widest mb-3">Platform</p>
          <h2 className="font-h1 text-h1 sm:text-[40px] text-on-background mb-4">Built for career momentum</h2>
          <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto text-sm sm:text-base">
            Everything you need to explore, prepare, and connect—with tools that match how students and mentors actually work.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {LANDING_FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-10 group reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000 hover:border-primary/20 hover:-translate-y-1"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors duration-300">
                <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {feature.icon}
                </span>
              </div>
              <h3 className="font-h2 text-xl sm:text-2xl text-on-background mb-3">{feature.title}</h3>
              <p className="font-body-md text-on-surface-variant text-sm sm:text-base leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI highlights */}
      <section className="w-full px-4 sm:px-6 mb-20 sm:mb-28">
        <div className="max-w-7xl mx-auto glass-panel rounded-3xl border border-primary/15 p-6 sm:p-12 lg:p-14 relative overflow-hidden reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <p className="font-mono-label text-primary text-[10px] uppercase tracking-widest mb-3">Career Oracle</p>
              <h2 className="font-h1 text-h1 sm:text-[36px] text-on-background mb-4">AI that speaks career fluently</h2>
              <p className="font-body-md text-on-surface-variant text-sm sm:text-base mb-6 leading-relaxed">
                Ask about roles, resumes, interviews, or learning plans. Your conversation history stays on your dashboard so
                advice builds over time.
              </p>
              <Link
                href="/dashboard/chat"
                className="inline-flex items-center gap-2 text-secondary font-mono-label text-xs uppercase tracking-wider hover:text-primary transition-colors"
              >
                Try the advisor
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {AI_HIGHLIGHTS.map((item) => (
                <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-surface-container/50 border border-white/5">
                  <span className="material-symbols-outlined text-primary shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="font-h2 text-sm text-on-surface mb-1">{item.title}</h4>
                    <p className="font-body-md text-on-surface-variant text-xs sm:text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How mentorship works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 sm:mb-28 w-full">
        <div className="text-center mb-12 sm:mb-16 reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
          <p className="font-mono-label text-secondary text-[10px] uppercase tracking-widest mb-3">How it works</p>
          <h2 className="font-h1 text-h1 sm:text-[40px] text-on-background mb-4">From insight to live guidance</h2>
          <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto text-sm sm:text-base">
            A clear flow from exploration to mentorship—without switching tools.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {MENTORSHIP_BENEFITS.map((item, i) => (
            <div
              key={item.step}
              className="glass-panel rounded-2xl p-5 sm:p-6 reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000 relative"
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <span className="font-mono-label text-primary/40 text-2xl font-bold absolute top-4 right-4">{item.step}</span>
              <span className="material-symbols-outlined text-3xl text-secondary mb-4 block">{item.icon}</span>
              <h3 className="font-h2 text-lg text-on-background mb-2">{item.title}</h3>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Domains */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 sm:mb-28 w-full">
        <div className="text-center mb-10 sm:mb-14 reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
          <h2 className="font-h1 text-h1 sm:text-[40px] text-on-background mb-4">Explore by field</h2>
          <p className="font-body-md text-on-surface-variant text-sm sm:text-base max-w-xl mx-auto">
            Pathways and mentors across industries—start where your ambition points.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          {[
            { icon: "terminal", title: "Technology" },
            { icon: "health_and_safety", title: "Healthcare" },
            { icon: "account_balance", title: "Finance" },
            { icon: "design_services", title: "Design" },
            { icon: "campaign", title: "Marketing" },
            { icon: "school", title: "Education" },
          ].map((domain) => (
            <Link
              href="/pathways"
              key={domain.title}
              className="glass-panel rounded-xl sm:rounded-2xl p-5 sm:p-8 flex flex-col items-center justify-center text-center group reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000 hover:border-secondary/40 hover:-translate-y-1"
            >
              <span
                className="material-symbols-outlined text-3xl sm:text-4xl text-primary mb-2 sm:mb-3 group-hover:scale-110 transition-transform"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {domain.icon}
              </span>
              <span className="font-h2 text-sm sm:text-lg text-on-background group-hover:text-secondary transition-colors">
                {domain.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 sm:mb-28 w-full">
        <div className="text-center mb-10 sm:mb-14 reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
          <p className="font-mono-label text-secondary text-[10px] uppercase tracking-widest mb-3">Community</p>
          <h2 className="font-h1 text-h1 sm:text-[40px] text-on-background">Trusted by learners and mentors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={t.name}
              className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000 border border-white/5"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <span className="material-symbols-outlined text-primary/60 text-3xl mb-4">format_quote</span>
              <p className="font-body-md text-on-surface-variant text-sm sm:text-base leading-relaxed flex-grow mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer>
                <p className="font-h2 text-sm text-on-surface">{t.name}</p>
                <p className="font-mono-label text-[10px] text-outline uppercase tracking-wider mt-1">{t.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="w-full px-4 sm:px-6 mb-20 sm:mb-28 reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
        <div className="max-w-4xl mx-auto text-center glass-panel rounded-3xl p-8 sm:p-12 border border-secondary/20">
          <p className="font-mono-label text-secondary text-[10px] uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="font-h1 text-h1 sm:text-[36px] text-on-background mb-4">Start free. Upgrade when you&apos;re ready.</h2>
          <p className="font-body-md text-on-surface-variant text-sm sm:text-base mb-8 max-w-lg mx-auto">
            Free exploration, Pro Student for unlimited AI and mentor bookings, Mentor Plus for those who guide others.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-surface font-mono-label text-xs uppercase tracking-wider rounded-full hover:shadow-[0_0_24px_rgba(78,222,163,0.3)] transition-all hover:-translate-y-0.5"
          >
            Compare plans
            <span className="material-symbols-outlined text-lg">north_east</span>
          </Link>
        </div>
      </section>

      <FAQSection className="mb-20 sm:mb-28" />

      {/* Final CTA */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden w-full reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100%,600px)] h-[400px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="font-h1 text-h1 sm:text-[40px] text-on-background mb-4 sm:mb-6">
            Ready to move your career forward?
          </h2>
          <p className="font-body-md sm:font-body-lg text-on-surface-variant mb-8 sm:mb-10 text-sm sm:text-base max-w-xl mx-auto">
            Join Choose Easy—get AI guidance today and book your first mentor session when you&apos;re ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/get-started"
              className="group px-10 py-4 bg-primary text-surface font-mono-label text-xs uppercase tracking-wider rounded-full inline-flex items-center justify-center gap-2 hover:cyan-glow transition-all hover:-translate-y-0.5"
            >
              Create free account
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-0.5">arrow_forward</span>
            </Link>
            <Link
              href="/mentors"
              className="px-10 py-4 glass-panel border border-white/15 font-mono-label text-xs uppercase tracking-wider rounded-full text-on-surface hover:border-primary/30 transition-all"
            >
              Browse mentors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
