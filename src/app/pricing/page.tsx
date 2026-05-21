"use client";

import { useState } from "react";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import PricingPlanGrid from "@/components/marketing/PricingPlanGrid";
import PlanComparisonTable from "@/components/marketing/PlanComparisonTable";
import FAQSection from "@/components/marketing/FAQSection";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  useReveal();

  return (
    <main className="relative z-10 w-full pb-20 sm:pb-28">
      {/* Hero */}
      <section className="pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-5 sm:mb-6 px-4 py-2 rounded-full border border-secondary/25 bg-surface-container/50 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-mono-label text-[10px] sm:text-xs text-secondary uppercase tracking-widest">
            Simple, transparent pricing
          </span>
        </div>
        <h1 className="font-display-xl text-[2.25rem] sm:text-display-xl text-on-background mb-4 sm:mb-6 leading-tight">
          Plans for learners and{" "}
          <span className="marketing-gradient-text">mentors</span>
        </h1>
        <p className="font-body-lg text-on-surface-variant text-sm sm:text-base max-w-2xl mx-auto mb-8 sm:mb-10">
          Start free with the AI career advisor. Upgrade to book live mentorship sessions or run your practice as an
          approved mentor.
        </p>

        <div className="inline-flex items-center gap-3 sm:gap-4 p-1.5 rounded-full glass-panel border border-white/10">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-4 sm:px-5 py-2 rounded-full font-mono-label text-[10px] sm:text-xs uppercase tracking-wider transition-all ${
              !isAnnual ? "bg-primary/20 text-primary" : "text-outline hover:text-on-surface"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`px-4 sm:px-5 py-2 rounded-full font-mono-label text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              isAnnual ? "bg-secondary/20 text-secondary" : "text-outline hover:text-on-surface"
            }`}
          >
            Annual
            <span className="text-[10px] text-secondary/90">Save ~20%</span>
          </button>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 sm:px-6 mb-16 sm:mb-24 reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
        <PricingPlanGrid isAnnual={isAnnual} />
      </section>

      {/* Comparison */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-16 sm:mb-24">
        <PlanComparisonTable />
      </section>

      {/* CTA strip */}
      <section className="px-4 sm:px-6 mb-16 sm:mb-24 reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
        <div className="max-w-4xl mx-auto glass-panel rounded-2xl sm:rounded-3xl p-8 sm:p-10 border border-primary/15 text-center">
          <h2 className="font-h2 text-xl sm:text-2xl text-on-background mb-3">Not sure which plan fits?</h2>
          <p className="font-body-md text-on-surface-variant text-sm sm:text-base mb-6 max-w-lg mx-auto">
            Start with Free to explore pathways and the AI advisor. Move to Pro Student when you&apos;re ready to book
            mentors.
          </p>
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-surface font-mono-label text-xs uppercase tracking-wider rounded-full hover:cyan-glow transition-all hover:-translate-y-0.5"
          >
            Create free account
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </section>

      <FAQSection className="mb-16 sm:mb-20 px-4 sm:px-6" />

      {/* Bottom CTA */}
      <section className="px-4 sm:px-6 text-center reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
        <p className="font-mono-label text-outline text-[10px] uppercase tracking-widest mb-4">Get started today</p>
        <Link
          href="/login?mode=register"
          className="inline-flex items-center gap-2 px-10 py-4 bg-secondary text-surface font-mono-label text-xs uppercase tracking-wider rounded-full hover:shadow-[0_0_24px_rgba(78,222,163,0.3)] transition-all hover:-translate-y-0.5"
        >
          Sign up free
          <span className="material-symbols-outlined text-lg">person_add</span>
        </Link>
      </section>
    </main>
  );
}
