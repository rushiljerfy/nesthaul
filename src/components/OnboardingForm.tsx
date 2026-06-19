"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { ApartmentType, OnboardingProfile, Preference } from "@/lib/types";

interface OnboardingFormProps {
  onComplete: (profile: OnboardingProfile) => void;
}

interface FormState {
  location: string;
  apartmentType: ApartmentType | "";
  moveInDate: string;
  totalBudget: string;
  preference: Preference | "";
  stylePreference: string;
  ownedItems: string;
}

const initialState: FormState = {
  location: "",
  apartmentType: "",
  moveInDate: "",
  totalBudget: "",
  preference: "",
  stylePreference: "",
  ownedItems: ""
};

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<string[]>([]);

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      return;
    }

    onComplete({
      location: form.location.trim(),
      apartmentType: form.apartmentType as ApartmentType,
      moveInDate: form.moveInDate,
      totalBudget: Number(form.totalBudget),
      preference: form.preference as Preference,
      stylePreference: form.stylePreference.trim(),
      ownedItems: form.ownedItems
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    });
  }

  return (
    <section className="section-shell" id="onboarding">
      <div className="section-heading">
        <p className="eyebrow">Move-in plan</p>
        <h2>Tell NestHaul what you are working with.</h2>
      </div>

      {errors.length > 0 ? (
        <div className="form-errors" role="alert">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}

      <form className="onboarding-grid" onSubmit={handleSubmit}>
        <label>
          Location
          <input
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="Brooklyn, NY"
          />
        </label>

        <label>
          Apartment type
          <select
            value={form.apartmentType}
            onChange={(event) => updateField("apartmentType", event.target.value)}
          >
            <option value="">Choose one</option>
            <option value="studio">Studio</option>
            <option value="one-bedroom">One-bedroom</option>
            <option value="two-bedroom">Two-bedroom</option>
            <option value="shared">Shared apartment</option>
          </select>
        </label>

        <label>
          Move-in date
          <input
            type="date"
            value={form.moveInDate}
            onChange={(event) => updateField("moveInDate", event.target.value)}
          />
        </label>

        <label>
          Total budget
          <input
            type="number"
            min="1"
            value={form.totalBudget}
            onChange={(event) => updateField("totalBudget", event.target.value)}
            placeholder="1500"
          />
        </label>

        <label>
          New/used preference
          <select value={form.preference} onChange={(event) => updateField("preference", event.target.value)}>
            <option value="">Choose one</option>
            <option value="mostly-new">Mostly new</option>
            <option value="mostly-used">Mostly used</option>
            <option value="mix">Mix of new and used</option>
          </select>
        </label>

        <label>
          Style preference
          <input
            value={form.stylePreference}
            onChange={(event) => updateField("stylePreference", event.target.value)}
            placeholder="Warm minimal, industrial, cozy"
          />
        </label>

        <label className="wide-field">
          Items already owned
          <textarea
            value={form.ownedItems}
            onChange={(event) => updateField("ownedItems", event.target.value)}
            placeholder="mattress, towels, dishes"
          />
        </label>

        <button className="primary-button form-submit" type="submit">
          Create my plan
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </form>
    </section>
  );
}

function validate(form: FormState) {
  const errors: string[] = [];

  if (!form.location.trim()) {
    errors.push("Location is required.");
  }
  if (!form.apartmentType) {
    errors.push("Apartment type is required.");
  }
  if (!form.moveInDate) {
    errors.push("Move-in date is required.");
  }
  if (!form.totalBudget || Number(form.totalBudget) <= 0) {
    errors.push("Total budget must be greater than 0.");
  }
  if (!form.preference) {
    errors.push("New/used preference is required.");
  }
  if (!form.stylePreference.trim()) {
    errors.push("Style preference is required.");
  }

  return errors;
}
