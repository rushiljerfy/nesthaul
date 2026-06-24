"use client";

import { calculateDashboardSummary } from "@/lib/budget";
import { formatCurrency } from "@/lib/format";
import type { ChecklistItem, Listing, OnboardingProfile } from "@/lib/types";
import { Badge, Card, StatCard } from "./ui";

interface DashboardProps {
  profile: OnboardingProfile;
  checklist: ChecklistItem[];
  listings: Listing[];
}

export function Dashboard({ profile, checklist, listings }: DashboardProps) {
  const summary = calculateDashboardSummary(profile.totalBudget, checklist, listings);
  const completedCount = checklist.filter((item) => item.status === "bought").length;

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Your {profile.location || "move-in"} plan</h2>
        </div>
        <p>{formatProfileSummary(profile)}</p>
      </div>

      <div className="metric-grid">
        <StatCard label="Total budget" value={formatCurrency(summary.totalBudget)} detail="Your ceiling for setup spending" />
        <StatCard label="Planned spend" value={formatCurrency(summary.plannedSpend)} detail="Saved items in the plan" />
        <StatCard label="Remaining" value={formatCurrency(summary.remainingBudget)} detail="Still available" />
        <StatCard label="Items saved/bought" value={`${summary.savedListings + completedCount}`} detail="Compared or completed" />
      </div>

      <Card className="next-item">
        <div>
          <p className="eyebrow">What to handle next</p>
          <strong>{summary.bestNextItem ? summary.bestNextItem.name : "Plan is complete"}</strong>
          {summary.bestNextItem ? (
            <p>
              Start here because it is marked {summary.bestNextItem.priority}. Aim around{" "}
              {formatCurrency(summary.bestNextItem.suggestedBudget)} before comparing listings.
            </p>
          ) : (
            <p>Your essentials are covered. Review saved items before making any extra purchases.</p>
          )}
        </div>
        <div className="urgent-list">
          <span>Missing essentials</span>
          {summary.missingUrgentItems.length === 0 ? (
            <Badge tone="green">None urgent</Badge>
          ) : (
            summary.missingUrgentItems.slice(0, 4).map((item) => (
              <Badge key={item.id} tone="orange">
                {item.name}
              </Badge>
            ))
          )}
        </div>
      </Card>
    </section>
  );
}

function formatProfileSummary(profile: OnboardingProfile) {
  const details = [
    profile.apartmentType ? profile.apartmentType.replace("-", " ") : null,
    profile.moveInDate ? `Moving ${profile.moveInDate}` : null,
    profile.preference ? profile.preference.replace("-", " ") : null
  ].filter(Boolean);

  return details.length > 0 ? details.join(" · ") : "Finish the details whenever you are ready.";
}
