"use client";

import { CheckCircle2, PiggyBank, ShoppingBag, Siren } from "lucide-react";
import { calculateDashboardSummary } from "@/lib/budget";
import { formatCurrency } from "@/lib/format";
import type { ChecklistItem, Listing, OnboardingProfile } from "@/lib/types";

interface DashboardProps {
  profile: OnboardingProfile;
  checklist: ChecklistItem[];
  listings: Listing[];
}

export function Dashboard({ profile, checklist, listings }: DashboardProps) {
  const summary = calculateDashboardSummary(profile.totalBudget, checklist, listings);

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">{profile.location}</p>
          <h2>Your move-in dashboard</h2>
        </div>
        <p>
          {profile.apartmentType.replace("-", " ")} · Moving {profile.moveInDate} · {profile.preference.replace("-", " ")}
        </p>
      </div>

      <div className="metric-grid">
        <Metric icon={<PiggyBank size={18} />} label="Total budget" value={formatCurrency(summary.totalBudget)} />
        <Metric icon={<ShoppingBag size={18} />} label="Planned spend" value={formatCurrency(summary.plannedSpend)} />
        <Metric icon={<PiggyBank size={18} />} label="Remaining" value={formatCurrency(summary.remainingBudget)} />
        <Metric icon={<CheckCircle2 size={18} />} label="Essentials completed" value={String(summary.essentialsCompleted)} />
        <Metric icon={<Siren size={18} />} label="Missing urgent items" value={String(summary.missingUrgentItems.length)} />
        <Metric icon={<ShoppingBag size={18} />} label="Saved listings" value={String(summary.savedListings)} />
      </div>

      <div className="next-item">
        <span>Best next item to buy</span>
        <strong>{summary.bestNextItem ? summary.bestNextItem.name : "Plan is complete"}</strong>
        {summary.bestNextItem ? <p>{formatCurrency(summary.bestNextItem.suggestedBudget)} suggested budget</p> : null}
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      <span className="metric-icon">{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
