"use client";

import { useState } from "react";
import type { OnboardingProfile } from "@/lib/types";
import { AuthCta } from "./AuthCta";
import { OnboardingForm } from "./OnboardingForm";
import { SectionHeader, StatCard } from "./ui";

interface ProfilePageProps {
  profile: OnboardingProfile;
  onSaveProfile: (profile: OnboardingProfile) => void;
  showAuthCta?: boolean;
}

export function ProfilePage({ profile, onSaveProfile, showAuthCta = false }: ProfilePageProps) {
  const [saved, setSaved] = useState(false);

  return (
    <section className="profile-page">
      {showAuthCta ? <AuthCta /> : null}
      <SectionHeader
        eyebrow="Profile"
        title="Set up your move-in details"
        note="Keep your budget, location, and preferences current so the plan stays useful."
      />
      <div className="profile-summary">
        <StatCard label="Where are you moving to?" value={profile.location || "Not set"} />
        <StatCard
          label="Total budget"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
          }).format(profile.totalBudget)}
        />
        <StatCard label="Preference" value={profile.preference.replace("-", " ")} />
      </div>
      {saved ? (
        <div className="success-message" role="status">
          Profile updated.
        </div>
      ) : null}
      <OnboardingForm
        headingEyebrow="Setup"
        headingTitle="Edit your move-in answers"
        initialProfile={profile}
        locationLabel="Where are you moving to?"
        submitLabel="Save profile"
        onComplete={(nextProfile) => {
          onSaveProfile(nextProfile);
          setSaved(true);
        }}
      />
    </section>
  );
}
