"use client";

import { ArrowRight, ClipboardList } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <section className="landing">
      <div className="landing-copy">
        <p className="eyebrow">NestHaul</p>
        <h1>Furnish your apartment without blowing your budget.</h1>
        <p className="lede">
          Build a move-in shopping plan, track what you still need, save listings you are considering,
          and get simple buy, wait, or skip guidance before you spend.
        </p>
        <button className="primary-button" type="button" onClick={onStart}>
          <ClipboardList aria-hidden="true" size={18} />
          Build a move-in plan
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </div>
      <div className="landing-visual" aria-label="Move-in budget preview">
        <div>
          <span>Total budget</span>
          <strong>$1,500</strong>
        </div>
        <div>
          <span>Urgent gaps</span>
          <strong>5</strong>
        </div>
        <div>
          <span>Saved listings</span>
          <strong>3</strong>
        </div>
      </div>
    </section>
  );
}
