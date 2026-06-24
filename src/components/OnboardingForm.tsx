"use client";

import { useState } from "react";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";
import type { ApartmentType, OnboardingProfile, Preference } from "@/lib/types";
import { Button, Card, FormField, SelectInput, TextArea, TextInput } from "./ui";

interface OnboardingFormProps {
  onComplete: (profile: OnboardingProfile) => void;
  initialProfile?: OnboardingProfile;
  submitLabel?: string;
  headingEyebrow?: string;
  headingTitle?: string;
  locationLabel?: string;
}

interface FormState {
  location: string;
  apartmentType: ApartmentType | "";
  moveInDate: string;
  totalBudget: string;
  preference: Preference | "";
  stylePreference: string;
  ownedItems: string[];
  otherOwnedItem: string;
}

const initialState: FormState = {
  location: "",
  apartmentType: "",
  moveInDate: "",
  totalBudget: "",
  preference: "",
  stylePreference: "",
  ownedItems: [],
  otherOwnedItem: ""
};

const ownedItemOptions = ["Mattress", "Desk", "Cookware", "Dishes", "Bath towels", "Cleaning kit"];

const steps = [
  { label: "Basics", title: "Set the boundaries." },
  { label: "Owned", title: "What do you already have?" },
  { label: "Optional", title: "Add details if you know them." }
];

export function OnboardingForm({
  onComplete,
  initialProfile,
  submitLabel = "Create my plan",
  headingEyebrow = "Move-in plan",
  headingTitle = "Tell NestHaul what you are working with.",
  locationLabel = "Where are you moving to?"
}: OnboardingFormProps) {
  const [form, setForm] = useState<FormState>(() => profileToFormState(initialProfile));
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const isLastStep = step === steps.length - 1;

  function updateField(name: keyof FormState, value: string | string[]) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleOwnedItem(item: string) {
    setForm((current) => ({
      ...current,
      ownedItems: current.ownedItems.includes(item)
        ? current.ownedItems.filter((ownedItem) => ownedItem !== item)
        : [...current.ownedItems, item]
    }));
  }

  function goNext() {
    const nextErrors = step === 0 ? validateRequired(form) : [];
    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      return;
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateRequired(form);
    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      setStep(0);
      return;
    }

    onComplete({
      location: form.location.trim(),
      apartmentType: form.apartmentType || "studio",
      moveInDate: form.moveInDate,
      totalBudget: Number(form.totalBudget),
      preference: form.preference as Preference,
      stylePreference: form.stylePreference.trim(),
      ownedItems: buildOwnedItems(form)
    });
  }

  return (
    <section className="section-shell onboarding-shell" id="onboarding">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{headingEyebrow}</p>
          <h2>{headingTitle}</h2>
        </div>
        <p className="section-note">A short setup now; everything can be edited later.</p>
      </div>

      <Card className="onboarding-card">
        <ol className="progress-steps" aria-label="Setup progress">
          {steps.map((item, index) => (
            <li aria-current={index === step ? "step" : undefined} key={item.label}>
              <span>{index + 1}</span>
              {item.label}
            </li>
          ))}
        </ol>

        <form className="onboarding-form" onSubmit={handleSubmit}>
          {errors.length > 0 ? (
            <div className="form-errors" role="alert">
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}

          <div className="step-heading">
            <span>Step {step + 1} of {steps.length}</span>
            <h3>{steps[step].title}</h3>
          </div>

          {step === 0 ? (
            <div className="form-grid">
              <FormField label={locationLabel}>
                <TextInput
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="Brooklyn, NY"
                />
              </FormField>

              <FormField label="Total budget">
                <TextInput
                  type="number"
                  min="1"
                  value={form.totalBudget}
                  onChange={(event) => updateField("totalBudget", event.target.value)}
                  placeholder="1500"
                />
              </FormField>

              <FormField label="New/used preference">
                <SelectInput value={form.preference} onChange={(event) => updateField("preference", event.target.value)}>
                  <option value="">Choose one</option>
                  <option value="mostly-new">Mostly new</option>
                  <option value="mostly-used">Mostly used</option>
                  <option value="mix">Mix of new and used</option>
                </SelectInput>
              </FormField>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="owned-grid">
              {ownedItemOptions.map((item) => (
                <label className="owned-option" key={item}>
                  <input
                    checked={form.ownedItems.includes(item)}
                    type="checkbox"
                    onChange={() => toggleOwnedItem(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
              <FormField help="Comma-separated is fine." label="Other">
                <TextInput
                  value={form.otherOwnedItem}
                  onChange={(event) => updateField("otherOwnedItem", event.target.value)}
                  placeholder="Rug, lamp, side table"
                />
              </FormField>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="form-grid">
              <FormField help="Optional" label="Apartment type">
                <SelectInput value={form.apartmentType} onChange={(event) => updateField("apartmentType", event.target.value)}>
                  <option value="">Skip for now</option>
                  <option value="studio">Studio</option>
                  <option value="one-bedroom">One-bedroom</option>
                  <option value="two-bedroom">Two-bedroom</option>
                  <option value="shared">Shared apartment</option>
                </SelectInput>
              </FormField>

              <FormField help="Optional" label="Move-in date">
                <TextInput
                  type="date"
                  value={form.moveInDate}
                  onChange={(event) => updateField("moveInDate", event.target.value)}
                />
              </FormField>

              <FormField help="Optional" label="Style preference">
                <TextArea
                  value={form.stylePreference}
                  onChange={(event) => updateField("stylePreference", event.target.value)}
                  placeholder="Warm minimal, industrial, cozy"
                />
              </FormField>
            </div>
          ) : null}

          <div className="form-actions">
            {step > 0 ? (
              <Button tone="quiet" type="button" onClick={() => setStep((current) => current - 1)}>
                <ChevronLeft aria-hidden="true" size={18} />
                Back
              </Button>
            ) : null}
            {!isLastStep ? (
              <Button type="button" onClick={goNext}>
                {step === 1 ? "Continue" : "Next"}
                <ArrowRight aria-hidden="true" size={18} />
              </Button>
            ) : (
              <Button type="submit">
                <Check aria-hidden="true" size={18} />
                {submitLabel}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </section>
  );
}

function profileToFormState(profile?: OnboardingProfile): FormState {
  if (!profile) {
    return initialState;
  }

  const isBlankProfile =
    !profile.location.trim() &&
    !profile.moveInDate &&
    profile.totalBudget <= 0 &&
    !profile.stylePreference.trim() &&
    profile.ownedItems.length === 0;
  const knownOwnedItems = profile.ownedItems.filter((item) => ownedItemOptions.includes(item));
  const otherOwnedItems = profile.ownedItems.filter((item) => !ownedItemOptions.includes(item));

  return {
    location: profile.location,
    apartmentType: isBlankProfile ? "" : profile.apartmentType,
    moveInDate: profile.moveInDate,
    totalBudget: profile.totalBudget > 0 ? String(profile.totalBudget) : "",
    preference: isBlankProfile ? "" : profile.preference,
    stylePreference: profile.stylePreference,
    ownedItems: knownOwnedItems,
    otherOwnedItem: otherOwnedItems.join(", ")
  };
}

function buildOwnedItems(form: FormState) {
  return [
    ...form.ownedItems,
    ...form.otherOwnedItem
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  ];
}

function validateRequired(form: FormState) {
  const errors: string[] = [];

  if (!form.location.trim()) {
    errors.push("Location is required.");
  }
  if (!form.totalBudget || Number(form.totalBudget) <= 0) {
    errors.push("Total budget must be greater than 0.");
  }
  if (!form.preference) {
    errors.push("New/used preference is required.");
  }

  return errors;
}
