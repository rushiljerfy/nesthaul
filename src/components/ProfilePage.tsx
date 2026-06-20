"use client";

import { useState } from "react";
import type { OnboardingProfile } from "@/lib/types";
import { AuthCta } from "./AuthCta";
import { OnboardingForm } from "./OnboardingForm";

interface ProfilePageProps {
  profile: OnboardingProfile;
  onSaveProfile: (profile: OnboardingProfile) => void;
  showAuthCta?: boolean;
}

export function ProfilePage({ profile, onSaveProfile, showAuthCta = false }: ProfilePageProps) {
  const [saved, setSaved] = useState(false);

  return (
    <section>
      {showAuthCta ? <AuthCta /> : null}
      <div className="profile-summary">
        <div>
          <span>Location</span>
          <strong>{profile.location}</strong>
        </div>
        <div>
          <span>Total budget</span>
          <strong>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0
            }).format(profile.totalBudget)}
          </strong>
        </div>
        <div>
          <span>Style</span>
          <strong>{profile.stylePreference}</strong>
        </div>
      </div>
      {saved ? (
        <div className="success-message" role="status">
          Profile updated.
        </div>
      ) : null}
      <OnboardingForm
        headingEyebrow="Profile"
        headingTitle="Edit your move-in answers."
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
