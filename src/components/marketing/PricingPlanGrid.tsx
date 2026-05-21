"use client";

import Link from "next/link";
import { MARKETING_PLANS } from "@/data/marketing";

export default function PricingPlanGrid({ isAnnual }: { isAnnual: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
      {MARKETING_PLANS.map((plan) => {
        const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
        const isRecommended = plan.recommended;

        return (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
              isRecommended
                ? "pricing-recommended-ring bg-surface-container/80 border border-secondary/40 lg:-translate-y-2 z-10"
                : "glass-panel border border-white/10 hover:border-primary/25"
            }`}
          >
            {isRecommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-secondary text-surface font-mono-label text-[10px] uppercase tracking-wider whitespace-nowrap">
                Recommended
              </div>
            )}

            <div className="mb-6 pt-2">
              <p className="font-mono-label text-outline text-[10px] uppercase tracking-wider mb-2">
                {plan.audience}
              </p>
              <h3 className="font-h2 text-2xl text-on-surface mb-1">{plan.name}</h3>
              <p className="font-body-md text-on-surface-variant text-sm">{plan.tagline}</p>
            </div>

            <div className="mb-6 flex items-baseline gap-1">
              {price === 0 ? (
                <span className="font-h1 text-4xl sm:text-5xl text-on-surface">$0</span>
              ) : (
                <>
                  <span className="font-h1 text-4xl sm:text-5xl text-on-surface">${price}</span>
                  <span className="font-mono-label text-outline text-sm">/mo</span>
                </>
              )}
              {isAnnual && price > 0 && (
                <span className="ml-2 font-mono-label text-secondary text-[10px] uppercase">billed annually</span>
              )}
            </div>

            <ul className="flex-grow space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span className={`font-body-md text-sm ${isRecommended ? "text-on-surface" : "text-on-surface-variant"}`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`w-full py-3.5 sm:py-4 rounded-xl font-mono-label text-xs sm:text-sm uppercase tracking-wide text-center transition-all ${
                isRecommended
                  ? "bg-secondary text-surface hover:shadow-[0_0_24px_rgba(78,222,163,0.35)] hover:-translate-y-0.5"
                  : "glass-panel border border-white/15 text-on-surface hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
