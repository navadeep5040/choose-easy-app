"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

interface PricingPlan {
  _id: string;
  planId: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  recommended: boolean;
  cta: string;
  href: string;
  features: string[];
  audience: string;
  isActive: boolean;
  badge: string;
  sortOrder: number;
}

const EMPTY_FORM = {
  planId: "",
  name: "",
  tagline: "",
  monthlyPrice: "",
  annualPrice: "",
  recommended: false,
  cta: "Get Started",
  href: "/login?mode=register",
  features: [] as string[],
  audience: "",
  isActive: true,
  badge: "",
  sortOrder: "0",
};

export default function PricingManager() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [featureInput, setFeatureInput] = useState("");

  const fetchPlans = async () => {
    try {
      // Fetch ALL plans including inactive — for admin we need to fetch from mentors route
      // but since the public route only returns active, we use the same route
      // In admin context we want all plans — so we use a query approach or just fetch all
      const res = await fetch("/api/admin/pricing");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error("Failed to fetch pricing plans", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setFeatureInput("");
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (plan: PricingPlan) => {
    setEditingId(plan._id);
    setForm({
      planId: plan.planId,
      name: plan.name,
      tagline: plan.tagline || "",
      monthlyPrice: String(plan.monthlyPrice),
      annualPrice: String(plan.annualPrice),
      recommended: plan.recommended,
      cta: plan.cta,
      href: plan.href,
      features: [...plan.features],
      audience: plan.audience || "",
      isActive: plan.isActive,
      badge: plan.badge || "",
      sortOrder: String(plan.sortOrder || 0),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addFeature = () => {
    const val = featureInput.trim();
    if (!val) return;
    setForm((p) => ({ ...p, features: [...p.features, val] }));
    setFeatureInput("");
  };

  const removeFeature = (i: number) => {
    setForm((p) => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        planId: form.planId,
        name: form.name,
        tagline: form.tagline,
        monthlyPrice: Number(form.monthlyPrice),
        annualPrice: Number(form.annualPrice),
        recommended: form.recommended,
        cta: form.cta,
        href: form.href,
        features: form.features,
        audience: form.audience,
        isActive: form.isActive,
        badge: form.badge,
        sortOrder: Number(form.sortOrder) || 0,
      };

      const url = editingId ? `/api/admin/pricing/${editingId}` : "/api/admin/pricing";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(editingId ? "Plan updated successfully" : "Plan created successfully", "success");
        resetForm();
        fetchPlans();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to save plan", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete the "${name}" pricing plan? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/pricing/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Plan deleted", "success");
        fetchPlans();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete plan", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const toggleActive = async (plan: PricingPlan) => {
    try {
      const res = await fetch(`/api/admin/pricing/${plan._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...plan, isActive: !plan.isActive }),
      });
      if (res.ok) {
        showToast(`Plan ${!plan.isActive ? "enabled" : "disabled"}`, "success");
        fetchPlans();
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-h2 text-2xl text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">sell</span>
            Pricing Plan Management
          </h2>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">
            Create, edit, enable/disable, and delete pricing plans. Changes reflect on the pricing page immediately.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-5 py-2.5 bg-primary text-surface rounded-lg font-mono-label text-xs uppercase hover:shadow-[0_0_15px_rgba(47,217,244,0.3)] transition-all flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Plan
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-primary/30">
          <h3 className="font-h2 text-xl mb-6 flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined">{editingId ? "edit" : "add_circle"}</span>
            {editingId ? "Edit Pricing Plan" : "Create New Pricing Plan"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">PLAN ID (slug) *</label>
                <input
                  required
                  type="text"
                  value={form.planId}
                  onChange={(e) => setForm((p) => ({ ...p, planId: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  disabled={!!editingId}
                  placeholder="e.g. pro-student"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">DISPLAY NAME *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Pro Student"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">MONTHLY PRICE (USD) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.monthlyPrice}
                  onChange={(e) => setForm((p) => ({ ...p, monthlyPrice: e.target.value }))}
                  placeholder="e.g. 19"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">ANNUAL PRICE (USD, per month) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.annualPrice}
                  onChange={(e) => setForm((p) => ({ ...p, annualPrice: e.target.value }))}
                  placeholder="e.g. 15"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">CTA BUTTON TEXT</label>
                <input
                  type="text"
                  value={form.cta}
                  onChange={(e) => setForm((p) => ({ ...p, cta: e.target.value }))}
                  placeholder="e.g. Get Started"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">CTA HREF</label>
                <input
                  type="text"
                  value={form.href}
                  onChange={(e) => setForm((p) => ({ ...p, href: e.target.value }))}
                  placeholder="/login?mode=register"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">BADGE / HIGHLIGHT TEXT</label>
                <input
                  type="text"
                  value={form.badge}
                  onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                  placeholder="e.g. Most Popular"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">SORT ORDER (lower = first)</label>
                <input
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
                  placeholder="0"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-mono-label text-outline text-xs block mb-1">TAGLINE</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
                placeholder="e.g. Book mentors and accelerate your path"
                className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="font-mono-label text-outline text-xs block mb-1">TARGET AUDIENCE</label>
              <input
                type="text"
                value={form.audience}
                onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
                placeholder="e.g. Active learners & job seekers"
                className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
              />
            </div>

            {/* Features */}
            <div>
              <label className="font-mono-label text-outline text-xs block mb-2">
                PLAN FEATURES <span className="text-primary ml-1">({form.features.length} added)</span>
              </label>
              <div className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                  placeholder="e.g. Unlimited AI career advisor"
                  className="flex-1 bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-3 bg-primary/20 border border-primary/40 text-primary rounded-lg font-mono-label text-xs uppercase hover:bg-primary/30 transition-all"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {form.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-surface-container rounded-lg border border-outline-variant/30">
                    <span className="material-symbols-outlined text-secondary text-[14px]">check_circle</span>
                    <span className="font-body-md text-on-surface text-sm flex-1">{feat}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="text-outline hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setForm((p) => ({ ...p, recommended: !p.recommended }))}
                  className={`w-11 h-6 rounded-full transition-colors ${form.recommended ? 'bg-primary' : 'bg-outline-variant'} relative cursor-pointer`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.recommended ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className="font-mono-label text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">MARK AS RECOMMENDED</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                  className={`w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-secondary' : 'bg-outline-variant'} relative cursor-pointer`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className="font-mono-label text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">PLAN ACTIVE (visible to users)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-primary text-surface rounded-lg font-mono-label text-xs uppercase hover:shadow-[0_0_15px_rgba(47,217,244,0.3)] transition-all disabled:opacity-50"
              >
                {isLoading ? "SAVING..." : editingId ? "SAVE CHANGES" : "CREATE PLAN"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 border border-outline-variant text-outline rounded-lg font-mono-label text-xs uppercase hover:border-primary/40 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plans List */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <h3 className="font-h2 text-lg text-on-surface">All Pricing Plans</h3>
          <span className="font-mono-label text-outline text-xs">{plans.length} plans</span>
        </div>

        {plans.length === 0 ? (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-3 block">sell</span>
            <p className="font-body-md text-on-surface-variant">No plans yet. Create one above, or static defaults will show on the pricing page.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {plans.map((plan) => (
              <div key={plan._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.02] transition-colors">
                {/* Plan info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-h2 text-sm text-on-surface font-medium">{plan.name}</span>
                    <span className="font-mono-label text-[9px] text-outline border border-outline-variant px-2 py-0.5 rounded">{plan.planId}</span>
                    {plan.recommended && (
                      <span className="px-2 py-0.5 rounded-full font-mono-label text-[9px] uppercase bg-primary/20 text-primary">Recommended</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full font-mono-label text-[9px] uppercase ${plan.isActive ? 'bg-secondary/20 text-secondary' : 'bg-outline-variant/30 text-outline'}`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 font-mono-label text-[10px] text-outline">
                    <span className="text-secondary">${plan.monthlyPrice}/mo · ${plan.annualPrice}/mo annual</span>
                    <span>{plan.features.length} features</span>
                    {plan.audience && <span className="text-on-surface-variant">{plan.audience}</span>}
                    {plan.badge && <span className="text-primary">{plan.badge}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(plan)}
                    title={plan.isActive ? "Disable plan" : "Enable plan"}
                    className={`p-2 rounded-lg border transition-all ${plan.isActive ? 'border-secondary/50 text-secondary hover:bg-secondary/10' : 'border-outline-variant text-outline hover:border-secondary hover:text-secondary'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{plan.isActive ? 'toggle_on' : 'toggle_off'}</span>
                  </button>
                  <button
                    onClick={() => startEdit(plan)}
                    title="Edit plan"
                    className="p-2 rounded-lg border border-outline-variant text-outline hover:border-primary hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id, plan.name)}
                    title="Delete plan"
                    className="p-2 rounded-lg border border-outline-variant text-outline hover:border-error hover:text-error transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel p-4 rounded-xl border border-primary/15">
        <p className="font-mono-label text-outline text-[10px] flex items-start gap-2">
          <span className="material-symbols-outlined text-[14px] text-primary shrink-0">info</span>
          If no plans are created in the database, the pricing page automatically falls back to the static plans defined in <code className="text-primary">src/data/marketing.ts</code>. Create plans here to override them.
        </p>
      </div>
    </div>
  );
}
