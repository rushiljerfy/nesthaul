"use client";

import { ArrowRight, BookmarkCheck, ClipboardList } from "lucide-react";
import { Card } from "./ui";

interface LandingPageProps {
  onExplore: () => void;
  onStart: () => void;
}

export function LandingPage({ onExplore, onStart }: LandingPageProps) {
  return (
    <section className="landing">
      <header className="landing-nav">
        <span className="wordmark">NestHaul</span>
        <div className="landing-auth">
          <a href="/login">Log in</a>
          <a href="/signup">Sign up</a>
        </div>
      </header>

      <div className="landing-grid">
        <div className="landing-copy">
          <p className="eyebrow">Move-in planning that keeps the receipt in mind</p>
        <h1>Furnish your apartment without blowing your budget.</h1>
        <p className="lede">
          Build a checklist, set your budget, save items you are considering, and get simple buy,
          wait, or skip guidance before you spend.
        </p>
          <div className="landing-actions">
            <button className="button button-primary" type="button" onClick={onStart}>
              <ClipboardList aria-hidden="true" size={18} />
              Build your move-in plan
              <ArrowRight aria-hidden="true" size={18} />
            </button>
            <button className="button button-secondary" type="button" onClick={onExplore}>
              <BookmarkCheck aria-hidden="true" size={18} />
              Explore starter items
            </button>
          </div>
      </div>
        <Card className="landing-visual" aria-label="Move-in budget preview">
          <div className="preview-header">
            <span>Starter plan preview</span>
            <strong>$740 left</strong>
          </div>
          <div className="preview-row">
            <span>Budget remaining</span>
            <strong>$740</strong>
          </div>
          <div className="preview-row">
            <span>Missing essentials</span>
            <strong>Mattress, cookware, towels</strong>
          </div>
          <div className="preview-row">
            <span>Saved items</span>
            <strong>3 options ready to compare</strong>
          </div>
        </Card>
      </div>
    </section>
  );
}
